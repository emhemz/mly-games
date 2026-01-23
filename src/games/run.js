export class RunGame {
  init(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx ?? canvas.getContext('2d');
    this.destroyed = false;

    // Internal resolution
    this.canvas.width = 1200;
    this.canvas.height = 800;
    this.canvas.style.touchAction = 'none';

    // Player state
    this.player = {
      x: 0, // position on current wall (-1 to 1, center is 0)
      z: 100, // how far forward we've traveled
      wall: 0, // which wall (0=floor, 1=right, 2=ceiling, 3=left)
      vx: 0, // velocity x
      speed: 300, // forward speed (z velocity)
      jumping: false,
      jumpTimer: 0,
    };

    // Camera rotation for smooth wall transitions
    this.cameraRotation = 0;
    this.targetRotation = 0;

    // Tunnel segments (platforms/floors with holes)
    this.segments = [];
    this.particles = [];
    this.stars = []; // background stars
    this.score = 0;
    this.gameOver = false;

    // Input
    this.input = {
      jump: false,
      left: false,
      right: false,
      pointerDown: false,
    };

    this._time = 0;
    this._lastSegmentZ = 0;

    // Generate background stars
    for (let i = 0; i < 200; i++) {
      this.stars.push({
        x: (Math.random() - 0.5) * 3000,
        y: (Math.random() - 0.5) * 3000,
        z: Math.random() * 5000,
        size: 0.5 + Math.random() * 1.5,
      });
    }

    // Generate initial tunnel segments
    for (let i = 0; i < 30; i++) {
      this._generateSegment();
    }

    // Event listeners
    this._onKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        this.input.jump = true;
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.input.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.input.right = true;
      }
      if (e.key === 'r' || e.key === 'R') {
        this._reset();
      }
    };

    this._onKeyUp = (e) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        this.input.jump = false;
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.input.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.input.right = false;
      }
    };

    this._onPointerDown = (e) => {
      this.input.pointerDown = true;
      this.input.jump = true;
    };

    this._onPointerUp = (e) => {
      this.input.pointerDown = false;
      this.input.jump = false;
    };

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    this.canvas.addEventListener('pointerdown', this._onPointerDown);
    window.addEventListener('pointerup', this._onPointerUp);
  }

  _reset() {
    this.player = {
      x: 0,
      z: 100,
      wall: 0,
      vx: 0,
      speed: 300,
      jumping: false,
      jumpTimer: 0,
    };
    this.cameraRotation = 0;
    this.targetRotation = 0;
    this.segments = [];
    this._lastSegmentZ = 0;
    for (let i = 0; i < 30; i++) {
      this._generateSegment();
    }
    this.score = 0;
    this.gameOver = false;
    this.particles = [];
  }

  _generateSegment() {
    const z = this._lastSegmentZ;
    const length = 100;
    
    // Determine which walls have floor (0=floor, 1=right, 2=ceiling, 3=left)
    // Early game: mostly just floor
    const progress = z / 2000;
    const segment = {
      z: z,
      length: length,
      walls: [
        this._generateWallSegment(0, progress), // floor
        this._generateWallSegment(1, progress), // right wall
        this._generateWallSegment(2, progress), // ceiling
        this._generateWallSegment(3, progress), // left wall
      ],
    };
    
    this.segments.push(segment);
    this._lastSegmentZ += length;
  }

  _generateWallSegment(wallIndex, progress) {
    // Floor (wall 0) is most common in the beginning
    let chance;
    if (wallIndex === 0) {
      // Floor: always there
      chance = 1.0;
    } else {
      // Other walls: rare in beginning, more common later
      chance = Math.max(0, progress - 0.3) * 0.8;
    }
    
    const hasPlatform = Math.random() < chance;
    
    if (!hasPlatform) return null;
    
    // Generate holes in the platform
    const holes = [];
    
    // No holes at the start for floor, gradually add them
    let numHoles = 0;
    if (wallIndex === 0) {
      // Floor: start with no holes, gradually add them
      if (progress > 0.3) {
        numHoles = Math.floor(Math.random() * Math.min(3, (progress - 0.3) * 5));
      }
    } else {
      // Other walls: more holes
      numHoles = Math.floor(Math.random() * (1 + progress * 2));
    }
    
    for (let i = 0; i < numHoles; i++) {
      holes.push({
        x: (Math.random() - 0.5) * 1.6, // -0.8 to 0.8
        width: 0.2 + Math.random() * 0.3,
      });
    }
    
    return { holes };
  }

  _createParticles(x, y, z, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100;
      this.particles.push({
        x: x,
        y: y,
        z: z,
        vx: Math.cos(angle) * speed * 0.5,
        vy: Math.sin(angle) * speed * 0.5,
        vz: (Math.random() - 0.5) * 100,
        life: 1,
        size: 2 + Math.random() * 3,
      });
    }
  }

  update(deltaTime) {
    if (this.destroyed || this.gameOver) return;
    const dt = Math.min(0.033, deltaTime);
    this._time += dt;

    // Move forward
    this.player.z += this.player.speed * dt;
    this.score = Math.floor(this.player.z / 10);

    // Increase speed over time
    this.player.speed += dt * 10;
    this.player.speed = Math.min(600, this.player.speed);

    // Horizontal movement
    const moveSpeed = 3;
    if (this.input.left) this.player.vx = -moveSpeed * dt;
    else if (this.input.right) this.player.vx = moveSpeed * dt;
    else this.player.vx *= 0.8; // friction

    this.player.x += this.player.vx;
    this.player.x = Math.max(-1, Math.min(1, this.player.x));

    // Jump to adjacent walls
    if (this.input.jump && !this.player.jumping && this.player.jumpTimer <= 0) {
      this.player.jumping = true;
      this.player.jumpTimer = 0.3;
      
      // Determine which wall to jump to based on current wall
      // If no horizontal input, cycle through walls
      const nextWall = (this.player.wall + 1) % 4;
      this.player.wall = nextWall;
      this.targetRotation = -nextWall * 90;
      
      this._createParticles(this.player.x * 200, 0, this.player.z, 20);
    }

    if (this.player.jumpTimer > 0) {
      this.player.jumpTimer -= dt;
      if (this.player.jumpTimer <= 0) {
        this.player.jumping = false;
      }
    }

    // Smooth camera rotation to match current wall
    const rotDiff = this.targetRotation - this.cameraRotation;
    this.cameraRotation += rotDiff * dt * 8;

    // Check for collision with floor/walls
    const currentSegment = this.segments.find(
      s => this.player.z >= s.z && this.player.z < s.z + s.length
    );

    if (currentSegment) {
      const wall = currentSegment.walls[this.player.wall];
      if (!wall) {
        // No platform on this wall - fall into space!
        this.gameOver = true;
      } else {
        // Check if player is in a hole
        for (const hole of wall.holes) {
          const holeLeft = hole.x - hole.width / 2;
          const holeRight = hole.x + hole.width / 2;
          if (this.player.x >= holeLeft && this.player.x <= holeRight) {
            // Fell through a hole!
            this.gameOver = true;
            break;
          }
        }
      }
    }

    // Generate new segments as we move forward
    while (this._lastSegmentZ < this.player.z + 2000) {
      this._generateSegment();
    }

    // Remove old segments
    this.segments = this.segments.filter(s => s.z > this.player.z - 500);

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.life -= dt * 2;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Clear and draw space background
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, w, h);

    // Draw stars in space
    this._drawStars();

    // Set up 3D transformation
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(this.cameraRotation * Math.PI / 180);

    // Draw tunnel segments
    this._drawTunnel();

    // Draw player
    this._drawPlayer();

    // Draw particles
    for (const p of this.particles) {
      const relZ = p.z - this.player.z;
      if (relZ > -200 && relZ < 1000) {
        const scale = 400 / (relZ + 400);
        ctx.globalAlpha = p.life * scale;
        ctx.fillStyle = '#ffffff';
        const size = p.size * scale;
        ctx.fillRect(p.x * scale - size / 2, p.y * scale - size / 2, size, size);
      }
    }

    ctx.restore();

    // HUD - reset all transforms and alpha
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    
    if (this.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, w, h);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 48px "Space Grotesk", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', w / 2, h / 2 - 40);
      
      ctx.font = '500 24px "Space Grotesk", system-ui, sans-serif';
      ctx.fillText(`Score: ${this.score}`, w / 2, h / 2 + 20);
      
      ctx.font = '400 18px "Space Grotesk", system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText('Press R to restart', w / 2, h / 2 + 60);
    } else {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(20, 18, 380, 54);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.font = '700 20px "Space Grotesk", system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Run • ${this.score}`, 36, 48);
      ctx.font = '500 14px "Space Grotesk", system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText('SPACE to flip • Arrow keys to move • R to reset', 36, 68);
    }
    ctx.restore();
  }

  _drawStars() {
    const ctx = this.ctx;
    for (const star of this.stars) {
      const relZ = star.z - this.player.z;
      if (relZ > -500 && relZ < 3000) {
        const scale = 600 / (relZ + 600);
        const alpha = Math.min(1, scale * 2);
        ctx.globalAlpha = alpha * 0.8;
        ctx.fillStyle = '#ffffff';
        const size = star.size * scale;
        ctx.fillRect(
          this.canvas.width / 2 + star.x * scale - size / 2,
          this.canvas.height / 2 + star.y * scale - size / 2,
          size,
          size
        );
      }
    }
    ctx.globalAlpha = 1;
  }

  _drawTunnel() {
    const ctx = this.ctx;
    const tunnelWidth = 300;
    
    // Draw segments in 3D perspective
    for (const segment of this.segments) {
      const relZ = segment.z - this.player.z;
      if (relZ < -200 || relZ > 1500) continue;
      
      const scale = 400 / (relZ + 400);
      const w = tunnelWidth * scale;
      const nextZ = segment.z + segment.length - this.player.z;
      const nextScale = 400 / (nextZ + 400);
      const nextW = tunnelWidth * nextScale;
      
      // Draw each wall of the square tunnel
      for (let wallIdx = 0; wallIdx < 4; wallIdx++) {
        const wall = segment.walls[wallIdx];
        if (!wall) continue;
        
        this._drawWall(wallIdx, w, nextW, scale, wall);
      }
    }
  }

  _drawWall(wallIdx, w, nextW, scale, wall) {
    const ctx = this.ctx;
    
    // Determine wall position based on which wall it is
    // 0=floor, 1=right, 2=ceiling, 3=left
    let points = [];
    let nextPoints = [];
    
    switch (wallIdx) {
      case 0: // floor
        points = [[-w/2, w/2], [w/2, w/2]];
        nextPoints = [[-nextW/2, nextW/2], [nextW/2, nextW/2]];
        break;
      case 1: // right wall
        points = [[w/2, w/2], [w/2, -w/2]];
        nextPoints = [[nextW/2, nextW/2], [nextW/2, -nextW/2]];
        break;
      case 2: // ceiling
        points = [[w/2, -w/2], [-w/2, -w/2]];
        nextPoints = [[nextW/2, -nextW/2], [-nextW/2, -nextW/2]];
        break;
      case 3: // left wall
        points = [[-w/2, -w/2], [-w/2, w/2]];
        nextPoints = [[-nextW/2, -nextW/2], [-nextW/2, nextW/2]];
        break;
    }
    
    // Draw solid platform base
    ctx.fillStyle = '#1a1a2e';
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    ctx.lineTo(points[1][0], points[1][1]);
    ctx.lineTo(nextPoints[1][0], nextPoints[1][1]);
    ctx.lineTo(nextPoints[0][0], nextPoints[0][1]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Draw holes (as dark space)
    for (const hole of wall.holes) {
      const holeLeft = hole.x - hole.width / 2;
      const holeRight = hole.x + hole.width / 2;
      
      const p1 = this._lerp(points[0], points[1], (holeLeft + 1) / 2);
      const p2 = this._lerp(points[0], points[1], (holeRight + 1) / 2);
      const p3 = this._lerp(nextPoints[0], nextPoints[1], (holeRight + 1) / 2);
      const p4 = this._lerp(nextPoints[0], nextPoints[1], (holeLeft + 1) / 2);
      
      ctx.fillStyle = '#050510';
      ctx.beginPath();
      ctx.moveTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.lineTo(p3[0], p3[1]);
      ctx.lineTo(p4[0], p4[1]);
      ctx.closePath();
      ctx.fill();
      
      // Draw hole edges with subtle glow
      ctx.strokeStyle = 'rgba(100, 50, 150, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const t = i / 4;
      const p1 = this._lerp(points[0], points[1], t);
      const p2 = this._lerp(nextPoints[0], nextPoints[1], t);
      ctx.beginPath();
      ctx.moveTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.stroke();
    }
  }

  _lerp(a, b, t) {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }

  _drawPlayer() {
    const ctx = this.ctx;
    
    // Player position on current wall
    const x = this.player.x * 150;
    const y = 150; // distance from center
    
    // Draw player as a small creature
    ctx.save();
    ctx.translate(x, y);
    
    // Body
    ctx.fillStyle = '#9ca3af';
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Arms
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-8, 2);
    ctx.lineTo(-14, -2);
    ctx.moveTo(8, 2);
    ctx.lineTo(14, -2);
    ctx.stroke();
    
    // Eyes
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(-4, -4, 3, 0, Math.PI * 2);
    ctx.arc(4, -4, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  destroy() {
    this.destroyed = true;
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    this.canvas.removeEventListener('pointerdown', this._onPointerDown);
    window.removeEventListener('pointerup', this._onPointerUp);
  }
}
