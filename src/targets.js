const MODULE_ID = "spell-target-fx";

/**
 * Entry point: extract targeted tokens from a chat message if it represents
 * a spell roll. Returns [] for attacks, checks, or non-spell items.
 * @param {ChatMessage} message
 * @returns {TokenDocument[]}
 */
export function getSpellTargets(message) {
  const ids = collectTokenIds(message);
  return ids
    .map((id) => canvas.scene?.tokens.get(id))
    .filter(Boolean);
}

/**
 * Merge per-spell item flags over module defaults.
 * @param {ChatMessage} message
 */
export function resolveSpellFxConfig(message) {
  const item = getMessageItem(message);
  if (!item) return null;

  const perSpell = item.flags?.[MODULE_ID] ?? {};
  return {
    enabled: perSpell.enabled ?? true,
    mode: perSpell.mode ?? "ring",              // "ring" | "sequencer"
    color: perSpell.color ?? game.settings.get(MODULE_ID, "fxColor"),
    sequencerFile: perSpell.sequencerFile ?? "jb2a.magic_missile.blue",
    scale: perSpell.scale ?? 1,
    duration: perSpell.duration ?? 1500
  };
}

/**
 * Resolve the item behind a chat message.
 * NOTE: flag paths vary between dnd5e versions — inspect one live
 * message during development and adjust these lookups.
 */
function getMessageItem(message) {
  if (message.item) return message.item;
  const uuid = message.flags?.dnd5e?.origin?.uuid ?? message.flags?.dnd5e?.itemUuid;
  try {
    return uuid ? fromUuidSync(uuid) : null;
  } catch {
    return null;
  }
}

function isSpellMessage(message) {
  const item = getMessageItem(message);
  if (item?.type === "spell") return true;
  return Boolean(
    message.flags?.dnd5e?.targets?.length ||
    message.flags?.pf2e?.context?.target
  );
}

function collectTokenIds(message) {
  const ids = new Set();

  if (!isSpell(message)) return [...ids];

  // dnd5e: message.targets is a Collection of TokenDocuments on modern versions
  if (message.targets?.forEach) {
    message.targets.forEach((t) => ids.add(t.id ?? t.document?.id));
  }

  // dnd5e flags fallback: array of target documents / ids
  for (const t of message.flags?.dnd5e?.targets ?? []) {
    ids.add(typeof t === "string" ? t : t?.id ?? t?._id);
  }

  // pf2e target
  const pf2eToken = message.flags?.pf2e?.context?.target?.token;
  if (pf2eTarget) ids.add(pf2eTarget);

  return [...ids];
}