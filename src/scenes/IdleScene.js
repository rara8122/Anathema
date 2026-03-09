/**
 * IdleScene - Default Phaser scene when no minigame is running.
 * Shows a placeholder. React controls when minigames start via GameEngine.startMinigame().
 */

import Phaser from 'phaser';

export class IdleScene extends Phaser.Scene {
  static KEY = 'IdleScene';

  constructor() {
    super({ key: IdleScene.KEY });
  }

  create() {
    this.add.rectangle(0, 0, this.scale.width * 2, this.scale.height * 2, 0x0a0e1a).setOrigin(0);
    this.add
      .text(this.scale.width / 2, this.scale.height / 2, 'Minigame will appear here', {
        fontSize: 16,
        color: '#4a5568',
      })
      .setOrigin(0.5);
  }
}
