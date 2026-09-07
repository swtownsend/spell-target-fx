const MODULE_ID = "spell-target-fx";

/** Single FX dispatcher: Sequencer/JB2A path vs. native canvas fallback. */
export async function playFx(tokenDocs, cfg) {
  if (!tokenDocs.length) return;

  if (cfg.mode === "sequencer" && window.Sequence) {
    const seq = new Sequence();
    for (const doc of tokenDocs) {
      seq.effect()
        .file(cfg.sequencerFile)
        .atLocation(doc.object)
        .scale(cfg.scale)
        .duration(cfg.duration)
        .fadeIn(200)
        .fadeOut(Math.min(500, cfg.duration));
    }
    return seq.play();
  }
  return nativeRingFx(cfg.color, cfg.duration, tokenDocs);
}

/**
 * Fallback ring. Uses raw PIXI + Ticker instead of the deprecated
 * global CanvasAnimation class (migrated into foundry.canvas.* in v13/14).
 */
export async function nativeRingFx(color, duration, tokenDocs) {
  const graphics = [];

  for (const doc of tokenDocs) {
    const mesh = doc.object;
    if (!mesh) continue;

    // TokenDocument dimensions in grid units -> pixels, stable across v12–v14
    const px = (doc.width ?? 1) * canvas.grid.size;
    const g = createRing(px, color);
    mesh.addChild(g);
    graphics.push(g);
  }

  if (!graphics.length) return;

  // Manual fade — no CanvasAnimation dependency.
  await new Promise((resolve) => {
    const start = performance.now();
    const tick = () => {
      const t = Math.min(1, (performance.now() - start) / Math.max(1, duration));
      for (const g of graphics) g.alpha = 1 - t;
      if (t >= 1) {
        PIXI.Ticker.shared.remove(tick);
        for (const g of graphics) g.destroy();
        return resolve();
      }
    };
    PIXI.Ticker.shared.add(tick);
  });
}

/** Pixi v7 vs v8-safe circle stroke (lineStyle is gone in v8). */
function createRing(size, cssColor) {
  const g = new PIXI.Graphics();
  const r = size * 0.55;
  const cx = size / 2, cy = size / 2;
  if (typeof g.setStrokeStyle === "function") {
    g.setStrokeStyle({ width: 4, color: cssToInt(cssColor), alpha: 0.9 });
    g.circle(cx, cy, r).stroke();
  } else {
    g.lineStyle(4, cssToInt(cssColor), 0.9);
    g.drawCircle(cx, cy, r);
  }
  return g;
}

function cssToInt(css) {
  return parseInt(css.replace("#", ""), 16);
}
