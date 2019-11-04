# zotero-price-checker
With this Zotero add-on, you can check the book price with ISBN-number.  
Download the file 'zoteroaoijpreise-1.0.0.xpi' and add it in your Zotero as add-on.  

After the successful adding on, you can pick the items up and check the prices of them.  
The add-on uses the API of [OpenDB](https://openbd.jp/) and search for the item price with ISBN.  
The type of item must be "book".  
The add-on gives following responses:

1. Case 1: ISBN absent - add a tag with "ISBNがありません" and put the value "0" in the "extra" field.  
1. Case 2: ISBN exists, but no response from API - add a tag "OpenDBに記載がありません" and put the value "0" in the "extra" field.
1. Case 3: ISBN exists, and there is a response from API
    1. Case 3-1: There is only one ISBN, the response includes no price information - add a tag with "古書価格を確認してください" and put the value "0" in the "extra" field.
    1. Case 3-2: There is only one ISBN, the resopnse incluses a price information - put the price in the "extra" field.
    1. Case 3-3: There are more than one ISBN numbers in one item, and each response includes a price information - put the sum of these prices in the "extra" field.
    1. Case 3-4: The are more than one ISBN numbers in one item, some responses includes price iformation, some not - put the sum of these prices in the "extra" field and add a tag with "[ISBN]には値段がありません" for each ISBN number for which no price information exists.

## Customizing and build  
If you want to customize this add-on, you can do it as follows:  
1. Get the folder 'chrome', and files like 'chrome.manifest' and 'install.rdf' from this repository.  
1. Change the codes as you like  
1. Build the xpi-file with `zip -r zoteroaoijpreise-1.0.0.xpi chrome/* chrome.manifest install.rdf`  
