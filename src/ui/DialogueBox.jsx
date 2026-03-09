/**
 * DialogueBox - Displays the current story node's text.
 * React passes speaker and text from the current node. No Phaser interaction.
 */

import React from 'react';

export default function DialogueBox({ speaker, text }) {
  return (
    <div className="dialogue-box">
      {speaker && <div className="dialogue-speaker">{speaker}</div>}
      <div className="dialogue-text">{text || '...'}</div>
    </div>
  );
}
