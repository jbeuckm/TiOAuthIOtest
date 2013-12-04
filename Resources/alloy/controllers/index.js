function Controller() {
    function connectTwitter() {
        OAuth.connect({
            provider: "twitter"
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
    $.__views.index = Ti.UI.createWindow({
        backgroundColor: "white",
        id: "index"
    });
    $.__views.index && $.addTopLevelView($.__views.index);
    $.__views.label = Ti.UI.createButton({
        title: "Connect Twitter",
        id: "label"
    });
    $.__views.index.add($.__views.label);
    connectTwitter ? $.__views.label.addEventListener("click", connectTwitter) : __defers["$.__views.label!click!connectTwitter"] = true;
    exports.destroy = function() {};
    _.extend($, $.__views);
    $.index.open();
    var OAuth = require("org.beuckman.oauth.io");
    OAuth.initWithKey({
        publicKey: "b4OEhwfv-5GbP9BN4AEpUS0swv4"
    });
    Ti.App.addEventListener("resume", function() {
        var args = Ti.App.getArguments();
        Ti.API.debug("resuming with args");
        Ti.API.debug(args);
        OAuth.customUrlEntry(args.url);
    });
    OAuth.addEventListener("auth", function(e) {
        alert(e);
    });
    OAuth.addEventListener("error", function(e) {
        Ti.API.error(e);
    });
    __defers["$.__views.label!click!connectTwitter"] && $.__views.label.addEventListener("click", connectTwitter);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;