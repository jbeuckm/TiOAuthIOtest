function hex_sha1(s) {
    return rstr2hex(rstr_sha1(str2rstr_utf8(s)));
}

function b64_sha1(s) {
    return rstr2b64(rstr_sha1(str2rstr_utf8(s)));
}

function any_sha1(s, e) {
    return rstr2any(rstr_sha1(str2rstr_utf8(s)), e);
}

function hex_hmac_sha1(k, d) {
    return rstr2hex(rstr_hmac_sha1(str2rstr_utf8(k), str2rstr_utf8(d)));
}

function b64_hmac_sha1(k, d) {
    return rstr2b64(rstr_hmac_sha1(str2rstr_utf8(k), str2rstr_utf8(d)));
}

function any_hmac_sha1(k, d, e) {
    return rstr2any(rstr_hmac_sha1(str2rstr_utf8(k), str2rstr_utf8(d)), e);
}

function sha1_vm_test() {
    return "a9993e364706816aba3e25717850c26c9cd0d89d" == hex_sha1("abc").toLowerCase();
}

function rstr_sha1(s) {
    return binb2rstr(binb_sha1(rstr2binb(s), 8 * s.length));
}

function rstr_hmac_sha1(key, data) {
    var bkey = rstr2binb(key);
    bkey.length > 16 && (bkey = binb_sha1(bkey, 8 * key.length));
    var ipad = Array(16), opad = Array(16);
    for (var i = 0; 16 > i; i++) {
        ipad[i] = 909522486 ^ bkey[i];
        opad[i] = 1549556828 ^ bkey[i];
    }
    var hash = binb_sha1(ipad.concat(rstr2binb(data)), 512 + 8 * data.length);
    return binb2rstr(binb_sha1(opad.concat(hash), 672));
}

function rstr2hex(input) {
    try {
        hexcase;
    } catch (e) {
        hexcase = 0;
    }
    var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
    var output = "";
    var x;
    for (var i = 0; input.length > i; i++) {
        x = input.charCodeAt(i);
        output += hex_tab.charAt(15 & x >>> 4) + hex_tab.charAt(15 & x);
    }
    return output;
}

function rstr2b64(input) {
    try {
        b64pad;
    } catch (e) {
        b64pad = "";
    }
    var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var output = "";
    var len = input.length;
    for (var i = 0; len > i; i += 3) {
        var triplet = input.charCodeAt(i) << 16 | (len > i + 1 ? input.charCodeAt(i + 1) << 8 : 0) | (len > i + 2 ? input.charCodeAt(i + 2) : 0);
        for (var j = 0; 4 > j; j++) output += 8 * i + 6 * j > 8 * input.length ? b64pad : tab.charAt(63 & triplet >>> 6 * (3 - j));
    }
    return output;
}

function rstr2any(input, encoding) {
    var divisor = encoding.length;
    var remainders = Array();
    var i, q, x, quotient;
    var dividend = Array(Math.ceil(input.length / 2));
    for (i = 0; dividend.length > i; i++) dividend[i] = input.charCodeAt(2 * i) << 8 | input.charCodeAt(2 * i + 1);
    while (dividend.length > 0) {
        quotient = Array();
        x = 0;
        for (i = 0; dividend.length > i; i++) {
            x = (x << 16) + dividend[i];
            q = Math.floor(x / divisor);
            x -= q * divisor;
            (quotient.length > 0 || q > 0) && (quotient[quotient.length] = q);
        }
        remainders[remainders.length] = x;
        dividend = quotient;
    }
    var output = "";
    for (i = remainders.length - 1; i >= 0; i--) output += encoding.charAt(remainders[i]);
    var full_length = Math.ceil(8 * input.length / (Math.log(encoding.length) / Math.log(2)));
    for (i = output.length; full_length > i; i++) output = encoding[0] + output;
    return output;
}

function str2rstr_utf8(input) {
    var output = "";
    var i = -1;
    var x, y;
    while (++i < input.length) {
        x = input.charCodeAt(i);
        y = input.length > i + 1 ? input.charCodeAt(i + 1) : 0;
        if (x >= 55296 && 56319 >= x && y >= 56320 && 57343 >= y) {
            x = 65536 + ((1023 & x) << 10) + (1023 & y);
            i++;
        }
        127 >= x ? output += String.fromCharCode(x) : 2047 >= x ? output += String.fromCharCode(192 | 31 & x >>> 6, 128 | 63 & x) : 65535 >= x ? output += String.fromCharCode(224 | 15 & x >>> 12, 128 | 63 & x >>> 6, 128 | 63 & x) : 2097151 >= x && (output += String.fromCharCode(240 | 7 & x >>> 18, 128 | 63 & x >>> 12, 128 | 63 & x >>> 6, 128 | 63 & x));
    }
    return output;
}

function str2rstr_utf16le(input) {
    var output = "";
    for (var i = 0; input.length > i; i++) output += String.fromCharCode(255 & input.charCodeAt(i), 255 & input.charCodeAt(i) >>> 8);
    return output;
}

function str2rstr_utf16be(input) {
    var output = "";
    for (var i = 0; input.length > i; i++) output += String.fromCharCode(255 & input.charCodeAt(i) >>> 8, 255 & input.charCodeAt(i));
    return output;
}

function rstr2binb(input) {
    var output = Array(input.length >> 2);
    for (var i = 0; output.length > i; i++) output[i] = 0;
    for (var i = 0; 8 * input.length > i; i += 8) output[i >> 5] |= (255 & input.charCodeAt(i / 8)) << 24 - i % 32;
    return output;
}

function binb2rstr(input) {
    var output = "";
    for (var i = 0; 32 * input.length > i; i += 8) output += String.fromCharCode(255 & input[i >> 5] >>> 24 - i % 32);
    return output;
}

function binb_sha1(x, len) {
    x[len >> 5] |= 128 << 24 - len % 32;
    x[(len + 64 >> 9 << 4) + 15] = len;
    var w = Array(80);
    var a = 1732584193;
    var b = -271733879;
    var c = -1732584194;
    var d = 271733878;
    var e = -1009589776;
    for (var i = 0; x.length > i; i += 16) {
        var olda = a;
        var oldb = b;
        var oldc = c;
        var oldd = d;
        var olde = e;
        for (var j = 0; 80 > j; j++) {
            w[j] = 16 > j ? x[i + j] : bit_rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
            var t = safe_add(safe_add(bit_rol(a, 5), sha1_ft(j, b, c, d)), safe_add(safe_add(e, w[j]), sha1_kt(j)));
            e = d;
            d = c;
            c = bit_rol(b, 30);
            b = a;
            a = t;
        }
        a = safe_add(a, olda);
        b = safe_add(b, oldb);
        c = safe_add(c, oldc);
        d = safe_add(d, oldd);
        e = safe_add(e, olde);
    }
    return Array(a, b, c, d, e);
}

function sha1_ft(t, b, c, d) {
    if (20 > t) return b & c | ~b & d;
    if (40 > t) return b ^ c ^ d;
    if (60 > t) return b & c | b & d | c & d;
    return b ^ c ^ d;
}

function sha1_kt(t) {
    return 20 > t ? 1518500249 : 40 > t ? 1859775393 : 60 > t ? -1894007588 : -899497514;
}

function safe_add(x, y) {
    var lsw = (65535 & x) + (65535 & y);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return msw << 16 | 65535 & lsw;
}

function bit_rol(num, cnt) {
    return num << cnt | num >>> 32 - cnt;
}

var hexcase = 0;

var b64pad = "";

exports.b64_sha1 = b64_sha1;