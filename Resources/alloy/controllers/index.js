function Controller() {
    function connect(e) {
        oauthio.connect(e.source.id);
    }
    function disconnectTwitter() {}
    function disconnectFacebook() {}
    function tweet() {
        oauthio.makeRequest("twitter", "POST", "https://api.twitter.com/1.1/statuses/update.json", {
            status: "Test from OAuth.io"
        }, function(resp) {
            alert(resp);
        }, function(e) {
            alert(e);
        });
    }
    function updateFacebook() {
        var xhr = Ti.Network.createHTTPClient({
            onload: function(resp) {
                alert(resp);
            },
            onerror: function(e) {
                alert(e);
            }
        });
        var url = "https://graph.facebook.com/me?access_token=" + oauthio.getAccessToken("facebook");
        Ti.API.debug("will get " + url);
        xhr.open("GET", url);
        xhr.send();
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "index";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    var __defers = {};
    $.__views.win = Ti.UI.createWindow({
        backgroundColor: "white",
        layout: "vertical",
        top: 20,
        id: "win"
    });
    $.__views.win && $.addTopLevelView($.__views.win);
    $.__views.twitter = Ti.UI.createButton({
        title: "Connect Twitter",
        id: "twitter"
    });
    $.__views.win.add($.__views.twitter);
    connect ? $.__views.twitter.addEventListener("click", connect) : __defers["$.__views.twitter!click!connect"] = true;
    $.__views.__alloyId0 = Ti.UI.createButton({
        title: "Tweet",
        id: "__alloyId0"
    });
    $.__views.win.add($.__views.__alloyId0);
    tweet ? $.__views.__alloyId0.addEventListener("click", tweet) : __defers["$.__views.__alloyId0!click!tweet"] = true;
    $.__views.__alloyId1 = Ti.UI.createButton({
        title: "Disconnect Twitter",
        id: "__alloyId1"
    });
    $.__views.win.add($.__views.__alloyId1);
    disconnectTwitter ? $.__views.__alloyId1.addEventListener("click", disconnectTwitter) : __defers["$.__views.__alloyId1!click!disconnectTwitter"] = true;
    $.__views.facebook = Ti.UI.createButton({
        title: "Connect Facebook",
        id: "facebook"
    });
    $.__views.win.add($.__views.facebook);
    connect ? $.__views.facebook.addEventListener("click", connect) : __defers["$.__views.facebook!click!connect"] = true;
    $.__views.__alloyId2 = Ti.UI.createButton({
        title: "Update Facebook",
        id: "__alloyId2"
    });
    $.__views.win.add($.__views.__alloyId2);
    updateFacebook ? $.__views.__alloyId2.addEventListener("click", updateFacebook) : __defers["$.__views.__alloyId2!click!updateFacebook"] = true;
    $.__views.__alloyId3 = Ti.UI.createButton({
        title: "Disconnect Facebook",
        id: "__alloyId3"
    });
    $.__views.win.add($.__views.__alloyId3);
    disconnectFacebook ? $.__views.__alloyId3.addEventListener("click", disconnectFacebook) : __defers["$.__views.__alloyId3!click!disconnectFacebook"] = true;
    exports.destroy = function() {};
    _.extend($, $.__views);
    $.win.open();
    var oauthio = require("oauthio/oauthio");
    oauthio.init();
    __defers["$.__views.twitter!click!connect"] && $.__views.twitter.addEventListener("click", connect);
    __defers["$.__views.__alloyId0!click!tweet"] && $.__views.__alloyId0.addEventListener("click", tweet);
    __defers["$.__views.__alloyId1!click!disconnectTwitter"] && $.__views.__alloyId1.addEventListener("click", disconnectTwitter);
    __defers["$.__views.facebook!click!connect"] && $.__views.facebook.addEventListener("click", connect);
    __defers["$.__views.__alloyId2!click!updateFacebook"] && $.__views.__alloyId2.addEventListener("click", updateFacebook);
    __defers["$.__views.__alloyId3!click!disconnectFacebook"] && $.__views.__alloyId3.addEventListener("click", disconnectFacebook);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;