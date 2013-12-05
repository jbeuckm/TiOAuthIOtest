function Controller() {
    function connect(e) {
        oauthio.connect(e.source.id);
    }
    function disconnect() {}
    function tweet(e) {
        oauthio.makeRequest("twitter", "POST", "https://api.twitter.com/1.1/statuses/update.json", {
            status: "test"
        }, function() {
            alert(e);
        }, function(e) {
            alert(e);
        });
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
    $.__views.tweet = Ti.UI.createButton({
        title: "Tweet",
        id: "tweet"
    });
    $.__views.win.add($.__views.tweet);
    tweet ? $.__views.tweet.addEventListener("click", tweet) : __defers["$.__views.tweet!click!tweet"] = true;
    $.__views.__alloyId0 = Ti.UI.createButton({
        title: "Disconnect Twitter",
        id: "__alloyId0"
    });
    $.__views.win.add($.__views.__alloyId0);
    disconnect ? $.__views.__alloyId0.addEventListener("click", disconnect) : __defers["$.__views.__alloyId0!click!disconnect"] = true;
    $.__views.facebook = Ti.UI.createButton({
        title: "Connect Facebook",
        id: "facebook"
    });
    $.__views.win.add($.__views.facebook);
    connect ? $.__views.facebook.addEventListener("click", connect) : __defers["$.__views.facebook!click!connect"] = true;
    exports.destroy = function() {};
    _.extend($, $.__views);
    $.win.open();
    var oauthio = require("oauthio/oauthio");
    oauthio.init();
    __defers["$.__views.twitter!click!connect"] && $.__views.twitter.addEventListener("click", connect);
    __defers["$.__views.tweet!click!tweet"] && $.__views.tweet.addEventListener("click", tweet);
    __defers["$.__views.__alloyId0!click!disconnect"] && $.__views.__alloyId0.addEventListener("click", disconnect);
    __defers["$.__views.facebook!click!connect"] && $.__views.facebook.addEventListener("click", connect);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;