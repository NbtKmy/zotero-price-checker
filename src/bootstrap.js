var PriceChecker;

function log(msg) {
	Zotero.debug("[ Price Checker ] : " + msg);
}

function install() {
	log("Installed");
}

function startup({ id, version, rootURI }) {
	try {
		
		log("Starting Price Checker");

		log("id: " + `'${id}'`);
		log("version: " + `'${version}'`);
		log("rootURI: " + `'${rootURI}'`);

		// register preference pane
		Zotero.PreferencePanes.register({
			pluginID: 'priceChecker@j-images.ch',
			src: rootURI + 'preferences.xhtml',
			scripts: [rootURI + 'preferences.js']
		});
		
		Services.scriptloader.loadSubScript(rootURI + 'priceChecker.js');
		
		PriceChecker.init({ id, version, rootURI });
		PriceChecker.addToAllWindows();
		//await PriceChecker.almaHoldingLookupInitialize();
	} catch (error) {
		this.log("Error during startup");
		this.log(error);
	}
}

function onMainWindowLoad({ window }) {
	try {
		PriceChecker.addToWindow(window);
	} catch (error) {
		this.log("Error while loading main window");
		this.log(error);
	}
}

function onMainWindowUnload({ window }) {
	try {
		PriceChecker.removeFromWindow(window);
	} catch (error) {
		this.log("Error while unloading main window");
		this.log(error);
	}
}

function shutdown() {
	try {
		log("Shutting down");
		PriceChecker.removeFromAllWindows();
		PriceChecker = undefined;
	} catch (error) {
		this.log("Error while shutting down");
		this.log(error);
	}
}


function uninstall() {
	log("Uninstalled");

	function uninstall() {
		try {
			log("Uninstalled");
		} catch (error) {
			this.log("Error while uninstalling");
			this.log(error);
		}
	}
}











