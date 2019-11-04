async function zoteroaoijpreiseLookup() {

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

		              if(typeof price_or1 !== 'undefined') {
		                var Price = json_data[0].onix.ProductSupply.SupplyDetail.Price[0].PriceAmount;
		                console.log(Price);
		                item.setField('extra', Price);
		                await item.saveTx();
		              }
		              else if (typeof price_or1 == 'undefined') {
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

		                if (typeof price_or2 !== 'undefined') {
		                    var price_i = json_data[i].onix.ProductSupply.SupplyDetail.Price[0].PriceAmount;
		                    var price_num = Number(price_i);
		                    prices.push(price_num);
		                  }
		                  else if (typeof price_or2 == 'undefined') {
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
		      else { // if you get the response "null" from OpenDB
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
};
