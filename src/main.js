import './style.css';
import { GameEngine } from './core/engine.js';
import { PlaceholderGame } from './games/placeholder.js';
import { TarotGame } from './games/tarot.js';

const canvas = document.getElementById('game-canvas');
const engine = new GameEngine(canvas);
const app = document.getElementById('app');

const games = {
  placeholder: PlaceholderGame,
  tarot: TarotGame,
};

let currentGame = null;

// Handle game buttons from homepage
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-game]');
  if (button && button.dataset.game) {
    const gameName = button.dataset.game;
    startGame(gameName);
  }
  
  // Handle back button
  if (event.target.id === 'back-to-home') {
    backToHome();
  }
});

function startGame(gameName) {
  const GameClass = games[gameName];
  if (GameClass) {
    // Hide homepage, show game
    app.style.display = 'none';
    canvas.style.display = 'block';
    
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
  
  // Remove back button
  const backButton = document.getElementById('back-to-home');
  if (backButton) {
    backButton.remove();
  }
}
