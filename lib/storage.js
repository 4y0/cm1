var path = require('path');
var fs = require('fs');
var _JSONLocation = path.join(path.dirname(__dirname), 'storage/_.json');


function getStorage(){

	var offline_token = Date.now()+"_OFFLINE";
	var localStorage = {
		"local":{},
		"token_aliases":{},
		"default_token":offline_token,
		"user_token":offline_token
	};
	try{

		localStorage = require(_JSONLocation);
	}
	catch(e){
		
		
		if(~e.message.indexOf('Cannot find module')){
			fs.writeFileSync(_JSONLocation, JSON.stringify(localStorage));
		}

	}
	return localStorage;

}


function updateStorage(updatedStorage){

	fs.writeFileSync(_JSONLocation, JSON.stringify(updatedStorage));

}
getStorage()
module.exports = {

	getStorage:getStorage,
	updateStorage:updateStorage

}