export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.currentGame = null;
    this.lastTime = 0;
    this.isRunning = false;
  }

  loadGame(game) {
    if (this.currentGame) {
      this.currentGame.cleanup();
    }
    this.currentGame = game;
    this.currentGame.init(this.canvas, this.ctx);
  }

  start() {
    if (!this.currentGame) {
      console.error('No game loaded');
      return;
    }
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop();
  }

  stop() {
    this.isRunning = false;
  }

  loop = (currentTime = 0) => {
    if (!this.isRunning) return;

    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    this.currentGame.update(deltaTime);
    this.currentGame.render(this.ctx);

    requestAnimationFrame(this.loop);
  };
}
