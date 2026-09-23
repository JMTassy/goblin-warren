// src/game/objects/ground.js
//
// Owned by P4. The 4x4 ground: terrain tiles, the legality-glow overlay
// used while dragging, and the plant sprites layered on top. Pure layout +
// Phaser sprite bookkeeping -- every *rule* (is this tile legal, what does
// a find become) is asked of src/core/finds.js, never reimplemented here.

import { plantTextureKey } from '../../art/registry.js';
import { toViewport } from '../testhook.js';

const TERRAIN_TEXTURE = { soil: 'tile_soil', rock: 'tile_rock', pond: 'tile_pond' };
const RAW_TILE = 24; // src/art/registry.js TEXTURE_SIZES.tile

/**
 * @param {Phaser.Scene} scene
 * @param {{w:number, h:number, terrain: string[]}} ground - state.ground shape
 * @param {{zoom:number, left:number, top:number, gap:number}} layout
 */
export function createGround(scene, ground, layout) {
  const { w, h, terrain } = ground;
  const { zoom, left, top, gap } = layout;
  const TILE = RAW_TILE * zoom;

  const centers = [];
  const tileSprites = [];
  const plantSprites = new Array(w * h).fill(null);

  for (let row = 0; row < h; row++) {
    for (let col = 0; col < w; col++) {
      const index = row * w + col;
      const x = left + col * (TILE + gap) + TILE / 2;
      const y = top + row * (TILE + gap) + TILE / 2;
      centers.push({ x, y, row, col });

      // Sprites render at scale 1 -- the zoom is already baked into the
      // texture pixels by src/game/textures.js, so TILE (below) already
      // equals the on-screen size.
      const sprite = scene.add
        .sprite(x, y, TERRAIN_TEXTURE[terrain[index]] ?? 'tile_soil')
        .setDepth(0);
      tileSprites.push(sprite);
    }
  }

  const glow = scene.add.sprite(0, 0, 'tile_glow_ok').setDepth(1).setVisible(false);

  return {
    w,
    h,
    zoom,
    TILE,
    centers,
    tileSprites,
    plantSprites,
    glow,

    /** Game-space {x,y} of a tile's center, or null if out of range. */
    centerOf(index) {
      return centers[index] ?? null;
    },

    /** Which tile index (0..15) a game-space point falls in, or -1. */
    indexAt(x, y) {
      for (let i = 0; i < centers.length; i++) {
        const c = centers[i];
        if (Math.abs(x - c.x) <= TILE / 2 && Math.abs(y - c.y) <= TILE / 2) return i;
      }
      return -1;
    },

    showGlow(index, ok) {
      const c = centers[index];
      if (!c) return;
      this.glow.setTexture(ok ? 'tile_glow_ok' : 'tile_glow_no').setPosition(c.x, c.y).setVisible(true);
    },

    hideGlow() {
      this.glow.setVisible(false);
    },

    /**
     * Sync the 16 plant sprites to `tiles` (state.ground.tiles). Creates,
     * updates (species/stage/wilted changed) or removes a sprite per index.
     * Returns the set of tile indices whose sprite was newly created this
     * call (so the caller can play a pop/particles beat only for those).
     */
    syncPlants(tiles) {
      const changed = [];
      for (let i = 0; i < tiles.length; i++) {
        const plant = tiles[i];
        const prevSprite = this.plantSprites[i];

        if (!plant) {
          if (prevSprite) {
            prevSprite.destroy();
            this.plantSprites[i] = null;
          }
          continue;
        }

        const key = plant.wilted ? 'plant_wilted' : plantTextureKey(plant.species, plant.stage);
        if (!prevSprite) {
          const c = centers[i];
          const sprite = scene.add.sprite(c.x, c.y - 2, key).setDepth(2).setOrigin(0.5, 0.92);
          this.plantSprites[i] = sprite;
          changed.push(i);
        } else if (prevSprite.texture.key !== key) {
          prevSprite.setTexture(key);
        }
      }
      return changed;
    },

    /** Tile description in viewport CSS px, for window.__gw.tiles(). `occupied` comes from live State, not sprite bookkeeping. */
    describeTile(index, occupied) {
      const c = centers[index];
      const p = toViewport(scene, c.x, c.y);
      const p2 = toViewport(scene, c.x + TILE, c.y + TILE);
      return {
        x: p.x,
        y: p.y,
        w: p2.x - p.x,
        h: p2.y - p.y,
        terrain: terrain[index],
        occupied: !!occupied,
      };
    },
  };
}
