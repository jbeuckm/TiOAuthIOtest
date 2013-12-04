
$.index.open();

var OAuth = require('org.beuckman.oauth.io');

OAuth.initWithKey({publicKey:"b4OEhwfv-5GbP9BN4AEpUS0swv4"});

function connect(e) {
	alert(e);
    OAuth.connect({provider:e.source.id});
}


OAuth.addEventListener("auth", function(e){
	alert(e);
});

OAuth.addEventListener("error", function(e){
	Ti.API.error(e);
});

