import { PacManAudio } from './pacman-audio.js';

export class PacManGame {
  constructor() {
    // Bindings
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
  }

  // Classic Pac-Man maze (1 = wall, 0 = empty, 2 = pellet, 3 = power pellet, 4 = ghost house)
  getMaze() {
    return [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
      [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
      [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
      [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
      [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
      [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
      [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
      [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1,1],
      [1,1,1,1,1,1,2,1,1,0,1,1,1,4,4,1,1,1,0,1,1,2,1,1,1,1,1,1],
      [1,1,1,1,1,1,2,1,1,0,1,4,4,4,4,4,4,1,0,1,1,2,1,1,1,1,1,1],
      [0,0,0,0,0,0,2,0,0,0,1,4,4,4,4,4,4,1,0,0,0,2,0,0,0,0,0,0],
      [1,1,1,1,1,1,2,1,1,0,1,4,4,4,4,4,4,1,0,1,1,2,1,1,1,1,1,1],
      [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
      [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1,1],
      [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
      [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
      [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
      [1,3,2,2,1,1,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,1,1,2,2,3,1],
      [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
      [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
      [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
      [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
      [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];
  }

  init(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx ?? canvas.getContext('2d');
    
    // Tile size (maze is 28x31 tiles in classic Pac-Man)
    this.tileSize = 20;
    this.mazeWidth = 28;
    this.mazeHeight = 31;
    
    // Set canvas size
    this.canvas.width = this.mazeWidth * this.tileSize;
    this.canvas.height = this.mazeHeight * this.tileSize + 40; // +40 for HUD
    
    // Game state
    this.state = 'ready'; // ready, playing, paused, won, gameover
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    
    // Player
    this.pacman = {
      x: 14,
      y: 23,
      dir: { x: 0, y: 0 },
      nextDir: { x: 0, y: 0 },
      speed: 0.15,
      mouthAngle: 0.2,
      mouthOpening: true,
      animFrame: 0
    };
    
    // Ghosts
    this.ghosts = [];
    this.ghostMode = 'scatter'; // scatter, chase, frightened
    this.ghostModeTimer = 0;
    this.frightenedTimer = 0;
    
    // Pellets
    this.pellets = [];
    this.powerPellets = [];
    this.totalPellets = 0;
    this.pelletsEaten = 0;
    
    // Timers
    this.readyTimer = 3;
    this.modeTimings = [
      { scatter: 7, chase: 20 },
      { scatter: 7, chase: 20 },
      { scatter: 5, chase: 20 },
      { scatter: 5, chase: -1 } // -1 means infinite
    ];
    this.currentModeIndex = 0;
    
    // Touch controls
    this.touchStart = null;
    this.touchCurrent = null;
    
    // Initialize audio
    this.audio = new PacManAudio();
    
    // Initialize maze and pellets
    this.maze = this.getMaze();
    this.initPellets();
    
    // Initialize ghosts
    this.initGhosts();
    
    // Event listeners
    window.addEventListener('keydown', this.handleKeyDown);
    this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    
    // Start ready countdown
    this.readyTimer = 3;
  }

  initPellets() {
    this.pellets = [];
    this.powerPellets = [];
    this.totalPellets = 0;
    this.pelletsEaten = 0;

    for (let y = 0; y < this.mazeHeight; y++) {
      for (let x = 0; x < this.mazeWidth; x++) {
        if (this.maze[y][x] === 2) {
          this.pellets.push({ x, y });
          this.totalPellets++;
        } else if (this.maze[y][x] === 3) {
          this.powerPellets.push({ x, y });
          this.totalPellets++;
        }
      }
    }
  }

  initGhosts() {
    // Blinky (red) - aggressive chaser
    // Pinky (pink) - ambusher (targets 4 tiles ahead)
    // Inky (cyan) - unpredictable
    // Clyde (orange) - scared (runs away when close)
    
    const ghostColors = [
      { name: 'Blinky', color: '#ff0000', startX: 14, startY: 11, scatterTarget: { x: 25, y: 0 } },
      { name: 'Pinky', color: '#ffb8ff', startX: 14, startY: 14, scatterTarget: { x: 2, y: 0 } },
      { name: 'Inky', color: '#00ffff', startX: 12, startY: 14, scatterTarget: { x: 27, y: 29 } },
      { name: 'Clyde', color: '#ffb851', startX: 16, startY: 14, scatterTarget: { x: 0, y: 29 } }
    ];

    this.ghosts = ghostColors.map(g => ({
      name: g.name,
      color: g.color,
      x: g.startX,
      y: g.startY,
      startX: g.startX,
      startY: g.startY,
      dir: { x: 0, y: -1 },
      speed: 0.12,
      scatterTarget: g.scatterTarget,
      frightened: false,
      eaten: false,
      inHouse: g.startY === 14
    }));
  }

  handleKeyDown(e) {
    if (this.state === 'ready' && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      this.startGame();
    }

    if (this.state !== 'playing') return;

    switch (e.key) {
      case 'ArrowUp':
        this.pacman.nextDir = { x: 0, y: -1 };
        break;
      case 'ArrowDown':
        this.pacman.nextDir = { x: 0, y: 1 };
        break;
      case 'ArrowLeft':
        this.pacman.nextDir = { x: -1, y: 0 };
        break;
      case 'ArrowRight':
        this.pacman.nextDir = { x: 1, y: 0 };
        break;
    }
  }

  handleTouchStart(e) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const touch = e.touches[0];
    
    this.touchStart = {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY
    };
    this.touchCurrent = { ...this.touchStart };

    if (this.state === 'ready') {
      this.startGame();
    }
  }

  handleTouchMove(e) {
    e.preventDefault();
    if (!this.touchStart) return;

    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const touch = e.touches[0];
    
    this.touchCurrent = {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY
    };
  }

  handleTouchEnd(e) {
    e.preventDefault();
    if (!this.touchStart || !this.touchCurrent) return;

    const dx = this.touchCurrent.x - this.touchStart.x;
    const dy = this.touchCurrent.y - this.touchStart.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 20) {
      const angle = Math.atan2(dy, dx);
      if (Math.abs(angle) < Math.PI / 4) {
        this.pacman.nextDir = { x: 1, y: 0 }; // Right
      } else if (Math.abs(angle) > 3 * Math.PI / 4) {
        this.pacman.nextDir = { x: -1, y: 0 }; // Left
      } else if (angle > 0) {
        this.pacman.nextDir = { x: 0, y: 1 }; // Down
      } else {
        this.pacman.nextDir = { x: 0, y: -1 }; // Up
      }
    }

    this.touchStart = null;
    this.touchCurrent = null;
  }

  startGame() {
    this.state = 'playing';
    this.audio?.resume();
    this.audio?.playSiren();
  }

  update(deltaTime) {
    if (this.state === 'ready') {
      this.readyTimer -= deltaTime;
      if (this.readyTimer <= 0) {
        this.startGame();
      }
      return;
    }

    if (this.state !== 'playing') return;

    // Update Pac-Man
    this.updatePacMan(deltaTime);

    // Update ghost mode
    this.updateGhostMode(deltaTime);

    // Update ghosts
    this.ghosts.forEach(ghost => this.updateGhost(ghost, deltaTime));

    // Check collisions
    this.checkCollisions();

    // Check win condition
    if (this.pelletsEaten >= this.totalPellets) {
      this.winLevel();
    }
  }

  updatePacMan(deltaTime) {
    const p = this.pacman;
    
    // Try to change direction
    const nextTileX = Math.floor(p.x + p.nextDir.x * p.speed);
    const nextTileY = Math.floor(p.y + p.nextDir.y * p.speed);
    
    if (!this.isWall(nextTileX, nextTileY)) {
      p.dir = { ...p.nextDir };
    }

    // Move in current direction
    const newX = p.x + p.dir.x * p.speed;
    const newY = p.y + p.dir.y * p.speed;

    if (!this.isWall(Math.floor(newX), Math.floor(newY))) {
      p.x = newX;
      p.y = newY;
    }

    // Wrap around tunnels
    if (p.x < 0) p.x = this.mazeWidth - 1;
    if (p.x >= this.mazeWidth) p.x = 0;

    // Animate mouth
    p.animFrame += deltaTime * 10;
    if (p.mouthOpening) {
      p.mouthAngle += deltaTime * 2;
      if (p.mouthAngle > 0.7) p.mouthOpening = false;
    } else {
      p.mouthAngle -= deltaTime * 2;
      if (p.mouthAngle < 0.05) p.mouthOpening = true;
    }

    // Eat pellets
    const tileX = Math.floor(p.x);
    const tileY = Math.floor(p.y);
    
    for (let i = this.pellets.length - 1; i >= 0; i--) {
      const pellet = this.pellets[i];
      if (pellet.x === tileX && pellet.y === tileY) {
        this.pellets.splice(i, 1);
        this.pelletsEaten++;
        this.score += 10;
        this.audio?.playWakka();
        break;
      }
    }

    for (let i = this.powerPellets.length - 1; i >= 0; i--) {
      const pellet = this.powerPellets[i];
      if (pellet.x === tileX && pellet.y === tileY) {
        this.powerPellets.splice(i, 1);
        this.pelletsEaten++;
        this.score += 50;
        this.activateFrightened();
        this.audio?.playPowerUp();
        break;
      }
    }
  }

  updateGhostMode(deltaTime) {
    if (this.ghostMode === 'frightened') {
      this.frightenedTimer -= deltaTime;
      if (this.frightenedTimer <= 0) {
        this.ghostMode = 'chase';
        this.ghosts.forEach(g => {
          if (!g.eaten) {
            g.frightened = false;
          }
        });
        this.audio?.playSiren();
      }
      return;
    }

    this.ghostModeTimer += deltaTime;
    
    const timing = this.modeTimings[this.currentModeIndex];
    const currentDuration = this.ghostMode === 'scatter' ? timing.scatter : timing.chase;

    if (currentDuration !== -1 && this.ghostModeTimer >= currentDuration) {
      this.ghostModeTimer = 0;
      if (this.ghostMode === 'scatter') {
        this.ghostMode = 'chase';
      } else {
        this.ghostMode = 'scatter';
        this.currentModeIndex = Math.min(this.currentModeIndex + 1, this.modeTimings.length - 1);
      }
    }
  }

  activateFrightened() {
    this.ghostMode = 'frightened';
    this.frightenedTimer = 7;
    this.ghosts.forEach(g => {
      if (!g.eaten) {
        g.frightened = true;
        // Reverse direction
        g.dir = { x: -g.dir.x, y: -g.dir.y };
      }
    });
  }

  updateGhost(ghost, deltaTime) {
    // If eaten, return to house
    if (ghost.eaten) {
      const houseX = 14;
      const houseY = 14;
      const dx = houseX - ghost.x;
      const dy = houseY - ghost.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 0.5) {
        ghost.eaten = false;
        ghost.frightened = false;
        ghost.x = houseX;
        ghost.y = houseY;
      } else {
        ghost.x += (dx / dist) * ghost.speed * 2;
        ghost.y += (dy / dist) * ghost.speed * 2;
      }
      return;
    }

    // Choose direction at intersections
    const tileX = Math.floor(ghost.x + 0.5);
    const tileY = Math.floor(ghost.y + 0.5);
    const alignedX = Math.abs(ghost.x - tileX) < 0.1;
    const alignedY = Math.abs(ghost.y - tileY) < 0.1;

    if (alignedX && alignedY) {
      const target = this.getGhostTarget(ghost);
      ghost.dir = this.chooseGhostDirection(ghost, tileX, tileY, target);
    }

    // Move
    const newX = ghost.x + ghost.dir.x * ghost.speed;
    const newY = ghost.y + ghost.dir.y * ghost.speed;

    if (!this.isWall(Math.floor(newX), Math.floor(newY))) {
      ghost.x = newX;
      ghost.y = newY;
    }

    // Wrap around
    if (ghost.x < 0) ghost.x = this.mazeWidth - 1;
    if (ghost.x >= this.mazeWidth) ghost.x = 0;
  }

  getGhostTarget(ghost) {
    if (ghost.frightened) {
      // Random target when frightened
      return {
        x: Math.floor(Math.random() * this.mazeWidth),
        y: Math.floor(Math.random() * this.mazeHeight)
      };
    }

    if (this.ghostMode === 'scatter') {
      return ghost.scatterTarget;
    }

    // Chase mode - different targeting for each ghost
    const p = this.pacman;
    
    switch (ghost.name) {
      case 'Blinky':
        // Directly chase Pac-Man
        return { x: Math.floor(p.x), y: Math.floor(p.y) };
      
      case 'Pinky':
        // Target 4 tiles ahead of Pac-Man
        return {
          x: Math.floor(p.x + p.dir.x * 4),
          y: Math.floor(p.y + p.dir.y * 4)
        };
      
      case 'Inky':
        // Complex: vector from Blinky to 2 tiles ahead of Pac-Man, doubled
        const blinky = this.ghosts[0];
        const targetX = Math.floor(p.x + p.dir.x * 2);
        const targetY = Math.floor(p.y + p.dir.y * 2);
        return {
          x: targetX + (targetX - Math.floor(blinky.x)),
          y: targetY + (targetY - Math.floor(blinky.y))
        };
      
      case 'Clyde':
        // Chase when far, scatter when close
        const dist = Math.sqrt(
          Math.pow(ghost.x - p.x, 2) + Math.pow(ghost.y - p.y, 2)
        );
        if (dist > 8) {
          return { x: Math.floor(p.x), y: Math.floor(p.y) };
        } else {
          return ghost.scatterTarget;
        }
      
      default:
        return { x: Math.floor(p.x), y: Math.floor(p.y) };
    }
  }

  chooseGhostDirection(ghost, x, y, target) {
    const possibleDirs = [
      { x: 0, y: -1 }, // up
      { x: 0, y: 1 },  // down
      { x: -1, y: 0 }, // left
      { x: 1, y: 0 }   // right
    ];

    // Don't reverse direction
    const validDirs = possibleDirs.filter(dir => {
      // Can't go backward
      if (dir.x === -ghost.dir.x && dir.y === -ghost.dir.y) return false;
      // Can't go into wall
      if (this.isWall(x + dir.x, y + dir.y)) return false;
      return true;
    });

    if (validDirs.length === 0) return ghost.dir;

    // Choose direction closest to target
    let bestDir = validDirs[0];
    let bestDist = Infinity;

    validDirs.forEach(dir => {
      const newX = x + dir.x;
      const newY = y + dir.y;
      const dist = Math.sqrt(
        Math.pow(newX - target.x, 2) + Math.pow(newY - target.y, 2)
      );
      if (dist < bestDist) {
        bestDist = dist;
        bestDir = dir;
      }
    });

    return bestDir;
  }

  checkCollisions() {
    const p = this.pacman;
    
    this.ghosts.forEach(ghost => {
      if (ghost.eaten) return;
      
      const dist = Math.sqrt(
        Math.pow(ghost.x - p.x, 2) + Math.pow(ghost.y - p.y, 2)
      );

      if (dist < 0.6) {
        if (ghost.frightened) {
          // Eat ghost
          ghost.eaten = true;
          ghost.frightened = false;
          this.score += 200;
          this.audio?.playEatGhost();
        } else {
          // Lose life
          this.loseLife();
        }
      }
    });
  }

  loseLife() {
    this.lives--;
    this.audio?.playDeath();
    
    if (this.lives <= 0) {
      this.state = 'gameover';
    } else {
      // Reset positions
      this.resetPositions();
      this.state = 'ready';
      this.readyTimer = 2;
    }
  }

  resetPositions() {
    this.pacman.x = 14;
    this.pacman.y = 23;
    this.pacman.dir = { x: 0, y: 0 };
    this.pacman.nextDir = { x: 0, y: 0 };

    this.ghosts.forEach(g => {
      g.x = g.startX;
      g.y = g.startY;
      g.dir = { x: 0, y: -1 };
      g.frightened = false;
      g.eaten = false;
    });
  }

  winLevel() {
    this.state = 'won';
    this.audio?.playWin();
  }

  isWall(x, y) {
    if (x < 0 || x >= this.mazeWidth || y < 0 || y >= this.mazeHeight) {
      return false; // Tunnels
    }
    return this.maze[y][x] === 1;
  }

  render() {
    const ctx = this.ctx;
    
    // Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw maze
    this.drawMaze();

    // Draw pellets
    this.drawPellets();

    // Draw Pac-Man
    this.drawPacMan();

    // Draw ghosts
    this.ghosts.forEach(g => this.drawGhost(g));

    // Draw HUD
    this.drawHUD();

    // Draw state messages
    if (this.state === 'ready') {
      this.drawCenteredText('READY!', this.mazeHeight * this.tileSize / 2);
    } else if (this.state === 'won') {
      this.drawCenteredText('LEVEL COMPLETE!', this.mazeHeight * this.tileSize / 2);
    } else if (this.state === 'gameover') {
      this.drawCenteredText('GAME OVER', this.mazeHeight * this.tileSize / 2);
    }
  }

  drawMaze() {
    const ctx = this.ctx;
    const ts = this.tileSize;

    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let y = 0; y < this.mazeHeight; y++) {
      for (let x = 0; x < this.mazeWidth; x++) {
        if (this.maze[y][x] === 1) {
          const cx = x * ts + ts / 2;
          const cy = y * ts + ts / 2;
          
          // Draw walls with rounded corners
          ctx.beginPath();
          
          const hasWallUp = y > 0 && this.maze[y - 1][x] === 1;
          const hasWallDown = y < this.mazeHeight - 1 && this.maze[y + 1][x] === 1;
          const hasWallLeft = x > 0 && this.maze[y][x - 1] === 1;
          const hasWallRight = x < this.mazeWidth - 1 && this.maze[y][x + 1] === 1;

          // Draw edges
          if (!hasWallUp) {
            ctx.moveTo(cx - ts / 2, cy - ts / 2);
            ctx.lineTo(cx + ts / 2, cy - ts / 2);
          }
          if (!hasWallDown) {
            ctx.moveTo(cx - ts / 2, cy + ts / 2);
            ctx.lineTo(cx + ts / 2, cy + ts / 2);
          }
          if (!hasWallLeft) {
            ctx.moveTo(cx - ts / 2, cy - ts / 2);
            ctx.lineTo(cx - ts / 2, cy + ts / 2);
          }
          if (!hasWallRight) {
            ctx.moveTo(cx + ts / 2, cy - ts / 2);
            ctx.lineTo(cx + ts / 2, cy + ts / 2);
          }

          ctx.stroke();
        }
      }
    }
  }

  drawPellets() {
    const ctx = this.ctx;
    const ts = this.tileSize;

    // Regular pellets
    ctx.fillStyle = '#ffb897';
    this.pellets.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x * ts + ts / 2, p.y * ts + ts / 2, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Power pellets (blinking)
    const blink = Math.floor(Date.now() / 300) % 2;
    if (blink) {
      ctx.fillStyle = '#ffb897';
      this.powerPellets.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x * ts + ts / 2, p.y * ts + ts / 2, 6, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  drawPacMan() {
    const ctx = this.ctx;
    const ts = this.tileSize;
    const p = this.pacman;
    
    const cx = p.x * ts + ts / 2;
    const cy = p.y * ts + ts / 2;
    const radius = ts * 0.4;

    // Determine mouth direction
    let rotation = 0;
    if (p.dir.x === 1) rotation = 0;
    else if (p.dir.x === -1) rotation = Math.PI;
    else if (p.dir.y === 1) rotation = Math.PI / 2;
    else if (p.dir.y === -1) rotation = -Math.PI / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    // Draw Pac-Man
    ctx.fillStyle = '#ffed4e';
    ctx.beginPath();
    ctx.arc(0, 0, radius, p.mouthAngle, Math.PI * 2 - p.mouthAngle);
    ctx.lineTo(0, 0);
    ctx.fill();

    ctx.restore();
  }

  drawGhost(ghost) {
    const ctx = this.ctx;
    const ts = this.tileSize;
    
    const cx = ghost.x * ts + ts / 2;
    const cy = ghost.y * ts + ts / 2;
    const radius = ts * 0.4;

    // Color
    let color = ghost.color;
    if (ghost.eaten) {
      color = 'rgba(255, 255, 255, 0.3)';
    } else if (ghost.frightened) {
      const flashTime = this.frightenedTimer < 2;
      color = flashTime && Math.floor(Date.now() / 200) % 2 ? '#ffffff' : '#2563eb';
    }

    ctx.fillStyle = color;

    // Body
    ctx.beginPath();
    ctx.arc(cx, cy - radius * 0.3, radius, Math.PI, 0);
    ctx.lineTo(cx + radius, cy + radius);
    
    // Wavy bottom
    const waveCount = 3;
    for (let i = 0; i < waveCount; i++) {
      const waveX = cx + radius - (i * 2 * radius / waveCount);
      const waveY = cy + radius - (i % 2 === 0 ? radius * 0.3 : 0);
      ctx.lineTo(waveX, waveY);
    }
    ctx.lineTo(cx - radius, cy + radius);
    
    ctx.closePath();
    ctx.fill();

    // Eyes (if not eaten)
    if (!ghost.eaten) {
      ctx.fillStyle = '#ffffff';
      
      // Left eye
      ctx.beginPath();
      ctx.arc(cx - radius * 0.3, cy - radius * 0.2, radius * 0.25, 0, Math.PI * 2);
      ctx.fill();
      
      // Right eye
      ctx.beginPath();
      ctx.arc(cx + radius * 0.3, cy - radius * 0.2, radius * 0.25, 0, Math.PI * 2);
      ctx.fill();

      if (!ghost.frightened) {
        // Pupils
        ctx.fillStyle = '#000000';
        const pupilOffsetX = ghost.dir.x * radius * 0.15;
        const pupilOffsetY = ghost.dir.y * radius * 0.15;
        
        ctx.beginPath();
        ctx.arc(cx - radius * 0.3 + pupilOffsetX, cy - radius * 0.2 + pupilOffsetY, radius * 0.12, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(cx + radius * 0.3 + pupilOffsetX, cy - radius * 0.2 + pupilOffsetY, radius * 0.12, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  drawHUD() {
    const ctx = this.ctx;
    const hudY = this.mazeHeight * this.tileSize + 10;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px "Space Grotesk", monospace';
    
    // Score
    ctx.fillText(`SCORE: ${this.score}`, 10, hudY);
    
    // Lives
    ctx.fillText(`LIVES:`, this.canvas.width - 150, hudY);
    for (let i = 0; i < this.lives; i++) {
      ctx.fillStyle = '#ffed4e';
      ctx.beginPath();
      ctx.arc(this.canvas.width - 90 + i * 25, hudY - 5, 8, 0.2, Math.PI * 2 - 0.2);
      ctx.lineTo(this.canvas.width - 90 + i * 25, hudY - 5);
      ctx.fill();
    }
  }

  drawCenteredText(text, y) {
    const ctx = this.ctx;
    ctx.fillStyle = '#ffed4e';
    ctx.font = 'bold 32px "Space Grotesk", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(text, this.canvas.width / 2, y);
    ctx.textAlign = 'left';
  }

  destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
    this.audio?.close();
  }
}
