
	var config = {
		oauthd_url: 'https://oauth.io'
	};

	if ( ! window.OAuth) {
		if (typeof jQuery == 'undefined')
		{
			var _preloadcalls = [];
			var e = document.createElement("script");
			e.src = "http://code.jquery.com/jquery.min.js";
			e.type = "text/javascript";
			e.onload = function() {
				buildOAuth(jQuery);
				for (var i in _preloadcalls)
					window.OAuth[_preloadcalls[i].method].apply(window.OAuth, _preloadcalls[i].args);
			};
			document.getElementsByTagName("head")[0].appendChild(e);

			var methods = ["initialize", "setOAuthdURL", "popup", "redirect", "callback", "http"];
			window.OAuth = {};
			var push_method = function(method) {
				window.OAuth[method] = function() {
					var args_copy = [];
					for (var arg in arguments)
						args_copy[arg] = arguments[arg];
					_preloadcalls.push({method:method, args:args_copy});
				};
			};
			for (var i in methods)
				push_method(methods[i]);
		}
		else
			buildOAuth(jQuery);
	}

	config.oauthd_base = getAbsUrl(config.oauthd_url).match(/^.{2,5}:\/\/[^/]+/)[0];

	var client_states = [];

	var oauth_result;
	(function parse_urlfragment() {
		var results = /[\\#&]oauthio=([^&]*)/.exec(document.location.hash);
		if (results) {
			document.location.hash = '';
			oauth_result = decodeURIComponent(results[1].replace(/\+/g, " "));
			var cookie_state = readCookie("oauthio_state");
			if (cookie_state) {
				client_states.push(cookie_state);
				eraseCookie("oauthio_state");
			}
		}
	})();

	function getAbsUrl(url) {
		if (url[0] === '/')
			url = document.location.protocol + '//' + document.location.host + url;
		else if ( ! url.match(/^.{2,5}:\/\//))
			url = document.location.protocol + '//' + document.location.host + document.location.pathname + '/' + url;
		return url;
	}

	function replaceParam(param, rep, rep2) {
		param = param.replace(/\{\{(.*?)\}\}/g, function(m,v) {
			return rep[v] || "";
		});
		if (rep2)
			param = param.replace(/\{(.*?)\}/g, function(m,v) {
				return rep2[v] || "";
			});
		return param;
	}

	function sendCallback(opts) {
		var data;
		var err;

		try {
			data = JSON.parse(opts.data);
		} catch (e) {}

		if ( ! data || ! data.provider)
			return;

		if (opts.provider && data.provider.toLowerCase() !== opts.provider.toLowerCase())
			return;

		if (data.status === 'error' || data.status === 'fail') {
			err = new Error(data.message);
			err.body = data.data;
			return opts.callback(err);
		}

		if (data.status !== 'success' || ! data.data) {
			err = new Error();
			err.body = data.data;
			return opts.callback(err);
		}

		if ( ! data.state || client_states.indexOf(data.state) == -1)
			return opts.callback(new Error('State is not matching'));

		if ( ! opts.provider)
			data.data.provider = data.provider;

		var res = data.data;
		var request = res.request;
		delete res.request;
		var tokens;
		if (res.access_token)
			tokens = { token: res.access_token };
		else if (res.oauth_token && res.oauth_token_secret)
			tokens = { oauth_token: res.oauth_token, oauth_token_secret: res.oauth_token_secret};

		if (request.required)
			for (var i in request.required)
				tokens[request.required[i]] = res[request.required[i]];

		var make_res = function(request, method) {
			return function(opts) {
				var options = {};
				if (typeof opts === 'string')
					options = {url:opts};
				else if (typeof opts === 'object')
					for (var i in opts) { options[i] = opts[i]; }
				options.type = options.type || method;
				options.oauthio = {provider:data.provider, tokens:tokens, request:request};
				return OAuth.http(options);
			};
		}

		res.get = make_res(request, 'GET');
		res.post = make_res(request, 'POST');
		res.put = make_res(request, 'PUT');
		res.patch = make_res(request, 'PATCH');
		res.del = make_res(request, 'DELETE');

		return opts.callback(null, res, request);
	}

	function buildOAuth($) {
		window.OAuth = {
			initialize: function(public_key) {
				config.key = public_key;
			},
			setOAuthdURL: function(url) {
				config.oauthd_url = url;
				config.oauthd_base = getAbsUrl(config.oauthd_url).match(/^.{2,5}:\/\/[^/]+/)[0];
			},
			popup: function(provider, opts, callback) {
				var wnd;
				if ( ! config.key)
					return callback(new Error('OAuth object must be initialized'));
				if (arguments.length == 2) {
					callback = opts;
					opts = {};
				}
				if ( ! opts.state) {
					opts.state = create_hash();
					opts.state_type = "client";
				}
				client_states.push(opts.state);

				var url = config.oauthd_url + '/auth/' + provider + "?k=" + config.key;
				url += '&d=' + encodeURIComponent(getAbsUrl('/'));
				if (opts)
					url += "&opts=" + encodeURIComponent(JSON.stringify(opts));

				// create popup
				var wnd_settings = {
					width: Math.floor(window.outerWidth * 0.8),
					height: Math.floor(window.outerHeight * 0.5)
				};
				if (wnd_settings.height < 350)
					wnd_settings.height = 350;
				if (wnd_settings.width < 800)
					wnd_settings.width = 800;
				wnd_settings.left = window.screenX + (window.outerWidth - wnd_settings.width) / 2;
				wnd_settings.top = window.screenY + (window.outerHeight - wnd_settings.height) / 8;
				var wnd_options = "width=" + wnd_settings.width + ",height=" + wnd_settings.height;
				wnd_options += ",toolbar=0,scrollbars=1,status=1,resizable=1,location=1,menuBar=0";
				wnd_options += ",left=" + wnd_settings.left + ",top=" + wnd_settings.top;

				opts = {provider:provider};
				function getMessage(e) {
					if (e.source !== wnd || e.origin !== config.oauthd_base)
						return;
					opts.data = e.data;
					return sendCallback(opts);
				}
				opts.callback = function(e, r) {
					if (window.removeEventListener)
						window.removeEventListener("message", getMessage, false);
					else if (window.detachEvent)
						window.detachEvent("onmessage", getMessage);
					else if (document.detachEvent)
						document.detachEvent("onmessage", getMessage);
					opts.callback = function() {};
					return callback(e,r);
				};

				if (window.attachEvent)
					window.attachEvent("onmessage", getMessage);
				else if (document.attachEvent)
					document.attachEvent("onmessage", getMessage);
				else if (window.addEventListener)
					window.addEventListener("message", getMessage, false);

				setTimeout(function() {
					opts.callback(new Error('Authorization timed out'));
				}, 600 * 1000);

				wnd = window.open(url, "Authorization", wnd_options);
				if (wnd)
					wnd.focus();
			},
			redirect: function(provider, opts, url) {
				if (arguments.length == 2) {
					url = opts;
					opts = {};
				}
				if ( ! opts.state) {
					opts.state = create_hash();
					opts.state_type = "client";
				}
				createCookie("oauthio_state", opts.state);
				var redirect_uri = encodeURIComponent(getAbsUrl(url));
				url = config.oauthd_url + '/auth/' + provider + "?k=" + config.key;
				url += "&redirect_uri=" + redirect_uri;
				if (opts)
					url += "&opts=" + encodeURIComponent(JSON.stringify(opts));
				document.location.href = url;
			},
			callback: function(provider, callback) {
				if ( ! oauth_result)
					return;

				if (arguments.length === 1)
					return sendCallback({data:oauth_result, callback:provider});

				return sendCallback({data:oauth_result, provider:provider, callback:callback});
			},
			http: function(opts) {
				var options = {};
				var i;
				for (i in opts) { options[i] = opts[i]; }
				if ( ! options.oauthio.request.cors) {
					options.url = encodeURIComponent(options.url);
					if (options.url[0] != '/')
						options.url = '/' + options.url;
					options.url = config.oauthd_url + '/request/' + options.oauthio.provider + options.url;
					options.headers = options.headers || {};
					options.headers.oauthio = 'k=' + config.key;
					if (options.oauthio.tokens.oauth_token && options.oauthio.tokens.oauth_token_secret)
						options.headers.oauthio += '&oauthv=1'; // make sure to use oauth 1
					for (var k in options.oauthio.tokens)
						options.headers.oauthio += '&' + encodeURIComponent(k) + '=' + encodeURIComponent(options.oauthio.tokens[k]);
					delete options.oauthio;
					return $.ajax(options);
				}
				if (options.oauthio.tokens.token) {

					if ( ! options.url.match(/^[a-z]{2,16}:\/\//)) {
						if (options.url[0] !== '/')
							options.url = '/' + options.url;
						options.url = options.oauthio.request.url + options.url;
					}

					if (options.oauthio.request.query) {
						var qs = [];
						for (i in options.oauthio.request.query)
							qs.push(encodeURIComponent(i) + '=' + encodeURIComponent(
								replaceParam(options.oauthio.request.query[i],
											 options.oauthio.tokens,
											 options.oauthio.request.parameters)
							));

						qs = qs.join('&');
						if (options.url.indexOf('?') !== -1)
							options.url += '&' + qs;
						else
							options.url += '?' + qs;
					}

					if (options.oauthio.request.headers)
					{
						options.headers = options.headers || {}
						for (i in options.oauthio.request.headers)
							options.headers[i] = replaceParam(options.oauthio.request.headers[i],
															  options.oauthio.tokens,
															  options.oauthio.request.parameters);
					}

					delete options.oauthio;
					return $.ajax(options);
				}
			}
		};
	}

	function create_hash() {
		var hash = require("md5").b64_sha1((new Date()).getTime() + ':' + Math.floor(Math.random()*9999999));
		return hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
	}

	function createCookie(name, value) {
		eraseCookie(name);
		var date = new Date();
		date.setTime(date.getTime() + 600000); // +10 mins
		var expires = "; expires="+date.toGMTString();
		document.cookie = name+"="+value+expires+"; path=/";
	}

	function readCookie(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) === ' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	}

	function eraseCookie(name) {
		var date = new Date();
		date.setTime(date.getTime() - 86400000);
		document.cookie = name+"=; expires="+date.toGMTString()+"; path=/";
	}

