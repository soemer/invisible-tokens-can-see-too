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
			
			return isVisionModified(this);
		},
		'WRAPPER');
		
	libWrapper.register(
		MODULE_ID,
		'Token.prototype.isVisible', 
		function(wrapped) {
			if (wrapped()) {
				return true;
			}
			
			return isVisionModified(this);
		},
		'WRAPPER');
}

function isVisionModified(token) {
	let moduleEnabled = game.settings.get(MODULE_NAME, PROPERTY_MODULE_ENABLED);
			
	if (moduleEnabled) {
		return token.hasSight && token.observer;
	}
		
	return false;
}