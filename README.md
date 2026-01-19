# Browser Games

Lightweight Vite project for building 2D browser games with vanilla JavaScript and HTML5 Canvas.

## Project Structure

```
browser-games/
├── src/
│   ├── core/
│   │   └── engine.js      # Game engine with main loop
│   ├── games/
│   │   └── placeholder.js # Example game module
│   ├── main.js            # Entry point
│   └── style.css          # Minimal styles
├── index.html             # Main HTML file
└── package.json
```

## Commands

```bash
# Start dev server on localhost:5173
npm run dev

# Build for production (outputs to dist/)
npm run build

# Preview production build
npm run preview
```

## Adding New Games

1. Create a new game file in `src/games/` (e.g., `src/games/mygame.js`)
2. Implement the game class with `init()`, `update(deltaTime)`, `render(ctx)`, and `cleanup()` methods
3. Import the game in `src/main.js` and add it to the `games` object
4. Add a button in `index.html` with `data-game="mygame"` attribute

Example game template:

```javascript
export class MyGame {
  constructor() {
    // Initialize game state
  }

  init(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    // Set up event listeners
  }

  update(deltaTime) {
    // Update game logic (deltaTime in seconds)
  }

  render(ctx) {
    // Draw to canvas
  }

  cleanup() {
    // Clean up resources
  }
}
```
