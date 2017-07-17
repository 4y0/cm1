#!/usr/bin/env node
var program = require('commander'); 
var nc = require('node-cmd');
var _ = require('underscore');
var commandAlias;
var storage = require('./lib/storage');
var cloud_storage = require('./lib/cloud.storage');
var getStorage = storage.getStorage, updateStorage = storage.updateStorage;
 

/*
Coercion essentially means, 
taking argument in <vnmn> and replacing program.command with it
so --add <vnmn> will mean program.add has value passed as vnmn
*/

program
  .version('0.0.0')
  .option('-a, --add <vnmn>', 'Add a command to remember with an optional key to fetch it')
  .option('-i, --init <token>', 'Set User token to store stuff for')
  .option('-d, --default', 'Set token as default')
  .option('-l, --list', 'List all stored commands')
  .option('-c, --clear', 'Clear a specific command or all commands')
  .option('-r, --rename <oldcommand>', 'Change command key')
  .option('-m, --modify <commandkey>', 'Change command assoc.d with a key')
  .option('-t, --tokenalias <existingtoken>', 'Set alias for 32 bit token key')
  .option('-x, --noexec', 'List all stored commands')
  .option('--pull', 'Pull stored commands from cloud storage')
  .option('--push', 'Push stored commands to cloud storage')
  .option('-f,--force', 'Override local storage with cloud storage. Used with --pull')
  .parse(process.argv);



if(program.init){

	var token = program.init; 
	console.log(token);
	if(typeof token == "undefined"){
		console.log("Please specify a token");
	}else{
	var localStorage = getStorage();
	var old_user_token = localStorage.user_token;
	localStorage.user_token = token;

	if(localStorage.local[old_user_token]){
		var tmp = localStorage.local[old_user_token];
		localStorage.local[token] = tmp;
		delete localStorage.local[old_user_token];
	}

	if(program.default){
		localStorage.default_token = token;
	}
	updateStorage(localStorage);
	}

}


if(program.default && !program.init){

	var token = program.args[0]; 
	console.log(token);
	if(typeof token == "undefined"){
		console.log("Please specify a token");
	}else{
	var localStorage = getStorage();  
	localStorage.default_token = token; 
	updateStorage(localStorage);
	}

}


if(program.tokenalias){

	var token = program.tokenalias; 
	var alias = program.args[0];
	console.log(token);
	if(typeof token == "undefined"){
		console.log("Please specify a token");
	}else if(alias){

	var localStorage = getStorage();  
	localStorage.token_aliases[alias] = token;
	 
	updateStorage(localStorage);
	}

}


//Store a new command
if(program.add){

	var localStorage = getStorage();
	var file_rem_key = program.args[0]; 
	var token = localStorage.default_token;
	if(token && !localStorage.local[token]){
		localStorage.local[token] = {commands:{}};
	}
	if(file_rem_key){
		localStorage.local[token].commands[file_rem_key] = program.add;
	}

	//persist to file
	updateStorage(localStorage);
	console.log("Command added")

}


if(program.pull){

	var localStorage = getStorage();

	cloud_storage
	.pull(localStorage.default_token)
	.then( function (r) {
			
		if(r){

			if(!localStorage.local[localStorage.default_token])
				localStorage.local[localStorage.default_token] = {commands:{}};

			if(program.force){
				console.log("Force");
				localStorage.local[localStorage.default_token].commands = r;
			}
			else{
				localStorage.local[localStorage.default_token].commands = _.extend(localStorage.local[localStorage.default_token].commands, r);
			}
			updateStorage(localStorage);
		}

	})
	.catch( function (e) {

		console.log("Some error occured", e.message);

	});

}

if(program.push){
	
	var localStorage = getStorage();
	if(!localStorage.local[localStorage.default_token])
		localStorage.local[localStorage.default_token] = {commands:{}};

	cloud_storage
	.push(localStorage.default_token, localStorage.local[localStorage.default_token].commands)
	.then( function (r) {

		console.log("Commands successfully pushed to cloud");
	})
	.catch( function (e) {

		console.log("Some error occured", e.message);
	})


}


//List all stored commands
if(program.list){

	var localStorage = getStorage();
	var token = localStorage.default_token;

	if(token && localStorage.local[token] && localStorage.local[token].commands){
		var commands = localStorage.local[token].commands
		for(item in commands){
			console.log('Key: ', item, ' Command: ', commands[item], ' To run: cm1 ', item);
		}
	}else{
		console.log("No commands to list for token", token);
	}

}


if(program.modify){

	var localStorage = getStorage();
	var token = localStorage.default_token;
	var new_command = program.args[0];
	var command_key = program.modify;
	if(token && localStorage.local[token] && localStorage.local[token].commands){

		if(localStorage.local[token].commands[command_key] && new_command){

			localStorage.local[token].commands[command_key] = new_command; 

		}
	}
	updateStorage(localStorage);
}

if(program.rename){

	var localStorage = getStorage();
	var token = localStorage.default_token;
	var new_command_key = program.args[0];
	var old_command_key = program.rename;
	if(token && localStorage.local[token] && localStorage.local[token].commands){

		if(new_command_key && localStorage.local[token].commands[old_command_key]){

			var old = localStorage.local[token].commands[old_command_key];
			localStorage.local[token].commands[new_command_key] = old;
			delete localStorage.local[token].commands[old_command_key];
			//old = null;

		}
	}
	updateStorage(localStorage);
}

if(program.clear){

	var localStorage = getStorage();
	var token = localStorage.default_token;
	var command_to_clear = program.args[0];
	if(token && localStorage.local[token] && localStorage.local[token].commands){

		if(command_to_clear && localStorage.local[token].commands[command_to_clear]){
			delete localStorage.local[token].commands[command_to_clear];
		}else{
			localStorage.local[token].commands = {};
		}
	}
	updateStorage(localStorage);
}
	
function processReplacements(command, args){

	var subst_regex = /(\{[a-z0-9]+\})/ig;
	var placeholders = command.match(subst_regex);

	if(args.length > 1 && placeholders){

		placeholders
		.forEach(

			function (p, i){
				if(args[i + 1]){
					var replacement = args[i + 1];
					if(/\s/.test(replacement)){
						replacement = '"' + replacement + '"';
					}
					command = command.replace(p, replacement);	
				}
				
			}
		)

	}
	return command;
}

//get single command
if(!program.pull && !program.push && !program.list && !program.clear && !program.add && !program.init && !program.default && !program.rename && !program.modify && !program.tokenalias){

	//console.log(program.args);
	var file_rem_key = program.args[0];
	var localStorage = getStorage();
	var token = localStorage.default_token;

	if(file_rem_key && localStorage.local[token] && localStorage.local[token].commands && localStorage.local[token].commands[file_rem_key.trim()] ){

		var command_to_recall = localStorage.local[token].commands[file_rem_key.trim()];

		command_to_recall = (processReplacements(command_to_recall, program.args));
		if(program.noexec){
			console.log(command_to_recall);
		}
		else{
			//nc.run(command_to_recall);
			console.log("==== Running command: ", command_to_recall, " ====");
			nc.get(command_to_recall, function (err, data, stderr){
				console.log(data);
			});
		}
	}
	else{
		console.log('No CM1 entry with the key', file_rem_key);
	}

}

//memr -a "git log admin" logadmin
