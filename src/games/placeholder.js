export class PlaceholderGame {
  constructor() {
    this.x = 400;
    this.y = 300;
    this.radius = 30;
    this.velocityX = 150;
    this.velocityY = 100;
    this.keys = {};
  }

  init(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    
    window.addEventListener('keydown', (e) => this.keys[e.key] = true);
    window.addEventListener('keyup', (e) => this.keys[e.key] = false);
  }

  update(deltaTime) {
    // Move circle with arrow keys
    const speed = 200;
    if (this.keys['ArrowLeft']) this.x -= speed * deltaTime;
    if (this.keys['ArrowRight']) this.x += speed * deltaTime;
    if (this.keys['ArrowUp']) this.y -= speed * deltaTime;
    if (this.keys['ArrowDown']) this.y += speed * deltaTime;

    // Bounce off walls
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;

    if (this.x - this.radius < 0 || this.x + this.radius > this.canvas.width) {
      this.velocityX *= -1;
      this.x = Math.max(this.radius, Math.min(this.canvas.width - this.radius, this.x));
    }
    if (this.y - this.radius < 0 || this.y + this.radius > this.canvas.height) {
      this.velocityY *= -1;
      this.y = Math.max(this.radius, Math.min(this.canvas.height - this.radius, this.y));
    }
  }

  render(ctx) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = '#646cff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Use arrow keys to move', this.canvas.width / 2, 30);
  }

  cleanup() {
    this.keys = {};
  }
}
