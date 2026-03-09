/**
 * HUD - Displays game state info (e.g. last minigame score).
 * Receives lastMinigameResult from React state, which was populated when
 * GameEngine emitted "minigameComplete" and React's subscription ran.
 */

import React from 'react';

export default function HUD({ lastMinigameResult, currentNodeId }) {
  return (
    <div className="hud-panel">
      <div className="hud-row">
        <span className="hud-label">Node</span>
        <span className="hud-value">{currentNodeId}</span>
      </div>
      {lastMinigameResult && (
        <div className="hud-row">
          <span className="hud-label">Last score</span>
          <span className="hud-value">
            {lastMinigameResult.score} ({lastMinigameResult.minigameId})
          </span>
        </div>
      )}
    </div>
  );
}
