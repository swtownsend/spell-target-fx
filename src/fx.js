const MODULE_ID = "spell-target-fx";

/**
 * Single FX dispatcher. Decides between the Sequencer/JB2A path and
 * the native canvas fallback based on cfg.mode and availability.
 */
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
 * Fallback: a fading colored ring drawn over the token.
 */
export async function nativeRingFx(color, duration, tokenDocs) {
  const graphics = [];

  for (const doc of tokenDocs) {
    const mesh = doc.object;
    if (!mesh) continue;

    const size = Math.max(mesh.w, mesh.h);
    const g = new PIXI.Graphics();
    g.lineStyle(4, stringToHex(color), 0.9);
    g.drawCircle(mesh.w / 2, mesh.h / 2, Math.max(mesh.w, mesh.h) * 0.55);
    mesh.addChild(g);
    graphics.push(g);
  }

  if (!graphics.length) return;

  await CanvasAnimation.animateLinear(
    Object.fromEntries(graphics.map((g) => [String(g.id), { alpha: [1, 0] }])),
    { name: `${MODULE_ID}-ring`, duration: Math.max(1, Number(cfg?.duration ?? 1500)) }
  );
  for (const g of graphics) g.destroy();
}

function stringToHex(css) {
  return parseInt(css.replace("#", ""), 16);
}