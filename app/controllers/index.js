
$.win.open();

var oauthio = require("oauthio/oauthio");
oauthio.init();

function connect(e){
	oauthio.connect(e.source.id);
}
function disconnect(e) {
	
}

function tweet(e) {
/*	
	oauthio.makeRequest("twitter", "GET", "https://api.twitter.com/1.1/statuses/user_timeline.json", {}, 
		function(resp) {
			alert(e);
		},
		function(e) {
			alert(e);
		}
	);
*/
	oauthio.makeRequest("twitter", "POST", "https://api.twitter.com/1.1/statuses/update.json", {status:"Test from OAuth.io"}, 
		function(resp) {
			alert(e);
		},
		function(e) {
			alert(e);
		}
	);

}

