// src/game/objects/bubble.js
//
// Owned by P4. Lulu's line: a small soft caption above her head, picked
// from src/content/lines.json, that fades in and back out on its own.
// Never a tutorial, never explanatory (VISION_V2.md §3) -- callers pass a
// category ('offer', 'hop', 'bighop', 'shrug', 'compost', 'sleep', 'wake',
// 'pet', 'idle') and a random line from that category is shown.

import LINES from '../../content/lines.json';

export function createBubble(scene) {
  const text = scene.add
    .text(0, 0, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '13px',
      fontStyle: 'italic',
      color: '#e8dcc0',
      align: 'center',
    })
    .setOrigin(0.5, 1)
    .setDepth(20)
    .setAlpha(0)
    .setShadow(0, 1, '#141c0e', 2, false, true);

  let hideTimer = null;

  return {
    text,

    say(category, x, y) {
      const options = LINES[category];
      if (!options || options.length === 0) return;
      const line = options[Math.floor(Math.random() * options.length)];

      if (hideTimer) hideTimer.remove(false);
      scene.tweens.killTweensOf(text);

      text.setText(line).setPosition(x, y).setAlpha(0);
      scene.tweens.add({ targets: text, alpha: 1, duration: 180 });
      hideTimer = scene.time.delayedCall(1900, () => {
        scene.tweens.add({ targets: text, alpha: 0, duration: 260 });
      });
    },
  };
}
