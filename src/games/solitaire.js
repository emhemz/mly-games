const SUITS = /** @type {const} */ (['spades', 'hearts', 'clubs', 'diamonds']);
const SUIT_SYMBOL = {
  spades: '♠',
  hearts: '♥',
  clubs: '♣',
  diamonds: '♦',
};

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

    this.layout = {
      cardW: 90,
      cardH: 128,
      r: 12,
      topPad: 85,
      leftPad: 60,
      gap: 22,
      tableauY: 240,
      tableauDy: 30,
    };

    this.state = {
      message: 'Click stock to draw • Drag cards • Double-click to send to foundation',
      won: false,
    };

    this._newGame();

    // input
    this.mouse = { x: 0, y: 0, down: false };
    this.drag = null; // { cards, from, offsetX, offsetY, x, y }
    this._lastClick = { t: 0, x: 0, y: 0 };

    this._onMouseMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      if (this.drag) {
        this.drag.x = this.mouse.x - this.drag.offsetX;
        this.drag.y = this.mouse.y - this.drag.offsetY;
      }
    };

    this._onMouseDown = (e) => {
      e.preventDefault();
      this.mouse.down = true;
      const { x, y } = this.mouse;

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
    };

    this._onMouseUp = (e) => {
      e.preventDefault();
      this.mouse.down = false;
      if (!this.drag) return;
      this._dropDrag(this.mouse.x, this.mouse.y);
    };

    this._onKeyDown = (e) => {
      if (e.key === 'r' || e.key === 'R') this._newGame();
    };

    this.canvas.addEventListener('mousemove', this._onMouseMove);
    this.canvas.addEventListener('mousedown', this._onMouseDown);
    window.addEventListener('mouseup', this._onMouseUp);
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
  }

  _drawFromStock() {
    if (this.state.won) return;
    if (this.stock.length > 0) {
      const c = this.stock.pop();
      c.faceUp = true;
      this.waste.push(c);
    } else {
      // recycle waste -> stock
      while (this.waste.length) {
        const c = this.waste.pop();
        c.faceUp = false;
        this.stock.push(c);
      }
    }
  }

  _startDragFromWaste(card, x, y) {
    if (!card) return;
    // only top card
    const top = this.waste[this.waste.length - 1];
    if (!top || top.id !== card.id) return;

    const pos = this._pilePositions();
    const px = pos.waste.x;
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
    const py = pos.tableau[pileIndex].y + cardIndex * this.layout.tableauDy;

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
    } else {
      // clean up origin (flip)
      this._afterMoveFrom(drag.from);
      this._checkWin();
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
        if (!last.faceUp) last.faceUp = true;
      }
    }
  }

  _checkWin() {
    const won = Object.values(this.foundations).every((p) => p.length === 13);
    if (won) {
      this.state.won = true;
      this.state.message = 'You win! Press R for a new game';
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
    const { cardW, cardH, tableauDy } = this.layout;

    // Stock
    if (x >= pos.stock.x && x <= pos.stock.x + cardW && y >= pos.stock.y && y <= pos.stock.y + cardH) {
      return { type: 'stock' };
    }

    // Waste (top)
    if (x >= pos.waste.x && x <= pos.waste.x + cardW && y >= pos.waste.y && y <= pos.waste.y + cardH) {
      const card = this.waste[this.waste.length - 1] ?? null;
      return { type: 'waste', card };
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

      // iterate from top to bottom for hit
      for (let j = pile.length - 1; j >= 0; j--) {
        const cy = p.y + j * tableauDy;
        const cx = p.x;
        const isLast = j === pile.length - 1;
        const h = isLast ? cardH : tableauDy + 6;
        if (x >= cx && x <= cx + cardW && y >= cy && y <= cy + h) {
          return { type: 'tableau', pileIndex: i, cardIndex: j, card: pile[j] };
        }
      }
    }

    return null;
  }

  update() {
    // solitaire is mostly event-driven; no per-frame physics needed
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const { cardW, cardH, r, tableauDy } = this.layout;
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
    ctx.fillText(this.state.message, w / 2, h - 30);

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
    const wTop = this.waste[this.waste.length - 1];
    if (wTop) this._drawCardFace(pos.waste.x, pos.waste.y, wTop);

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
      for (let j = 0; j < pile.length; j++) {
        const c = pile[j];
        const x = p.x;
        const y = p.y + j * tableauDy;

        // If dragging, skip drawing the moving cards in their original pile
        if (this.drag && this.drag.from.type === 'tableau' && this.drag.from.pileIndex === i && j >= this.drag.from.cardIndex) {
          continue;
        }

        if (c.faceUp) this._drawCardFace(x, y, c);
        else this._drawCardBack(x, y);
      }
    }

    // Drag rendering (on top)
    if (this.drag) {
      const dx = this.drag.x;
      const dy = this.drag.y;
      for (let i = 0; i < this.drag.cards.length; i++) {
        const c = this.drag.cards[i];
        this._drawCardFace(dx, dy + i * tableauDy, c, { lifting: true });
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
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = '#ffffff';
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
    ctx.fillText(rankToLabel(card.rank), x + 10, y + 24);
    ctx.fillText(SUIT_SYMBOL[card.suit], x + 10, y + 44);

    ctx.textAlign = 'right';
    ctx.save();
    ctx.translate(x + cardW - 10, y + cardH - 10);
    ctx.rotate(Math.PI);
    ctx.fillText(rankToLabel(card.rank), 0, 0);
    ctx.fillText(SUIT_SYMBOL[card.suit], 0, 20);
    ctx.restore();

    ctx.restore();
  }

  destroy() {
    this.destroyed = true;
    this.canvas.removeEventListener('mousemove', this._onMouseMove);
    this.canvas.removeEventListener('mousedown', this._onMouseDown);
    window.removeEventListener('mouseup', this._onMouseUp);
    window.removeEventListener('keydown', this._onKeyDown);
  }
}

