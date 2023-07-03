const MODULE_NAME = 'InvisibleTokensCanSeeToo';
const MODULE_ID = 'invisible-tokens-can-see-too';
const PROPERTY_INVISIBLE_TOKENS_CAN_SEE = 'invisibleTokensCanSee';
const PROPERTY_INVISIBLE_TOKENS_EMIT_LIGHT = 'invisibleTokensEmitLight';

Hooks.once('setup', ()=>{
	console.info(MODULE_NAME + ' | Initializing module');
	registerDependencyChecks();
	registerSettings();
	registerVisionSourceCalculation();
	registerLightSourceCalculation();
});

function registerSettings() {
	game.settings.register(MODULE_ID, PROPERTY_INVISIBLE_TOKENS_CAN_SEE, {
		name: game.i18n.localize(MODULE_ID + '.Settings.InvisibleTokensCanSee.Name'),
		hint: game.i18n.localize(MODULE_ID + '.Settings.InvisibleTokensCanSee.Hint'),
		scope: 'world',
		config: true,
		type: Boolean,
		default: true
	});
	game.settings.register(MODULE_ID, PROPERTY_INVISIBLE_TOKENS_EMIT_LIGHT, {
		name: game.i18n.localize(MODULE_ID + '.Settings.InvisibleTokensEmitLight.Name'),
		hint: game.i18n.localize(MODULE_ID + '.Settings.InvisibleTokensEmitLight.Hint'),
		scope: 'world',
		config: true,
		type: Boolean,
		default: true
	});
}

function registerDependencyChecks() {
	Hooks.once("canvasInit", () => {
		if (!game.modules.get("lib-wrapper")?.active) {
			Notifications.error('libWrapper is required!', { permanent: true, console: false });
			Console.error("libWrapper is not enabled");
		}
	});
}

function registerVisionSourceCalculation() {
	libWrapper.register(
		MODULE_ID,
		'Token.prototype._isVisionSource',
		function (wrapped) {
			if (wrapped()) {
				return true;
			}

			// If setting is not enabled or token is not hidden, don't change the behavior
			if (!game.settings.get(MODULE_ID, PROPERTY_INVISIBLE_TOKENS_CAN_SEE) || !this.document.hidden) return false;

			if (!canvas.effects.visibility.tokenVision || !this.hasSight || game.user.isGM) return false;
			return this.controlled || this.isOwner;
		},
		'WRAPPER');

	libWrapper.register(
		MODULE_ID,
		'Token.prototype.isVisible',
		function(wrapped) {
			if (wrapped()) {
				return true;
			}

			// If setting is not enabled or token is not hidden, don't change the behavior
			if (!game.settings.get(MODULE_ID, PROPERTY_INVISIBLE_TOKENS_CAN_SEE) || !this.document.hidden) return false;

			return !game.user.isGM && (this.controlled || this.isOwner);
		},
		'WRAPPER');
}

function registerLightSourceCalculation() {
	libWrapper.register(
		MODULE_ID,
		'Token.prototype.emitsLight',
		function(wrapped) {
			if (wrapped()) {
				return true;
			}

			// If setting is not enabled or token is not hidden, don't change the behavior
			if (!game.settings.get(MODULE_ID, PROPERTY_INVISIBLE_TOKENS_EMIT_LIGHT) || !this.document.hidden) return false;

			let light = this.document.light;
			if ( !(light.dim || light.bright) ) return false;
			const darkness = canvas.darknessLevel;
			return darkness.between(light.darkness.min, light.darkness.max);
		},
		'WRAPPER');
}