const MODULE_ID = "spell-target-fx";

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

export class SpellTargetFxConfig extends FormApplication {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: `${MODULE_ID}-config`,
      title: "Target FX Configuration",
      width: 420
    });
  }

  constructor(item, options = {}) {
    super(item, options);
    this.item = item;
  }

  get object() { return this.item; }

  async getData() {
    const stored = this.item.getFlag(MODULE_ID, "config") ?? {};
    this.cfg = { ...defaultSpellFxConfig(), ...stored };
    return this.cfg;
  }

  async _renderInner(data) {
    const root = document.createElement("form");
    root.autocomplete = "off";
    root.innerHTML = `
      <fieldset>
        <legend>Target FX</legend>
        <label><input type="checkbox" name="enabled" ${this._cfg.enabled ? "checked" : ""}/> Enabled for this spell</label><br/>
        <label>Mode:
          <select name="mode">
            <option value="ring" ${this._cfg.mode === "ring" ? "selected" : ""}>Native ring</option>
            <option value="sequencer" ${this._cfg.mode === "sequencer" ? "selected" : ""}>Sequencer (JB2A)</option>
          </select>
        </label>
        <label>Ring color: <input type="color" name="color" value="${this._cfg.color}"></label>
        <label>Sequencer file: <input type="text" name="sequencerFile" value="${this._cfg.sequencerFile}" placeholder="jb2a.magic_missile.blue"></label>
        <label>Scale: <input type="number" name="scale" step="0.1" min="0.1" max="5" value="${this._cfg.scale}"></label>
        <label>Duration (ms): <input type="number" name="duration" step="100" min="0" value="${this._cfg.duration}"></label>
      </fieldset>
      <footer>
        <button type="button" data-action="preview"><i class="fas fa-play"></i> Preview</button>
        <button type="submit"><i class="fas fa-save"></i> Save</button>
      </footer>`;
    html.querySelector("[data-action=preview]")?.addEventListener("click", (ev) => this.#preview(ev));
    return root;
  }

  async #preview(ev) {
    ev.preventDefault();
    const targets = canvas.tokens.controlled.map((t) => t.document);
    if (!targets.length) return ui.notifications.warn("Select a token first to preview.");
    const cfg = this.#readForm();
    const { playFx } = await import("./fx.js");
    await playFx(targets, cfg);
  }

  #readForm() {
    const f = this.element.find ? this.element : this.element;
    return {
      enabled: f.querySelector("[name=enabled]")?.checked ?? true,
      mode: f.querySelector("[name=mode]")?.value ?? "ring",
      color: f.querySelector("[name=color]")?.value ?? "#7d4aff",
      sequencerFile: f.querySelector("[name=sequencerFile]")?.value.trim() || "jb2a.magic_missile.blue",
      scale: Number(f.querySelector("[name=scale]")?.value) || 1,
      duration: Number(f.querySelector("[name=duration]")?.value) || 1500
    };
  }

  async _updateObject(event, formData) {
    const cfg = {
      enabled: formData.enabled ?? true,
      mode: formData.mode ?? "ring",
      color: formData.color,
      sequencerFile: formData.sequencerFile,
      scale: Number(formData.scale) || 1,
      duration: Number(formData.duration) || 1500
    };
    await this.item.update({ [`flags.${MODULE_ID}.config`]: cfg });
  }
}