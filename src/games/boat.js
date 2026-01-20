export class BoatGame {
  init(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx ?? canvas.getContext('2d');
    this.destroyed = false;

    // Internal resolution (CSS scales for mobile)
    this.canvas.width = 1200;
    this.canvas.height = 800;
    this.canvas.style.touchAction = 'none';

    this.world = { w: 4200, h: 3000 };

    this.boat = {
      x: this.world.w * 0.5,
      y: this.world.h * 0.6,
      angle: -Math.PI / 2,
      speed: 0,
      maxSpeed: 520,
      accel: 520,
      turnRate: 2.8,
      drag: 0.985, // base drag (we'll modulate it with throttle)
      radius: 22,
    };

    this.camera = { x: 0, y: 0 };
    this.ui = { score: 0 };

    this.input = {
      left: false,
      right: false,
      up: false,
      down: false,
      pointerDown: false,
      pointerX: 0,
      pointerY: 0,
    };

    this._rng = this._mulberry32(0x626f6174); // "boat"
    this.spawn = { x: this.boat.x, y: this.boat.y };
    this.islands = this._generateIslands(14);
    this.buoys = this._generateBuoys(16);

    this._time = 0;
    this._waveTile = this._makeWaveTile();

    this._canvasPoint = (clientX, clientY) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    };

    // Pointer (touch + mouse)
    this._onPointerDown = (e) => {
      const p = this._canvasPoint(e.clientX, e.clientY);
      this.input.pointerDown = true;
      this.input.pointerX = p.x;
      this.input.pointerY = p.y;
      if (typeof this.canvas.setPointerCapture === 'function') {
        try {
          this.canvas.setPointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      }
    };
    this._onPointerMove = (e) => {
      if (!this.input.pointerDown) return;
      const p = this._canvasPoint(e.clientX, e.clientY);
      this.input.pointerX = p.x;
      this.input.pointerY = p.y;
    };
    this._onPointerUp = () => {
      this.input.pointerDown = false;
    };

    // Keyboard
    this._onKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.input.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.input.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.input.up = true;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.input.down = true;
      if (e.key === 'r' || e.key === 'R') this._reset();
    };
    this._onKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.input.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.input.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.input.up = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.input.down = false;
    };

    this.canvas.addEventListener('pointerdown', this._onPointerDown);
    this.canvas.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerup', this._onPointerUp);
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  _reset() {
    this.boat.x = this.world.w * 0.5;
    this.boat.y = this.world.h * 0.6;
    this.boat.angle = -Math.PI / 2;
    this.boat.speed = 0;
    this.ui.score = 0;
    this.buoys = this._generateBuoys(16);
  }

  _mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  _rand(min, max) {
    return min + (max - min) * this._rng();
  }

  _generateIslands(n) {
    const arr = [];
    for (let i = 0; i < n; i++) {
      // Smaller islands so we don't get giant blobs dominating the screen
      const r = this._rand(70, 150);

      // Keep islands away from spawn + away from each other
      let placed = false;
      for (let tries = 0; tries < 250; tries++) {
        const x = this._rand(r + 140, this.world.w - r - 140);
        const y = this._rand(r + 140, this.world.h - r - 140);

        const farFromSpawn = (x - this.spawn.x) ** 2 + (y - this.spawn.y) ** 2 > (560) ** 2;
        const farFromOthers = arr.every((o) => (x - o.x) ** 2 + (y - o.y) ** 2 > (o.r + r + 180) ** 2);

        if (farFromSpawn && farFromOthers) {
          arr.push({ x, y, r });
          placed = true;
          break;
        }
      }

      if (!placed) {
        // fallback
        const x = this._rand(r + 140, this.world.w - r - 140);
        const y = this._rand(r + 140, this.world.h - r - 140);
        arr.push({ x, y, r });
      }
    }
    return arr;
  }

  _spawnBuoy() {
    for (let tries = 0; tries < 200; tries++) {
      const x = this._rand(120, this.world.w - 120);
      const y = this._rand(120, this.world.h - 120);
      const ok = this.islands.every((isle) => (x - isle.x) ** 2 + (y - isle.y) ** 2 > (isle.r + 90) ** 2);
      if (ok) return { x, y };
    }
    return { x: this._rand(120, this.world.w - 120), y: this._rand(120, this.world.h - 120) };
  }

  _generateBuoys(n) {
    return Array.from({ length: n }, () => this._spawnBuoy());
  }

  _makeWaveTile() {
    const tile = document.createElement('canvas');
    tile.width = 240;
    tile.height = 240;
    const c = tile.getContext('2d');

    const g = c.createLinearGradient(0, 0, 0, tile.height);
    g.addColorStop(0, '#071b2d');
    g.addColorStop(1, '#051a2a');
    c.fillStyle = g;
    c.fillRect(0, 0, tile.width, tile.height);

    c.strokeStyle = 'rgba(120, 190, 255, 0.10)';
    c.lineWidth = 2;
    for (let y = 14; y < tile.height + 24; y += 24) {
      c.beginPath();
      for (let x = -10; x <= tile.width + 10; x += 18) {
        const yy = y + Math.sin((x + y) * 0.08) * 4;
        c.lineTo(x, yy);
      }
      c.stroke();
    }

    // sparkles
    for (let i = 0; i < 40; i++) {
      const x = Math.floor(this._rand(0, tile.width));
      const y = Math.floor(this._rand(0, tile.height));
      c.fillStyle = `rgba(255,255,255,${this._rand(0.02, 0.06)})`;
      c.fillRect(x, y, 2, 2);
    }

    return tile;
  }

  _angleDiff(a, b) {
    let d = a - b;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return d;
  }

  update(deltaTime) {
    if (this.destroyed) return;
    const dt = Math.min(0.033, deltaTime);
    this._time += dt;

    // steering + throttle (keyboard)
    let steer = 0;
    if (this.input.left) steer -= 1;
    if (this.input.right) steer += 1;

    if (this.input.up) this.boat.speed += this.boat.accel * dt;
    if (this.input.down) this.boat.speed -= this.boat.accel * 0.7 * dt;

    // Pointer steering (like before): point to steer direction, distance = throttle
    // Idea: the farther you drag from the center, the faster you go.
    // If you drag closer to the center, it slows down faster (more drag).
    let throttle01 = 0;
    if (this.input.pointerDown) {
      const cx = this.canvas.width * 0.5;
      const cy = this.canvas.height * 0.55;
      const dx = this.input.pointerX - cx;
      const dy = this.input.pointerY - cy;

      const desired = Math.atan2(dy, dx);
      const diff = this._angleDiff(desired, this.boat.angle);
      steer = Math.max(-1, Math.min(1, diff / 0.9));

      const dist = Math.hypot(dx, dy);
      // 0..1 throttle based on distance
      throttle01 = Math.max(0, Math.min(1, (dist - 25) / 260));
      this.boat.speed += this.boat.accel * throttle01 * dt;
    }

    this.boat.speed = Math.max(-160, Math.min(this.boat.maxSpeed, this.boat.speed));

    // Steering sensitivity scales a bit with speed
    const turnFactor = 0.35 + 0.65 * Math.min(1, Math.abs(this.boat.speed) / 220);
    this.boat.angle += steer * this.boat.turnRate * turnFactor * dt;

    // drag (dynamic): when you're not dragging far (low throttle), slow down more.
    // This matches: "jo mindre, jo saktere" (closer drag => more slow-down)
    const dragEff = this.input.pointerDown
      ? (0.94 + 0.045 * throttle01) // throttle01=0 -> 0.94 (more slowdown), throttle01=1 -> 0.985 (glide)
      : this.boat.drag;
    this.boat.speed *= Math.pow(dragEff, dt * 60);

    // move
    const vx = Math.cos(this.boat.angle) * this.boat.speed;
    const vy = Math.sin(this.boat.angle) * this.boat.speed;
    this.boat.x += vx * dt;
    this.boat.y += vy * dt;

    // bounds
    const m = 70;
    if (this.boat.x < m) { this.boat.x = m; this.boat.speed *= -0.25; }
    if (this.boat.y < m) { this.boat.y = m; this.boat.speed *= -0.25; }
    if (this.boat.x > this.world.w - m) { this.boat.x = this.world.w - m; this.boat.speed *= -0.25; }
    if (this.boat.y > this.world.h - m) { this.boat.y = this.world.h - m; this.boat.speed *= -0.25; }

    // island collision
    for (const isle of this.islands) {
      const dx = this.boat.x - isle.x;
      const dy = this.boat.y - isle.y;
      const d = Math.hypot(dx, dy);
      const minD = isle.r + this.boat.radius;
      if (d < minD) {
        const nx = dx / (d || 1);
        const ny = dy / (d || 1);
        this.boat.x = isle.x + nx * minD;
        this.boat.y = isle.y + ny * minD;
        this.boat.speed *= 0.55;
      }
    }

    // collect buoys
    for (let i = this.buoys.length - 1; i >= 0; i--) {
      const b = this.buoys[i];
      const dx = this.boat.x - b.x;
      const dy = this.boat.y - b.y;
      if (dx * dx + dy * dy < 48 * 48) {
        this.buoys.splice(i, 1);
        this.ui.score += 1;
        this.buoys.push(this._spawnBuoy());
      }
    }

    // camera
    const targetX = this.boat.x - this.canvas.width / 2;
    const targetY = this.boat.y - this.canvas.height / 2;
    const alpha = 1 - Math.pow(0.0001, dt);
    this.camera.x += (targetX - this.camera.x) * alpha;
    this.camera.y += (targetY - this.camera.y) * alpha;
    this.camera.x = Math.max(0, Math.min(this.world.w - this.canvas.width, this.camera.x));
    this.camera.y = Math.max(0, Math.min(this.world.h - this.canvas.height, this.camera.y));
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // draw water tiled
    const ox = -((this.camera.x * 0.35 + this._time * 22) % this._waveTile.width);
    const oy = -((this.camera.y * 0.35 + this._time * 16) % this._waveTile.height);
    for (let y = oy; y < h + this._waveTile.height; y += this._waveTile.height) {
      for (let x = ox; x < w + this._waveTile.width; x += this._waveTile.width) {
        ctx.drawImage(this._waveTile, x, y);
      }
    }

    // islands
    for (const isle of this.islands) {
      const sx = isle.x - this.camera.x;
      const sy = isle.y - this.camera.y;
      if (sx < -300 || sy < -300 || sx > w + 300 || sy > h + 300) continue;

      const sand = ctx.createRadialGradient(sx - isle.r * 0.2, sy - isle.r * 0.2, 0, sx, sy, isle.r);
      sand.addColorStop(0, '#f9d29d');
      sand.addColorStop(0.75, '#eab676');
      sand.addColorStop(1, '#c98c46');
      ctx.fillStyle = sand;
      ctx.beginPath();
      ctx.arc(sx, sy, isle.r, 0, Math.PI * 2);
      ctx.fill();

      const green = ctx.createRadialGradient(sx, sy, 0, sx, sy, isle.r * 0.85);
      green.addColorStop(0, '#2ecc71');
      green.addColorStop(1, '#1b7f49');
      ctx.fillStyle = green;
      ctx.beginPath();
      ctx.arc(sx, sy, isle.r * 0.78, 0, Math.PI * 2);
      ctx.fill();
    }

    // buoys
    for (const b of this.buoys) {
      const sx = b.x - this.camera.x;
      const sy = b.y - this.camera.y;
      if (sx < -50 || sy < -50 || sx > w + 50 || sy > h + 50) continue;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(sx, sy, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // boat (screen coords)
    const bx = this.boat.x - this.camera.x;
    const by = this.boat.y - this.camera.y;
    this._drawBoat(bx, by, this.boat.angle);

    // HUD
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(20, 18, 420, 54);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '700 20px "Space Grotesk", system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Boat • score ${this.ui.score}`, 36, 48);
    ctx.font = '500 14px "Space Grotesk", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('WASD/Arrows • Drag to steer & go faster • R to reset', 36, 68);

    // mini compass
    ctx.save();
    ctx.translate(w - 62, 54);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.rotate(this.boat.angle);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(6, 10);
    ctx.lineTo(0, 6);
    ctx.lineTo(-6, 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // (No joystick overlay — keep it clean)
  }

  _drawBoat(x, y, angle) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // wake
    ctx.fillStyle = 'rgba(150, 220, 255, 0.10)';
    ctx.beginPath();
    ctx.ellipse(-18, 0, 10, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // hull
    const hull = ctx.createLinearGradient(0, -20, 0, 20);
    hull.addColorStop(0, '#ff8a5c');
    hull.addColorStop(1, '#e24a3b');
    ctx.fillStyle = hull;
    ctx.beginPath();
    ctx.moveTo(26, 0);
    ctx.lineTo(8, 16);
    ctx.lineTo(-22, 14);
    ctx.lineTo(-26, 0);
    ctx.lineTo(-22, -14);
    ctx.lineTo(8, -16);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // cabin
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect?.(-6, -10, 18, 20, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.stroke();

    // window
    ctx.fillStyle = 'rgba(59,130,246,0.55)';
    ctx.beginPath();
    ctx.ellipse(2, -2, 5, 7, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  destroy() {
    this.destroyed = true;
    this.canvas.removeEventListener('pointerdown', this._onPointerDown);
    this.canvas.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('pointerup', this._onPointerUp);
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
  }
}

