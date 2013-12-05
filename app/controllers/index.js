$.index.open();

var OAuth = require('org.beuckman.oauth.io');

OAuth.initWithKey({publicKey:"<redactified>"});

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

