
$.win.open();

var oauthio = require("oauthio/oauthio");
oauthio.init();

function connect(e){
	oauthio.connect(e.source.id);
}
function disconnectTwitter(e) {
	
}
function disconnectFacebook(e) {
	
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
			alert(resp);
		},
		function(e) {
			alert(e);
		}
	);

}


function updateFacebook() {
	
	var xhr = Ti.Network.createHTTPClient({
		onload: function(resp) {
			alert(resp);
			/*
			/{user-id}/feed?message={message}&access_token={access-token}
    */
		},
		onerror: function(e) {
			alert(e);
		}
	});
	var url = "https://graph.facebook.com/me?access_token="+oauthio.getAccessToken("facebook");
	Ti.API.debug("will get "+url);
	xhr.open("GET", url);
	xhr.send();
}
