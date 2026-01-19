import { tarotDeck, shuffleDeck, drawCard } from './tarot-data.js';

export class TarotGame {
  constructor() {
    this.deck = [];
    this.drawnCards = [];
    this.shuffledDeck = [];
    this.fortuneTeller = null;
    this.candles = [];
    this.selectedCardIndex = null;
    this.isReading = false;
    this.hoveredCard = null;
  }

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Resize canvas
    this.canvas.width = 1200;
    this.canvas.height = 800;
    
    // Shuffle the deck
    this.shuffledDeck = shuffleDeck(tarotDeck);
    
    // Initialize candle flicker
    this.candleFlicker = {
      left: { intensity: 1, phase: 0 },
      right: { intensity: 1, phase: Math.PI }
    };
    
    // Setup click handler
    this.canvas.addEventListener('click', this.handleClick.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    
    // Button state
    this.showButton = true;
  }

  update(deltaTime) {
    // Animate candle flicker
    this.candleFlicker.left.phase += deltaTime * 0.003;
    this.candleFlicker.right.phase += deltaTime * 0.004;
    
    this.candleFlicker.left.intensity = 0.8 + Math.sin(this.candleFlicker.left.phase) * 0.2;
    this.candleFlicker.right.intensity = 0.85 + Math.sin(this.candleFlicker.right.phase) * 0.15;
  }

  render() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Get current time for dynamic sky
    const now = new Date();
    const hour = now.getHours();
    
    // Draw the mystical room (background)
    this.drawRoom();
    
    // Draw window with time-based sky (behind fortune teller)
    this.drawWindow(hour);
    
    // Draw the table (large part of screen - POV)
    this.drawTable();
    
    // Draw candles with flicker
    this.drawCandles();
    
    // Draw fortune teller (old and sweet)
    this.drawFortuneTeller();
    
    // Draw cards or button
    if (this.drawnCards.length === 0 && this.showButton) {
      this.drawStartButton();
    } else if (this.drawnCards.length > 0) {
      this.drawCards();
    }
    
