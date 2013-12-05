function getAbsUrl(url) {
    "/" === url[0] ? url = document.location.protocol + "//" + document.location.host + url : url.match(/^.{2,5}:\/\//) || (url = document.location.protocol + "//" + document.location.host + document.location.pathname + "/" + url);
    return url;
}

function replaceParam(param, rep, rep2) {
    param = param.replace(/\{\{(.*?)\}\}/g, function(m, v) {
        return rep[v] || "";
    });
    rep2 && (param = param.replace(/\{(.*?)\}/g, function(m, v) {
        return rep2[v] || "";
    }));
    return param;
}

function sendCallback(opts) {
    var data;
    var err;
    try {
        data = JSON.parse(opts.data);
    } catch (e) {}
    if (!data || !data.provider) return;
    if (opts.provider && data.provider.toLowerCase() !== opts.provider.toLowerCase()) return;
    if ("error" === data.status || "fail" === data.status) {
        err = new Error(data.message);
        err.body = data.data;
        return opts.callback(err);
    }
    if ("success" !== data.status || !data.data) {
        err = new Error();
        err.body = data.data;
        return opts.callback(err);
    }
    if (!data.state || -1 == client_states.indexOf(data.state)) return opts.callback(new Error("State is not matching"));
    opts.provider || (data.data.provider = data.provider);
    var res = data.data;
    var request = res.request;
    delete res.request;
    var tokens;
    res.access_token ? tokens = {
        token: res.access_token
    } : res.oauth_token && res.oauth_token_secret && (tokens = {
        oauth_token: res.oauth_token,
        oauth_token_secret: res.oauth_token_secret
    });
    if (request.required) for (var i in request.required) tokens[request.required[i]] = res[request.required[i]];
    var make_res = function(request, method) {
        return function(opts) {
            var options = {};
            if ("string" == typeof opts) options = {
                url: opts
            }; else if ("object" == typeof opts) for (var i in opts) options[i] = opts[i];
            options.type = options.type || method;
            options.oauthio = {
                provider: data.provider,
                tokens: tokens,
                request: request
            };
            return OAuth.http(options);
        };
    };
    res.get = make_res(request, "GET");
    res.post = make_res(request, "POST");
    res.put = make_res(request, "PUT");
    res.patch = make_res(request, "PATCH");
    res.del = make_res(request, "DELETE");
    return opts.callback(null, res, request);
}

function create_hash() {
    var hash = require("md5").b64_sha1(new Date().getTime() + ":" + Math.floor(9999999 * Math.random()));
    return hash.replace(/\+/g, "-").replace(/\//g, "_").replace(/\=+$/, "");
}

function createCookie(name, value) {
    eraseCookie(name);
    var date = new Date();
    date.setTime(date.getTime() + 6e5);
    var expires = "; expires=" + date.toGMTString();
    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; ca.length > i; i++) {
        var c = ca[i];
        while (" " === c.charAt(0)) c = c.substring(1, c.length);
        if (0 === c.indexOf(nameEQ)) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    var date = new Date();
    date.setTime(date.getTime() - 864e5);
    document.cookie = name + "=; expires=" + date.toGMTString() + "; path=/";
}

var config = {
    oauthd_url: "https://oauth.io"
};

config.oauthd_base = getAbsUrl(config.oauthd_url).match(/^.{2,5}:\/\/[^/]+/)[0];

var client_states = [];

var oauth_result;

(function() {
    var results = /[\\#&]oauthio=([^&]*)/.exec(document.location.hash);
    if (results) {
        document.location.hash = "";
        oauth_result = decodeURIComponent(results[1].replace(/\+/g, " "));
        var cookie_state = readCookie("oauthio_state");
        if (cookie_state) {
            client_states.push(cookie_state);
            eraseCookie("oauthio_state");
        }
    }
})();

exports.OAuth = {
    initialize: function(public_key) {
        config.key = public_key;
    },
    setOAuthdURL: function(url) {
        config.oauthd_url = url;
        config.oauthd_base = getAbsUrl(config.oauthd_url).match(/^.{2,5}:\/\/[^/]+/)[0];
    },
    redirect: function(provider, opts, url) {
        if (2 == arguments.length) {
            url = opts;
            opts = {};
        }
        if (!opts.state) {
            opts.state = create_hash();
            opts.state_type = "client";
        }
        createCookie("oauthio_state", opts.state);
        var redirect_uri = encodeURIComponent(getAbsUrl(url));
        url = config.oauthd_url + "/auth/" + provider + "?k=" + config.key;
        url += "&redirect_uri=" + redirect_uri;
        opts && (url += "&opts=" + encodeURIComponent(JSON.stringify(opts)));
        document.location.href = url;
    },
    callback: function(provider, callback) {
        if (!oauth_result) return;
        if (1 === arguments.length) return sendCallback({
            data: oauth_result,
            callback: provider
        });
        return sendCallback({
            data: oauth_result,
            provider: provider,
            callback: callback
        });
    },
    http: function(opts) {
        var options = {};
        var i;
        for (i in opts) options[i] = opts[i];
        if (!options.oauthio.request.cors) {
            options.url = encodeURIComponent(options.url);
            "/" != options.url[0] && (options.url = "/" + options.url);
            options.url = config.oauthd_url + "/request/" + options.oauthio.provider + options.url;
            options.headers = options.headers || {};
            options.headers.oauthio = "k=" + config.key;
            options.oauthio.tokens.oauth_token && options.oauthio.tokens.oauth_token_secret && (options.headers.oauthio += "&oauthv=1");
            for (var k in options.oauthio.tokens) options.headers.oauthio += "&" + encodeURIComponent(k) + "=" + encodeURIComponent(options.oauthio.tokens[k]);
            delete options.oauthio;
            return $.ajax(options);
        }
        if (options.oauthio.tokens.token) {
            if (!options.url.match(/^[a-z]{2,16}:\/\//)) {
                "/" !== options.url[0] && (options.url = "/" + options.url);
                options.url = options.oauthio.request.url + options.url;
            }
            if (options.oauthio.request.query) {
                var qs = [];
                for (i in options.oauthio.request.query) qs.push(encodeURIComponent(i) + "=" + encodeURIComponent(replaceParam(options.oauthio.request.query[i], options.oauthio.tokens, options.oauthio.request.parameters)));
                qs = qs.join("&");
                options.url += -1 !== options.url.indexOf("?") ? "&" + qs : "?" + qs;
            }
            if (options.oauthio.request.headers) {
                options.headers = options.headers || {};
                for (i in options.oauthio.request.headers) options.headers[i] = replaceParam(options.oauthio.request.headers[i], options.oauthio.tokens, options.oauthio.request.parameters);
            }
            delete options.oauthio;
            return options;
        }
    }
};