/**
 * SceneManager - Registers Phaser scenes and builds the game config.
 * React never imports this directly; GameEngine uses it when creating the Phaser instance.
 */

import { IdleScene } from '../scenes/IdleScene.js';
import { ClickGameScene } from '../scenes/ClickGameScene.js';

/** Map of minigame IDs (e.g. "click") to Phaser scene class keys. */
export const MINIGAME_SCENES = {
  click: 'ClickGameScene',
};

/** All scenes. IdleScene is the default boot scene; others are minigames. */
export const SCENES = [IdleScene, ClickGameScene];
