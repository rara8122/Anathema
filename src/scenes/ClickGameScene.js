/**
 * ClickGameScene - Simple Phaser minigame: click a target multiple times within a time limit.
 * This scene is owned by Phaser. React never touches it directly.
 * When the minigame ends, it notifies the GameEngine via the global event bus.
 */

import Phaser from 'phaser';

const TARGET_RADIUS = 40;
const TIME_LIMIT_MS = 5000;
const TARGET_MOVE_INTERVAL_MS = 800;

export class ClickGameScene extends Phaser.Scene {
  static KEY = 'ClickGameScene';

  constructor() {
    super({ key: ClickGameScene.KEY });
  }

  create() {
    this.score = 0;
    this.target = null;
    this.timerText = null;
    this.scoreText = null;
    this.timeLeft = TIME_LIMIT_MS;
    this.timerEvent = null;
    this.moveTimer = null;

    // Background
    this.add.rectangle(0, 0, this.scale.width * 2, this.scale.height * 2, 0x0a0e1a).setOrigin(0);

    // Instructions
    this.add
      .text(this.scale.width / 2, 30, 'Click the target as many times as you can!', {
        fontSize: 18,
        color: '#b0b7d0',
      })
      .setOrigin(0.5, 0);

    // Score display
    this.scoreText = this.add
      .text(this.scale.width / 2, 55, 'Score: 0', { fontSize: 16, color: '#6be6ff' })
      .setOrigin(0.5, 0);

    // Timer display
    this.timerText = this.add
      .text(this.scale.width / 2, 75, '5.0s', { fontSize: 16, color: '#ffb86c' })
      .setOrigin(0.5, 0);

    // Create clickable target
    this.spawnTarget();

    // Start countdown timer
    this.timerEvent = this.time.delayedCall(TIME_LIMIT_MS, this.finishMinigame, [], this);

    // Move target periodically to make it slightly challenging
    this.moveTimer = this.time.addEvent({
      delay: TARGET_MOVE_INTERVAL_MS,
      callback: this.moveTarget,
      callbackScope: this,
      loop: true,
    });
  }

  spawnTarget() {
    if (this.target) {
      this.target.destroy();
    }

    const padding = TARGET_RADIUS + 20;
    const x = padding + Math.random() * (this.scale.width - padding * 2);
    const y = 120 + Math.random() * (this.scale.height - 120 - padding * 2);

    this.target = this.add.circle(x, y, TARGET_RADIUS, 0xff6b6b, 1);
    this.target.setInteractive({ useHandCursor: true });
    this.target.on('pointerdown', this.onTargetClick, this);
  }

  moveTarget() {
    if (!this.target || !this.target.active) return;
    this.spawnTarget();
  }

  onTargetClick() {
    this.score += 1;
    this.scoreText.setText(`Score: ${this.score}`);
    // Brief flash on hit
    this.target.setFillStyle(0x6be6ff, 0.9);
    this.time.delayedCall(80, () => {
      if (this.target?.active) this.target.setFillStyle(0xff6b6b, 1);
    });
  }

  update(time, delta) {
    if (this.timerEvent) {
      this.timeLeft = Math.max(0, this.timerEvent.getRemainingSeconds() * 1000);
      this.timerText.setText(`${(this.timeLeft / 1000).toFixed(1)}s`);
    }
  }

  /**
   * Called when time runs out. Sends result to React via the GameEngine event bus.
   * React subscribes to "minigameComplete" and updates story state.
   */
  finishMinigame() {
    this.moveTimer?.destroy();
    this.target?.destroy();
    this.target = null;

    const result = {
      minigameId: 'click',
      score: this.score,
      success: this.score > 0,
    };

    // Emit to GameEngine - React listens and continues the story.
    this.game.events.emit('minigameComplete', result);

    this.scene.stop();
  }
}
