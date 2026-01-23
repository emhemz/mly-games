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
      x: 0, // rotation around tunnel (0-360 degrees)
      y: 0, // distance from center
      targetY: 120, // target distance from center (on wall)
      gravity: 0, // which wall we're on (0=bottom, 90=right, 180=top, 270=left)
      jumping: false,
      jumpSpeed: 0,
      speed: 300, // forward speed
      rotation: 0, // visual rotation
    };

    // Camera/perspective
    this.camera = {
      z: 0, // how far we've traveled
      rotation: 0, // tunnel rotation
      tilt: 0,
    };

    // Platforms/obstacles
    this.platforms = [];
    this.particles = [];
    this.score = 0;
    this.gameOver = false;

    // Input
    this.input = {
      jump: false,
      pointerDown: false,
    };

    this._time = 0;
    this._lastPlatformZ = 0;

    // Generate initial platforms
    for (let i = 0; i < 20; i++) {
      this._generatePlatform();
    }

    // Event listeners
    this._onKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        this.input.jump = true;
      }
      if (e.key === 'r' || e.key === 'R') {
        this._reset();
      }
    };

    this._onKeyUp = (e) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        this.input.jump = false;
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
      y: 0,
      targetY: 120,
      gravity: 0,
      jumping: false,
      jumpSpeed: 0,
      speed: 300,
      rotation: 0,
    };
    this.camera = {
      z: 0,
      rotation: 0,
      tilt: 0,
    };
    this.platforms = [];
    this._lastPlatformZ = 0;
    for (let i = 0; i < 20; i++) {
      this._generatePlatform();
    }
    this.score = 0;
    this.gameOver = false;
    this.particles = [];
  }

  _generatePlatform() {
    const z = this._lastPlatformZ + 200 + Math.random() * 400;
    
    // Random wall position (0, 90, 180, 270)
    const walls = [0, 90, 180, 270];
    const wall = walls[Math.floor(Math.random() * walls.length)];
    
    // Width of platform
    const width = 60 + Math.random() * 80;
    const angle = Math.random() * 360;
    
    this.platforms.push({
      z: z,
      wall: wall, // which wall (gravity direction)
      angle: angle, // position around the tunnel
      width: width,
      passed: false,
    });
    
    this._lastPlatformZ = z;
  }

  _createParticles(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
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
    this.camera.z += this.player.speed * dt;
    this.score = Math.floor(this.camera.z / 10);

    // Increase speed over time
    this.player.speed += dt * 10;
    this.player.speed = Math.min(800, this.player.speed);

    // Rotate tunnel slowly
    this.camera.rotation += dt * 15;

    // Jump mechanics
    if (this.input.jump && !this.player.jumping) {
      this.player.jumping = true;
      this.player.jumpSpeed = -400;
      this._createParticles(600, 400, 15);
    }

    if (this.player.jumping) {
      // Apply jump physics
      this.player.y += this.player.jumpSpeed * dt;
      this.player.jumpSpeed += 1200 * dt; // gravity

      // Check if we're landing on a wall
      // If y crosses from inner tunnel (0) to outer wall and back
      if (this.player.y > this.player.targetY + 100) {
        // We've jumped past the wall - check if we hit a platform
        let landed = false;
        
        for (const platform of this.platforms) {
          const relZ = platform.z - this.camera.z;
          if (relZ > -50 && relZ < 50) {
            // We're at the right Z position
            // Check if our angle matches the platform
            const playerAngle = (this.player.x + this.camera.rotation) % 360;
            let angleDiff = Math.abs(playerAngle - platform.angle);
            if (angleDiff > 180) angleDiff = 360 - angleDiff;
            
            if (angleDiff < platform.width / 2) {
              // Landed on platform!
              landed = true;
              this.player.jumping = false;
              this.player.jumpSpeed = 0;
              this.player.y = 0;
              this.player.gravity = platform.wall;
              this.player.x = platform.angle - this.camera.rotation;
              this._createParticles(600, 400, 20);
              break;
            }
          }
        }

        if (!landed && this.player.y > 300) {
          // Fell off!
          this.gameOver = true;
        }
      }
    } else {
      // Not jumping - stick to current wall
      this.player.y = 0;
    }

    // Generate new platforms as we move forward
    while (this._lastPlatformZ < this.camera.z + 3000) {
      this._generatePlatform();
    }

    // Remove old platforms
    this.platforms = this.platforms.filter(p => p.z > this.camera.z - 500);

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt * 2;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Create ambient particles
    if (Math.random() < 0.3) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 100 + Math.random() * 150;
      this.particles.push({
        x: 600 + Math.cos(angle) * radius,
        y: 400 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        life: 0.5 + Math.random() * 0.5,
        size: 1 + Math.random() * 2,
      });
    }
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Background - deep blue
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#1a1f3a');
    gradient.addColorStop(1, '#2563eb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Draw tunnel walls with 3D perspective
    this._drawTunnel();

    // Draw platforms
    this._drawPlatforms();

    // Draw player
    this._drawPlayer();

    // Draw particles
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
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
      ctx.fillRect(20, 18, 320, 54);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.font = '700 20px "Space Grotesk", system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Run • ${this.score}`, 36, 48);
      ctx.font = '500 14px "Space Grotesk", system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText('SPACE or click to jump • R to reset', 36, 68);
    }
    ctx.restore();
  }

  _drawTunnel() {
    const ctx = this.ctx;
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    
    // Draw multiple tunnel rings to create depth
    for (let i = 0; i < 15; i++) {
      const z = i * 200;
      const scale = 300 / (z + 300);
      const radius = 180 * scale;
      
      const alpha = Math.max(0, Math.min(1, scale * 2));
      
      // Tunnel ring
      ctx.strokeStyle = `rgba(100, 100, 150, ${alpha * 0.3})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Draw segments
      const segments = 8;
      for (let j = 0; j < segments; j++) {
        const angle = (j / segments) * Math.PI * 2 + (this.camera.rotation * Math.PI / 180);
        const x1 = cx + Math.cos(angle) * radius * 0.9;
        const y1 = cy + Math.sin(angle) * radius * 0.9;
        const x2 = cx + Math.cos(angle) * radius * 1.1;
        const y2 = cy + Math.sin(angle) * radius * 1.1;
        
        ctx.strokeStyle = `rgba(150, 150, 200, ${alpha * 0.2})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }
  }

  _drawPlatforms() {
    const ctx = this.ctx;
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    
    // Draw platforms in 3D space
    for (const platform of this.platforms) {
      const relZ = platform.z - this.camera.z;
      if (relZ < 0 || relZ > 2500) continue;
      
      const scale = 300 / (relZ + 300);
      const radius = 180 * scale;
      
      // Platform angle with camera rotation
      const angle = (platform.angle + this.camera.rotation) * Math.PI / 180;
      const width = platform.width * Math.PI / 180;
      
      // Draw arc for platform (thicker and more visible)
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 12 * scale;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, angle - width / 2, angle + width / 2);
      ctx.stroke();
      
      // Draw inner shadow/glow
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 8 * scale;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, angle - width / 2, angle + width / 2);
      ctx.stroke();
      
      // Draw stars/particles on platform (more visible)
      const particleCount = Math.max(3, Math.floor(8 * scale));
      for (let i = 0; i < particleCount; i++) {
        const pAngle = angle - width / 2 + ((i + 0.5) / particleCount) * width;
        const px = cx + Math.cos(pAngle) * radius;
        const py = cy + Math.sin(pAngle) * radius;
        
        // Pulsing star effect
        const pulse = 0.5 + Math.sin(this._time * 4 + i) * 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${pulse * 0.9})`;
        ctx.beginPath();
        ctx.arc(px, py, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow
        ctx.fillStyle = `rgba(255, 255, 255, ${pulse * 0.3})`;
        ctx.beginPath();
        ctx.arc(px, py, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  _drawPlayer() {
    const ctx = this.ctx;
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    
    // Player is always at center-ish in screen space
    const radius = 120 + this.player.y;
    const angle = (this.player.x + this.camera.rotation) * Math.PI / 180;
    
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    
    // Draw player as a small creature
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle + Math.PI / 2);
    
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
