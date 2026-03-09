/**
 * GameCanvas - React component that owns the DOM node where Phaser renders.
 *
 * React mounts this component and passes a ref to the container.
 * GameEngine.init() creates the Phaser instance and attaches it to that container.
 * React never touches the Phaser game object or any scene - only GameEngine methods.
 */

import React, { useEffect, useRef } from 'react';
import { gameEngine } from './GameEngine.js';

export default function GameCanvas() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    gameEngine.init(containerRef.current);
    return () => {
      // Phaser cleanup could go here if we ever need to destroy the game
    };
  }, []);

  return (
    <div ref={containerRef} className="game-canvas" aria-hidden="true" />
  );
}
