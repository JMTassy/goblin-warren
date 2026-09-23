// src/game/objects/book.js
//
// Owned by P4. The Book page: a small overlay listing `book(ledger)` --
// recipes found and reactions seen (VISION_V2.md §11 P4 accept list,
// docs/RULES_M1.md "Pip's Book"). This is the only "learnable" surface in
// M1: the reducer already knows every rule, this just reads it back.
// Text only, no lore, nothing that names the words the vision bans on
// screen (proposal/verdict/admit/ledger) -- "recipes" and "reactions"
// instead.

const REACTION_LABEL = { hop: 'hop', bighop: 'big hop', shrug: 'shrug' };

function speciesLabel(species) {
  return species; // the species names themselves already read fine as labels
}

export function createBook(scene, W, H) {
  const container = scene.add.container(0, 0).setDepth(50).setVisible(false);

  const backdrop = scene.add
    .rectangle(W / 2, H / 2, W, H, 0x0a1206, 0.72)
    .setInteractive();
  const panelW = Math.min(340, W - 32);
  const panelH = Math.min(460, H - 60);
  const panel = scene.add.rectangle(W / 2, H / 2, panelW, panelH, 0x2a1f14, 0.97).setStrokeStyle(2, 0xa8d858, 0.6);

  const title = scene.add
    .text(W / 2, H / 2 - panelH / 2 + 22, 'book', {
      fontFamily: 'Georgia, serif',
      fontSize: '18px',
      color: '#e8dcc0',
    })
    .setOrigin(0.5, 0.5);

  const body = scene.add
    .text(W / 2 - panelW / 2 + 18, H / 2 - panelH / 2 + 50, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '13px',
      color: '#e8dcc0',
      wordWrap: { width: panelW - 36 },
      lineSpacing: 6,
    })
    .setOrigin(0, 0);

  const closeBtn = scene.add
    .text(W / 2 + panelW / 2 - 18, H / 2 - panelH / 2 + 16, 'x', {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#e8dcc0',
    })
    .setOrigin(0.5, 0.5)
    .setInteractive({ useHandCursor: true });

  container.add([backdrop, panel, title, body, closeBtn]);

  let open = false;

  function render(book) {
    const lines = [];
    lines.push('-- recipes --');
    if (book.recipes.length === 0) {
      lines.push('nothing found yet.');
    } else {
      for (const r of book.recipes) {
        lines.push(`${speciesLabel(r.pair[0])} + ${speciesLabel(r.pair[1])} -> ${speciesLabel(r.result)} (day ${r.warrenDay})`);
      }
    }
    lines.push('');
    lines.push('-- reactions --');
    const reactionKeys = Object.keys(book.reactions);
    if (reactionKeys.length === 0) {
      lines.push('nothing planted yet.');
    } else {
      for (const species of reactionKeys) {
        const r = book.reactions[species];
        lines.push(`${speciesLabel(species)}: ${r ? REACTION_LABEL[r] ?? r : '—'}`);
      }
    }
    body.setText(lines.join('\n'));
  }

  function show(book) {
    render(book);
    container.setVisible(true);
    open = true;
  }

  function hide() {
    container.setVisible(false);
    open = false;
  }

  backdrop.on('pointerdown', hide);
  closeBtn.on('pointerdown', hide);

  return {
    container,
    get isOpen() {
      return open;
    },
    show,
    hide,
    toggle(book) {
      if (open) hide();
      else show(book);
    },
  };
}
