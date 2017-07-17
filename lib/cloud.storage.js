var req = require('request');
var q = require('q');
var base_url = "http://cm1cs.herokuapp.com/api/v1/";


function pull(token) {

	var d = q.defer();

	req.post(base_url+"cm/list", {json:true, body:{
		token:token
	}}, function(e, r, b){

		//console.log(b);

		if(b && b.data && b.data[0]){
			d.resolve(b.data[0].data);
			//console.log(_.extend({a:23}, b.data[0].data), "9203" );
		}else{
			d.resolve({});
		}
		

	})

	return d.promise;

}

function push(token, data) {


	var d = q.defer();

	req.post(base_url+"cm/new", {json:true, body:{
		token:token,
		data:data
	}}, function(e, r, b){

		console.log(b);
		d.resolve(b);

	})

	return d.promise;


}

module.exports = {
	pull:pull,
	push:push
}