import { getSpellTargets, resolveSpellFxConfig } from "./targets.js";
import { playFx } from "./fx.js";
import { SpellTargetFxConfig } from "./spell-fx-config.js";

const MODULE_ID = "spell-target-fx";

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "fxColor", {
    name: "SPELLTARGETFX.FxColor",
    hint: "SPELLTARGETFX.FxColorHint",
    scope: "world",
    config: true,
    type: String,
    default: "#7d4aff"
  });
});

Hooks.once("ready", () => {
  // Expose an API usable from macros: game.modules.get("spell-target-fx").api
  const mod = game.modules.get(MODULE_ID);
  mod.api = { playFx };
});

// Every client receives this hook, so the visual renders for all players.
Hooks.on("createChatMessage", async (message) => {
  try {
    const config = resolveSpellFxConfig(message);
    if (!config?.enabled) return;

    const tokens = getSpellTargets(message);
    if (!tokens.length) return;

    await playFx(tokens, config);
  } catch (err) {
    console.error(`spell-target-fx | createChatMessage failed`, err);
  }
});

// Per-spell configuration button on spell sheets.
Hooks.on("getItemSheetHeaderButtons", (sheet, buttons) => {
  if (sheet.object?.type !== "spell") return;
  buttons.unshift({
    label: "Target FX",
    icon: "fas fa-wand-magic-sparkles",
    class: "spell-target-fx-config",
    onClick: () => new SpellTargetFxConfig(sheet.object).render(true)
  });
});