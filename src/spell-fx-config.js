const MODULE_ID = "spell-target-fx";

/** Effective defaults inherited by any spell that defines nothing here. */
export function defaultSpellFxConfig() {
  return {
    enabled: true,
    mode: "ring",
    color: game.settings.get(MODULE_ID, "fxColor"),
    sequencerFile: "jb2a.magic_missile.blue",
    scale: 1.0,
    duration: 1500
  };
}

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class SpellTargetFxConfig extends HandlebarsApplicationMixin(ApplicationV2) {

  /** @override — v2 configuration replaces defaultOptions */
  static DEFAULT_OPTIONS = {
    id: `${MODULE_ID}-config`,
    tag: "form",                                   // REQUIRED for form applications
    position: { width: 420, height: "auto" },
    window: { title: "Target FX Configuration", resizable: false },
    form: {
      handler: SpellTargetFxConfig.#onSubmitForm,  // static handler, receives FormDataExtended
      closeOnSubmit: true
    },
    actions: {
      preview: SpellTargetFxConfig.#onPreview
    }
  };

  /** @override — template parts replace the single `template` option */
  static PARTS = {
    form: {
      template: `modules/${MODULE_ID}/templates/spell-fx-config.hbs`
    }
  };

  constructor(item, options = {}) {
    super(options);
    this.item = item;
  }

  /** Document lives in options in v2, not in super(). */
  get document() { return this.item; }

  /** @override — replaces getData() */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const stored = this.item.getFlag(MODULE_ID, "config") ?? {};
    this._cfg = { ...defaultSpellFxConfig(), ...stored };
    return this._cfg;
  }

  /* ---- form handlers (static, per the v2 form contract) ---- */

  static async #onSubmitForm(event, form, formData) {
    const cfg = {
      enabled: Boolean(formData.object.enabled),
      mode: formData.object.mode ?? "ring",
      color: formData.object.color,
      sequencerFile: formData.object.sequencerFile?.trim() || "jb2a.magic_missile.blue",
      scale: Number(formData.object.scale) || 1,
      duration: Number(formData.object.duration) || 1500
    };
    // Ownership guard: non-owners' updates are rejected server-side.
    await this.item.update({ [`flags.${MODULE_ID}.config`]: cfg });
  }

  static async #onPreview(event, target) {
    const targets = canvas.tokens.controlled.map((t) => t.document);
    if (!targets.length) return ui.notifications.warn("Select a token first to preview.");

    // Read current form values live so preview reflects unsaved edits.
    const el = this.element;
    const cfg = {
      enabled: true,
      mode: el.querySelector("[name=mode]")?.value ?? this._cfg.mode,
      color: el.querySelector("[name=color]")?.value ?? this._cfg.color,
      sequencerFile: el.querySelector("[name=sequencerFile]")?.value.trim() || this._cfg.sequencerFile,
      scale: Number(el.querySelector("[name=scale]")?.value) || 1,
      duration: Number(el.querySelector("[name=duration]")?.value) || 1500
    };
    const { playFx } = await import("./fx.js");
    await playFx(targets, cfg);
  }
}
