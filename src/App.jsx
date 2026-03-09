import React, { useEffect, useMemo, useState } from 'react';
import DialogueBox from './ui/DialogueBox.jsx';
import ChoiceMenu from './ui/ChoiceMenu.jsx';
import HUD from './ui/HUD.jsx';
import GameCanvas from './game/GameCanvas.jsx';
import { gameEngine } from './game/GameEngine.js';
import chapter1 from './story/chapter1.json';

// High-level React shell for the hybrid VN RPG.
// - React owns "story state" (current node, last minigame result, flags).
// - React never touches Phaser directly; it only talks to the GameEngine facade.
// - GameEngine forwards "start minigame" into Phaser, and forwards
//   "minigame completed" events back to React.

function App() {
  const [currentNodeId, setCurrentNodeId] = useState('intro');
  const [pendingNextNodeId, setPendingNextNodeId] = useState(null);
  const [isMinigameRunning, setIsMinigameRunning] = useState(false);
  const [lastMinigameResult, setLastMinigameResult] = useState(null);

  const nodesById = useMemo(() => {
    const map = {};
    for (const node of chapter1.nodes) {
      map[node.id] = node;
    }
    return map;
  }, []);

  const currentNode = nodesById[currentNodeId];

  useEffect(() => {
    // Subscribe once to gameEngine minigame completion events.
    const unsubscribe = gameEngine.onMinigameComplete((result) => {
      setIsMinigameRunning(false);
      setLastMinigameResult(result);

      // If we were waiting to advance the story after a minigame, do it now.
      if (pendingNextNodeId) {
        setCurrentNodeId(pendingNextNodeId);
        setPendingNextNodeId(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [pendingNextNodeId]);

  const handleChoiceSelected = (choice) => {
    // A choice can advance the VN directly, or request a minigame.
    if (choice.minigame) {
      // Flag that we will move to choice.next once the minigame completes.
      setPendingNextNodeId(choice.next);
      setIsMinigameRunning(true);

      // Imperative edge of React: call into the GameEngine.
      // React still does not touch any Phaser APIs here.
      gameEngine.startMinigame(choice.minigame, { sourceChoiceId: choice.id });
    } else if (choice.next) {
      setCurrentNodeId(choice.next);
    }
  };

  const handleQuickStartMinigame = () => {
    // Convenience button to start the example minigame without going through
    // the narrative choice flow, useful during early development.
    setIsMinigameRunning(true);
    setPendingNextNodeId(null);
    gameEngine.startMinigame('click', { source: 'debug-button' });
  };

  return (
    <div className="app-root">
      <div className="app-column">
        <div className="vn-panel">
          <div>
            <div className="vn-title">Anathema · VN RPG Starter</div>
            <div className="vn-subtitle">
              React drives the story. Phaser runs the arcade scenes.
            </div>
          </div>

          <DialogueBox
            speaker={currentNode?.speaker}
            text={currentNode?.text}
          />

          <ChoiceMenu
            choices={currentNode?.choices ?? []}
            onSelect={handleChoiceSelected}
            disabled={isMinigameRunning}
          />

          <div className="vn-footer">
            <div className="choices-row">
              <button
                className="btn btn-ghost"
                onClick={handleQuickStartMinigame}
                disabled={isMinigameRunning}
              >
                Start Example Minigame
              </button>
            </div>

            <div className="choices-row">
              <span
                className={
                  'status-pill ' +
                  (isMinigameRunning ? 'status-pill--active' : '')
                }
              >
                {isMinigameRunning ? 'Minigame: Running in Phaser' : 'Minigame: Idle'}
              </span>
            </div>
          </div>

          <HUD lastMinigameResult={lastMinigameResult} currentNodeId={currentNodeId} />
        </div>
      </div>

      <div className="app-column">
        <div className="hud-panel" style={{ marginBottom: 8 }}>
          <div className="hud-row">
            <span className="hud-label">Phaser GameCanvas</span>
            <span className="hud-value">
              React owns this DOM node, GameEngine owns everything inside the canvas.
            </span>
          </div>
        </div>
        <div className="game-canvas-container">
          <GameCanvas />
        </div>
      </div>
    </div>
  );
}

export default App;

