PriceChecker = {
    id: null,
    version: null,
    rootURI: null,
    initialized: false,
    addedElementIDs: [],
    
    init({ id, version, rootURI }) {
        if (this.initialized) return;
		this.id = id;
		this.version = version;
		this.rootURI = rootURI;
		this.initialized = true;
    },
    
	addToWindow(window) {
		let doc = window.document;
		
        // use Fluent for localization
        window.MozXULElement.insertFTLIfNeeded("zotero_price_checker.ftl");
		
		// add menu option
		var menuitem = doc.createXULElement('menuitem');
		menuitem.id = 'priceChecker';
		menuitem.setAttribute('type', 'command');
		menuitem.setAttribute('class', 'menuitem-iconic');
		menuitem.setAttribute('image', this.rootURI+'coin_kinka.png');
        menuitem.setAttribute('data-l10n-id', 'priceChecker');
		menuitem.addEventListener('command', () => {
			this.priceLookup();
		});

        doc.getElementById('zotero-itemmenu').appendChild(menuitem);
        this.storeAddedElement(menuitem);
	},

	addToAllWindows() {
		var windows = Zotero.getMainWindows();
		for (let win of windows) {
			if (!win.ZoteroPane) continue;
			this.addToWindow(win);
		}
	},

	removeFromWindow(window) {
		var doc = window.document;
		// Remove all elements added to DOM
		for (let id of this.addedElementIDs) {
            // optional chaining
			doc.getElementById(id)?.remove();
		}
		doc.querySelector('[href="zotero_price_checker.ftl"]').remove();
	},

	removeFromAllWindows() {
		var windows = Zotero.getMainWindows();
		for (let win of windows) {
			if (!win.ZoteroPane) continue;
			this.removeFromWindow(win);
		}
	},

	storeAddedElement(elem) {
		if (!elem.id) {
			throw new Error("Element must have an id");
		}
		this.addedElementIDs.push(elem.id);
	},

	async priceLookup() {

		var ZoteroPane = Zotero.getActiveZoteroPane();
		var selectedItems = ZoteroPane.getSelectedItems();

		// kick all non-book-titles out
		var items = selectedItems.filter(item => item.itemTypeID == Zotero.ItemTypes.getID('book'));
		// Loop through the items
		for (const item of items) {
			let isbns;
			if (item.getField('ISBN')) { // if there are one or more any ISBNs...
				isbns = item.getField('ISBN').split(" ");
				var x = isbns.length;

			var price_url = "https://api.openbd.jp/v1/get?isbn=";
			var Price_Url_Full = price_url + isbns.join(",");

			let opendb = new XMLHttpRequest();
			opendb.onreadystatechange = async function() {
				if (this.readyState == 4 && this.status == 200) {
					var json_data = this.response;

							//console.log(json_data);
					if (json_data && x == 1) { // if you have only one ISBN...
						var price_or1 = json_data[0].onix.ProductSupply.SupplyDetail.Price

						if(price_or1) {
							var Price = json_data[0].onix.ProductSupply.SupplyDetail.Price[0].PriceAmount;
							//console.log(Price);
							item.setField('extra', Price);
							await item.saveTx();
						}
						else if (typeof price_or1 === 'undefined' || price_or1 === null) {
							//console.log("古書価格を確認")
							item.setField('extra', 0);
							await item.saveTx();
							item.addTag('古書価格を確認してください');
							await item.saveTx();
						}
						}
					else if (json_data && x >= 2) { // if there are more ISBNs...
						var prices = [];
						for 			(var i = 0; i < x ; i++) {

							var price_or2 = json_data[i].onix.ProductSupply.SupplyDetail.Price

							if (price_or2) {
								var price_i = json_data[i].onix.ProductSupply.SupplyDetail.Price[0].PriceAmount;
								var price_num = Number(price_i);
								prices.push(price_num);
							}
							else if (typeof price_or2 === 'undefined' || price_or2 === null) {
								prices.push(0);
								item.addTag(isbns[i]+'には値段がありません');
								await item.saveTx();
							}
						} //end of "for (var i =...)"
						//console.log(prices);
						const reducer = (accumulator, currentValue) => accumulator + currentValue;
						var sum = prices.reduce(reducer);
						//console.log(sum);
					item.setField('extra', sum);
					await item.saveTx();
				}
				else if (!json_data){ // if you get the response "null" from OpenDB
					//console.log("null");
					item.addTag('OpenDBに記載がありません');
					await item.saveTx();
					item.setField('extra', 0);
					await item.saveTx();
				}
			}
			}
			opendb.open("GET", Price_Url_Full, true);
			opendb.responseType = 'json';
			opendb.send();
			}
			else { // if there are no ISBN...
						item.addTag('ISBNがありません');
						await item.saveTx();
						item.setField('extra', 0);
						await item.saveTx();
					}
			}
	},

	log(msg) {
        Zotero.debug("[ Price Checker ] : " + msg);
	},
}
