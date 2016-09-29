window.loaded_levels= window.loaded_levels || [];
window.adsniper = (function () {
    var config = {
        urls: {
            webmasterTags: "//rtrgt.adsniper.ru/adtd/##code##.gif?t=2&p=1&pageType=##level##&url64=##location##&ref64=##referer##&shopUserId=##shopUserId##&##params##"
        },
        levelsDefault: [
            0, 1, 2, 3, 4, 5, 20, 8, 9, 7, 6
        ],
        levelsCustom: {
        },
        locationMaxLength: 500
    };

    var core = {
        loadWebmasterTags: function (masterTagAppData, report,  callback) {
            var location = window.location.href.slice(0, config.locationMaxLength)
            var level = check.validateLevel(masterTagAppData.level)
            var url_params = {
                code: utils.genKey(),
                level: level,
                location: Base64.encode(location),
                referer: Base64.encode(document.referrer),
                shopUserId: !utils.isUndef(window.shopUserId) ? window.shopUserId : '',
                params: utils.packObject(check.checkers[level]())
            };
            var url = utils.buildUrl(config.urls.webmasterTags, url_params);
            core.loadScript(url, url_params.level, url_params.params);
        },

        run: function (masterTagAppData) {
            core.loadWebmasterTags(masterTagAppData)
        },
        loadScript: function(url, level, packed_params){
            var loaded_string = 'l'+level+'pp'+packed_params;
            var loaded = false;
            for (var k = 0; k < window.loaded_levels.length; k++) {
                if (window.loaded_levels[k] == loaded_string) {
                    loaded = true;
                    break;
                }
            }
            if (!loaded) {
                utils.appendImg(url)
                window.loaded_levels.push(loaded_string);
                //console.log(url)
            }
        }
    };

    var errCodes = {
        undefValue: 0,
        emptyValue: 0
    };

    var check = {
        checkers: {
            1: function () {
                return {}
            },
            0: function () {
                return {}
            },
            3: function () {
                var resp = {}
                if (utils.isUndef(window.ad_category)) {
                    resp.category_id = errCodes.undefValue
                }
                resp.category_id = window.ad_category
                return resp
            },
            2: function () {
                var resp = {}
                if (utils.isUndef(window.ad_product)) {
                    resp.product_id = errCodes.undefValue;
                }else {
                    if (utils.isUndef(window.ad_product.id)) {
                        resp.product_id = errCodes.undefValue;
                    }else{
                        resp.product_id = window.ad_product.id
                        if (!utils.isUndef(window.ad_product.size)) {
                            resp.size = window.ad_product.size;
                        }
                    }
                }

                return resp
            },
            7: function(){
                return check.checkers[2]();
            },
            4: function () {
                var resp = {}
                if (utils.isUndef(window.ad_products)) {
                    resp.basket_products = errCodes.undefValue;
                    resp.basket_quantity = errCodes.undefValue;
                }else {
                    var products = []
                    var quantities = []
                    for (var i=0; i<window.ad_products.length; i++) {
                        var product = window.ad_products[i]
                        if (utils.isUndef(product.id)) {
                            resp.basket_products = errCodes.undefValue;
                            resp.basket_quantity = errCodes.undefValue;
                        }else{
                            products[i] = window.ad_products[i].id;
                            quantities[i] = window.ad_products[i].number;
                        }
                    }
                    resp.basket_products = products.join()
                    resp.basket_quantity = quantities.join()
                }
                return resp
            },
            6: function () {
                var resp = {}
                var products = []
                var quantities = []

                if (utils.isUndef(window.ad_products)) {
                    resp.basket_products = errCodes.undefValue;
                    resp.basket_quantity = errCodes.undefValue;
                }else{
                    for(var i = 0; i < window.ad_products.length; i++) {
                        products[i] = window.ad_products[i].id;
                        quantities[i] = window.ad_products[i].number;
                    }
                }

                resp.order_products = products.join()
                resp.order_quantity = quantities.join()
                resp.orderId = window.ad_order
                resp.order_total = window.ad_amount

                return resp
            },
            20: function () {
                var resp = {}
                if (utils.isUndef(window.ad_product)) {
                    resp.product_id = errCodes.undefValue;
                }else {
                    resp.product_id = window.ad_product
                }

                return resp
            },
            8: function () {
               return check.checkers[4]();
            },
            9: function () {
                return check.checkers[4]();
            },
            5: function () {
                return {}
            },
        },

        validateLevel: function(level){
            var hasLevel = check.checkers.hasOwnProperty(level)
            if (!hasLevel) {
                console.log('NOTICE: unknown level '+level)
            }

            return hasLevel ? level : 0
        }
    };

    var re = {
        externalScripts: /<\s*script[^>]*?src[\s]*=[\s]*['"]([^"']*?)['"]/gim,
        internalScripts: /<\s*script[^>]*>([\S\s]*?)<\s*\/script\s*>/gim,
        img: /<img.+?src=[\"'](.+?)[\"'].+?>/gim,
        iframe: /<\s*iframe[^>]*?src[\s]*=[\s]*['"]([^"']*?)['"]/gim
    };

    var utils = {
        trim: function (string) {
            return string.replace(/^\s+|\s+$/g, '');
        },

        isLevelDefault: function (level) {
            return !(utils.isUndef(level)) || config.levelsDefault.indexOf(level) > -1;
        },

        arrayUpdate: function (array1, array2) {
            for (var i=0; i<array2.length; i++) {
                array1.push(array2[i]);
            }
            return array1
        },

        buildUrl: function (url, parameters) {
            for (var key in parameters) {
                url = url.replace("##" + key + "##", parameters[key])
            }
            var protocol = (document.location.protocol == "https:" ? "https:" : "http:")
            return protocol + url
        },

        createImg: function (src) {
            var img = new Image()
            img.height = 1;
            img.width = 1;
            img.alt = "";
            img.style['visibility'] = 'hidden';
            img.style['position'] = 'absolute';
            img.src = src;
            return img
        },

        createIframe: function (src) {
            var iframe = document.createElement("iframe")
            iframe.src = src;
            iframe.height = "1";
            iframe.width = "1";
            iframe.frameBorder = "0";
            return iframe
        },

        createScript: function (src) {
            var script = document.createElement("script");
            script.src = src;
            return script
        },

        each: function (list, func, context) {
            context = context || window
            for (var i=0;i<list.length; i++) {
                func.call(context, list[i], i)
            }
        },

        match: function (re, source, type) {
            var matched = [],
                match = null;
            do {
                match = re.exec(source);
                if (match && match.length > 1 && match[1]) {
                    var value = utils.trim(match[1]);
                    if (value) {
                        matched.push({
                            'value': value,
                            'type': type,
                            'index': match.index
                        })
                    }
                }
            } while (match != null);
            return matched
        },

        appendImg: function (src) {
            var img = utils.createImg(src)
            document.body.insertBefore(img, document.body.firstChild);
        },

        appendIframe: function (src) {
            var iframe = utils.createIframe(src)
            document.body.appendChild(iframe);
        },

        appendJs: function(src){
            var script = utils.createScript(src)
            document.body.appendChild(script);
        },

        isArray: function (array) {
            return (array && array.length > 0)
        },

        isObject: function (obj) {
            return (obj && typeof obj === "object")
        },

        isUndef: function (obj) {
            return (typeof obj === "undefined")
        },

        isEmpty: function (obj) {
            if (typeof obj === "number")
                return false;
            var hasOwnProperty = Object.prototype.hasOwnProperty;
            if (obj == null)
                return true;
            if (obj.length && obj.length > 0)
                return false;
            if (obj.length === 0)
                return true;
            for (var key in obj) {
                if (hasOwnProperty.call(obj, key))
                    return false;
            }
            return true;
        },

        packObject: function (obj) {
            if (!utils.isObject(obj)) return "";
            var packed = "";
            for (key in obj) {
                packed += key;
                packed += "=";
                packed += obj[key];
                packed += "&";
            }
            packed = packed.substring(0, packed.length-1)
            return packed
            //return encodeURIComponent(packed)
        },

        genKey: function () {
          var key = '';
          for (i=0;i<13;i++) key += Math.ceil(Math.random()*15).toString(16);
          return key;
        }
    }

    var Base64 = {
        // private property
        _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

        // public method for encoding
        encode : function (input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;

            input = Base64._utf8_encode(input);

            while (i < input.length) {

                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
            }
            return output;
        },

        // public method for decoding
        decode : function (input) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;

            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            while (i < input.length) {

                enc1 = this._keyStr.indexOf(input.charAt(i++));
                enc2 = this._keyStr.indexOf(input.charAt(i++));
                enc3 = this._keyStr.indexOf(input.charAt(i++));
                enc4 = this._keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
            }
            output = Base64._utf8_decode(output);
            return output;
        },

        // private method for UTF-8 encoding
        _utf8_encode : function (string) {
            string = string.replace(/\r\n/g,"\n");
            var utftext = "";

            for (var n = 0; n < string.length; n++) {

                var c = string.charCodeAt(n);

                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
            }
            return utftext;
        },

        // private method for UTF-8 decoding
        _utf8_decode : function (utftext) {
            var string = "";
            var i = 0;
            var c = c1 = c2 = 0;

            while ( i < utftext.length ) {

                c = utftext.charCodeAt(i);

                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                }
                else if((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i+1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                }
                else {
                    c2 = utftext.charCodeAt(i+1);
                    c3 = utftext.charCodeAt(i+2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }
            }
            return string;
        }
    }

    var api = {
        createApp: function (masterTagAppData) {
            core.run(masterTagAppData)
        }
    }
    return api
})();

try {
    if (window.ad_retag) {
        for (var i in window.ad_retag) {
            adsniper.createApp(window.ad_retag[i])
        }
    } else if (window._retag) {
        for (var i in window._retag) {
            adsniper.createApp(window._retag[i])
        }
    }
} catch(e) {
    console.log('WARNING: '+e)
}

