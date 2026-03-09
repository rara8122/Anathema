# Anathema — Project Context

Use this file to resume work on the project. It summarizes architecture, important files, current progress, and suggested next steps.

---

## Overview

**Anathema** is a hybrid **Visual Novel + RPG** browser game. Player choices drive the story; some choices trigger **arcade-style minigames** (Phaser). The stack is **Vite + React + Phaser**: React handles all UI and story flow, Phaser runs inside a single canvas and only handles gameplay.

---

## Architecture

### Separation of concerns

- **React** owns:
  - Story state (current node, pending minigame choice, last result)
  - All UI: dialogue, choices, HUD, reset, layout
  - When to show the canvas vs dialogue
- **Phaser** owns:
  - The canvas and all scenes (idle + minigames)
  - Gameplay logic only
- **React must never** import Phaser or touch Phaser objects. All cross-boundary communication goes through **GameEngine**.

### Communication flow

1. **Story → Minigame**  
   User picks a choice with `"action": "minigame"`. React calls `gameEngine.startMinigame("click")`. GameEngine starts the corresponding Phaser scene.

2. **Minigame → Story**  
   When the minigame ends, the Phaser scene does `this.game.events.emit('minigameComplete', result)`. GameEngine forwards to React subscribers. React compares `result.score` to the choice’s `minigameSuccessThreshold` and goes to `next` (success) or `failNext` (failure).

### Story data format

- **File**: `src/story/chapter1.json`
- **Structure**: Object keyed by node IDs. Each node has:
  - `text`: string
  - `choices`: array of choice objects
- **Choice types**:
  - **Branch**: `{ "text": "...", "next": "node_id" }`
  - **Minigame**: `{ "text": "...", "action": "minigame", "next": "success_node", "failNext": "fail_node", "minigameSuccessThreshold": number }`
- **Text**: Supports `{score}` interpolation when the last result has a score.

### Directory layout

```
src/
├── main.jsx              # Entry; mounts App
├── App.jsx                # Root: story state, minigame subscription, layout (dialogue vs canvas)
├── styles.css             # Global + VN/canvas layout
├── ui/
│   ├── DialogueBox.jsx    # Renders current node text (optional speaker)
│   ├── ChoiceMenu.jsx     # Renders choice buttons; calls onSelect(choice)
│   └── HUD.jsx            # Shows currentNodeId + last minigame result
├── game/
│   ├── GameCanvas.jsx     # Single div ref; calls gameEngine.init(ref) on mount
│   ├── GameEngine.js      # Facade: initGame(), startMinigame(), onMinigameComplete()
│   └── SceneManager.js    # SCENES array + MINIGAME_SCENES map (id → scene key)
├── scenes/
│   ├── IdleScene.js       # Default boot scene (placeholder when no minigame)
│   └── ClickGameScene.js  # Click-the-target minigame; emits minigameComplete with score
└── story/
    └── chapter1.json      # Chapter 1 story graph
```

---

## Important Files

| File | Purpose |
|------|--------|
| `src/App.jsx` | Story state, `handleChoiceSelected`, `handleReset`, minigame completion handler, dialogue vs canvas visibility |
| `src/game/GameEngine.js` | Single place React talks to “the game”: init, startMinigame, onMinigameComplete. Holds Phaser instance and subscriber list. |
| `src/game/SceneManager.js` | Register new Phaser scenes and add entries to `MINIGAME_SCENES` for new minigame types |
| `src/game/GameCanvas.jsx` | Mounts once; passes container ref to `gameEngine.init()`. Never unmount for the session so Phaser stays alive. |
| `src/scenes/ClickGameScene.js` | 5s click minigame; target moves periodically; emits `{ minigameId, score, success }` on end |
| `src/story/chapter1.json` | Full chapter 1 graph: start → save_father / escape, minigame success/fail, escape ending |
| `src/ui/ChoiceMenu.jsx` | Renders choices; App handles both `next` and `action: "minigame"` in `handleChoiceSelected` |
| `vite.config.js` | Vite + React plugin; dev server port 5173 |
| `package.json` | react, react-dom, phaser; vite, @vitejs/plugin-react |

---

## Current Progress

- **Done**
  - Vite + React + Phaser setup; React never touches Phaser
  - Story loaded from JSON; node format with `text` + `choices`
  - Dialogue UI (DialogueBox, ChoiceMenu, HUD)
  - GameEngine facade; GameCanvas mounts Phaser once
  - Click minigame (5s, moving target, score)
  - Score-based branching: `minigameSuccessThreshold`, `next`, `failNext`
  - Chapter 1 story: wake up → save father / escape → sword choice → minigame (sword 10+ / no sword 15+) → success/fail nodes → “Run to safety” / “Escape” → same escape ending
  - Reset button on end nodes (when `choices` is empty)
  - Canvas centered when minigame runs; dialogue hidden; after minigame, back to dialogue
  - `{score}` interpolation in node text (used in story as needed)

- **Not done**
  - Only one minigame type (`click`); no Pong or other minigames
  - No persistent save/load
  - No chapter 2+ or story loader by chapter
  - No lint/format config
  - README is minimal

---

## Next Steps

1. **Add more minigames**  
   Create a new Phaser scene (e.g. `PongScene.js`), add it to `SceneManager.js` and `MINIGAME_SCENES`, and add story nodes that call `gameEngine.startMinigame("pong")` (or another id). Ensure the scene emits `minigameComplete` with a result shape React expects (e.g. `score` and/or `success`).

2. **Chapter / story loader**  
   Replace single `chapter1.json` import with a loader (e.g. by chapter id or route) so multiple chapters or episodes can be added without hardcoding.

3. **Save / continue**  
   Persist `currentNodeId` (and optionally flags or inventory) to `localStorage`; on load, restore and optionally show “Continue” vs “New game”.

4. **Polish**  
   Add a simple VN “typing” effect for dialogue, sound/music hooks, and basic accessibility (focus management, reduced motion).

5. **Tooling**  
   Add ESLint + Prettier and optionally a quick schema or validation for story JSON.

6. **Expand chapter 1**  
   More branches, more minigame variants, or alternate endings after escape (e.g. next chapter hook).

---

## How to run

```bash
npm install
npm run dev
```

Open http://localhost:5173. Play through: dialogue → choices → minigame (if chosen) → result → reset or continue as designed.
