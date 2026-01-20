const SUITS = /** @type {const} */ (['spades', 'hearts', 'clubs', 'diamonds']);
const SUIT_SYMBOL = {
  spades: '♠',
  hearts: '♥',
  clubs: '♣',
  diamonds: '♦',
};

import { SolitaireAudio } from './solitaire-audio.js';

function rankToLabel(rank) {
  if (rank === 1) return 'A';
  if (rank === 11) return 'J';
  if (rank === 12) return 'Q';
  if (rank === 13) return 'K';
  return String(rank);
}

function cardColor(suit) {
  return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
}

function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export class SolitaireGame {
  init(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx ?? canvas.getContext('2d');
    this.destroyed = false;

    this.canvas.width = 1200;
    this.canvas.height = 800;

    this.audio = new SolitaireAudio();

    this.layout = {
      cardW: 90,
      cardH: 128,
      r: 12,
      topPad: 85,
      leftPad: 60,
      gap: 22,
      tableauY: 240,
      tableauDyDown: 14, // tighter for face-down stacks
      tableauDyUp: 32, // tighter stack, still readable
      wasteFanDx: 18,
    };

    this.state = {
      message: 'Click stock to draw 3 • Drag cards • Double-click to send to foundation',
      won: false,
    };

    this._newGame();

    // input
    this.mouse = { x: 0, y: 0, down: false };
    this.drag = null; // { cards, from, offsetX, offsetY, x, y }
    this._lastClick = { t: 0, x: 0, y: 0 };
    this.anims = []; // { cardId, fromX, fromY, toX, toY, start, dur }
    this.drawingUntil = 0;

    this._canvasPoint = (clientX, clientY) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    };

    this._onPointerMove = (e) => {
      const p = this._canvasPoint(e.clientX, e.clientY);
      this.mouse.x = p.x;
      this.mouse.y = p.y;
      if (this.drag) {
        this.drag.x = this.mouse.x - this.drag.offsetX;
        this.drag.y = this.mouse.y - this.drag.offsetY;
      }
    };

    this._onPointerDown = (e) => {
      e.preventDefault();
      this.mouse.down = true;
      const p = this._canvasPoint(e.clientX, e.clientY);
      this.mouse.x = p.x;
      this.mouse.y = p.y;
      const { x, y } = this.mouse;

      // Resume audio on first user gesture (browser policy)
      this.audio?.resume?.();

      // Double click detection
      const now = performance.now();
      const isDouble = now - this._lastClick.t < 280 && Math.hypot(x - this._lastClick.x, y - this._lastClick.y) < 10;
      this._lastClick = { t: now, x, y };

      const hit = this._hitTest(x, y);
      if (!hit) return;

      if (hit.type === 'stock') {
        this._drawFromStock();
        return;
      }

      if (hit.type === 'waste') {
        if (isDouble) this._tryAutoToFoundation(hit.card);
        this._startDragFromWaste(hit.card, x, y);
        return;
      }

      if (hit.type === 'foundation') {
        // no drag from foundation in MVP
        return;
      }

      if (hit.type === 'tableau') {
        if (hit.card && isDouble) {
          // If single top card double-clicked, try to send to foundation
          const pile = this.tableau[hit.pileIndex];
          const idx = hit.cardIndex;
          if (idx === pile.length - 1) this._tryAutoToFoundation(hit.card);
        }
        this._startDragFromTableau(hit.pileIndex, hit.cardIndex, x, y);
      }

      if (typeof this.canvas.setPointerCapture === 'function') {
        try {
          this.canvas.setPointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      }
    };

    this._onPointerUp = (e) => {
      e.preventDefault();
      this.mouse.down = false;
      if (!this.drag) return;
      this._dropDrag(this.mouse.x, this.mouse.y);
    };

    this._onKeyDown = (e) => {
      if (e.key === 'r' || e.key === 'R') this._newGame();
    };

    this.canvas.addEventListener('pointermove', this._onPointerMove);
    this.canvas.addEventListener('pointerdown', this._onPointerDown);
    window.addEventListener('pointerup', this._onPointerUp);
    window.addEventListener('keydown', this._onKeyDown);
  }

  _newGame() {
    // Build deck
    const deck = [];
    let id = 0;
    for (const suit of SUITS) {
      for (let rank = 1; rank <= 13; rank++) {
        deck.push({ id: id++, suit, rank, color: cardColor(suit), faceUp: false });
      }
    }
    this.deck = shuffle(deck);

    // Piles
    this.foundations = {
      spades: [],
      hearts: [],
      clubs: [],
      diamonds: [],
    };
    this.stock = [];
    this.waste = [];
    this.tableau = Array.from({ length: 7 }, () => []);

    // Deal tableau: 1..7
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j <= i; j++) {
        const c = this.deck.pop();
        this.tableau[i].push(c);
      }
      this.tableau[i][this.tableau[i].length - 1].faceUp = true;
    }

    // Remaining cards to stock
    this.stock = this.deck;
    this.deck = [];
    this.state.won = false;
    this.drag = null;
    this.anims = [];
    this.drawingUntil = 0;
  }

  _easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  _drawFromStock() {
    if (this.state.won) return;
    if (performance.now() < this.drawingUntil) return; // avoid spam-click during animation

    if (this.stock.length > 0) {
      // Draw 3 at a time (or as many as left)
      const pos = this._pilePositions();
      const drawCount = Math.min(3, this.stock.length);
      const now = performance.now();
      const dur = 220;
      const stagger = 70;

      const startX = pos.stock.x;
      const startY = pos.stock.y;

      const baseIndex = Math.max(0, Math.min(2, this.waste.length % 3)); // purely cosmetic if you spam draw
      for (let i = 0; i < drawCount; i++) {
        const c = this.stock.pop();
        c.faceUp = true;
        this.waste.push(c);

        // animate into fanned waste positions (top 3 visible)
        const toX = pos.waste.x + (Math.max(0, Math.min(2, (this.waste.length - 1) % 3)) * this.layout.wasteFanDx);
        const toY = pos.waste.y;

        this.anims.push({
          cardId: c.id,
          fromX: startX,
          fromY: startY,
          toX,
          toY,
          start: now + i * stagger,
          dur,
        });
      }

      this.drawingUntil = now + (drawCount - 1) * stagger + dur;
      this.audio?.draw?.();
    } else {
      // recycle waste -> stock
      while (this.waste.length) {
        const c = this.waste.pop();
        c.faceUp = false;
        this.stock.push(c);
      }
      this.audio?.recycle?.();
    }
  }

  _startDragFromWaste(card, x, y) {
    if (!card) return;
    // only top card
    const top = this.waste[this.waste.length - 1];
    if (!top || top.id !== card.id) return;

    const pos = this._pilePositions();
    const visible = this._wasteVisibleCards();
    const px = visible.length ? visible[visible.length - 1].x : pos.waste.x;
    const py = pos.waste.y;

    this.drag = {
      cards: [top],
      from: { type: 'waste' },
      offsetX: x - px,
      offsetY: y - py,
      x: px,
      y: py,
    };
  }

  _startDragFromTableau(pileIndex, cardIndex, x, y) {
    const pile = this.tableau[pileIndex];
    if (!pile || pile.length === 0) return;
    const card = pile[cardIndex];
    if (!card || !card.faceUp) return;

    // Take stack from cardIndex..end if it's a valid descending alternating sequence
    const moving = pile.slice(cardIndex);
    if (!this._isValidTableauStack(moving)) return;

    const pos = this._pilePositions();
    const px = pos.tableau[pileIndex].x;
    const py = this._tableauYAt(pileIndex, cardIndex);

    this.drag = {
      cards: moving,
      from: { type: 'tableau', pileIndex, cardIndex },
      offsetX: x - px,
      offsetY: y - py,
      x: px,
      y: py,
    };
  }

  _dropDrag(x, y) {
    const drag = this.drag;
    this.drag = null;

    const topCard = drag.cards[0];
    const hit = this._hitTest(x, y, { includeDrag: false });

    let moved = false;

    // Try drop onto foundations (only single card)
    if (drag.cards.length === 1) {
      const fKey = this._foundationKeyAt(x, y);
      if (fKey) {
        moved = this._tryMoveToFoundation(topCard, drag.from, fKey);
      }
    }

    // Try drop onto tableau
    if (!moved) {
      const tKey = this._tableauKeyAt(x, y);
      if (tKey != null) {
        moved = this._tryMoveToTableau(drag.cards, drag.from, tKey);
      }
    }

    if (!moved) {
      // return cards back to origin
      this._returnDrag(drag);
      this.audio?.error?.();
    } else {
      // clean up origin (flip)
      this._afterMoveFrom(drag.from);
      this._checkWin();
      this.audio?.place?.();
    }
  }

  _returnDrag(drag) {
    const from = drag.from;
    if (from.type === 'waste') {
      // nothing changed
      return;
    }
    if (from.type === 'tableau') {
      // nothing changed (we didn't remove yet in this approach)
      return;
    }
  }

  _afterMoveFrom(from) {
    if (from.type === 'tableau') {
      const pile = this.tableau[from.pileIndex];
      // If last card now face-down, flip it
      if (pile.length > 0) {
        const last = pile[pile.length - 1];
        if (!last.faceUp) {
          last.faceUp = true;
          this.audio?.flip?.();
        }
      }
    }
  }

  _checkWin() {
    const won = Object.values(this.foundations).every((p) => p.length === 13);
    if (won) {
      this.state.won = true;
      this.state.message = 'You win! Press R for a new game';
      this.audio?.win?.();
    }
  }

  _tryAutoToFoundation(card) {
    if (!card || !card.faceUp) return false;
    const key = card.suit;
    const from = this._locateCard(card);
    if (!from) return false;
    const ok = this._tryMoveToFoundation(card, from, key);
    if (ok) {
      this._afterMoveFrom(from);
      this._checkWin();
    }
    return ok;
  }

  _locateCard(card) {
    // waste
    const wTop = this.waste[this.waste.length - 1];
    if (wTop && wTop.id === card.id) return { type: 'waste' };
    // tableau
    for (let i = 0; i < 7; i++) {
      const pile = this.tableau[i];
      const idx = pile.findIndex((c) => c.id === card.id);
      if (idx !== -1) return { type: 'tableau', pileIndex: i, cardIndex: idx };
    }
    return null;
  }

  _tryMoveToFoundation(card, from, fKey) {
    if (!card.faceUp) return false;
    if (card.suit !== fKey) return false;
    const pile = this.foundations[fKey];
    const needRank = pile.length === 0 ? 1 : pile[pile.length - 1].rank + 1;
    if (card.rank !== needRank) return false;

    // Remove from origin
    if (from.type === 'waste') {
      const top = this.waste[this.waste.length - 1];
      if (!top || top.id !== card.id) return false;
      this.waste.pop();
    } else if (from.type === 'tableau') {
      const tPile = this.tableau[from.pileIndex];
      if (from.cardIndex !== tPile.length - 1) return false; // only top card to foundation
      tPile.pop();
    }
    pile.push(card);
    return true;
  }

  _tryMoveToTableau(cards, from, destIndex) {
    const dest = this.tableau[destIndex];
    const movingTop = cards[0];

    // Validate tableau placement rules
    if (dest.length === 0) {
      if (movingTop.rank !== 13) return false; // only King on empty
    } else {
      const top = dest[dest.length - 1];
      if (!top.faceUp) return false;
      if (top.color === movingTop.color) return false;
      if (top.rank !== movingTop.rank + 1) return false;
    }

    // Remove from origin
    if (from.type === 'waste') {
      const top = this.waste[this.waste.length - 1];
      if (!top || top.id !== movingTop.id || cards.length !== 1) return false;
      this.waste.pop();
    } else if (from.type === 'tableau') {
      const src = this.tableau[from.pileIndex];
      // remove slice
      const moving = src.slice(from.cardIndex);
      if (moving.length !== cards.length) return false;
      src.splice(from.cardIndex, cards.length);
    }

    // Add to destination
    for (const c of cards) dest.push(c);
    return true;
  }

  _isValidTableauStack(cards) {
    // Must be descending rank, alternating color, all faceUp
    for (let i = 0; i < cards.length; i++) {
      if (!cards[i].faceUp) return false;
      if (i === 0) continue;
      const a = cards[i - 1];
      const b = cards[i];
      if (a.color === b.color) return false;
      if (a.rank !== b.rank + 1) return false;
    }
    return true;
  }

  _pilePositions() {
    const { cardW, cardH, leftPad, topPad, gap, tableauY } = this.layout;
    const stock = { x: leftPad, y: topPad };
    const waste = { x: leftPad + cardW + gap, y: topPad };
    const foundations = {};
    const fx0 = this.canvas.width - leftPad - (cardW * 4 + gap * 3);
    for (let i = 0; i < 4; i++) {
      foundations[SUITS[i]] = { x: fx0 + i * (cardW + gap), y: topPad };
    }
    const tableau = Array.from({ length: 7 }, (_, i) => ({
      x: leftPad + i * (cardW + gap),
      y: tableauY,
    }));
    return { stock, waste, foundations, tableau };
  }

  _tableauYs(pileIndex) {
    const pos = this._pilePositions();
    const pile = this.tableau[pileIndex];
    const ys = [];
    let y = pos.tableau[pileIndex].y;
    for (let i = 0; i < pile.length; i++) {
      ys.push(y);
      y += pile[i].faceUp ? this.layout.tableauDyUp : this.layout.tableauDyDown;
    }
    return ys;
  }

  _tableauYAt(pileIndex, cardIndex) {
    const ys = this._tableauYs(pileIndex);
    return ys[cardIndex] ?? this._pilePositions().tableau[pileIndex].y;
  }

  _wasteVisibleCards() {
    const pos = this._pilePositions();
    const visibleCards = this.waste.slice(-3);
    return visibleCards.map((c, i) => ({
      card: c,
      x: pos.waste.x + i * this.layout.wasteFanDx,
      y: pos.waste.y,
    }));
  }

  _foundationKeyAt(x, y) {
    const pos = this._pilePositions();
    const { cardW, cardH } = this.layout;
    for (const suit of SUITS) {
      const p = pos.foundations[suit];
      if (x >= p.x && x <= p.x + cardW && y >= p.y && y <= p.y + cardH) return suit;
    }
    return null;
  }

  _tableauKeyAt(x, y) {
    const pos = this._pilePositions();
    const { cardW, cardH } = this.layout;
    for (let i = 0; i < 7; i++) {
      const p = pos.tableau[i];
      // Allow dropping anywhere down the column
      if (x >= p.x && x <= p.x + cardW && y >= p.y && y <= this.canvas.height - 40) return i;
      // also allow dropping on empty pile placeholder area
      if (x >= p.x && x <= p.x + cardW && y >= p.y && y <= p.y + cardH) return i;
    }
    return null;
  }

  _hitTest(x, y) {
    const pos = this._pilePositions();
    const { cardW, cardH } = this.layout;

    // Stock
    if (x >= pos.stock.x && x <= pos.stock.x + cardW && y >= pos.stock.y && y <= pos.stock.y + cardH) {
      return { type: 'stock' };
    }

    // Waste (top)
    const wVis = this._wasteVisibleCards();
    if (wVis.length) {
      // check from topmost (rightmost) backwards
      for (let i = wVis.length - 1; i >= 0; i--) {
        const p = wVis[i];
        if (x >= p.x && x <= p.x + cardW && y >= p.y && y <= p.y + cardH) {
          const top = this.waste[this.waste.length - 1] ?? null;
          return { type: 'waste', card: top };
        }
      }
    } else {
      // empty waste slot area
      if (x >= pos.waste.x && x <= pos.waste.x + cardW && y >= pos.waste.y && y <= pos.waste.y + cardH) {
        return { type: 'waste', card: null };
      }
    }

    // Foundations (top)
    for (const suit of SUITS) {
      const p = pos.foundations[suit];
      if (x >= p.x && x <= p.x + cardW && y >= p.y && y <= p.y + cardH) {
        const pile = this.foundations[suit];
        const card = pile[pile.length - 1] ?? null;
        return { type: 'foundation', suit, card };
      }
    }

    // Tableau: find top-most face-up card under cursor
    for (let i = 6; i >= 0; i--) {
      const p = pos.tableau[i];
      const pile = this.tableau[i];
      if (pile.length === 0) continue;

      const ys = this._tableauYs(i);

      // iterate from top to bottom for hit
      for (let j = pile.length - 1; j >= 0; j--) {
        const cy = ys[j];
        const cx = p.x;
        const isLast = j === pile.length - 1;
        const nextY = !isLast ? ys[j + 1] : cy + cardH;
        const h = isLast ? cardH : Math.max(24, (nextY - cy) + 10);
        if (x >= cx && x <= cx + cardW && y >= cy && y <= cy + h) {
          return { type: 'tableau', pileIndex: i, cardIndex: j, card: pile[j] };
        }
      }
    }

    return null;
  }

  update() {
    // Animate draws
    if (!this.anims.length) return;
    const now = performance.now();
    this.anims = this.anims.filter((a) => now < a.start + a.dur);
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const { cardW, cardH, r } = this.layout;
    const pos = this._pilePositions();

    // Felt background
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#0b3b2e');
    bg.addColorStop(1, '#06261e');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Header text
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '600 18px "Space Grotesk", system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(this.state.won ? 'Solitaire — You win!' : 'Solitaire', 60, 45);
    ctx.textAlign = 'right';
    ctx.fillText('Press R for new deal', w - 60, 45);

    // helper message
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '500 16px "Space Grotesk", system-ui, sans-serif';
    ctx.fillText(this.state.message, w / 2, h - 62);

    // Win chance bar (heuristic)
    this._drawWinChanceBar();

    // Draw placeholders
    const drawSlot = (x, y) => {
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 2;
      this._roundRect(ctx, x, y, cardW, cardH, r);
      ctx.stroke();
    };

    drawSlot(pos.stock.x, pos.stock.y);
    drawSlot(pos.waste.x, pos.waste.y);
    for (const suit of SUITS) {
      const p = pos.foundations[suit];
      drawSlot(p.x, p.y);
      // suit hint
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.font = '700 28px "Outfit", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(SUIT_SYMBOL[suit], p.x + cardW / 2, p.y + cardH / 2 + 10);
    }
    for (let i = 0; i < 7; i++) drawSlot(pos.tableau[i].x, pos.tableau[i].y);

    // Stock (face-down stack)
    if (this.stock.length > 0) {
      this._drawCardBack(pos.stock.x, pos.stock.y);
      // small count
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '600 14px "Space Grotesk", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(this.stock.length), pos.stock.x + cardW / 2, pos.stock.y + cardH + 18);
    }

    // Waste top
    const animating = new Set(this.anims.map((a) => a.cardId));
    const wVisible = this._wasteVisibleCards();
    for (let i = 0; i < wVisible.length; i++) {
      const { card, x, y } = wVisible[i];
      if (animating.has(card.id)) continue; // will be drawn by anim pass
      // only top visible card gets face; others still face-up but draw them underneath
      this._drawCardFace(x, y, card);
    }

    // Foundations top
    for (const suit of SUITS) {
      const pile = this.foundations[suit];
      const top = pile[pile.length - 1];
      if (!top) continue;
      const p = pos.foundations[suit];
      this._drawCardFace(p.x, p.y, top);
    }

    // Tableau
    for (let i = 0; i < 7; i++) {
      const pile = this.tableau[i];
      const p = pos.tableau[i];
      let y = p.y;
      for (let j = 0; j < pile.length; j++) {
        const c = pile[j];
        const x = p.x;

        // If dragging, skip drawing the moving cards in their original pile
        if (this.drag && this.drag.from.type === 'tableau' && this.drag.from.pileIndex === i && j >= this.drag.from.cardIndex) {
          y += c.faceUp ? this.layout.tableauDyUp : this.layout.tableauDyDown;
          continue;
        }

        if (c.faceUp) this._drawCardFace(x, y, c);
        else this._drawCardBack(x, y);

        y += c.faceUp ? this.layout.tableauDyUp : this.layout.tableauDyDown;
      }
    }

    // Drag rendering (on top)
    if (this.drag) {
      const dx = this.drag.x;
      const dy = this.drag.y;
      for (let i = 0; i < this.drag.cards.length; i++) {
        const c = this.drag.cards[i];
        this._drawCardFace(dx, dy + i * this.layout.tableauDyUp, c, { lifting: true });
      }
    }

    // Draw animations on top (stock -> waste deal)
    if (this.anims.length) {
      const now = performance.now();
      for (const a of this.anims) {
        if (now < a.start) continue;
        const t = Math.min(1, (now - a.start) / a.dur);
        const e = this._easeOutCubic(t);
        const ax = a.fromX + (a.toX - a.fromX) * e;
        const ay = a.fromY + (a.toY - a.fromY) * e;
        const card = this.waste.find((c) => c.id === a.cardId);
        if (card) this._drawCardFace(ax, ay, card, { lifting: true });
      }
    }
  }

  _roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.arcTo(x + w, y, x + w, y + rr, rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr);
    ctx.lineTo(x + rr, y + h);
    ctx.arcTo(x, y + h, x, y + h - rr, rr);
    ctx.lineTo(x, y + rr);
    ctx.arcTo(x, y, x + rr, y, rr);
    ctx.closePath();
  }

  _drawCardBack(x, y) {
    const ctx = this.ctx;
    const { cardW, cardH, r } = this.layout;

    ctx.save();
    // shadow
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;

    const g = ctx.createLinearGradient(x, y, x + cardW, y + cardH);
    g.addColorStop(0, '#5e5ce6');
    g.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = g;
    this._roundRect(ctx, x, y, cardW, cardH, r);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 2;
    this._roundRect(ctx, x + 4, y + 4, cardW - 8, cardH - 8, r - 3);
    ctx.stroke();

    // pattern
    // Clip the pattern to the card shape so no rings spill outside
    this._roundRect(ctx, x, y, cardW, cardH, r);
    ctx.clip();

    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(x + cardW / 2, y + cardH / 2, 10 + i * 10, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  _drawCardFace(x, y, card, opts = {}) {
    const ctx = this.ctx;
    const { cardW, cardH, r } = this.layout;
    const isRed = card.color === 'red';

    ctx.save();
    // shadow
    ctx.shadowColor = opts.lifting ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = opts.lifting ? 18 : 12;
    ctx.shadowOffsetY = opts.lifting ? 10 : 6;

    ctx.fillStyle = '#f8fafc';
    this._roundRect(ctx, x, y, cardW, cardH, r);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.18)';
    ctx.lineWidth = 2;
    this._roundRect(ctx, x, y, cardW, cardH, r);
    ctx.stroke();

    // center suit faint
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = isRed ? '#ef4444' : '#0f172a';
    ctx.font = '900 64px "Outfit", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(SUIT_SYMBOL[card.suit], x + cardW / 2, y + cardH / 2 + 22);

    // corners
    ctx.globalAlpha = 1;
    ctx.fillStyle = isRed ? '#ef4444' : '#0f172a';
    ctx.font = '800 18px "Outfit", system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    // tighter padding like classic solitaire
    ctx.fillText(rankToLabel(card.rank), x + 10, y + 10);
    ctx.fillText(SUIT_SYMBOL[card.suit], x + 10, y + 30);

    // Bottom-right (keep fully inside card — no rotation)
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(rankToLabel(card.rank), x + cardW - 10, y + cardH - 26);
    ctx.fillText(SUIT_SYMBOL[card.suit], x + cardW - 10, y + cardH - 8);

    ctx.restore();
  }

  _estimateWinChance01() {
    // Heuristic estimate (0..1). Not perfect math; just a vibe meter.
    const foundationCount = Object.values(this.foundations).reduce((sum, p) => sum + p.length, 0); // 0..52
    const tableauFaceUp = this.tableau.reduce((sum, pile) => sum + pile.filter((c) => c.faceUp).length, 0);
    const tableauTotal = this.tableau.reduce((sum, pile) => sum + pile.length, 0);
    const faceUpRatio = tableauTotal > 0 ? tableauFaceUp / tableauTotal : 0;

    const emptyTableau = this.tableau.filter((p) => p.length === 0).length;
    const stockLeft = this.stock.length;
    const wasteCount = this.waste.length;

    // Count some immediate legal moves (top-cards only; cheap)
    const moves = this._countQuickMoves();

    // Core progress: foundations dominate
    let score = 0;
    score += (foundationCount / 52) * 0.62;
    score += faceUpRatio * 0.18;
    score += Math.min(1, moves / 10) * 0.16;
    score += Math.min(2, emptyTableau) * 0.03; // small boost for flexibility

    // Penalties
    score -= Math.min(1, stockLeft / 24) * 0.08;
    score -= Math.min(1, wasteCount / 24) * 0.04;

    // Baseline chance so early game doesn't show 0%
    score = 0.06 + score;

    if (this.state.won) score = 1;
    return Math.max(0, Math.min(1, score));
  }

  _countQuickMoves() {
    let n = 0;

    const wasteTop = this.waste[this.waste.length - 1];
    if (wasteTop && wasteTop.faceUp) {
      // to foundation
      n += this._canGoFoundation(wasteTop) ? 1 : 0;
      // to any tableau
      for (let i = 0; i < 7; i++) {
        if (this._canGoTableau([wasteTop], i)) {
          n += 1;
          break;
        }
      }
    }

    // tableau tops
    for (let i = 0; i < 7; i++) {
      const pile = this.tableau[i];
      if (!pile.length) continue;
      const top = pile[pile.length - 1];
      if (!top.faceUp) continue;

      // to foundation
      if (this._canGoFoundation(top)) n += 1;

      // to other tableau (top-only quick check)
      for (let j = 0; j < 7; j++) {
        if (i === j) continue;
        if (this._canGoTableau([top], j)) {
          n += 1;
          break;
        }
      }
    }

    return n;
  }

  _canGoFoundation(card) {
    const pile = this.foundations[card.suit];
    const need = pile.length === 0 ? 1 : pile[pile.length - 1].rank + 1;
    return card.rank === need;
  }

  _canGoTableau(cards, destIndex) {
    const dest = this.tableau[destIndex];
    const movingTop = cards[0];
    if (!movingTop.faceUp) return false;
    if (dest.length === 0) return movingTop.rank === 13;
    const top = dest[dest.length - 1];
    if (!top.faceUp) return false;
    if (top.color === movingTop.color) return false;
    return top.rank === movingTop.rank + 1;
  }

  _drawWinChanceBar() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    const chance = this._estimateWinChance01();
    const pct = Math.round(chance * 100);

    const barW = 520;
    const barH = 14;
    const x = w / 2 - barW / 2;
    const y = h - 30;
    const r = 8;

    // Track background
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    this._roundRect(ctx, x, y, barW, barH, r);
    ctx.fill();

    // Fill (red -> yellow -> green)
    const fillW = Math.max(6, Math.floor(barW * chance));
    const grad = ctx.createLinearGradient(x, y, x + barW, y);
    grad.addColorStop(0, '#ef4444');
    grad.addColorStop(0.55, '#fbbf24');
    grad.addColorStop(1, '#22c55e');

    ctx.fillStyle = grad;
    this._roundRect(ctx, x, y, fillW, barH, r);
    ctx.fill();

    // Border
    ctx.globalAlpha = 0.65;
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1.5;
    this._roundRect(ctx, x, y, barW, barH, r);
    ctx.stroke();

    // Label
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '600 14px "Space Grotesk", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`Est. win chance: ${pct}%`, w / 2, y - 6);

    ctx.restore();
  }

  destroy() {
    this.destroyed = true;
    this.canvas.removeEventListener('pointermove', this._onPointerMove);
    this.canvas.removeEventListener('pointerdown', this._onPointerDown);
    window.removeEventListener('pointerup', this._onPointerUp);
    window.removeEventListener('keydown', this._onKeyDown);

    this.audio?.close?.();
  }
}

