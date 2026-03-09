/**
 * GameEngine - Facade between React and Phaser.
 *
 * React calls:
 *   - gameEngine.startMinigame("click")  → Phaser launches the click scene
 *   - gameEngine.onMinigameComplete(cb)   → Subscribe to minigame results
 *
 * React NEVER imports Phaser or manipulates Phaser objects.
 * All communication goes through this module.
 */

import Phaser from 'phaser';
import { SCENES, MINIGAME_SCENES } from './SceneManager.js';

let phaserGame = null;
const minigameCompleteSubscribers = [];

/**
 * Initialize the Phaser game. Called once by GameCanvas when the canvas mount ref is ready.
 * Forwards Phaser's minigameComplete events to React subscribers.
 */
export function initGame(canvas) {
  if (phaserGame) return phaserGame;

  const config = {
    type: Phaser.CANVAS,
    parent: canvas,
    width: 640,
    height: 360,
    backgroundColor: '#0a0e1a',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: SCENES,
    physics: {
      default: 'arcade',
      arcade: { debug: false },
    },
  };

  phaserGame = new Phaser.Game(config);
  phaserGame.events.on('minigameComplete', (result) => {
    minigameCompleteSubscribers.forEach((fn) => fn(result));
  });
  return phaserGame;
}

/**
 * Start a minigame. React calls this when the player chooses a minigame action.
 */
export function startMinigame(minigameId, options = {}) {
  const sceneKey = MINIGAME_SCENES[minigameId];
  if (!sceneKey || !phaserGame) {
    console.warn(`GameEngine: unknown minigame "${minigameId}" or Phaser not ready`);
    return;
  }
  phaserGame.scene.start(sceneKey, options);
}

/**
 * Subscribe to minigame completion. Works even before Phaser is initialized.
 */
export function onMinigameComplete(callback) {
  minigameCompleteSubscribers.push(callback);
  return () => {
    const i = minigameCompleteSubscribers.indexOf(callback);
    if (i >= 0) minigameCompleteSubscribers.splice(i, 1);
  };
}

/** Singleton-style API for React */
export const gameEngine = {
  init: initGame,
  startMinigame,
  onMinigameComplete,
};
