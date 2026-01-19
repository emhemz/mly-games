import { BreakoutAudio } from './breakout-audio.js';

export class BreakoutGame {
  init(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx ?? canvas.getContext('2d');
    this.destroyed = false;
    this.audio = new BreakoutAudio();

    // Fixed-size like the rest of the games (simple + consistent)
    this.canvas.width = 1200;
    this.canvas.height = 800;

    this.state = {
      score: 0,
      lives: 3,
      started: false,
      gameOver: false,
      won: false,
    };

    // Paddle
    this.paddle = {
      w: 170,
      h: 16,
      x: (this.canvas.width - 170) / 2,
      y: this.canvas.height - 90,
      speed: 880, // px/sec
      vx: 0,
    };

    // Ball
    this.ball = {
      r: 9,
      x: this.canvas.width / 2,
      y: this.paddle.y - 18,
      vx: 0,
      vy: 0,
      speed: 560,
      stuckToPaddle: true,
    };

    // Bricks (rainbow rows)
    this.bricks = [];
    this.brick = {
      rows: 6,
      cols: 14,
      h: 22,
      gap: 8,
      top: 110,
      sidePad: 80,
    };

    this.rainbow = ['#ff3b30', '#ff9500', '#ffd60a', '#34c759', '#0a84ff', '#5e5ce6'];
    this._buildBricks();

    // Input
    this.input = {
      left: false,
      right: false,
      mouseX: null,
      usingMouse: false,
    };

    this._onKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.input.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.input.right = true;
      if (e.key === ' ' || e.key === 'Enter') this._launchBall();
      if (e.key === 'r' || e.key === 'R') this._restart();
    };

