import './style.css';
import { GameEngine } from './core/engine.js';
import { PlaceholderGame } from './games/placeholder.js';
import { TarotGame } from './games/tarot.js';
import { BreakoutGame } from './games/breakout.js';
import { SolitaireGame } from './games/solitaire.js';
import { BoatGame } from './games/boat.js';

const canvas = document.getElementById('game-canvas');
const engine = new GameEngine(canvas);
const app = document.getElementById('app');

const games = {
  placeholder: PlaceholderGame,
  tarot: TarotGame,
  breakout: BreakoutGame,
  solitaire: SolitaireGame,
  boat: BoatGame,
};

let currentGame = null;

// --- Simple hash router (GitHub Pages-friendly) ---
const ROUTES = {
  home: '#/',
  tarot: '#/tarot',
  breakout: '#/breakout',
  solitaire: '#/solitaire',
  boat: '#/boat',
};

function normalizeHash() {
  // Accept empty hash as home
  if (!window.location.hash || window.location.hash === '#') return ROUTES.home;
  return window.location.hash;
}

function setRoute(hash, { replace = false } = {}) {
  if (replace) {
    window.location.replace(hash);
  } else {
    window.location.hash = hash;
  }
}

// Custom Cursor
const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
document.body.appendChild(cursor);

let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  
  // Create trail effect
  if (app.style.display !== 'none') {
    createTrail(e.clientX, e.clientY);
  }
});

// Smooth cursor follow
function animateCursor() {
  const speed = 0.15;
  cursorX += (mouseX - cursorX) * speed;
  cursorY += (mouseY - cursorY) * speed;
  
  cursor.style.left = cursorX + 'px';
  cursor.style.top = cursorY + 'px';
  
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Hover effect on interactive elements
document.addEventListener('mouseover', (e) => {
  if (e.target.closest('button, a, .game-card, .deco-item')) {
    cursor.classList.add('hover');
  }
});

document.addEventListener('mouseout', (e) => {
  if (e.target.closest('button, a, .game-card, .deco-item')) {
    cursor.classList.remove('hover');
  }
});

// Cursor trail
let trailTimeout;
function createTrail(x, y) {
  // Throttle trail creation
  if (trailTimeout) return;
  
  trailTimeout = setTimeout(() => {
    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    trail.style.left = x + 'px';
    trail.style.top = y + 'px';
    document.body.appendChild(trail);
    
    setTimeout(() => {
      trail.remove();
    }, 600);
    
    trailTimeout = null;
  }, 30);
}

// Handle game buttons from homepage
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-game]');
  if (button && button.dataset.game) {
    const gameName = button.dataset.game;
    // Route-based navigation (enables browser back/forward)
    if (gameName === 'tarot') setRoute(ROUTES.tarot);
    else if (gameName === 'breakout') setRoute(ROUTES.breakout);
    else if (gameName === 'solitaire') setRoute(ROUTES.solitaire);
    else if (gameName === 'boat') setRoute(ROUTES.boat);
    else startGame(gameName);
  }
  
  // Handle back button
  if (event.target.id === 'back-to-home') {
    setRoute(ROUTES.home);
  }
});

function startGame(gameName) {
  const GameClass = games[gameName];
  if (GameClass) {
    // Hide homepage, show game
    app.style.display = 'none';
    canvas.style.display = 'block';
    
    // Hide custom cursor in game
    cursor.style.display = 'none';
    document.body.style.cursor = 'default';
    
    // Add back button if it doesn't exist
    if (!document.getElementById('back-to-home')) {
      const backButton = document.createElement('button');
      backButton.id = 'back-to-home';
      backButton.className = 'back-button';
      backButton.textContent = '← Back to Home';
      document.body.appendChild(backButton);
    }
    
    engine.stop();
    currentGame = new GameClass();
    engine.loadGame(currentGame);
    engine.start();
  }
}

function backToHome() {
  // Stop game
  engine.stop();
  if (currentGame && currentGame.destroy) {
    currentGame.destroy();
  }
  currentGame = null;
  
  // Show homepage, hide game
  app.style.display = 'flex';
  canvas.style.display = 'none';
  
  // Show custom cursor again
  cursor.style.display = 'block';
  document.body.style.cursor = 'none';
  
  // Remove back button
  const backButton = document.getElementById('back-to-home');
  if (backButton) {
    backButton.remove();
  }
}

function route() {
  const hash = normalizeHash();

  if (hash === ROUTES.tarot) {
    // If already in tarot, do nothing
    if (!(currentGame instanceof TarotGame)) {
      startGame('tarot');
    } else {
      // Ensure correct visibility if user used back/forward quickly
      app.style.display = 'none';
      canvas.style.display = 'block';
      cursor.style.display = 'none';
      document.body.style.cursor = 'default';
    }
    return;
  }

  if (hash === ROUTES.breakout) {
    if (!(currentGame instanceof BreakoutGame)) {
      startGame('breakout');
    } else {
      app.style.display = 'none';
      canvas.style.display = 'block';
      cursor.style.display = 'none';
      document.body.style.cursor = 'default';
    }
    return;
  }

  if (hash === ROUTES.solitaire) {
    if (!(currentGame instanceof SolitaireGame)) {
      startGame('solitaire');
    } else {
      app.style.display = 'none';
      canvas.style.display = 'block';
      cursor.style.display = 'none';
      document.body.style.cursor = 'default';
    }
    return;
  }

  if (hash === ROUTES.boat) {
    if (!(currentGame instanceof BoatGame)) {
      startGame('boat');
    } else {
      app.style.display = 'none';
      canvas.style.display = 'block';
      cursor.style.display = 'none';
      document.body.style.cursor = 'default';
    }
    return;
  }

  // Default to home
  if (hash !== ROUTES.home) {
    setRoute(ROUTES.home, { replace: true });
  }
  backToHome();
}

window.addEventListener('hashchange', route);
// Initial route on load
route();
