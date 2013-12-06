var OAuth = require("org.beuckman.oauth.io");

var key = require("oauthio/config").key;

var server = require("oauthio/config").server;

exports.init = function() {
    OAuth.initWithKey({
        publicKey: key
    });
};

exports.connect = function(provider) {
    OAuth.connect({
        provider: provider
    });
};

exports.disconnect = function() {};

OAuth.addEventListener("auth", function(e) {
    Ti.API.debug(e);
    var tokens = Ti.App.Properties.getObject("oauthio", {});
    tokens[e.provider] = {
        oauth_token: e.oauth_token,
        oauth_token_secret: e.oauth_token_secret
    };
    Ti.App.Properties.setObject("oauthio", tokens);
});

exports.getAccessToken = function(provider) {
    var tokens = Ti.App.Properties.getObject("oauthio", {});
    return tokens[provider] ? tokens[provider].access_token : null;
};

OAuth.addEventListener("error", function(e) {
    Ti.API.error(e);
});

exports.makeRequest = function(provider, method, path, data, success, error) {
    var tokens = Ti.App.Properties.getObject("oauthio", {});
    var token = tokens[provider];
    oauthioParams = {
        k: key,
        oauthv: 1,
        oauth_token: token.oauth_token,
        oauth_token_secret: token.oauth_token_secret
    };
    var headerPairs = [];
    for (var i in oauthioParams) headerPairs.push(i + "=" + oauthioParams[i]);
    var xhr = Ti.Network.createHTTPClient({
        onload: success,
        onerror: error
    });
    var requestUrl = server + "/request/" + provider + "/" + encodeURIComponent(path);
    xhr.open(method, requestUrl);
    xhr.setRequestHeader("oauthio", headerPairs.join("&"));
    xhr.send(data);
};