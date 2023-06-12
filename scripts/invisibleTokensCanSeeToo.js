const MODULE_NAME = 'InvisibleTokensCanSeeToo';
const MODULE_ID = 'invisible-tokens-can-see-too';
const PROPERTY_MODULE_ENABLED = 'invisibleTokensCanSee';

Hooks.once('setup', ()=>{
	console.info(MODULE_NAME + ' | Initializing module');
	registerDependencyChecks();
	registerSettings();
	registerVisionSourceCalculation();
});

function registerSettings() {
	game.settings.register(MODULE_ID, PROPERTY_MODULE_ENABLED, {
		name: game.i18n.localize(MODULE_ID + '.Settings.InvisibleTokensCanSee.Name'),
		hint: game.i18n.localize(MODULE_ID + '.Settings.InvisibleTokensCanSee.Hint'),
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

			// If module is not enabled or token is not hidden, don't change the behavior
			if (!game.settings.get(MODULE_ID, PROPERTY_MODULE_ENABLED) || !this.document.hidden) return false;

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

			// If module is not enabled or token is not hidden, don't change the behavior
			if (!game.settings.get(MODULE_ID, PROPERTY_MODULE_ENABLED) || !this.document.hidden) return false;

			return !game.user.isGM && (this.controlled || this.isOwner);
		},
		'WRAPPER');
}
