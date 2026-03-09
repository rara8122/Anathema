/**
 * App - Main React shell for the hybrid VN RPG.
 *
 * FLOW: React loads story → DialogueBox shows text → ChoiceMenu shows choices.
 *
 * When player picks a NORMAL choice (has "next"):
 *   → setCurrentNodeId(choice.next)
 *
 * When player picks a MINIGAME choice (has "action": "minigame"):
 *   → setPendingNextNodeId(choice.next)  // where to go after minigame
 *   → setIsMinigameRunning(true)
 *   → gameEngine.startMinigame("click")  // React calls GameEngine; never touches Phaser
 *
 * Phaser runs the click minigame. When it ends, the scene emits "minigameComplete".
 * GameEngine forwards this to our onMinigameComplete subscription:
 *   → setIsMinigameRunning(false)
 *   → setLastMinigameResult(result)
 *   → setCurrentNodeId(pendingNextNodeId)  // continue the story
 *
 * The canvas is shown in the center when isMinigameRunning; otherwise we show dialogue UI.
 */

import React, { useEffect, useRef, useState } from 'react';
import DialogueBox from './ui/DialogueBox.jsx';
import ChoiceMenu from './ui/ChoiceMenu.jsx';
import HUD from './ui/HUD.jsx';
import GameCanvas from './game/GameCanvas.jsx';
import { gameEngine } from './game/GameEngine.js';
import chapter1 from './story/chapter1.json';

const START_NODE = 'start';

function App() {
  const [currentNodeId, setCurrentNodeId] = useState(START_NODE);
  const [pendingMinigameChoice, setPendingMinigameChoice] = useState(null);
  const [isMinigameRunning, setIsMinigameRunning] = useState(false);
  const [lastMinigameResult, setLastMinigameResult] = useState(null);

  const currentNode = chapter1[currentNodeId];
  const pendingRef = useRef(null);
  pendingRef.current = pendingMinigameChoice;

  // Subscribe once to minigame completion. Pick success or fail node based on score threshold.
  useEffect(() => {
    const unsub = gameEngine.onMinigameComplete((result) => {
      setIsMinigameRunning(false);
      setLastMinigameResult(result);
      const choice = pendingRef.current;
      if (choice) {
        const threshold = choice.minigameSuccessThreshold ?? 0;
        const nextNode = result.score >= threshold ? choice.next : choice.failNext;
        if (nextNode) setCurrentNodeId(nextNode);
        setPendingMinigameChoice(null);
      }
    });
    return unsub;
  }, []);

  const handleChoiceSelected = (choice) => {
    if (choice.action === 'minigame') {
      setPendingMinigameChoice(choice);
      setIsMinigameRunning(true);
      gameEngine.startMinigame('click');
    } else if (choice.next) {
      setCurrentNodeId(choice.next);
    }
  };

  const handleReset = () => {
    setCurrentNodeId(START_NODE);
    setLastMinigameResult(null);
    setPendingMinigameChoice(null);
  };

  // Interpolate {score} in text if we have a recent minigame result
  const hasNoChoices = !currentNode?.choices || currentNode.choices.length === 0;
  const displayText = (() => {
    let t = currentNode?.text ?? '';
    if (lastMinigameResult?.score != null && t.includes('{score}')) {
      t = t.replace('{score}', String(lastMinigameResult.score));
    }
    return t;
  })();

  return (
    <div className="app-root">
      {/* Dialogue UI: visible when NOT in minigame. */}
      <div className={`app-dialogue-view ${isMinigameRunning ? 'app-dialogue-view--hidden' : ''}`}>
        <div className="vn-panel">
          <div className="vn-title">Anathema</div>
          <DialogueBox text={displayText} />
          <ChoiceMenu
            choices={currentNode?.choices ?? []}
            onSelect={handleChoiceSelected}
            disabled={false}
          />
          {hasNoChoices && (
            <button type="button" className="btn btn-ghost" onClick={handleReset}>
              Reset
            </button>
          )}
          <HUD lastMinigameResult={lastMinigameResult} currentNodeId={currentNodeId} />
        </div>
      </div>

      {/* Phaser canvas: centered when minigame running, hidden otherwise. */}
      <div className={`game-canvas-container game-canvas-container--center ${isMinigameRunning ? '' : 'game-canvas-container--hidden'}`}>
        <GameCanvas />
      </div>
    </div>
  );
}

export default App;