    this._onKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.input.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.input.right = false;
    };

    this._onMouseMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.input.mouseX = e.clientX - rect.left;
      this.input.usingMouse = true;
    };

    this._onClick = () => {
      this._launchBall();
    };

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    this.canvas.addEventListener('mousemove', this._onMouseMove);
    this.canvas.addEventListener('click', this._onClick);
  }

  _buildBricks() {
    const { rows, cols, h, gap, top, sidePad } = this.brick;
    const usableW = this.canvas.width - sidePad * 2;
    const w = (usableW - gap * (cols - 1)) / cols;

    this.bricks = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = sidePad + c * (w + gap);
        const y = top + r * (h + gap);
        this.bricks.push({
          x,
          y,
          w,
          h,
          alive: true,
          color: this.rainbow[r % this.rainbow.length],
          // a few gaps like the screenshot (pattern)
          hole:
            (r === 3 && (c === 3 || c === 4 || c === 9 || c === 10)) ||
            (r === 4 && (c === 5 || c === 8)) ||
            (r === 5 && (c === 1 || c === 12)),
        });
      }
    }

    // Apply holes
    for (const b of this.bricks) {
      if (b.hole) b.alive = false;
    }
  }

  _restart() {
    this.state.score = 0;
    this.state.lives = 3;
    this.state.started = false;
    this.state.gameOver = false;
    this.state.won = false;

    this.paddle.x = (this.canvas.width - this.paddle.w) / 2;
    this.ball.x = this.canvas.width / 2;
    this.ball.y = this.paddle.y - 18;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.stuckToPaddle = true;

    this._buildBricks();
  }

  _launchBall() {
    if (this.state.gameOver || this.state.won) return;
    if (!this.ball.stuckToPaddle) return;

    // Audio must be resumed after a user gesture
    this.audio.resume();

    this.state.started = true;
    this.ball.stuckToPaddle = false;

    // Launch slightly randomized but controlled
    const angle = (-Math.PI / 2) + (Math.random() * 0.6 - 0.3); // mostly up
    this.ball.vx = Math.cos(angle) * this.ball.speed;
    this.ball.vy = Math.sin(angle) * this.ball.speed;
    this.audio.launch();
  }

  update(deltaTime) {
    if (this.destroyed) return;
    const dt = Math.min(0.033, deltaTime); // clamp for stability

    // Paddle movement
    const left = this.input.left ? -1 : 0;
    const right = this.input.right ? 1 : 0;
    const dir = left + right;

    if (this.input.usingMouse && this.input.mouseX != null) {
      // Mouse follows (smoothly)
      const target = this.input.mouseX - this.paddle.w / 2;
      const alpha = 1 - Math.pow(0.0001, dt); // framerate independent smoothing
      this.paddle.x = this.paddle.x + (target - this.paddle.x) * alpha;
    } else {
      this.paddle.x += dir * this.paddle.speed * dt;
    }

    this.paddle.x = Math.max(30, Math.min(this.canvas.width - 30 - this.paddle.w, this.paddle.x));

    // Ball follows paddle before launch
    if (this.ball.stuckToPaddle) {
      this.ball.x = this.paddle.x + this.paddle.w / 2;
      this.ball.y = this.paddle.y - this.ball.r - 6;
      return;
    }

    // Ball physics
    this.ball.x += this.ball.vx * dt;
    this.ball.y += this.ball.vy * dt;

    // Wall collisions
    if (this.ball.x - this.ball.r < 30) {
      this.ball.x = 30 + this.ball.r;
      this.ball.vx *= -1;
      this.audio.wall();
    }
    if (this.ball.x + this.ball.r > this.canvas.width - 30) {
      this.ball.x = this.canvas.width - 30 - this.ball.r;
      this.ball.vx *= -1;
      this.audio.wall();
    }
    if (this.ball.y - this.ball.r < 80) {
      this.ball.y = 80 + this.ball.r;
      this.ball.vy *= -1;
      this.audio.wall();
    }

    // Paddle collision
    if (
      this.ball.y + this.ball.r >= this.paddle.y &&
      this.ball.y + this.ball.r <= this.paddle.y + this.paddle.h + 8 &&
      this.ball.x >= this.paddle.x &&
      this.ball.x <= this.paddle.x + this.paddle.w &&
      this.ball.vy > 0
    ) {
      this.ball.y = this.paddle.y - this.ball.r - 0.5;

      // “English” based on hit position
      const hit = (this.ball.x - (this.paddle.x + this.paddle.w / 2)) / (this.paddle.w / 2);
      const maxAngle = Math.PI * 0.35; // ~63 degrees
      const angle = (-Math.PI / 2) + hit * maxAngle;

      const speed = Math.min(840, Math.hypot(this.ball.vx, this.ball.vy) * 1.01);
      this.ball.vx = Math.cos(angle) * speed;
      this.ball.vy = Math.sin(angle) * speed;

      this.audio.paddle(Math.abs(hit));
    }

    // Brick collisions (simple AABB)
    const bx = this.ball.x;
    const by = this.ball.y;
    const br = this.ball.r;

    let hitBrick = null;
    for (const b of this.bricks) {
      if (!b.alive) continue;
      const nearestX = Math.max(b.x, Math.min(bx, b.x + b.w));
      const nearestY = Math.max(b.y, Math.min(by, b.y + b.h));
      const dx = bx - nearestX;
      const dy = by - nearestY;
      if (dx * dx + dy * dy <= br * br) {
        hitBrick = b;
        break;
      }
    }

    if (hitBrick) {
      hitBrick.alive = false;
      this.state.score += 10;
      // row index from y position
      const rowIndex = Math.max(0, Math.round((hitBrick.y - this.brick.top) / (this.brick.h + this.brick.gap)));
      this.audio.brick(rowIndex);

      // Reflect based on which side we hit more
      const cx = hitBrick.x + hitBrick.w / 2;
      const cy = hitBrick.y + hitBrick.h / 2;
      const dx = (bx - cx) / (hitBrick.w / 2);
      const dy = (by - cy) / (hitBrick.h / 2);
      if (Math.abs(dx) > Math.abs(dy)) this.ball.vx *= -1;
      else this.ball.vy *= -1;

      // Win check (ignore holes)
      const anyAlive = this.bricks.some((b) => b.alive);
      if (!anyAlive) {
        this.state.won = true;
        this.audio.win();
      }
    }

    // Bottom out
    if (this.ball.y - this.ball.r > this.canvas.height + 40) {
      this.state.lives -= 1;
      if (this.state.lives <= 0) {
        this.state.gameOver = true;
        this.audio.gameOver();
      } else {
        this.ball.stuckToPaddle = true;
        this.ball.vx = 0;
        this.ball.vy = 0;
        this.audio.lifeLost();
      }
    }
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Frame like the screenshot
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, w, h);

    // Inner “screen”
    ctx.fillStyle = '#0b0b0e';
    ctx.fillRect(30, 80, w - 60, h - 140);

    // Bricks
    for (const b of this.bricks) {
      if (!b.alive) continue;
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.w, b.h);
    }

    // Paddle
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.w, this.paddle.h);

    // Ball
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(this.ball.x, this.ball.y, this.ball.r, 0, Math.PI * 2);
    ctx.fill();

    // HUD (pixel-ish)
    ctx.fillStyle = '#e6e6e6';
    ctx.font = '700 44px "Space Grotesk", system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(String(this.state.score).padStart(3, '0'), 60, 60);

    ctx.textAlign = 'right';
    ctx.fillText(String(this.state.lives), w - 60, 60);

    // Helper text
    if (!this.state.started) {
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(230, 230, 230, 0.9)';
      ctx.font = '600 20px "Space Grotesk", system-ui, sans-serif';
      ctx.fillText('Click / Space to launch • Move with Mouse or ← →', w / 2, h - 40);
    }

    if (this.state.gameOver || this.state.won) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(30, 80, w - 60, h - 140);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 56px "Outfit", system-ui, sans-serif';
      ctx.fillText(this.state.won ? 'YOU WIN' : 'GAME OVER', w / 2, h / 2 - 10);
      ctx.font = '600 22px "Space Grotesk", system-ui, sans-serif';
      ctx.fillText('Press R to restart', w / 2, h / 2 + 40);
    }
  }

  destroy() {
    this.destroyed = true;
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    this.canvas.removeEventListener('mousemove', this._onMouseMove);
    this.canvas.removeEventListener('click', this._onClick);

    if (this.audio) this.audio.close();
  }
}

