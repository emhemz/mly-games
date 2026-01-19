import './style.css';
import { GameEngine } from './core/engine.js';
import { PlaceholderGame } from './games/placeholder.js';

const canvas = document.getElementById('game-canvas');
const engine = new GameEngine(canvas);

const games = {
  placeholder: PlaceholderGame,
};

document.querySelectorAll('#game-menu button').forEach((button) => {
  button.addEventListener('click', () => {
    const gameName = button.dataset.game;
    const GameClass = games[gameName];
    if (GameClass) {
      engine.stop();
      engine.loadGame(new GameClass());
      engine.start();
    }
  });
});

// Auto-start placeholder game
engine.loadGame(new PlaceholderGame());
engine.start();
