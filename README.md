# Spell Target FX

An add-on module for [Foundry Virtual Tabletop](https://foundryvtt.com).

Displays a visual effect on the target(s) of a spell the moment its roll
appears in chat.

## Features
- Automatic targeting ring flash on every hit token when a spell roll resolves
- Works standalone (pure-canvas rendering) or with Sequencer + JB2A for animated effects
- Per-spell configuration via a button on every spell sheet: enable/disable,
  ring vs. Sequencer mode, color, file, scale, duration
- Live preview from the configuration form (targets currently selected tokens)
- Global default color via module settings

## Installation
Paste the manifest URL into Foundry's module installer, or clone this
repository into your `Data/modules` folder.

## Compatibility
Tested on Foundry VTT v12 with dnd5e. Pf2e targeting recognized opportunistically.

## License
MIT
