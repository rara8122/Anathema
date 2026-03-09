/**
 * ChoiceMenu - Renders choice buttons from the current story node.
 *
 * When the player clicks a choice:
 * - If choice.action === "minigame": React calls GameEngine.startMinigame("click")
 *   and stores choice.next to advance the story when the minigame completes.
 * - If choice.next: React advances directly to that node.
 *
 * React controls story flow. Phaser is never touched here.
 */

import React from 'react';

export default function ChoiceMenu({ choices, onSelect, disabled }) {
  if (!choices || choices.length === 0) {
    return null;
  }

  const handleClick = (choice) => {
    if (disabled) return;
    onSelect(choice);
  };

  return (
    <div className="choice-menu">
      <div className="choices-row">
        {choices.map((choice, i) => (
          <button
            key={i}
            className="btn btn-primary"
            onClick={() => handleClick(choice)}
            disabled={disabled}
          >
            {choice.text}
          </button>
        ))}
      </div>
    </div>
  );
}
