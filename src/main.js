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
  game.modules.get(MODULE_ID).api = { playFx };
});

Hooks.on("createChatMessage", async (message) => {
  try {
    const config = resolveSpellFxConfig(message);
    if (!config?.enabled) return;

    const tokens = getSpellTargets(message);
    if (!tokens.length) return;

    await playFx(tokens, config);
  } catch (err) {
    console.error(`${MODULE_ID} | createChatMessage failed`, err);
  }
});

// v13+/v14: header CONTROLS on the v2 item sheets, not v1 header buttons.
Hooks.on("getItemSheetHeaderControls", (sheet, controls) => {
  if (sheet.document?.type !== "spell") return;
  controls.push({
    action: "spell-target-fx-open-config",
    label: "Target FX",
    icon: "fas fa-wand-magic-sparkles"
  });
});

// Route the control's click through the sheet's action system (v2 pattern).
Hooks.on("renderItemSheet", (sheet) => {
  const button = sheet.element?.querySelector('[data-action="spell-target-fx-open-config"]');
  button?.addEventListener("click", () => {
    new SpellTargetFxConfig({ document: sheet.document }).render(true);
  });
});
