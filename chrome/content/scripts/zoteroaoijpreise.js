async function zoteroaoijpreiseLookup() {

	var ZoteroPane = Zotero.getActiveZoteroPane();
	var selectedItems = ZoteroPane.getSelectedItems();

	// Alle nicht-Buch-Titel werden herausgefiltert
	var items = selectedItems.filter(item => item.itemTypeID == Zotero.ItemTypes.getID('book'));
	// Loop durch die Items
	for (const item of items) {
		let isbns;
		if (item.getField('ISBN')) {
			isbns = item.getField('ISBN').split(" ");

		var price_url = "https://api.openbd.jp/v1/get?isbn=";
		var Price_Url_Full = price_url + isbns.join(",");
		let opendb = new XMLHttpRequest();
		opendb.onreadystatechange = async function() {
		    if (this.readyState == 4 && this.status == 200) {
		        var json_data = this.response;

		      if(json_data)	{
		        var Price = json_data[0].onix.ProductSupply.SupplyDetail.Price[0].PriceAmount;

		        item.setField('extra', Price);
		        item.saveTx();
		      }
		      else {
		        item.setField('extra', 0);
		        item.saveTx();
		      };
		  };
		}
		opendb.open("GET", Price_Url_Full, true);
		opendb.responseType = 'json';
		opendb.send();
		}
		else {
					item.setField('extra', "Keine ISBN-Nummer vorhanden");
					item.saveTx();
				}
		}
};