    // Draw card meanings if all cards are revealed
    if (this.drawnCards.length === 3 && this.drawnCards.every(c => c.revealed)) {
      this.drawReadings();
    }
  }

  drawWindow(hour) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    
    // Window frame - positioned on the right side, big and visible
    const windowX = width - 420;
    const windowY = 60;
    const windowWidth = 350;
    const windowHeight = 300;
    
    // Sky colors based on time
    let skyTop, skyBottom;
    
    if (hour >= 5 && hour < 7) {
      // Dawn
      skyTop = '#1a1a3e';
      skyBottom = '#ff6b35';
    } else if (hour >= 7 && hour < 12) {
      // Morning
      skyTop = '#4a90e2';
      skyBottom = '#87ceeb';
    } else if (hour >= 12 && hour < 17) {
      // Afternoon
      skyTop = '#2b6cb0';
      skyBottom = '#93c5fd';
    } else if (hour >= 17 && hour < 19) {
      // Sunset
      skyTop = '#1e3a8a';
      skyBottom = '#fb923c';
    } else if (hour >= 19 && hour < 21) {
      // Dusk
      skyTop = '#1a1a3e';
      skyBottom = '#4c1d95';
    } else {
      // Night
      skyTop = '#0a0a1e';
      skyBottom = '#1e1e3f';
    }
    
    // Draw sky
    const skyGradient = ctx.createLinearGradient(windowX, windowY, windowX, windowY + windowHeight);
    skyGradient.addColorStop(0, skyTop);
    skyGradient.addColorStop(1, skyBottom);
    ctx.fillStyle = skyGradient;
    ctx.fillRect(windowX, windowY, windowWidth, windowHeight);
    
    // Add stars if night
    if (hour < 6 || hour >= 20) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for (let i = 0; i < 30; i++) {
        const x = windowX + Math.random() * windowWidth;
        const y = windowY + Math.random() * windowHeight;
        const size = Math.random() * 2;
        ctx.fillRect(x, y, size, size);
      }
    }
    
    // Window frame
    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = 15;
    ctx.strokeRect(windowX, windowY, windowWidth, windowHeight);
    
    // Window cross bars
    ctx.beginPath();
    ctx.moveTo(windowX + windowWidth / 2, windowY);
    ctx.lineTo(windowX + windowWidth / 2, windowY + windowHeight);
    ctx.moveTo(windowX, windowY + windowHeight / 2);
    ctx.lineTo(windowX + windowWidth, windowY + windowHeight / 2);
    ctx.stroke();
  }

  drawRoom() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Dark mystical room background
    const bgGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
    bgGradient.addColorStop(0, '#2d1b1b');
    bgGradient.addColorStop(1, '#1a0f0f');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add some texture/atmosphere
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height * 0.6;
      const size = Math.random() * 3;
      ctx.fillRect(x, y, size, size);
    }
  }

  drawTable() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Large table taking up bottom 60% of screen (POV perspective)
    const tableY = height * 0.4;
    
    // Table in perspective
    const tableGradient = ctx.createLinearGradient(0, tableY, 0, height);
    tableGradient.addColorStop(0, '#4a2c2a');
    tableGradient.addColorStop(1, '#2d1810');
    
    ctx.fillStyle = tableGradient;
    ctx.beginPath();
    ctx.moveTo(0, tableY);
    ctx.lineTo(width, tableY);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
    
    // Table cloth pattern - mystical purple
    ctx.fillStyle = 'rgba(88, 28, 135, 0.3)';
    ctx.fillRect(0, tableY, width, height - tableY);
    
    // Add some mystical symbols on the table cloth
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
    ctx.lineWidth = 2;
    
    // Draw mystical circle
    ctx.beginPath();
    ctx.arc(width / 2, tableY + 200, 150, 0, Math.PI * 2);
    ctx.stroke();
    
    // Stars around circle
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const x = width / 2 + Math.cos(angle) * 180;
      const y = tableY + 200 + Math.sin(angle) * 180;
      this.drawStar(ctx, x, y, 5, 8, 4);
    }
  }

  drawStar(ctx, x, y, points, outer, inner) {
    ctx.save();
    ctx.beginPath();
    ctx.translate(x, y);
    ctx.moveTo(0, 0 - outer);
    
    for (let i = 0; i < points; i++) {
      ctx.rotate(Math.PI / points);
      ctx.lineTo(0, 0 - inner);
      ctx.rotate(Math.PI / points);
      ctx.lineTo(0, 0 - outer);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  drawCandles() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Left candle
    this.drawCandle(ctx, 100, height * 0.5, this.candleFlicker.left.intensity);
    
    // Right candle
    this.drawCandle(ctx, width - 100, height * 0.5, this.candleFlicker.right.intensity);
  }

  drawCandle(ctx, x, y, intensity) {
    // Candle body
    ctx.fillStyle = '#f5f5dc';
    ctx.fillRect(x - 10, y, 20, 60);
    
    // Melted wax
    ctx.fillStyle = '#ececd0';
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x - 12, y + 10);
    ctx.lineTo(x - 10, y + 15);
    ctx.closePath();
    ctx.fill();
    
    // Flame
    const flameGlow = ctx.createRadialGradient(x, y - 10, 0, x, y - 10, 40 * intensity);
    flameGlow.addColorStop(0, `rgba(255, 200, 50, ${0.8 * intensity})`);
    flameGlow.addColorStop(0.5, `rgba(255, 140, 50, ${0.4 * intensity})`);
    flameGlow.addColorStop(1, 'rgba(255, 100, 20, 0)');
    
    ctx.fillStyle = flameGlow;
    ctx.beginPath();
    ctx.arc(x, y - 10, 40, 0, Math.PI * 2);
    ctx.fill();
    
    // Flame itself
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath();
    ctx.ellipse(x, y - 15, 5, 10 * intensity, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.ellipse(x, y - 15, 3, 7 * intensity, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawFortuneTeller() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    
    // Old fortune teller sitting across from player
    const x = width / 2;
    const y = 150;
    
    // Head with shawl
    ctx.fillStyle = '#8b4513';
    ctx.beginPath();
    ctx.ellipse(x, y, 40, 50, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Face
    ctx.fillStyle = '#d4a574';
    ctx.beginPath();
    ctx.ellipse(x, y + 5, 30, 35, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes (wise and kind)
    ctx.fillStyle = '#3e2723';
    ctx.beginPath();
    ctx.arc(x - 10, y, 3, 0, Math.PI * 2);
    ctx.arc(x + 10, y, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Smile
    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y + 10, 12, 0.2, Math.PI - 0.2);
    ctx.stroke();
    
    // Headscarf (mystical purple)
    ctx.fillStyle = '#6b21a8';
    ctx.beginPath();
    ctx.ellipse(x, y - 20, 45, 30, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    
    // Body/shawl
    ctx.fillStyle = '#7c3aed';
    ctx.beginPath();
    ctx.moveTo(x - 45, y + 40);
    ctx.lineTo(x + 45, y + 40);
    ctx.lineTo(x + 60, y + 120);
    ctx.lineTo(x - 60, y + 120);
    ctx.closePath();
    ctx.fill();
    
    // Hands on table
    ctx.fillStyle = '#d4a574';
    // Left hand
    ctx.beginPath();
    ctx.ellipse(x - 150, this.canvas.height * 0.42, 20, 25, -0.3, 0, Math.PI * 2);
    ctx.fill();
    // Right hand
    ctx.beginPath();
    ctx.ellipse(x + 150, this.canvas.height * 0.42, 20, 25, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  drawStartButton() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    const buttonX = width / 2 - 120;
    const buttonY = height * 0.7;
    const buttonWidth = 240;
    const buttonHeight = 60;
    
    // Button glow
    const glowGradient = ctx.createRadialGradient(width / 2, buttonY + 30, 0, width / 2, buttonY + 30, 150);
    glowGradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
    glowGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
    ctx.fillStyle = glowGradient;
    ctx.fillRect(buttonX - 60, buttonY - 30, buttonWidth + 120, buttonHeight + 60);
    
    // Button background
    ctx.fillStyle = 'rgba(88, 28, 135, 0.8)';
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // Button border
    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 2;
    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // Button text
    ctx.fillStyle = '#e9d5ff';
    ctx.font = 'bold 24px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Draw Your Cards', width / 2, buttonY + 30);
    
    this.buttonBounds = { x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight };
  }

  drawCards() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    const cardWidth = 130;
    const cardHeight = 200;
    const spacing = 50;
    const startX = width / 2 - (cardWidth * 3 + spacing * 2) / 2;
    const cardY = height * 0.52;
    
    // Draw position labels
    const labels = ['PAST', 'PRESENT', 'FUTURE'];
    ctx.fillStyle = 'rgba(139, 92, 246, 0.6)';
    ctx.font = 'bold 14px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '2px';
    
    this.drawnCards.forEach((card, index) => {
      const x = startX + (cardWidth + spacing) * index;
      
      // Draw label above card
      ctx.fillText(labels[index], x + cardWidth / 2, cardY - 20);
      
      // Add hover effect
      const isHovering = this.hoveredCard === index;
      const yOffset = isHovering ? -10 : 0;
      
      this.drawCard(ctx, card, x, cardY + yOffset, cardWidth, cardHeight, index);
    });
  }

  drawCard(ctx, cardData, x, y, width, height, index) {
    // Enhanced shadow with glow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8;
    
    // Card background
    if (cardData.revealed) {
      // Revealed card - beautiful ornate design
      const gradient = ctx.createLinearGradient(x, y, x, y + height);
      gradient.addColorStop(0, '#1a0f3e');
      gradient.addColorStop(0.5, '#2d1b69');
      gradient.addColorStop(1, '#1a0f3e');
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, width, height);
      
      // Reset shadow for inner elements
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      
      // Decorative border - multiple layers
      // Outer golden border
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 4;
      ctx.strokeRect(x + 2, y + 2, width - 4, height - 4);
      
      // Inner purple border
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 6, y + 6, width - 12, height - 12);
      
      // Corner decorations
      this.drawCardCorners(ctx, x, y, width, height);
      
      // Rotation indicator
      if (cardData.isReversed) {
        ctx.save();
        ctx.translate(x + width / 2, y + height / 2);
        ctx.rotate(Math.PI);
        ctx.translate(-(x + width / 2), -(y + height / 2));
      }
      
      // Card name with elegant background
      ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
      ctx.fillRect(x + 10, y + 15, width - 20, 45);
      
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 13px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      // Word wrap card name
      const words = cardData.name.split(' ');
      let line = '';
      let lineY = y + 22;
      words.forEach((word, i) => {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > width - 30 && i > 0) {
          ctx.fillText(line, x + width / 2, lineY);
          line = word + ' ';
          lineY += 16;
        } else {
          line = testLine;
        }
      });
      ctx.fillText(line, x + width / 2, lineY);
      
      // Card symbol with glow
      const symbolGradient = ctx.createRadialGradient(
        x + width / 2, y + height / 2, 0,
        x + width / 2, y + height / 2, 30
      );
      symbolGradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
      symbolGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = symbolGradient;
      ctx.fillRect(x + 25, y + 60, width - 50, 60);
      
      ctx.font = '50px serif';
      ctx.fillStyle = '#e9d5ff';
      ctx.fillText('🔮', x + width / 2, y + height / 2 - 5);
      
      // Orientation badge
      const badgeY = y + height - 30;
      const badgeWidth = 70;
      const badgeX = x + width / 2 - badgeWidth / 2;
      
      ctx.fillStyle = cardData.isReversed ? 'rgba(252, 165, 165, 0.2)' : 'rgba(134, 239, 172, 0.2)';
      ctx.fillRect(badgeX, badgeY, badgeWidth, 20);
      
      ctx.strokeStyle = cardData.isReversed ? '#fca5a5' : '#86efac';
      ctx.lineWidth = 1;
      ctx.strokeRect(badgeX, badgeY, badgeWidth, 20);
      
      ctx.font = 'bold 9px "Space Grotesk", sans-serif';
      ctx.fillStyle = cardData.isReversed ? '#fca5a5' : '#86efac';
      ctx.textAlign = 'center';
      ctx.fillText(cardData.orientation.toUpperCase(), x + width / 2, badgeY + 13);
      
      if (cardData.isReversed) {
        ctx.restore();
      }
    } else {
      // Face-down card - mystical animated design
      const backGradient = ctx.createLinearGradient(x, y, x + width, y + height);
      backGradient.addColorStop(0, '#581c87');
      backGradient.addColorStop(0.3, '#7c3aed');
      backGradient.addColorStop(0.7, '#6b21a8');
      backGradient.addColorStop(1, '#581c87');
      ctx.fillStyle = backGradient;
      ctx.fillRect(x, y, width, height);
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      
      // Ornate border
      ctx.strokeStyle = '#a78bfa';
      ctx.lineWidth = 3;
      ctx.strokeRect(x + 3, y + 3, width - 6, height - 6);
      
      // Inner mystical circle pattern
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      
      // Outer circle
      ctx.strokeStyle = '#c4b5fd';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 35, 0, Math.PI * 2);
      ctx.stroke();
      
      // Middle circle
      ctx.strokeStyle = '#a78bfa';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
      ctx.stroke();
      
      // Inner circle
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
      ctx.stroke();
      
      // Rotating stars
      const time = Date.now() * 0.001;
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2) / 8 + time;
        const sx = centerX + Math.cos(angle) * 40;
        const sy = centerY + Math.sin(angle) * 40;
        
        // Star glow
        const starGlow = ctx.createRadialGradient(sx, sy, 0, sx, sy, 8);
        starGlow.addColorStop(0, '#fbbf24');
        starGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = starGlow;
        ctx.beginPath();
        ctx.arc(sx, sy, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Star
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        for (let j = 0; j < 5; j++) {
          const starAngle = (j * Math.PI * 2) / 5 - Math.PI / 2;
          const starX = sx + Math.cos(starAngle) * 4;
          const starY = sy + Math.sin(starAngle) * 4;
          if (j === 0) ctx.moveTo(starX, starY);
          else ctx.lineTo(starX, starY);
        }
        ctx.closePath();
        ctx.fill();
      }
      
      // Click hint with glow
      ctx.fillStyle = 'rgba(139, 92, 246, 0.4)';
      ctx.fillRect(x + 15, y + height + 10, width - 30, 25);
      
      ctx.fillStyle = '#e9d5ff';
      ctx.font = 'bold 11px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(139, 92, 246, 0.8)';
      ctx.shadowBlur = 10;
      ctx.fillText('✨ CLICK TO REVEAL ✨', x + width / 2, y + height + 25);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }
    
    // Store card bounds for click detection
    if (!this.cardBounds) this.cardBounds = [];
    this.cardBounds[index] = { x, y, width, height };
  }
  
  drawCardCorners(ctx, x, y, width, height) {
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    const cornerSize = 12;
    
    // Top-left
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 10 + cornerSize);
    ctx.lineTo(x + 10, y + 10);
    ctx.lineTo(x + 10 + cornerSize, y + 10);
    ctx.stroke();
    
    // Top-right
    ctx.beginPath();
    ctx.moveTo(x + width - 10 - cornerSize, y + 10);
    ctx.lineTo(x + width - 10, y + 10);
    ctx.lineTo(x + width - 10, y + 10 + cornerSize);
    ctx.stroke();
    
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(x + 10, y + height - 10 - cornerSize);
    ctx.lineTo(x + 10, y + height - 10);
    ctx.lineTo(x + 10 + cornerSize, y + height - 10);
    ctx.stroke();
    
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(x + width - 10 - cornerSize, y + height - 10);
    ctx.lineTo(x + width - 10, y + height - 10);
    ctx.lineTo(x + width - 10, y + height - 10 - cornerSize);
    ctx.stroke();
  }

  drawReadings() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Beautiful gradient overlay
    const overlayGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
    overlayGradient.addColorStop(0, 'rgba(26, 15, 62, 0.95)');
    overlayGradient.addColorStop(1, 'rgba(10, 10, 30, 0.98)');
    ctx.fillStyle = overlayGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Decorative top border
    const topGradient = ctx.createLinearGradient(0, 0, width, 0);
    topGradient.addColorStop(0, 'transparent');
    topGradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.6)');
    topGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = topGradient;
    ctx.fillRect(0, 0, width, 3);
    
    // Title with glow
    ctx.shadowColor = 'rgba(139, 92, 246, 0.8)';
    ctx.shadowBlur = 20;
    const titleGradient = ctx.createLinearGradient(width / 2 - 200, 0, width / 2 + 200, 0);
    titleGradient.addColorStop(0, '#8b5cf6');
    titleGradient.addColorStop(0.5, '#fbbf24');
    titleGradient.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = titleGradient;
    ctx.font = 'bold 36px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ Your Three-Card Reading ✨', width / 2, 60);
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    
    // Subtitle
    ctx.fillStyle = 'rgba(233, 213, 255, 0.7)';
    ctx.font = '16px "Space Grotesk", sans-serif';
    ctx.fillText('The cards have spoken...', width / 2, 90);
    
    // Positions
    const positions = ['🌅 The Past', '⭐ The Present', '🌙 The Future'];
    const positionColors = ['#fb923c', '#fbbf24', '#8b5cf6'];
    const cardY = 130;
    const cardSpacing = height / 4.5;
    
    this.drawnCards.forEach((card, index) => {
      const y = cardY + index * cardSpacing;
      
      // Card container background
      const containerGradient = ctx.createLinearGradient(40, y - 10, 40, y + 100);
      containerGradient.addColorStop(0, 'rgba(139, 92, 246, 0.1)');
      containerGradient.addColorStop(1, 'rgba(139, 92, 246, 0.05)');
      ctx.fillStyle = containerGradient;
      ctx.fillRect(40, y - 10, width - 80, cardSpacing - 10);
      
      // Left accent bar
      ctx.fillStyle = positionColors[index];
      ctx.fillRect(40, y - 10, 4, cardSpacing - 10);
      
      // Position label
      ctx.fillStyle = positionColors[index];
      ctx.font = 'bold 22px "Outfit", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(positions[index], 60, y + 10);
      
      // Card name with orientation badge
      ctx.fillStyle = '#e9d5ff';
      ctx.font = 'bold 20px "Outfit", sans-serif';
      ctx.fillText(card.name, 60, y + 40);
      
      // Orientation badge
      const badgeX = 60 + ctx.measureText(card.name).width + 15;
      const badgeWidth = 80;
      ctx.fillStyle = card.isReversed ? 'rgba(252, 165, 165, 0.2)' : 'rgba(134, 239, 172, 0.2)';
      ctx.fillRect(badgeX, y + 25, badgeWidth, 22);
      ctx.strokeStyle = card.isReversed ? '#fca5a5' : '#86efac';
      ctx.lineWidth = 1;
      ctx.strokeRect(badgeX, y + 25, badgeWidth, 22);
      ctx.fillStyle = card.isReversed ? '#fca5a5' : '#86efac';
      ctx.font = 'bold 11px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(card.orientation.toUpperCase(), badgeX + badgeWidth / 2, y + 40);
      ctx.textAlign = 'left';
      
      // Meaning with better formatting
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '15px "Space Grotesk", sans-serif';
      
      // Word wrap meaning
      const maxWidth = width - 120;
      const words = card.meaning.split(' ');
      let line = '';
      let lineY = y + 70;
      words.forEach((word, i) => {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(line, 60, lineY);
          line = word + ' ';
          lineY += 22;
        } else {
          line = testLine;
        }
      });
      ctx.fillText(line, 60, lineY);
    });
    
    // New reading button with glow
    const buttonY = height - 90;
    const buttonWidth = 280;
    const buttonHeight = 55;
    const buttonX = width / 2 - buttonWidth / 2;
    
    // Button glow
    const buttonGlow = ctx.createRadialGradient(width / 2, buttonY + 27, 0, width / 2, buttonY + 27, 150);
    buttonGlow.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
    buttonGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = buttonGlow;
    ctx.fillRect(buttonX - 50, buttonY - 25, buttonWidth + 100, buttonHeight + 50);
    
    // Button background
    const buttonGradient = ctx.createLinearGradient(buttonX, buttonY, buttonX + buttonWidth, buttonY);
    buttonGradient.addColorStop(0, '#7c3aed');
    buttonGradient.addColorStop(0.5, '#8b5cf6');
    buttonGradient.addColorStop(1, '#7c3aed');
    ctx.fillStyle = buttonGradient;
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // Button border
    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 2;
    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // Button text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText('✨ New Reading ✨', width / 2, buttonY + 35);
    ctx.shadowBlur = 0;
    
    this.newReadingBounds = { x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight };
  }

  handleClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Check start button
    if (this.buttonBounds && this.drawnCards.length === 0) {
      const btn = this.buttonBounds;
      if (x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height) {
        this.startReading();
        return;
      }
    }
    
    // Check card clicks
    if (this.cardBounds && this.drawnCards.length > 0 && this.drawnCards.length < 4) {
      this.cardBounds.forEach((bounds, index) => {
        if (bounds && x >= bounds.x && x <= bounds.x + bounds.width && 
            y >= bounds.y && y <= bounds.y + bounds.height) {
          if (!this.drawnCards[index].revealed) {
            this.drawnCards[index].revealed = true;
          }
        }
      });
    }
    
    // Check new reading button
    if (this.newReadingBounds && this.drawnCards.length === 3 && this.drawnCards.every(c => c.revealed)) {
      const btn = this.newReadingBounds;
      if (x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height) {
        this.resetReading();
      }
    }
  }

  handleMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    let cursor = 'default';
    let hovering = false;
    
    // Check if hovering over button
    if (this.buttonBounds && this.drawnCards.length === 0) {
      const btn = this.buttonBounds;
      if (x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height) {
        cursor = 'pointer';
      }
    }
    
    // Check if hovering over cards
    this.hoveredCard = null;
    if (this.cardBounds && this.drawnCards.length > 0) {
      this.cardBounds.forEach((bounds, index) => {
        if (bounds && x >= bounds.x && x <= bounds.x + bounds.width && 
            y >= bounds.y - 10 && y <= bounds.y + bounds.height) {
          this.hoveredCard = index;
          if (!this.drawnCards[index].revealed) {
            cursor = 'pointer';
          }
          hovering = true;
        }
      });
    }
    
    // Check if hovering over new reading button
    if (this.newReadingBounds && this.drawnCards.length === 3 && this.drawnCards.every(c => c.revealed)) {
      const btn = this.newReadingBounds;
      if (x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height) {
        cursor = 'pointer';
      }
    }
    
    this.canvas.style.cursor = cursor;
  }

  startReading() {
    // Draw 3 cards
    this.drawnCards = [];
    for (let i = 0; i < 3; i++) {
      const card = drawCard(this.shuffledDeck[i]);
      card.revealed = false;
      this.drawnCards.push(card);
    }
    this.showButton = false;
    this.cardBounds = [];
  }

  resetReading() {
    this.shuffledDeck = shuffleDeck(tarotDeck);
    this.drawnCards = [];
    this.showButton = true;
    this.cardBounds = [];
    this.newReadingBounds = null;
  }

  destroy() {
    this.canvas.removeEventListener('click', this.handleClick);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
  }
}
