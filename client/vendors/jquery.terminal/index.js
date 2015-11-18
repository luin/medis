/**@license
 *       __ _____                     ________                              __
 *      / // _  /__ __ _____ ___ __ _/__  ___/__ ___ ______ __ __  __ ___  / /
 *  __ / // // // // // _  // _// // / / // _  // _//     // //  \/ // _ \/ /
 * /  / // // // // // ___// / / // / / // ___// / / / / // // /\  // // / /__
 * \___//____ \\___//____//_/ _\_  / /_//____//_/ /_/ /_//_//_/ /_/ \__\_\___/
 *           \/              /____/                              version {{VER}}
 * http://terminal.jcubic.pl
 *
 * Licensed under GNU LGPL Version 3 license
 * Copyright (c) 2011-2013 Jakub Jankiewicz <http://jcubic.pl>
 *
 * Includes:
 *
 * Storage plugin Distributed under the MIT License
 * Copyright (c) 2010 Dave Schindler
 *
 * jQuery Timers licenced with the WTFPL
 * <http://jquery.offput.ca/every/>
 *
 * Cross-Browser Split 1.1.1
 * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
 * Available under the MIT License
 *
 * sprintf.js
 * Copyright (c) 2007-2013 Alexandru Marasteanu <hello at alexei dot ro>
 * licensed under 3 clause BSD license
 *
 * Date: {{DATE}}
 *
 */

(function(ctx) {
    var sprintf = function() {
        if (!sprintf.cache.hasOwnProperty(arguments[0])) {
            sprintf.cache[arguments[0]] = sprintf.parse(arguments[0]);
        }
        return sprintf.format.call(null, sprintf.cache[arguments[0]], arguments);
    };

    sprintf.format = function(parse_tree, argv) {
        var cursor = 1, tree_length = parse_tree.length, node_type = '', arg, output = [], i, k, match, pad, pad_character, pad_length;
        for (i = 0; i < tree_length; i++) {
            node_type = get_type(parse_tree[i]);
            if (node_type === 'string') {
                output.push(parse_tree[i]);
            }
            else if (node_type === 'array') {
                match = parse_tree[i]; // convenience purposes only
                if (match[2]) { // keyword argument
                    arg = argv[cursor];
                    for (k = 0; k < match[2].length; k++) {
                        if (!arg.hasOwnProperty(match[2][k])) {
                            throw(sprintf('[sprintf] property "%s" does not exist', match[2][k]));
                        }
                        arg = arg[match[2][k]];
                    }
                }
                else if (match[1]) { // positional argument (explicit)
                    arg = argv[match[1]];
                }
                else { // positional argument (implicit)
                    arg = argv[cursor++];
                }

                if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {
                    throw(sprintf('[sprintf] expecting number but found %s', get_type(arg)));
                }
                switch (match[8]) {
                    case 'b': arg = arg.toString(2); break;
                    case 'c': arg = String.fromCharCode(arg); break;
                    case 'd': arg = parseInt(arg, 10); break;
                    case 'e': arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential(); break;
                    case 'f': arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg); break;
                    case 'o': arg = arg.toString(8); break;
                    case 's': arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg); break;
                    case 'u': arg = arg >>> 0; break;
                    case 'x': arg = arg.toString(16); break;
                    case 'X': arg = arg.toString(16).toUpperCase(); break;
                }
                arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+'+ arg : arg);
                pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';
                pad_length = match[6] - String(arg).length;
                pad = match[6] ? str_repeat(pad_character, pad_length) : '';
                output.push(match[5] ? arg + pad : pad + arg);
            }
        }
        return output.join('');
    };

    sprintf.cache = {};

    sprintf.parse = function(fmt) {
        var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;
        while (_fmt) {
            if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
                parse_tree.push(match[0]);
            }
            else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
                parse_tree.push('%');
            }
            else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
                if (match[2]) {
                    arg_names |= 1;
                    var field_list = [], replacement_field = match[2], field_match = [];
                    if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                        field_list.push(field_match[1]);
                        while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
                            if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                                field_list.push(field_match[1]);
                            }
                            else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
                                field_list.push(field_match[1]);
                            }
                            else {
                                throw('[sprintf] huh?');
                            }
                        }
                    }
                    else {
                        throw('[sprintf] huh?');
                    }
                    match[2] = field_list;
                }
                else {
                    arg_names |= 2;
                }
                if (arg_names === 3) {
                    throw('[sprintf] mixing positional and named placeholders is not (yet) supported');
                }
                parse_tree.push(match);
            }
            else {
                throw('[sprintf] huh?');
            }
            _fmt = _fmt.substring(match[0].length);
        }
        return parse_tree;
    };

    var vsprintf = function(fmt, argv, _argv) {
        _argv = argv.slice(0);
        _argv.splice(0, 0, fmt);
        return sprintf.apply(null, _argv);
    };

    /**
     * helpers
     */
    function get_type(variable) {
        return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
    }

    function str_repeat(input, multiplier) {
        for (var output = []; multiplier > 0; output[--multiplier] = input) {/* do nothing */}
        return output.join('');
    }

    /**
     * export to either browser or node.js
     */
    ctx.sprintf = sprintf;
    ctx.vsprintf = vsprintf;
})(typeof exports != "undefined" ? exports : window);

(function($, undefined) {
    "use strict";
    // -----------------------------------------------------------------------
    // :: map object to object
    // -----------------------------------------------------------------------
    $.omap = function(o, fn) {
        var result = {};
        $.each(o, function(k, v) {
            result[k] = fn.call(o, k, v);
        });
        return result;
    };
    // -----------------------------------------------------------------------
    // :: Storage plugin
    // -----------------------------------------------------------------------
    // Private data
    var isLS = typeof window.localStorage !== 'undefined';
    // Private functions
    function wls(n, v) {
        var c;
        if (typeof n === 'string' && typeof v === 'string') {
            localStorage[n] = v;
            return true;
        } else if (typeof n === 'object' && typeof v === 'undefined') {
            for (c in n) {
                if (n.hasOwnProperty(c)) {
                    localStorage[c] = n[c];
                }
            }
            return true;
        }
        return false;
    }
    function wc(n, v) {
        var dt, e, c;
        dt = new Date();
        dt.setTime(dt.getTime() + 31536000000);
        e = '; expires=' + dt.toGMTString();
        if (typeof n === 'string' && typeof v === 'string') {
            document.cookie = n + '=' + v + e + '; path=/';
            return true;
        } else if (typeof n === 'object' && typeof v === 'undefined') {
            for (c in n) {
                if (n.hasOwnProperty(c)) {
                    document.cookie = c + '=' + n[c] + e + '; path=/';
                }
            }
            return true;
        }
        return false;
    }
    function rls(n) {
        return localStorage[n];
    }
    function rc(n) {
        var nn, ca, i, c;
        nn = n + '=';
        ca = document.cookie.split(';');
        for (i = 0; i < ca.length; i++) {
            c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1, c.length);
            }
            if (c.indexOf(nn) === 0) {
                return c.substring(nn.length, c.length);
            }
        }
        return null;
    }
    function dls(n) {
        return delete localStorage[n];
    }
    function dc(n) {
        return wc(n, '', -1);
    }
    /**
    * Public API
    * $.Storage.set("name", "value")
    * $.Storage.set({"name1":"value1", "name2":"value2", etc})
    * $.Storage.get("name")
    * $.Storage.remove("name")
    */
    $.extend({
        Storage: {
            set: isLS ? wls : wc,
            get: isLS ? rls : rc,
            remove: isLS ? dls : dc
        }
    });
    // -----------------------------------------------------------------------
    // :: jQuery Timers
    // -----------------------------------------------------------------------
    jQuery.fn.extend({
        everyTime: function(interval, label, fn, times, belay) {
            return this.each(function() {
                jQuery.timer.add(this, interval, label, fn, times, belay);
            });
        },
        oneTime: function(interval, label, fn) {
            return this.each(function() {
                jQuery.timer.add(this, interval, label, fn, 1);
            });
        },
        stopTime: function(label, fn) {
            return this.each(function() {
                jQuery.timer.remove(this, label, fn);
            });
        }
    });

    jQuery.extend({
        timer: {
            guid: 1,
            global: {},
            regex: /^([0-9]+)\s*(.*s)?$/,
            powers: {
                // Yeah this is major overkill...
                'ms': 1,
                'cs': 10,
                'ds': 100,
                's': 1000,
                'das': 10000,
                'hs': 100000,
                'ks': 1000000
            },
            timeParse: function(value) {
                if (value === undefined || value === null) {
                    return null;
                }
                var result = this.regex.exec(jQuery.trim(value.toString()));
                if (result[2]) {
                    var num = parseInt(result[1], 10);
                    var mult = this.powers[result[2]] || 1;
                    return num * mult;
                } else {
                    return value;
                }
            },
            add: function(element, interval, label, fn, times, belay) {
                var counter = 0;

                if (jQuery.isFunction(label)) {
                    if (!times) {
                        times = fn;
                    }
                    fn = label;
                    label = interval;
                }

                interval = jQuery.timer.timeParse(interval);

                if (typeof interval !== 'number' ||
                    isNaN(interval) ||
                    interval <= 0) {
                    return;
                }
                if (times && times.constructor !== Number) {
                    belay = !!times;
                    times = 0;
                }

                times = times || 0;
                belay = belay || false;

                if (!element.$timers) {
                    element.$timers = {};
                }
                if (!element.$timers[label]) {
                    element.$timers[label] = {};
                }
                fn.$timerID = fn.$timerID || this.guid++;

                var handler = function() {
                    if (belay && handler.inProgress) {
                        return;
                    }
                    handler.inProgress = true;
                    if ((++counter > times && times !== 0) ||
                        fn.call(element, counter) === false) {
                        jQuery.timer.remove(element, label, fn);
                    }
                    handler.inProgress = false;
                };

                handler.$timerID = fn.$timerID;

                if (!element.$timers[label][fn.$timerID]) {
                    element.$timers[label][fn.$timerID] = window.setInterval(handler, interval);
                }

                if (!this.global[label]) {
                    this.global[label] = [];
                }
                this.global[label].push(element);

            },
            remove: function(element, label, fn) {
                var timers = element.$timers, ret;

                if (timers) {

                    if (!label) {
                        for (var lab in timers) {
                            if (timers.hasOwnProperty(lab)) {
                                this.remove(element, lab, fn);
                            }
                        }
                    } else if (timers[label]) {
                        if (fn) {
                            if (fn.$timerID) {
                                window.clearInterval(timers[label][fn.$timerID]);
                                delete timers[label][fn.$timerID];
                            }
                        } else {
                            for (var _fn in timers[label]) {
                                if (timers[label].hasOwnProperty(_fn)) {
                                    window.clearInterval(timers[label][_fn]);
                                    delete timers[label][_fn];
                                }
                            }
                        }

                        for (ret in timers[label]) {
                            if (timers[label].hasOwnProperty(ret)) {
                                break;
                            }
                        }
                        if (!ret) {
                            ret = null;
                            delete timers[label];
                        }
                    }

                    for (ret in timers) {
                        if (timers.hasOwnProperty(ret)) {
                            break;
                        }
                    }
                    if (!ret) {
                        element.$timers = null;
                    }
                }
            }
        }
    });

    if (/(msie) ([\w.]+)/.exec(navigator.userAgent.toLowerCase())) {
        jQuery(window).one('unload', function() {
            var global = jQuery.timer.global;
            for (var label in global) {
                if (global.hasOwnProperty(label)) {
                    var els = global[label], i = els.length;
                    while (--i) {
                        jQuery.timer.remove(els[i], label);
                    }
                }
            }
        });
    }
    // -----------------------------------------------------------------------
    // :: CROSS BROWSER SPLIT
    // -----------------------------------------------------------------------

    (function(undef) {

        // prevent double include

        if (!String.prototype.split.toString().match(/\[native/)) {
            return;
        }

        var nativeSplit = String.prototype.split,
        compliantExecNpcg = /()??/.exec("")[1] === undef, // NPCG: nonparticipating capturing group
        self;

        self = function (str, separator, limit) {
            // If `separator` is not a regex, use `nativeSplit`
            if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
                return nativeSplit.call(str, separator, limit);
            }
            var output = [],
            flags = (separator.ignoreCase ? "i" : "") +
                (separator.multiline  ? "m" : "") +
                (separator.extended   ? "x" : "") + // Proposed for ES6
                (separator.sticky     ? "y" : ""), // Firefox 3+
                lastLastIndex = 0,
            // Make `global` and avoid `lastIndex` issues by working with a copy
            separator2, match, lastIndex, lastLength;
            separator = new RegExp(separator.source, flags + "g");
            str += ""; // Type-convert
            if (!compliantExecNpcg) {
                // Doesn't need flags gy, but they don't hurt
                separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
            }
            /* Values for `limit`, per the spec:
         * If undefined: 4294967295 // Math.pow(2, 32) - 1
         * If 0, Infinity, or NaN: 0
         * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
         * If negative number: 4294967296 - Math.floor(Math.abs(limit))
         * If other: Type-convert, then use the above rules
         */
            // ? Math.pow(2, 32) - 1 : ToUint32(limit)
            limit = limit === undef ? -1 >>> 0 : limit >>> 0;
            while (match = separator.exec(str)) {
                    // `separator.lastIndex` is not reliable cross-browser
                    lastIndex = match.index + match[0].length;
                    if (lastIndex > lastLastIndex) {
                        output.push(str.slice(lastLastIndex, match.index));
                        // Fix browsers whose `exec` methods don't consistently return `undefined` for
                        // nonparticipating capturing groups
                        if (!compliantExecNpcg && match.length > 1) {
                            match[0].replace(separator2, function () {
                                for (var i = 1; i < arguments.length - 2; i++) {
                                    if (arguments[i] === undef) {
                                        match[i] = undef;
                                    }
                                }
                            });
                        }
                        if (match.length > 1 && match.index < str.length) {
                            Array.prototype.push.apply(output, match.slice(1));
                        }
                        lastLength = match[0].length;
                        lastLastIndex = lastIndex;
                        if (output.length >= limit) {
                            break;
                        }
                    }
                    if (separator.lastIndex === match.index) {
                        separator.lastIndex++; // Avoid an infinite loop
                    }
                }
            if (lastLastIndex === str.length) {
                if (lastLength || !separator.test("")) {
                    output.push("");
                }
            } else {
                output.push(str.slice(lastLastIndex));
            }
            return output.length > limit ? output.slice(0, limit) : output;
        };

        // For convenience
        String.prototype.split = function (separator, limit) {
            return self(this, separator, limit);
        };

        return self;

    })();
    // -----------------------------------------------------------------------
    // :: Split string to array of strings with the same length
    // -----------------------------------------------------------------------
    function str_parts(str, length) {
        var result = [];
        var len = str.length;
        if (len < length) {
            return [str];
        }
        for (var i = 0; i < len; i += length) {
            result.push(str.substring(i, i + length));
        }
        return result;
    }
    // -----------------------------------------------------------------------
    // :: CYCLE DATA STRUCTURE
    // -----------------------------------------------------------------------
    function Cycle(init) {
        var data = init ? [init] : [];
        var pos = 0;
        $.extend(this, {
            get: function() {
                return data;
            },
            rotate: function() {
                if (data.length === 1) {
                    return data[0];
                } else {
                    if (pos === data.length - 1) {
                        pos = 0;
                    } else {
                        ++pos;
                    }
                    return data[pos];
                }
            },
            length: function() {
                return data.length;
            },
            set: function(item) {
                for (var i = data.length; i--;) {
                    if (data[i] === item) {
                        pos = i;
                        return;
                    }
                }
                this.append(item);
            },
            front: function() {
                return data[pos];
            },
            append: function(item) {
                data.push(item);
            }
        });
    }
    // -----------------------------------------------------------------------
    // :: STACK DATA STRUCTURE
    // -----------------------------------------------------------------------
    function Stack(init) {
        var data = init ? [init] : [];
        $.extend(this, {
            map: function(fn) {
                return $.map(data, fn);
            },
            size: function() {
                return data.length;
            },
            pop: function() {
                if (data.length === 0) {
                    return null;
                } else {
                    var value = data[data.length - 1];
                    data = data.slice(0, data.length - 1);
                    return value;
                }
            },
            push: function(value) {
                data = data.concat([value]);
                return value;
            },
            top: function() {
                return data.length > 0 ? data[data.length - 1] : null;
            }
        });
    }
    // -----------------------------------------------------------------------
    // :: Serialize object myself (biwascheme or prototype library do something
    // :: wicked with JSON serialization for Arrays)
    // -----------------------------------------------------------------------
    $.json_stringify = function(object, level) {
        var result = '', i;
        level = level === undefined ? 1 : level;
        var type = typeof object;
        switch (type) {
        case 'function':
            result += object;
            break;
        case 'boolean':
            result += object ? 'true' : 'false';
            break;
        case 'object':
            if (object === null) {
                result += 'null';
            } else if (object instanceof Array) {
                result += '[';
                var len = object.length;
                for (i = 0; i < len - 1; ++i) {
                    result += $.json_stringify(object[i], level + 1);
                }
                result += $.json_stringify(object[len - 1], level + 1) + ']';
            } else {
                result += '{';
                for (var property in object) {
                    if (object.hasOwnProperty(property)) {
                        result += '"' + property + '":' +
                            $.json_stringify(object[property], level + 1);
                    }
                }
                result += '}';
            }
            break;
        case 'string':
            var str = object;
            var repl = {
                '\\\\': '\\\\',
                '"': '\\"',
                '/': '\\/',
                '\\n': '\\n',
                '\\r': '\\r',
                '\\t': '\\t'};
            for (i in repl) {
                if (repl.hasOwnProperty(i)) {
                    str = str.replace(new RegExp(i, 'g'), repl[i]);
                }
            }
            result += '"' + str + '"';
            break;
        case 'number':
            result += String(object);
            break;
        }
        result += (level > 1 ? ',' : '');
        // quick hacks below
        if (level === 1) {
            // fix last comma
            result = result.replace(/,([\]}])/g, '$1');
        }
        // fix comma before array or object
        return result.replace(/([\[{]),/g, '$1');
    };
    // -----------------------------------------------------------------------
    // :: HISTORY CLASS
    // -----------------------------------------------------------------------
    function History(name, size) {
        var enabled = true;
        var storage_key = '';
        if (typeof name === 'string' && name !== '') {
            storage_key = name + '_';
        }
        storage_key += 'commands';
        var data = $.Storage.get(storage_key);
        data = data ? $.parseJSON(data) : [];
        var pos = data.length-1;
        $.extend(this, {
            append: function(item) {
                if (enabled) {
                    if (data[data.length-1] !== item) {
                        data.push(item);
                        if (size && data.length > size) {
                            data = data.slice(-size);
                        }
                        pos = data.length-1;
                        $.Storage.set(storage_key, $.json_stringify(data));
                    }
                }
            },
            data: function() {
                return data;
            },
            reset: function() {
                pos = data.length-1;
            },
            last: function() {
                return data[length-1];
            },
            end: function() {
                return pos === data.length-1;
            },
            position: function() {
                return pos;
            },
            current: function() {
                return data[pos];
            },
            next: function() {
                if (pos < data.length-1) {
                    ++pos;
                }
                if (pos !== -1) {
                    return data[pos];
                }
            },
            previous: function() {
                var old = pos;
                if (pos > 0) {
                    --pos;
                }
                if (old !== -1) {
                    return data[pos];
                }
            },
            clear: function() {
                data = [];
                this.purge();
            },
            enabled: function() {
                return enabled;
            },
            enable: function() {
                enabled = true;
            },
            purge: function() {
                $.Storage.remove(storage_key);
            },
            disable: function() {
                enabled = false;
            }
        });
    }
    // -----------------------------------------------------------------------
    // :: COMMAND LINE PLUGIN
    // -----------------------------------------------------------------------
    $.fn.cmd = function(options) {
        var self = this;
        var maybe_data = self.data('cmd');
        if (maybe_data) {
            return maybe_data;
        }
        self.addClass('cmd');
        self.append('<span class="prompt"></span><span></span>' +
                    '<span class="cursor">&nbsp;</span><span></span>');
        var clip = $('<textarea/>').addClass('clipboard').appendTo(self);
        if (options.width) {
            self.width(options.width);
        }
        var num_chars; // calculated by draw_prompt
        var prompt_len;
        var reverse_search = false;
        var reverse_search_string = '';
        var reverse_search_position = null;
        var backup_prompt;
        var mask = options.mask || false;
        var command = '';
        var selected_text = ''; // text from selection using CTRL+SHIFT+C (as in Xterm)
        var kill_text = ''; // text from command that kill part of the command
        var position = 0;
        var prompt;
        var enabled = options.enabled;
        var historySize = options.historySize || 60;
        var name, history;
        var cursor = self.find('.cursor');
        var animation;
        if (supportAnimations()) {
            animation = function(toggle) {
                if (toggle) {
                    cursor.addClass('blink');
                } else {
                    cursor.removeClass('blink');
                }
            };
        } else {
            animation = function(toggle) {
                if (toggle && !enabled) {
                    cursor.addClass('inverted');
                    self.everyTime(500, 'blink', blink);
                } else if (enabled) {
                    self.stopTime('blink', blink);
                    cursor.removeClass('inverted');
                }
            };
        }
        // -----------------------------------------------------------------------
        // :: Blinking cursor function
        // -----------------------------------------------------------------------
        function blink(i) {
            cursor.toggleClass('inverted');
        }
        // -----------------------------------------------------------------------
        // :: Set prompt for reverse search
        // -----------------------------------------------------------------------
        function draw_reverse_prompt() {
            prompt = "(reverse-i-search)`" + reverse_search_string + "': ";
            draw_prompt();
        }
        // -----------------------------------------------------------------------
        // :: Disable reverse search
        // -----------------------------------------------------------------------
        function clear_reverse_state() {
            prompt = backup_prompt;
            reverse_search = false;
            reverse_search_position = null;
            reverse_search_string = '';
        }
        // -----------------------------------------------------------------------
        // :: Search through command line history. If next is not defined or false
        // :: it searches for the first item from the end. If true it search for 
        // :: the next item
        // -----------------------------------------------------------------------
        function reverse_history_search(next) {
            var history_data = history.data();
            var regex, save_string;
            var len = history_data.length;
            if (next && reverse_search_position > 0) {
                len -= reverse_search_position;
            }
            if (reverse_search_string.length > 0) {
                for (var j=reverse_search_string.length; j>0; j--) {
                    save_string = reverse_search_string.substring(0, j).
                        replace(/([.*+{}\[\]?])/g, '\\$1');
                    regex = new RegExp(save_string);
                    for (var i=len; i--;) {
                        if (regex.test(history_data[i])) {
                            reverse_search_position = history_data.length - i;
                            position = 0;
                            self.set(history_data[i], true);
                            redraw();
                            if (reverse_search_string.length !== j) {
                                reverse_search_string = reverse_search_string.substring(0, j);
                                draw_reverse_prompt();
                            }
                            return;
                        }
                    }
                }
            }
            reverse_search_string = ''; // clear if not found any
        }
        // -----------------------------------------------------------------------
        // :: Recalculate number of characters in command line
        // -----------------------------------------------------------------------
        function change_num_chars() {
            var W = self.width();
            var w = cursor.innerWidth();
            num_chars = Math.floor(W / w);
        }
        // -----------------------------------------------------------------------
        // :: Return string repeated n times
        // -----------------------------------------------------------------------
        function str_repeat(str, n) {
            var result = '';
            for (var i = n; i--;) {
                result += str;
            }
            return result;
        }
        // -----------------------------------------------------------------------
        // :: Split String that fit into command line where first line need to
        // :: fit next to prompt (need to have less characters)
        // -----------------------------------------------------------------------
        function get_splited_command_line(string) {
            var first = string.substring(0, num_chars - prompt_len);
            var rest = string.substring(num_chars - prompt_len);
            return [first].concat(str_parts(rest, num_chars));
        }
        // -----------------------------------------------------------------------
        // :: Function that displays the command line. Split long lines and place
        // :: cursor in the right place
        // -----------------------------------------------------------------------
        var redraw = (function(self) {
            var before = cursor.prev();
            var after = cursor.next();
            // -----------------------------------------------------------------------
            // :: Draw line with the cursor
            // -----------------------------------------------------------------------
            function draw_cursor_line(string, position) {
                var len = string.length;
                if (position === len) {
                    before.html($.terminal.encode(string, true));
                    cursor.html('&nbsp;');
                    after.html('');
                } else if (position === 0) {
                    before.html('');
                    //fix for tilda in IE
                    cursor.html($.terminal.encode(string.slice(0, 1), true));
                    //cursor.html($.terminal.encode(string[0]));
                    after.html($.terminal.encode(string.slice(1), true));
                } else {
                    var before_str = $.terminal.encode(string.slice(0, position), true);
                    before.html(before_str);
                    //fix for tilda in IE
                    var c = string.slice(position, position + 1);
                    //cursor.html(string[position]));
                    cursor.html(c === ' ' ? '&nbsp;' : $.terminal.encode(c, true));
                    if (position === string.length - 1) {
                        after.html('');
                    } else {
                        after.html($.terminal.encode(string.slice(position + 1), true));
                    }
                }
            }
            function div(string) {
                return '<div>' + $.terminal.encode(string, true) + '</div>';
            }
            // -----------------------------------------------------------------------
            // :: Display lines after the cursor
            // -----------------------------------------------------------------------
            function lines_after(lines) {
                var last_ins = after;
                $.each(lines, function(i, line) {
                    last_ins = $(div(line)).insertAfter(last_ins).
                        addClass('clear');
                });
            }
            // -----------------------------------------------------------------------
            // :: Display lines before the cursor
            // -----------------------------------------------------------------------
            function lines_before(lines) {
                $.each(lines, function(i, line) {
                    before.before(div(line));
                });
            }
            var count = 0;
            // -----------------------------------------------------------------------
            // :: Redraw function
            // -----------------------------------------------------------------------
            return function() {
                var string = mask ? command.replace(/./g, '*') : command;
                var i, first_len;
                self.find('div').remove();
                before.html('');
                // long line
                if (string.length > num_chars - prompt_len - 1 ||
                    string.match(/\n/)) {
                    var array;
                    var tabs = string.match(/\t/g);
                    var tabs_rm = tabs ? tabs.length * 3 : 0;
                    //quick tabulation hack
                    if (tabs) {
                        string = string.replace(/\t/g, '\x00\x00\x00\x00');
                    }
                    // command contains new line characters
                    if (string.match(/\n/)) {
                        var tmp = string.split("\n");
                        first_len = num_chars - prompt_len - 1;
                        // empty character after each line
                        for (i=0; i<tmp.length-1; ++i) {
                            tmp[i] += ' ';
                        }
                        // split first line
                        if (tmp[0].length > first_len) {
                            array = [tmp[0].substring(0, first_len)];
                            array = array.concat(str_parts(tmp[0].substring(first_len), num_chars));
                        } else {
                            array = [tmp[0]];
                        }
                        // process rest of the lines
                        for (i=1; i<tmp.length; ++i) {
                            if (tmp[i].length > num_chars) {
                                array = array.concat(str_parts(tmp[i], num_chars));
                            } else {
                                array.push(tmp[i]);
                            }
                        }
                    } else {
                        array = get_splited_command_line(string);
                    }
                    if (tabs) {
                        array = $.map(array, function(line) {
                            return line.replace(/\x00\x00\x00\x00/g, '\t');
                        });
                    }
                    first_len = array[0].length;
                    //cursor in first line
                    if (first_len === 0 && array.length === 1) {
                        // skip empty line
                    } else if (position < first_len) {
                        draw_cursor_line(array[0], position);
                        lines_after(array.slice(1));
                    } else if (position === first_len) {
                        before.before(div(array[0]));
                        draw_cursor_line(array[1], 0);
                        lines_after(array.slice(2));
                    } else {
                        var num_lines = array.length;
                        var offset = 0;
                        if (position < first_len) {
                            draw_cursor_line(array[0], position);
                            lines_after(array.slice(1));
                        } else if (position === first_len) {
                            before.before(div(array[0]));
                            draw_cursor_line(array[1], 0);
                            lines_after(array.slice(2));
                        } else {
                            var last = array.slice(-1)[0];
                            var from_last = string.length - position;
                            var last_len = last.length;
                            var pos = 0;
                            if (from_last <= last_len) {
                                lines_before(array.slice(0, -1));
                                pos = last_len === from_last ? 0 : last_len-from_last;
                                draw_cursor_line(last, pos+tabs_rm);
                            } else {
                                // in the middle
                                if (num_lines === 3) {
                                    before.before('<div>' + $.terminal.encode(array[0], true) +
                                                  '</div>');
                                    draw_cursor_line(array[1], position-first_len-1);
                                    after.after('<div class="clear">' +
                                                $.terminal.encode(array[2], true) +
                                                '</div>');
                                } else {
                                    // more lines, cursor in the middle
                                    var line_index;
                                    var current;
                                    pos = position;
                                    for (i=0; i<array.length; ++i) {
                                        var current_len = array[i].length;
                                        if (pos > current_len) {
                                            pos -= current_len;
                                        } else {
                                            break;
                                        }
                                    }
                                    current = array[i];
                                    line_index = i;
                                    // cursor on first character in line
                                    if (pos === current.length) {
                                        pos = 0;
                                        current = array[++line_index];
                                    }
                                    draw_cursor_line(current, pos);
                                    lines_before(array.slice(0, line_index));
                                    lines_after(array.slice(line_index+1));
                                }
                            }
                        }
                    }
                } else {
                     if (string === '') {
                         before.html('');
                         cursor.html('&nbsp;');
                         after.html('');
                     } else {
                         draw_cursor_line(string, position);
                     }
                }
            };
        })(self);
        var last_command;
        // -----------------------------------------------------------------------
        // :: Draw prompt that can be a function or a string
        // -----------------------------------------------------------------------
        var draw_prompt = (function() {
            var prompt_node = self.find('.prompt');
            function set(prompt) {
                prompt_len = skipFormattingCount(prompt);
                prompt_node.html($.terminal.format($.terminal.encode(prompt)));
            }
            return function() {
                switch (typeof prompt) {
                case 'string':
                    set(prompt);
                    break;
                case 'function':
                    prompt(set);
                    break;
                }
            };
        })();
        // -----------------------------------------------------------------------
        // :: Paste content to terminal using hidden textarea
        // -----------------------------------------------------------------------
        function paste() {
            clip.focus();
            //wait until Browser insert text to textarea
            self.oneTime(1, function() {
                self.insert(clip.val());
                clip.blur().val('');
            });
        }
        var first_up_history = true;
        //var prevent_keypress = false;
        // -----------------------------------------------------------------------
        // :: Keydown Event Handler
        // -----------------------------------------------------------------------
        function keydown_event(e) {
            var result, pos, len;
            if (typeof options.keydown == 'function') {
                result = options.keydown(e);
                if (result !== undefined) {
                    //prevent_keypress = true;
                    return result;
                }
            }
            if (enabled) {
                if (e.which !== 38 &&
                    !(e.which === 80 && e.ctrlKey)) {
                    first_up_history = true;
                }
                // arrows / Home / End / ENTER
                if (reverse_search && (e.which === 35 || e.which === 36 ||
                                       e.which === 37 || e.which === 38 ||
                                       e.which === 39 || e.which === 40 ||
                                       e.which === 13 || e.which === 27)) {
                    clear_reverse_state();
                    draw_prompt();
                    if (e.which === 27) { // ESC
                        command = '';
                    }
                    redraw();
                    // finish reverse search and execute normal event handler
                    keydown_event.call(this, e);
                } else if (e.altKey) {
                    // Chrome on Windows sets ctrlKey and altKey for alt
                    // need to check for alt first
                    //if (e.which === 18) { // press ALT
                    if (e.which === 68) { //ALT+D
                        self.set(command.slice(0, position) +
                                 command.slice(position).replace(/[^ ]+ |[^ ]+$/, ''),
                                 true);
                        // chrome jump to address bar
                        return false;
                    }
                    return true;
                } else if (e.keyCode === 13) { //enter
                    if (e.shiftKey) {
                        self.insert('\n');
                    } else {
                        if (history && command && !mask &&
                            ((typeof options.historyFilter == 'function' &&
                              options.historyFilter(command)) ||
                             !options.historyFilter)) {
                            history.append(command);
                        }
                        var tmp = command;
                        history.reset();
                        self.set('');
                        if (options.commands) {
                            options.commands(tmp);
                        }
                        if (typeof prompt === 'function') {
                            draw_prompt();
                        }
                    }
                } else if (e.which === 8) { //backspace
                    if (reverse_search) {
                        reverse_search_string = reverse_search_string.slice(0, -1);
                        draw_reverse_prompt();
                    } else {
                        if (command !== '' && position > 0) {
                            command = command.slice(0, position - 1) +
                                command.slice(position, command.length);
                            --position;
                            redraw();
                        }
                    }
                } else if (e.which === 67 && e.ctrlKey && e.shiftKey) { // CTRL+SHIFT+C
                    selected_text = getSelectedText();
                } else if (e.which === 86 && e.ctrlKey && e.shiftKey) {
                    if (selected_text !== '') {
                        self.insert(selected_text);
                    }
                } else if (e.which === 9 && !(e.ctrlKey || e.altKey)) { // TAB
                    self.insert('\t');
                } else if (e.which === 46) {
                    //DELETE
                    if (command !== '' && position < command.length) {
                        command = command.slice(0, position) +
                            command.slice(position + 1, command.length);
                        redraw();
                    }
                    return true;
                } else if (history && e.which === 38 ||
                           (e.which === 80 && e.ctrlKey)) {
                    //UP ARROW or CTRL+P
                    if (first_up_history) {
                        last_command = command;
                        self.set(history.current());
                    } else {
                        self.set(history.previous());
                    }
                    first_up_history = false;
                } else if (history && e.which === 40 ||
                           (e.which === 78 && e.ctrlKey)) {
                    //DOWN ARROW or CTRL+N
                    self.set(history.end() ? last_command : history.next());
                } else if (e.which === 37 ||
                           (e.which === 66 && e.ctrlKey)) {
                    //CTRL+LEFT ARROW or CTRL+B
                    if (e.ctrlKey && e.which !== 66) {
                        len = position - 1;
                        pos = 0;
                        if (command[len] === ' ') {
                            --len;
                        }
                        for (var i = len; i > 0; --i) {
                            if (command[i] === ' ' && command[i+1] !== ' ') {
                                pos = i + 1;
                                break;
                            } else if (command[i] === '\n' && command[i+1] !== '\n') {
                                pos = i;
                                break;
                            }
                        }
                        self.position(pos);
                    } else {
                        //LEFT ARROW or CTRL+B
                        if (position > 0) {
                            --position;
                            redraw();
                        }
                    }
                } else if (e.which === 82 && e.ctrlKey) { // CTRL+R
                    if (reverse_search) {
                        reverse_history_search(true);
                    } else {
                        backup_prompt = prompt;
                        draw_reverse_prompt();
                        last_command = command;
                        command = '';
                        redraw();
                        reverse_search = true;
                    }
                } else if (e.which == 71 && e.ctrlKey) { // CTRL+G
                    if (reverse_search) {
                        prompt = backup_prompt;
                        draw_prompt();
                        command = last_command;
                        redraw();
                        reverse_search = false;
                        reverse_search_string = '';
                    }
                } else if (e.which === 39 ||
                           (e.which === 70 && e.ctrlKey)) {
                    //RIGHT ARROW OR CTRL+F
                    if (e.ctrlKey && e.which !== 70) {
                        // jump to beginning or end of the word
                        if (command[position] === ' ') {
                            ++position;
                        }
                        var re = /\S[\n\s]{2,}|[\n\s]+\S?/;
                        var match = command.slice(position).match(re);
                        if (!match || match[0].match(/^\s+$/)) {
                            position = command.length;
                        } else {
                            if (match[0][0] !== ' ') {
                                position += match.index + 1;
                            } else {
                                position += match.index + match[0].length - 1;
                                if (match[0][match[0].length-1] !== ' ') {
                                    --position;
                                }
                            }
                        }
                        redraw();
                    } else {
                        if (position < command.length) {
                            ++position;
                            redraw();
                        }
                    }
                } else if (e.which === 123) { //F12 - Allow Firebug
                    return true;
                } else if (e.which === 36) { //HOME
                    self.position(0);
                } else if (e.which === 35) {
                    //END
                    self.position(command.length);
                } else if (e.shiftKey && e.which == 45) { // Shift+Insert
                    paste();
                    return true;
                } else if (e.ctrlKey || e.metaKey) {
                    if (e.which === 192) { // CMD+` switch browser window on Mac
                        return true;
                    }
                    if (e.metaKey) {
                        if(e.which === 82) { // CMD+r page reload in Chrome Mac
                            return true;
                        } else if(e.which === 76) {
                            return true; // CMD+l jump into Omnibox on Chrome Mac
                        }
                    }
                    if (e.shiftKey) { // CTRL+SHIFT+??
                        if (e.which === 84) {
                            //CTRL+SHIFT+T open closed tab
                            return true;
                        }
                    //} else if (e.altKey) { //ALT+CTRL+??
                    } else {
                        if (e.which === 81) { // CTRL+W
                            // don't work in Chromium (can't prevent close tab)
                            if (command !== '' && position !== 0) {
                                var first = command.slice(0, position);
                                var last = command.slice(position+1);
                                var m = first.match(/([^ ]+ *$)/);
                                position = first.length-m[0].length;
                                kill_text = first.slice(position);
                                command = first.slice(0, position) + last;
                                redraw();
                            }
                            return false;
                        } else if (e.which === 72) { // CTRL+H
                            if (command !== '' && position > 0) {
                                command = command.slice(0, --position);
                                if (position < command.length-1) {
                                    command += command.slice(position);
                                }
                                redraw();
                            }
                            return false;
                        //NOTE: in opera charCode is undefined
                        } else if (e.which === 65) {
                            //CTRL+A
                            self.position(0);
                        } else if (e.which === 69) {
                            //CTRL+E
                            self.position(command.length);
                        } else if (e.which === 88 || e.which === 67 || e.which === 84) {
                            //CTRL+X CTRL+C CTRL+W CTRL+T
                            return true;
                        } else if (e.which === 89) { // CTRL+Y
                            if (kill_text !== '') {
                                self.insert(kill_text);
                            }
                        } else if (e.which === 86) {
                            //CTRL+V
                            paste();
                            return true;
                        } else if (e.which === 75) {
                            //CTRL+K
                            if (position === 0) {
                                kill_text = command;
                                self.set('');
                            } else if (position !== command.length) {
                                kill_text = command.slice(position);
                                self.set(command.slice(0, position));
                            }
                        } else if (e.which === 85) { // CTRL+U
                            if (command !== '' && position !== 0) {
                                kill_text = command.slice(0, position);
                                self.set(command.slice(position, command.length));
                                self.position(0);
                            }
                        } else if (e.which === 17) { //CTRL+TAB switch tab
                            return false;
                        }
                    }
                } else {
                    return true;
                }
                return false;
            } /*else {
                if ((e.altKey && e.which === 68) ||
                    (e.ctrlKey &&
                     $.inArray(e.which, [65, 66, 68, 69, 80, 78, 70]) > -1) ||
                    // 68 === D
                    [35, 36, 37, 38, 39, 40].has(e.which)) {
                    return false;
                }
            } */
        }
        var history_list = [];
        // -----------------------------------------------------------------------
        // :: Command Line Methods
        // -----------------------------------------------------------------------
        $.extend(self, {
            name: function(string) {
                if (string !== undefined) {
                    name = string;
                    var enabled = history && history.enabled() || !history;
                    history = new History(string, historySize);
                    // disable new history if old was disabled
                    if (!enabled) {
                        history.disable();
                    }
                    return self;
                } else {
                    return name;
                }
            },
            purge: function() {
                history.clear();
                return self;
            },
            history: function() {
                return history;
            },
            set: function(string, stay) {
                if (string !== undefined) {
                    command = string;
                    if (!stay) {
                        position = command.length;
                    }
                    redraw();
                    if (typeof options.onCommandChange === 'function') {
                        options.onCommandChange(command);
                    }
                }
                return self;
            },
            insert: function(string, stay) {
                if (position === command.length) {
                    command += string;
                } else if (position === 0) {
                    command = string + command;
                } else {
                    command = command.slice(0, position) +
                        string + command.slice(position);
                }
                if (!stay) {
                    position += string.length;
                }
                redraw();
                if (typeof options.onCommandChange === 'function') {
                    options.onCommandChange(command);
                }
                return self;
            },
            get: function() {
                return command;
            },
            commands: function(commands) {
                if (commands) {
                    options.commands = commands;
                    return self;
                } else {
                    return commands;
                }
            },
            destroy: function() {
                $(document.documentElement || window).unbind('.cmd');
                self.stopTime('blink', blink);
                self.find('.cursor').next().remove().end().prev().remove().end().remove();
                self.find('.prompt, .clipboard').remove();
                self.removeClass('cmd').removeData('cmd');
                return self;
            },
            prompt: function(user_prompt) {
                if (user_prompt === undefined) {
                    return prompt;
                } else {
                    if (typeof user_prompt === 'string' ||
                        typeof user_prompt === 'function') {
                        prompt = user_prompt;
                    } else {
                        throw 'prompt must be a function or string';
                    }
                    draw_prompt();
                    // we could check if command is longer then numchars-new prompt
                    redraw();
                    return self;
                }
            },
            kill_text: function() {
                return kill_text;
            },
            position: function(n) {
                if (typeof n === 'number') {
                    position = n < 0 ? 0 : n > command.length ? command.length : n;
                    redraw();
                    return self;
                } else {
                    return position;
                }
            },
            visible: (function() {
                var visible = self.visible;
                return function() {
                    visible.apply(self, []);
                    redraw();
                    draw_prompt();
                };
            })(),
            show: (function() {
                var show = self.show;
                return function() {
                    show.apply(self, []);
                    redraw();
                    draw_prompt();
                };
            })(),
            resize: function(num) {
                if (num) {
                    num_chars = num;
                } else {
                    change_num_chars();
                }
                redraw();
                return self;
            },
            enable: function() {
                enabled = true;
                animation(true);
                return self;
            },
            isenabled: function() {
                return enabled;
            },
            disable: function() {
                enabled = false;
                animation(false);
                return self;
            },
            mask: function(display) {
                if (typeof display === 'boolean') {
                    mask = display;
                    redraw();
                    return self;
                } else {
                    return mask;
                }
            }
        });
        // -----------------------------------------------------------------------
        // :: INIT
        // -----------------------------------------------------------------------
        self.name(options.name || options.prompt || '');
        prompt = options.prompt || '> ';
        draw_prompt();
        if (options.enabled === undefined || options.enabled === true) {
            self.enable();
        }
        // Keystrokes
        var object;
        $(document.documentElement || window).bind('keypress.cmd', function(e) {
            var result;
            if (e.ctrlKey && e.which === 99) { // CTRL+C
                return true;
            }
            if (!reverse_search && typeof options.keypress === 'function') {
                result = options.keypress(e);
            }
            if (result === undefined || result) {
                if (enabled) {
                    if ($.inArray(e.which, [38, 13, 0, 8]) > -1 &&
                        e.keyCode !== 123 && // for F12 which === 0
                        //!(e.which === 40 && e.shiftKey ||
                        !(e.which === 38 && e.shiftKey)) {
                        return false;
                    } else if (!e.ctrlKey && !(e.altKey && e.which === 100) || e.altKey) { // ALT+D
                        // TODO: this should be in one statement
                        if (reverse_search) {
                            reverse_search_string += String.fromCharCode(e.which);
                            reverse_history_search();
                            draw_reverse_prompt();
                        } else {
                            self.insert(String.fromCharCode(e.which));
                        }
                        return false;
                    }
                }
            } else {
                return result;
            }
        }).bind('keydown.cmd', keydown_event);
        // characters
        self.data('cmd', self);
        return self;
    }; // cmd plugin

    // -------------------------------------------------------------------------
    // :: TOOLS
    // -------------------------------------------------------------------------
    function skipFormattingCount(string) {
        // this will covert html entities to single characters
        return $('<div>' + $.terminal.strip(string) + '</div>').text().length;
    }
    // -------------------------------------------------------------------------
    function formattingCount(string) {
        return string.length - skipFormattingCount(string);
    }
    // -------------------------------------------------------------------------
    // taken from https://hacks.mozilla.org/2011/09/detecting-and-generating-css-animations-in-javascript/
    function supportAnimations() {
        var animation = false,
        animationstring = 'animation',
        keyframeprefix = '',
        domPrefixes = 'Webkit Moz O ms Khtml'.split(' '),
        pfx  = '',
        elm = document.createElement('div');
        if (elm.style.animationName) { animation = true; }
        if (animation === false) {
            for (var i = 0; i < domPrefixes.length; i++) {
                if (elm.style[ domPrefixes[i] + 'AnimationName' ] !== undefined) {
                    pfx = domPrefixes[i];
                    animationstring = pfx + 'Animation';
                    keyframeprefix = '-' + pfx.toLowerCase() + '-';
                    animation = true;
                    break;
                }
            }
        }
        return animation;
    }
    // -------------------------------------------------------------------------
    function processCommand(string, fn) {
        var args = string.replace(/^\s+|\s+$/g, '').split(/(\s+)/);
        var rest = string.replace(/^[^\s]+\s*/, '');
        return {
            name: args[0],
            args: fn(rest),
            rest: rest
        };
    }
    // colors from http://www.w3.org/wiki/CSS/Properties/color/keywords
    var color_names = [
        'black', 'silver', 'gray', 'white', 'maroon', 'red', 'purple',
        'fuchsia', 'green', 'lime', 'olive', 'yellow', 'navy', 'blue', 'teal',
        'aqua', 'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure',
        'beige', 'bisque', 'black', 'blanchedalmond', 'blue', 'blueviolet',
        'brown', 'burlywood', 'cadetblue', 'chartreuse', 'chocolate', 'coral',
        'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue', 'darkcyan',
        'darkgoldenrod', 'darkgray', 'darkgreen', 'darkgrey', 'darkkhaki',
        'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred',
        'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray',
        'darkslategrey', 'darkturquoise', 'darkviolet', 'deeppink',
        'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue', 'firebrick',
        'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite',
        'gold', 'goldenrod', 'gray', 'green', 'greenyellow', 'grey', 'honeydew',
        'hotpink', 'indianred', 'indigo', 'ivory', 'khaki', 'lavender',
        'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral',
        'lightcyan', 'lightgoldenrodyellow', 'lightgray', 'lightgreen',
        'lightgrey', 'lightpink', 'lightsalmon', 'lightseagreen',
        'lightskyblue', 'lightslategray', 'lightslategrey', 'lightsteelblue',
        'lightyellow', 'lime', 'limegreen', 'linen', 'magenta', 'maroon',
        'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple',
        'mediumseagreen', 'mediumslateblue', 'mediumspringgreen',
        'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mintcream',
        'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace', 'olive',
        'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod',
        'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip',
        'peachpuff', 'peru', 'pink', 'plum', 'powderblue', 'purple', 'red',
        'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown',
        'seagreen', 'seashell', 'sienna', 'silver', 'skyblue', 'slateblue',
        'slategray', 'slategrey', 'snow', 'springgreen', 'steelblue', 'tan',
        'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat', 'white',
        'whitesmoke', 'yellow', 'yellowgreen'];
    // -------------------------------------------------------------------------
    var format_split_re = /(\[\[[gbiuso]*;[^;]*;[^\]]*\](?:[^\]]*\\\][^\]]*|[^\]]*|[^\[]*\[[^\]]*)\]?)/i;
    var format_parts_re = /\[\[([gbiuso]*);([^;]*);([^;\]]*);?([^;\]]*);?([^\]]*)\]([^\]]*\\\][^\]]*|[^\]]*|[^\[]*\[[^\]]*)\]?/gi;
    var format_re = /\[\[([gbiuso]*;[^;\]]*;[^;\]]*(?:;|[^\]()]*);?[^\]]*)\]([^\]]*\\\][^\]]*|[^\]]*|[^\[]*\[[^\]]*)\]?/gi;
    var format_full_re = /^\[\[([gbiuso]*;[^;\]]*;[^;\]]*(?:;|[^\]()]*);?[^\]]*)\]([^\]]*\\\][^\]]*|[^\]]*|[^\[]*\[[^\]]*)\]$/gi;
    var color_hex_re = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
    //var url_re = /https?:\/\/(?:(?!&[^;]+;)[^\s:"'<>)])+/g;
    var url_re = /\bhttps?:\/\/(?:(?!&[^;]+;)[^\s"'<>)])+\b/g;
    var email_re = /((([^<>('")[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})))/g;
    var command_re = /('[^']*'|"(\\"|[^"])*"|\/(\\\/|[^\/])+\/[gimy]*|(\\ |[^ ])+|[\w-]+)/g;
    var format_begin_re = /(\[\[[gbiuso]*;[^;]*;[^\]]*\])/i;
    var format_last_re = /\[\[[gbiuso]*;[^;]*;[^\]]*\]?$/i;
    $.terminal = {
        // -----------------------------------------------------------------------
        // :: Validate html color (it can be name or hex)
        // -----------------------------------------------------------------------
        valid_color: function(color) {
            return color.match(color_hex_re) || $.inArray(color.toLowerCase(), color_names) !== -1;
        },
        // -----------------------------------------------------------------------
        // :: Escape all special regex characters, so it can be use as regex to
        // :: match exact string that contain those characters
        // -----------------------------------------------------------------------
        escape_regex: function(string) {
            var special = /([\^\$\[\]\(\)\+\*\.\|])/g;
            return string.replace(special, '\\$1');
        },
        // -----------------------------------------------------------------------
        // :: test if string contain formatting
        // -----------------------------------------------------------------------
        have_formatting: function(str) {
            return str.match(format_re);
        },
        is_formatting: function(str) {
            return str.match(format_full_re);
        },
        // -----------------------------------------------------------------------
        // :: return array of formatting and text between them
        // -----------------------------------------------------------------------
        format_split: function(str) {
            return str.split(format_split_re);
        },
        // -----------------------------------------------------------------------
        // :: split text into lines with equal length so each line can be rendered
        // :: separately (text formatting can be longer then a line).
        // -----------------------------------------------------------------------
        split_equal: function(str, length) {
            var formatting = false;
            var in_text = false;
            var braket = 0;
            var prev_format = '';
            var result = [];
            // add format text as 5th paramter to formatting it's used for
            // data attribute in format function
            var array = str.replace(format_re, function(_, format, text) {
                var semicolons = format.match(/;/g).length;
                // missing semicolons
                if (semicolons == 2) {
                    semicolons = ';;';
                } else if (semicolons == 3) {
                    semicolons = ';';
                } else {
                    semicolons = '';
                }
                // return '[[' + format + ']' + text + ']';
                // closing braket will break formatting so we need to escape those using
                // html entity equvalent
                return '[[' + format + semicolons +
                    text.replace(/\\\]/g, '&#93;').replace(/\n/g, '\\n') + ']' +
                    text + ']';
            }).split(/\n/g);
            for (var i = 0, len = array.length; i < len; ++i) {
                if (array[i] === '') {
                    result.push('');
                    continue;
                }
                var line = array[i];
                var first_index = 0;
                var count = 0;
                for (var j=0, jlen=line.length; j<jlen; ++j) {
                    if (line[j] === '[' && line[j+1] === '[') {
                        formatting = true;
                    } else if (formatting && line[j] === ']') {
                        if (in_text) {
                            formatting = false;
                            in_text = false;
                        } else {
                            in_text = true;
                        }
                    } else if ((formatting && in_text) || !formatting) {
                        if (line[j] === '&') { // treat entity as one character
                            var m = line.substring(j).match(/^(&[^;]+;)/);
                            if (!m) {
                                // should never happen if used by terminal, because
                                // it always calls $.terminal.encode before this function
                                throw "Unclosed html entity in line " + (i+1) + ' at char ' + (j+1);
                            }
                            j+=m[1].length-2; // because continue adds 1 to j
                            // if entity is at the end there is no next loop - issue #77
                            if (j === jlen-1) {
                                result.push(output_line + m[1]);
                            }
                            continue;
                        } else if (line[j] === ']' && line[j-1] === '\\') {
                            // escape \] counts as one character
                            --count;
                        } else {
                            ++count;
                        }
                    }
                    if (count === length || j === jlen-1) {
                        var output_line = line.substring(first_index, j+1);
                        if (prev_format) {
                            output_line = prev_format + output_line;
                            if (output_line.match(']')) {
                                prev_format = '';
                            }
                        }
                        first_index = j+1;
                        count = 0;
                        // Fix output_line if formatting not closed
                        var matched = output_line.match(format_re);
                        if (matched) {
                            var last = matched[matched.length-1];
                            if (last[last.length-1] !== ']') {
                                prev_format = last.match(format_begin_re)[1];
                                output_line += ']';
                            } else if (output_line.match(format_last_re)) {
                                var line_len = output_line.length;
                                var f_len = line_len - last[last.length-1].length;
                                output_line = output_line.replace(format_last_re, '');
                                prev_format = last.match(format_begin_re)[1];
                            }
                        }
                        result.push(output_line);
                    }
                }
            }
            return result;
        },
        // -----------------------------------------------------------------------
        // :: Encode formating as html for insertion into DOM
        // -----------------------------------------------------------------------
        encode: function(str, full) {
            // don't escape entities
            if (full) {
                str = str.replace(/&(?![^=]+=)/g, '&amp;');
            } else {
                str = str.replace(/&(?!#[0-9]+;|[a-zA-Z]+;|[^= "]+=[^=])/g, '&amp;');
            }
            return str.replace(/</g, '&lt;').replace(/>/g, '&gt;')
                      .replace(/ /g, '&nbsp;')
                      .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
        },
        // -----------------------------------------------------------------------
        // :: Replace terminal formatting with html
        // -----------------------------------------------------------------------
        format: function(str, options) {
            var settings = $.extend({}, {
                linksNoReferrer: false
            }, options || {});
            if (typeof str === 'string') {
                //support for formating foo[[u;;]bar]baz[[b;#fff;]quux]zzz
                var splited = $.terminal.format_split(str);
                if (splited && splited.length > 1) {
                    str = $.map(splited, function(text) {
                        if (text === '') {
                            return text;
                        } else if (text.substring(0,1) === '[') {
                            // use substring for IE quirks mode - [0] don't work
                            return text.replace(format_parts_re, function(s,
                                                                    style,
                                                                    color,
                                                                    background,
                                                                    _class,
                                                                    data_text,
                                                                    text) {
                                if (text === '') {
                                    return ''; //'<span>&nbsp;</span>';
                                }
                                text = text.replace(/\\]/g, ']');
                                var style_str = '';
                                if (style.indexOf('b') !== -1) {
                                    style_str += 'font-weight:bold;';
                                }
                                var text_decoration = [];
                                if (style.indexOf('u') !== -1) {
                                    text_decoration.push('underline');
                                }
                                if (style.indexOf('s') !== -1) {
                                    text_decoration.push('line-through');
                                }
                                if (style.indexOf('o') !== -1) {
                                    text_decoration.push('overline');
                                }
                                if (text_decoration.length) {
                                    style_str += 'text-decoration:' +
                                        text_decoration.join(' ') + ';';
                                }
                                if (style.indexOf('i') !== -1) {
                                    style_str += 'font-style:italic;';
                                }
                                if ($.terminal.valid_color(color)) {
                                    style_str += 'color:' + color + ';';
                                    if (style.indexOf('g') !== -1) {
                                        style_str += 'text-shadow:0 0 5px ' + color + ';';
                                    }
                                }
                                if ($.terminal.valid_color(background)) {
                                    style_str += 'background-color:' + background;
                                }
                                var data;
                                if (data_text === '') {
                                    data = text;
                                } else {
                                    data = data_text.replace(/&#93;/g, ']');
                                }
                                var result = '<span style="' + style_str + '"' +
                                    (_class !== '' ? ' class="' + _class + '"' : '') +
                                    ' data-text="'+ data.replace('"', '&quote;') +
                                    '">' + text + '</span>';
                                return result;
                            });
                        } else {
                            return '<span>' + text + '</span>';
                        }
                    }).join('');
                }
                return $.map(str.split(/(<\/?span[^>]*>)/g), function(string) {
                    if (!string.match(/span/)) {
                        return string.replace(url_re, function(link) {
                            var comma = link.match(/\.$/);
                            link = link.replace(/\.$/, '');
                            return '<a target="_blank" ' +
                                (settings.linksNoReferer ? ' rel="noreferrer" ' : '') +
                                'href="' + link + '">' + link + '</a>' +
                                (comma ? '.' : '');
                        }).replace(email_re, '<a href="mailto:$1">$1</a>');
                    } else {
                        return string;
                    }
                }).join('').replace(/<span><br\/?><\/span>/g, '<br/>');
            } else {
                return '';
            }
        },
        // -----------------------------------------------------------------------
        // :: Replace brackets with html entities
        // -----------------------------------------------------------------------
        escape_brackets: function(string) {
            return string.replace(/\[/g, '&#91;').replace(/\]/g, '&#93;');
        },
        // -----------------------------------------------------------------------
        // :: Remove formatting from text
        // -----------------------------------------------------------------------
        strip: function(str) {
            return str.replace(format_parts_re, '$6');
        },
        // -----------------------------------------------------------------------
        // :: Return active terminal
        // -----------------------------------------------------------------------
        active: function() {
            return terminals.front();
        },
        // -----------------------------------------------------------------------
        // :: Replace overtyping (from man) formatting with terminal formatting
        // -----------------------------------------------------------------------
        overtyping: function(string) {
            return string.replace(/((?:_\x08.|.\x08_)+)/g, function(full, g) {
                return '[[u;;]' + full.replace(/_x08|\x08_|_\u0008|\u0008_/g, '') + ']';
            }).replace(/((?:.\x08.)+)/g, function(full, g) {
                return '[[b;#fff;]' + full.replace(/(.)(?:\x08|\u0008)(.)/g,
                                                   function(full, g1, g2) {
                                                       return g2;
                                                   }) + ']';
            });
        },
        // -----------------------------------------------------------------------
        // :: Html colors taken from ANSI formatting in Linux Terminal
        // -----------------------------------------------------------------------
        ansi_colors: {
            normal: {
                black: '#000',
                red: '#A00',
                green: '#008400',
                yellow: '#A50',
                blue: '#00A',
                magenta: '#A0A',
                cyan: '#0AA',
                white: '#AAA'
            },
            faited: {
                black: '#000',
                red: '#640000',
                green: '#006100',
                yellow: '#737300',
                blue: '#000087',
                magenta: '#650065',
                cyan: '#008787',
                white: '#818181'
            },
            bold: {
                black: '#000',
                red: '#F55',
                green: '#44D544',
                yellow: '#FF5',
                blue: '#55F',
                magenta: '#F5F',
                cyan: '#5FF',
                white: '#FFF'
            },
            // XTerm 8-bit pallete
            palette: [
                '#000000', '#AA0000', '#00AA00', '#AA5500', '#0000AA',
                '#AA00AA', '#00AAAA', '#AAAAAA', '#555555', '#FF5555',
                '#55FF55', '#FFFF55', '#5555FF', '#FF55FF', '#55FFFF',
                '#FFFFFF', '#000000', '#00005F', '#000087', '#0000AF',
                '#0000D7', '#0000FF', '#005F00', '#005F5F', '#005F87',
                '#005FAF', '#005FD7', '#005FFF', '#008700', '#00875F',
                '#008787', '#0087AF', '#0087D7', '#00AF00', '#00AF5F',
                '#00AF87', '#00AFAF', '#00AFD7', '#00AFFF', '#00D700',
                '#00D75F', '#00D787', '#00D7AF', '#00D7D7', '#00D7FF',
                '#00FF00', '#00FF5F', '#00FF87', '#00FFAF', '#00FFD7',
                '#00FFFF', '#5F0000', '#5F005F', '#5F0087', '#5F00AF',
                '#5F00D7', '#5F00FF', '#5F5F00', '#5F5F5F', '#5F5F87',
                '#5F5FAF', '#5F5FD7', '#5F5FFF', '#5F8700', '#5F875F',
                '#5F8787', '#5F87AF', '#5F87D7', '#5F87FF', '#5FAF00',
                '#5FAF5F', '#5FAF87', '#5FAFAF', '#5FAFD7', '#5FAFFF',
                '#5FD700', '#5FD75F', '#5FD787', '#5FD7AF', '#5FD7D7',
                '#5FD7FF', '#5FFF00', '#5FFF5F', '#5FFF87', '#5FFFAF',
                '#5FFFD7', '#5FFFFF', '#870000', '#87005F', '#870087',
                '#8700AF', '#8700D7', '#8700FF', '#875F00', '#875F5F',
                '#875F87', '#875FAF', '#875FD7', '#875FFF', '#878700',
                '#87875F', '#878787', '#8787AF', '#8787D7', '#8787FF',
                '#87AF00', '#87AF5F', '#87AF87', '#87AFAF', '#87AFD7',
                '#87AFFF', '#87D700', '#87D75F', '#87D787', '#87D7AF',
                '#87D7D7', '#87D7FF', '#87FF00', '#87FF5F', '#87FF87',
                '#87FFAF', '#87FFD7', '#87FFFF', '#AF0000', '#AF005F',
                '#AF0087', '#AF00AF', '#AF00D7', '#AF00FF', '#AF5F00',
                '#AF5F5F', '#AF5F87', '#AF5FAF', '#AF5FD7', '#AF5FFF',
                '#AF8700', '#AF875F', '#AF8787', '#AF87AF', '#AF87D7',
                '#AF87FF', '#AFAF00', '#AFAF5F', '#AFAF87', '#AFAFAF',
                '#AFAFD7', '#AFAFFF', '#AFD700', '#AFD75F', '#AFD787',
                '#AFD7AF', '#AFD7D7', '#AFD7FF', '#AFFF00', '#AFFF5F',
                '#AFFF87', '#AFFFAF', '#AFFFD7', '#AFFFFF', '#D70000',
                '#D7005F', '#D70087', '#D700AF', '#D700D7', '#D700FF',
                '#D75F00', '#D75F5F', '#D75F87', '#D75FAF', '#D75FD7',
                '#D75FFF', '#D78700', '#D7875F', '#D78787', '#D787AF',
                '#D787D7', '#D787FF', '#D7AF00', '#D7AF5F', '#D7AF87',
                '#D7AFAF', '#D7AFD7', '#D7AFFF', '#D7D700', '#D7D75F',
                '#D7D787', '#D7D7AF', '#D7D7D7', '#D7D7FF', '#D7FF00',
                '#D7FF5F', '#D7FF87', '#D7FFAF', '#D7FFD7', '#D7FFFF',
                '#FF0000', '#FF005F', '#FF0087', '#FF00AF', '#FF00D7',
                '#FF00FF', '#FF5F00', '#FF5F5F', '#FF5F87', '#FF5FAF',
                '#FF5FD7', '#FF5FFF', '#FF8700', '#FF875F', '#FF8787',
                '#FF87AF', '#FF87D7', '#FF87FF', '#FFAF00', '#FFAF5F',
                '#FFAF87', '#FFAFAF', '#FFAFD7', '#FFAFFF', '#FFD700',
                '#FFD75F', '#FFD787', '#FFD7AF', '#FFD7D7', '#FFD7FF',
                '#FFFF00', '#FFFF5F', '#FFFF87', '#FFFFAF', '#FFFFD7',
                '#FFFFFF', '#080808', '#121212', '#1C1C1C', '#262626',
                '#303030', '#3A3A3A', '#444444', '#4E4E4E', '#585858',
                '#626262', '#6C6C6C', '#767676', '#808080', '#8A8A8A',
                '#949494', '#9E9E9E', '#A8A8A8', '#B2B2B2', '#BCBCBC',
                '#C6C6C6', '#D0D0D0', '#DADADA', '#E4E4E4', '#EEEEEE'
            ]
        },
        // -----------------------------------------------------------------------
        // :: Replace ANSI formatting with terminal formatting
        // -----------------------------------------------------------------------
        from_ansi: (function() {
            var color = {
                30: 'black',
                31: 'red',
                32: 'green',
                33: 'yellow',
                34: 'blue',
                35: 'magenta',
                36: 'cyan',
                37: 'white',

                39: 'white' // default color
            };
            var background = {
                40: 'black',
                41: 'red',
                42: 'green',
                43: 'yellow',
                44: 'blue',
                45: 'magenta',
                46: 'cyan',
                47: 'white',

                49: 'black' // default background
            };
            function format_ansi(code) {
                var controls = code.split(';');
                var num;
                var faited = false;
                var reverse = false;
                var bold = false;
                var styles = [];
                var output_color = '';
                var output_background = '';
                var _8bit_color = false;
                var _8bit_background = false;
                var process_8bit = false;
                var palette = $.terminal.ansi_colors.palette;
                for(var i in controls) {
                    num = parseInt(controls[i], 10);
                    switch(num) {
                    case 1:
                        styles.push('b');
                        bold = true;
                        faited = false;
                        break;
                    case 4:
                        styles.push('u');
                        break;
                    case 3:
                        styles.push('i');
                        break;
                    case 5:
                        process_8bit = true;
                        break;
                    case 38:
                        _8bit_color = true;
                        break;
                    case 48:
                        _8bit_background = true;
                        break;
                    case 2:
                        faited = true;
                        bold = false;
                        break;
                    case 7:
                        reverse = true;
                        break;
                    default:
                        if (_8bit_color && process_8bit && palette[num-1]) {
                            output_color = palette[num-1];
                        } else if (color[num]) {
                            output_color = color[num];
                        }
                        if (_8bit_background && process_8bit && palette[num-1]) {
                            output_background = palette[num-1];
                        } else if (background[num]) {
                            output_background = background[num];
                        }
                    }
                    if (num !== 5) {
                        process_8bit = false;
                    }
                }
                if (reverse) {
                    if (output_color && output_background) {
                        var tmp = output_background;
                        output_background = output_color;
                        output_color = tmp;
                    } else {
                        output_color = 'black';
                        output_background = 'white';
                    }
                }
                var colors, backgrounds;
                if (bold) {
                    colors = backgrounds = $.terminal.ansi_colors.bold;
                } else if (faited) {
                    colors = backgrounds = $.terminal.ansi_colors.faited;
                } else {
                    colors = backgrounds = $.terminal.ansi_colors.normal;
                }
                return [styles.join(''),
                        _8bit_color ? output_color : colors[output_color],
                        _8bit_background ? output_background : backgrounds[output_background]
                       ];
            }
            return function(input) {
                var splitted = input.split(/(\x1B\[[0-9;]*[A-Za-z])/g);
                if (splitted.length == 1) {
                    return input;
                }
                var output = [];
                //skip closing at the begining
                if (splitted.length > 3 && splitted.slice(0,3).join('') == '[0m') {
                    splitted = splitted.slice(3);
                }
                var inside = false, next, prev_color, prev_background, code, match;
                for (var i=0; i<splitted.length; ++i) {
                    match = splitted[i].match(/^\x1B\[([0-9;]*)([A-Za-z])$/);
                    if (match) {
                        switch (match[2]) {
                        case 'm':
                            if (match[1] === '') {
                                continue;
                            }
                            if (match[1] !== '0') {
                                code = format_ansi(match[1]);
                            }
                            if (inside) {
                                output.push(']');
                                if (match[1] == '0') {
                                    //just closing
                                    inside = false;
                                    prev_color = prev_background = '';
                                } else {
                                    // someone forget to close - move to next
                                    code[1] = code[1] || prev_color;
                                    code[2] = code[2] || prev_background;
                                    output.push('[[' + code.join(';') + ']');
                                    // store colors to next use
                                    if (code[1]) {
                                        prev_color = code[1];
                                    }
                                    if (code[2]) {
                                        prev_background = code[2];
                                    }
                                }
                            } else {
                                if (match[1] != '0') {
                                    inside = true;
                                    output.push('[[' + code.join(';') + ']');
                                    // store colors to next use
                                    if (code[1]) {
                                        prev_color = code[1];
                                    }
                                    if (code[2]) {
                                        prev_background = code[2];
                                    }
                                }
                            }
                            break;
                        }
                    } else {
                        output.push(splitted[i]);
                    }
                }
                if (inside) {
                    output.push(']');
                }
                return output.join(''); //.replace(/\[\[[^\]]+\]\]/g, '');
            };
        })(),
        // -----------------------------------------------------------------------
        // :: Function splits arguments and works with strings like
        // :: 'asd' 'asd\' asd' "asd asd" asd\ 123 -n -b / [^ ]+ / /\s+/ asd\ asd
        // :: it creates a regex and numbers and replaces escape characters in double
        // :: quotes
        // -----------------------------------------------------------------------
        parseArguments: function(string) {
            return $.map(string.match(command_re) || [], function(arg) {
                if (arg[0] === "'" && arg[arg.length-1] === "'") {
                    return arg.replace(/^'|'$/g, '');
                } else if (arg[0] === '"' && arg[arg.length-1] === '"') {
                    arg = arg.replace(/^"|"$/g, '').replace(/\\([" ])/g, '$1');
                    return arg.replace(/\\\\|\\t|\\n/g, function(string) {
                        if (string[1] === 't') {
                            return '\t';
                        } else if (string[1] === 'n') {
                            return '\n';
                        } else {
                            return '\\';
                        }
                    }).replace(/\\x([0-9a-f]+)/gi, function(_, hex) {
                        return String.fromCharCode(parseInt(hex, 16));
                    }).replace(/\\0([0-7]+)/g, function(_, oct) {
                        return String.fromCharCode(parseInt(oct, 8));
                    });
                } else if (arg.match(/^\/(\\\/|[^\/])+\/[gimy]*$/)) {
                    var m = arg.match(/^\/([^\/]+)\/([^\/]*)$/);
                    return new RegExp(m[1], m[2]);
                } else if (arg.match(/^-?[0-9]+$/)) {
                    return parseInt(arg, 10);
                } else if (arg.match(/^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/)) {
                    return parseFloat(arg);
                } else {
                    return arg.replace(/\\ /g, ' ');
                }
            });
        },
        // -----------------------------------------------------------------------
        // :: Split arguments: it only strips single and double quotes and escapes
        // :: spaces
        // -----------------------------------------------------------------------
        splitArguments: function(string) {
            return $.map(string.match(command_re) || [], function(arg) {
                if (arg[0] === "'" && arg[arg.length-1] === "'") {
                    return arg.replace(/^'|'$/g, '');
                } else if (arg[0] === '"' && arg[arg.length-1] === '"') {
                    return arg.replace(/^"|"$/g, '').replace(/\\([" ])/g, '$1');
                } else if (arg[0] === '/' && arg[arg.length-1] == '/') {
                    return arg;
                } else {
                    return arg.replace(/\\ /g, ' ');
                }
            });
        },
        // -----------------------------------------------------------------------
        // :: Function that returns an object {name,args}. Arguments are parsed
        // :: using the function parseArguments
        // -----------------------------------------------------------------------
        parseCommand: function(string) {
            return processCommand(string, $.terminal.parseArguments);
        },
        // -----------------------------------------------------------------------
        // :: Same as parseCommand but arguments are parsed using splitArguments
        // -----------------------------------------------------------------------
        splitCommand: function(string) {
            return processCommand(string, $.terminal.splitArguments);
        },
        // -----------------------------------------------------------------------
        // :: Test $.terminal functions using terminal
        // -----------------------------------------------------------------------
        test: function() {
            var term = $.terminal.active();
            if (!term) {
                term = $('body').terminal($.noop).css('margin', 0);
                var margin = term.outerHeight() - term.height();
                var $win = $(window);
                $win.resize(function() {
                    term.css('height', $(window).height()-20);
                }).resize();
            }
            term.echo('Testing...');
            function assert(cond, msg) {
                term.echo(msg + ' &#91;' + (cond ? '[[b;#44D544;]PASS]' : '[[b;#FF5555;]FAIL]') + '&#93;');
            }
            var string = 'name "foo bar" baz /^asd [x]/ str\\ str 10 1e10';
            var cmd = $.terminal.splitCommand(string);
            assert(cmd.name === 'name' && cmd.args[0] === 'foo bar' &&
                  cmd.args[1] === 'baz' && cmd.args[2] === '/^asd [x]/' &&
                  cmd.args[3] === 'str str' && cmd.args[4] === '10' &&
                  cmd.args[5] === '1e10', '$.terminal.splitCommand');
            cmd = $.terminal.parseCommand(string);
            assert(cmd.name === 'name' && cmd.args[0] === 'foo bar' &&
                  cmd.args[1] === 'baz' && $.type(cmd.args[2]) === 'regexp' &&
                  cmd.args[2].source === '^asd [x]' &&
                  cmd.args[3] === 'str str' && cmd.args[4] === 10 &&
                  cmd.args[5] === 1e10, '$.terminal.parseCommand');
            string = '\x1b[2;31;46mFoo\x1b[1;3;4;32;45mBar\x1b[0m\x1b[7mBaz';
            assert($.terminal.from_ansi(string) ===
                  '[[;#640000;#008787]Foo][[biu;#44D544;#F5F]Bar][[;#000;#AAA]Baz]',
                   '$.terminal.from_ansi');
            string = '[[biugs;#fff;#000]Foo][[i;;;foo]Bar][[ous;;]Baz]';
            term.echo('$.terminal.format');
            assert($.terminal.format(string) === '<span style="font-weight:bold;text-decoration:underline line-through;font-style:italic;color:#fff;text-shadow:0 0 5px #fff;background-color:#000" data-text="Foo">Foo</span><span style="font-style:italic;" class="foo" data-text="Bar">Bar</span><span style="text-decoration:underline line-through overline;" data-text="Baz">Baz</span>', '\tformatting');
            string = 'http://terminal.jcubic.pl/examples.php https://www.google.com/?q=jquery%20terminal';
            assert($.terminal.format(string) === '<a target="_blank" href="http://terminal.jcubic.pl/examples.php">http://terminal.jcubic.pl/examples.php</a> <a target="_blank" href="https://www.google.com/?q=jquery%20terminal">https://www.google.com/?q=jquery%20terminal</a>', '\turls');
            string = 'foo@bar.com baz.quux@example.com';
            assert($.terminal.format(string) === '<a href="mailto:foo@bar.com">foo@bar.com</a> <a href="mailto:baz.quux@example.com">baz.quux@example.com</a>', '\temails');
            string = '-_-[[biugs;#fff;#000]Foo]-_-[[i;;;foo]Bar]-_-[[ous;;]Baz]-_-';
            assert($.terminal.strip(string) === '-_-Foo-_-Bar-_-Baz-_-', '$.terminal.strip');
            string = '[[bui;#fff;]Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sed dolor nisl, in suscipit justo. Donec a enim et est porttitor semper at vitae augue. Proin at nulla at dui mattis mattis. Nam a volutpat ante. Aliquam consequat dui eu sem convallis ullamcorper. Nulla suscipit, massa vitae suscipit ornare, tellus] est [[b;;#f00]consequat nunc, quis blandit elit odio eu arcu. Nam a urna nec nisl varius sodales. Mauris iaculis tincidunt orci id commodo. Aliquam] non magna quis [[i;;]tortor malesuada aliquam] eget ut lacus. Nam ut vestibulum est. Praesent volutpat tellus in eros dapibus elementum. Nam laoreet risus non nulla mollis ac luctus [[ub;#fff;]felis dapibus. Pellentesque mattis elementum augue non sollicitudin. Nullam lobortis fermentum elit ac mollis. Nam ac varius risus. Cras faucibus euismod nulla, ac auctor diam rutrum sit amet. Nulla vel odio erat], ac mattis enim.';
            term.echo('$.terminal.split_equal');
            var cols = [10, 40, 60, 400];
            for (var i=cols.length; i--;) {
                var lines = $.terminal.split_equal(string, cols[i]);
                var success = true;
                for (var j=0; j<lines.length; ++j) {
                    if ($.terminal.strip(lines[j]).length > cols[i]) {
                        success = false;
                        break;
                    }
                }
                assert(success, '\tsplit ' + cols[i]);
            }
        }
    };

    // -----------------------------------------------------------------------
    // Helper plugins
    // -----------------------------------------------------------------------
    $.fn.visible = function() {
        return this.css('visibility', 'visible');
    };
    $.fn.hidden = function() {
        return this.css('visibility', 'hidden');
    };
    // -----------------------------------------------------------------------
    // JSON-RPC CALL
    // -----------------------------------------------------------------------
    var ids = {};
    $.jrpc = function(url, method, params, success, error) {
        ids[url] = ids[url] || 0;
        var request = $.json_stringify({
           'jsonrpc': '2.0', 'method': method,
            'params': params, 'id': ++ids[url]});
        return $.ajax({
            url: url,
            data: request,
            success: function(result, status, jqXHR) {
                var content_type = jqXHR.getResponseHeader('Content-Type');
                if (!content_type.match(/application\/json/)) {
                    if (console && console.warn) {
                        console.warn('Response Content-Type is not application/json');
                    } else {
                        throw new Error('WARN: Response Content-Type is not application/json');
                    }
                }
                var json;
                try {
                    json = $.parseJSON(result);
                } catch (e) {
                    if (error) {
                        error(jqXHR, 'Invalid JSON', e);
                    } else {
                        throw new Error('Invalid JSON');
                    }
                    return;
                }
                // don't catch errors in success callback
                success(json, status, jqXHR);
            },
            error: error,
            contentType: 'application/json',
            dataType: 'text',
            async: true,
            cache: false,
            //timeout: 1,
            type: 'POST'});
    };

    // -----------------------------------------------------------------------
    function is_scrolled_into_view(elem) {
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();

        var elemTop = $(elem).offset().top;
        var elemBottom = elemTop + $(elem).height();

        return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom));
    }
    // -----------------------------------------------------------------------
    // :: Create fake terminal to calcualte the dimention of one character
    // :: this will make terminal work if terminal div is not added to the
    // :: DOM at init like with:
    // :: $('<div/>').terminal().echo('foo bar').appendTo('body');
    // -----------------------------------------------------------------------
    function char_size() {
        var temp = $('<div class="terminal"><div class="cmd"><span>&nbsp;' +
                     '</span></div></div>').appendTo('body');
        var span = temp.find('span');
        var result = {
            width: span.width(),
            height: span.outerHeight()
        };
        temp.remove();
        return result;
    }
    // -----------------------------------------------------------------------
    // :: calculate numbers of characters
    // -----------------------------------------------------------------------
    function get_num_chars(terminal) {
        var width = char_size().width;
        var result = Math.floor(terminal.width() / width);
        if (have_scrollbars(terminal)) {
            var SCROLLBAR_WIDTH = 20;
            // assume that scrollbars are 20px - in my Laptop with
            // Linux/Chrome they are 16px
            var margins = terminal.innerWidth() - terminal.width();
            result -= Math.ceil((SCROLLBAR_WIDTH - margins / 2) / (width-1));
        }
        return result;
    }
    // -----------------------------------------------------------------------
    // :: Calculate number of lines that fit without scroll
    // -----------------------------------------------------------------------
    function get_num_rows(terminal) {
        return Math.floor(terminal.height() / char_size().height);
    }
    // -----------------------------------------------------------------------
    // :: Get Selected Text (this is internal because it return text even if
    // :: it's outside of terminal, is used to paste text to the terminal)
    // -----------------------------------------------------------------------
    function getSelectedText() {
        if (window.getSelection || document.getSelection) {
            var selection = (window.getSelection || document.getSelection)();
            if (selection.text) {
                return selection.text;
            } else {
                return selection.toString();
            }
        } else if (document.selection) {
            return document.selection.createRange().text;
        }
    }
    // -----------------------------------------------------------------------
    // :: check if div have scrollbars (need to have overflow auto or always)
    // -----------------------------------------------------------------------
    function have_scrollbars(div) {
        return div.get(0).scrollHeight > div.innerHeight();
    }
    // -----------------------------------------------------------------------
    // :: TERMINAL PLUGIN CODE
    // -----------------------------------------------------------------------
    var version = '{{VER}}';
    var version_set = !version.match(/^\{\{/);
    var copyright = 'Copyright (c) 2011-2013 Jakub Jankiewicz <http://jcubic.pl>';
    var version_string = version_set ? ' version ' + version : ' ';
    //regex is for placing version string aligned to the right
    var reg = new RegExp(" {" + version_string.length + "}$");
    // -----------------------------------------------------------------------
    // :: Terminal Signatures
    // -----------------------------------------------------------------------
    var signatures = [
        ['jQuery Terminal', '(c) 2011-2013 jcubic'],
        ['jQuery Terminal Emulator' + (version_set ? ' v. ' + version : ''),
         copyright.replace(/ *<.*>/, '')],
        ['jQuery Terminal Emulator' + (version_set ? version_string : ''),
         copyright.replace(/^Copyright /, '')],
        ['      _______                 ________                        __',
         '     / / _  /_ ____________ _/__  ___/______________  _____  / /',
         ' __ / / // / // / _  / _/ // / / / _  / _/     / /  \\/ / _ \\/ /',
         '/  / / // / // / ___/ // // / / / ___/ // / / / / /\\  / // / /__',
         '\\___/____ \\\\__/____/_/ \\__ / /_/____/_//_/ /_/ /_/  \\/\\__\\_\\___/',
         '         \\/          /____/                                   '.replace(reg, ' ') +
         version_string,
         copyright],
        ['      __ _____                     ________                              __',
         '     / // _  /__ __ _____ ___ __ _/__  ___/__ ___ ______ __ __  __ ___  / /',
         ' __ / // // // // // _  // _// // / / // _  // _//     // //  \\/ // _ \\/ /',
         '/  / // // // // // ___// / / // / / // ___// / / / / // // /\\  // // / /__',
         '\\___//____ \\\\___//____//_/ _\\_  / /_//____//_/ /_/ /_//_//_/ /_/ \\__\\_\\___/',
         '          \\/              /____/                                          '.replace(reg, '') +
         version_string,
         copyright]
    ];
    // -----------------------------------------------------------------------
    // :: Default options
    // -----------------------------------------------------------------------
    $.terminal.defaults = {
        prompt: '> ',
        history: true,
        exit: true,
        clear: true,
        enabled: true,
        historySize: 60,
        checkArity: true,
        exceptionHandler: null,
        cancelableAjax: true,
        processArguments: true,
        linksNoReferrer: false,
        login: null,
        outputLimit: -1,
        onAjaxError: null,
        onRPCError: null,
        completion: false,
        historyFilter: null,
        onInit: $.noop,
        onClear: $.noop,
        onBlur: $.noop,
        onFocus: $.noop,
        onTerminalChange: $.noop,
        onExit: $.noop,
        keypress: $.noop,
        keydown: $.noop,
        strings: {
            wrongPasswordTryAgain: "Wrong password try again!",
            wrongPassword: "Wrong password!",
            ajaxAbortError: "Error while aborting ajax call!",
            wrongArity: "Wrong number of arguments. Function '%s' expect %s got %s!",
            commandNotFound: "Command '%s' Not Found!",
            oneRPCWithIgnore: "You can use only one rpc with ignoreSystemDescribe",
            oneInterpreterFunction: "You can't use more then one function (rpc with " +
                "ignoreSystemDescribe is count as one)",
            loginFunctionMissing: "You don't have login function",
            noTokenError: "Access denied (no token)",
            serverResponse: "Server reponse is",
            wrongGreetings: "Wrong value of greetings parameter",
            notWhileLogin: "You can't call that function while in login",
            loginIsNotAFunction: "Authenticate must be a function",
            canExitError: "You can't exit from main interpeter",
            invalidCompletion: "Invalid completion",
            login: "login",
            password: "password"
        }
    };
    // -----------------------------------------------------------------------
    // :: All terminal globals
    // -----------------------------------------------------------------------
    var requests = []; // for canceling on CTRL+D
    var terminals = new Cycle(); // list of terminals global in this scope
    $.fn.terminal = function(init_interpreter, options) {
        // -----------------------------------------------------------------------
        // :: helper function
        // -----------------------------------------------------------------------
        function get_processed_command(command) {
            if (typeof settings.processArguments === 'function') {
                return processCommand(command, settings.processArguments);
            } else if (settings.processArguments) {
                return $.terminal.parseCommand(command);
            } else {
                return $.terminal.splitCommand(command);
            }
        }
        // -----------------------------------------------------------------------
        // :: Display object on terminal
        // -----------------------------------------------------------------------
        function display_object(object) {
            if (typeof object === 'string') {
                self.echo(object);
            } else if (object instanceof Array) {
                self.echo($.map(object, function(object) {
                    return $.json_stringify(object);
                }).join(' '));
            } else if (typeof object === 'object') {
                self.echo($.json_stringify(object));
            } else {
                self.echo(object);
            }
        }
        // -----------------------------------------------------------------------
        // :: Helper function
        // -----------------------------------------------------------------------
        function display_json_rpc_error(error) {
            if (typeof settings.onRPCError === 'function') {
                settings.onRPCError.call(self, error);
            } else {
                self.error('&#91;RPC&#93; ' + error.message);
            }
        }
        // -----------------------------------------------------------------------
        // :: Create interpreter function from url string
        // -----------------------------------------------------------------------
        function make_basic_json_rpc_interpreter(url) {
            var service = function(method, params) {
                self.pause();
                $.jrpc(url, method, params, function(json) {
                    if (!json.error) {
                        if (typeof settings.processRPCResponse === 'function') {
                            settings.processRPCResponse.call(self, json.result);
                        } else {
                            display_object(json.result);
                        }
                    } else {
                        display_json_rpc_error(json.error);
                    }
                    self.resume();
                }, ajax_error);
            };
            //this is the interpreter function
            return function(command, terminal) {
                if (command === '') {
                    return;
                }
                command = get_processed_command(command);
                if (!settings.login || command.name === 'help') {
                    // allows to call help without a token
                    service(command.name, command.args);
                } else {
                    var token = terminal.token();
                    if (token) {
                        service(command.name, [token].concat(command.args));
                    } else {
                        //should never happen
                        terminal.error('&#91;AUTH&#93; ' +
                                       strings.noTokenError);
                    }
                }
            };
        }
        // -----------------------------------------------------------------------
        // :: Create interpreter function from Object. If the value is object
        // :: it will create nested interpreters
        // -----------------------------------------------------------------------
        function make_object_interpreter(object, arity, fallback) {
            // function that maps commands to object methods
            // it keeps terminal context
            return function(user_command, terminal) {
                if (user_command === '') {
                    return;
                }
                //command = split_command_line(command);
                var command = get_processed_command(user_command);
                var val = object[command.name];
                var type = $.type(val);
                if (type === 'function') {
                    if (arity && val.length !== command.args.length) {
                        self.error("&#91;Arity&#93; " +
                                   sprintf(strings.wrongArity,
                                           command.name,
                                           val.length,
                                           command.args.length));
                    } else {
                        return val.apply(self, command.args);
                    }
                } else if (type === 'object' || type === 'string') {
                    var commands = [];
                    if (type === 'object') {
                        commands = Object.keys(val);
                        val = make_object_interpreter(val, arity);
                    }
                    terminal.push(val, {
                        prompt: command.name + '> ',
                        name: command.name,
                        completion: type === 'object' ? function(term, string, callback) {
                            callback(commands);
                        } : undefined
                    });
                } else {
                    if ($.type(fallback) === 'function') {
                        fallback(user_command, self);
                    } else if ($.type(settings.onCommandNotFound) === 'function') {
                        settings.onCommandNotFound(user_command, self);
                    } else {
                        terminal.error(sprintf(strings.commandNotFound, command.name));
                    }
                }
            };
        }
        // -----------------------------------------------------------------------
        function ajax_error(xhr, status, error) {
            self.resume(); // onAjaxError can use pause/resume call it first
            if (typeof settings.onAjaxError == 'function') {
                settings.onAjaxError.call(self, xhr, status, error);
            } else if (status !== 'abort') {
                self.error('&#91;AJAX&#93; ' + status + ' - ' +
                           strings.serverResponse +
                           ': \n' + xhr.responseText);
            }
        }
        // -----------------------------------------------------------------------
        function make_json_rpc_object(url, auth, success) {
            $.jrpc(url, 'system.describe', [], function(ret) {
                var commands = [];
                if (ret.procs) {
                    var interpreter_object = {};
                    $.each(ret.procs, function(_, proc) {
                        interpreter_object[proc.name] = function() {
                            var append = auth && proc.name != 'help';
                            var args = Array.prototype.slice.call(arguments);
                            var args_len = args.length + (append ? 1 : 0);
                            if (settings.checkArity && proc.params &&
                                proc.params.length !== args_len) {
                                self.error("&#91;Arity&#93; " +
                                           sprintf(strings.wrongArity,
                                                   proc.name,
                                                   proc.params.length,
                                                   args_len));
                            } else {
                                self.pause();
                                if (append) {
                                    args = [self.token(true)].concat(args);
                                }
                                $.jrpc(url, proc.name, args, function(json) {
                                    if (json.error) {
                                        display_json_rpc_error(json.error);
                                    } else {
                                        display_object(json.result);
                                    }
                                    self.resume();
                                }, ajax_error);
                            }
                        };
                    });
                    success(interpreter_object);
                } else {
                    success(null);
                }
            }, function() {
                success(null);
            });
        }
        // -----------------------------------------------------------------------
        function make_interpreter(user_interpreter, auth, finalize) {
            finalize = finalize || $.noop;
            var type = $.type(user_interpreter);
            var result = {};
            var commands;
            var rpc_count = 0; // only one rpc can be use for array
            var function_interpreter;
            if (type === 'array') {
                var object = {};
                // recur will be called when previous acync call is finished
                (function recur(interpreters, success) {
                    if (interpreters.length) {
                        var first = interpreters[0];
                        var rest = interpreters.slice(1);
                        var type = $.type(first);
                        if (type === 'string') {
                            rpc_count++;
                            self.pause();
                            if (settings.ignoreSystemDescribe) {
                                if (rpc_count === 1) {
                                    function_interpreter = make_basic_json_rpc_interpreter(first);
                                } else {
                                    self.error(strings.oneRPCWithIgnore);
                                }
                                recur(rest, success);
                            } else {
                                make_json_rpc_object(first, auth, function(new_object) {
                                    // will ignore rpc in array that don't have system.describe
                                    if (new_object) {
                                        $.extend(object, new_object);
                                    }
                                    self.resume();
                                    recur(rest, success);
                                });
                            }
                        } else if (type === 'function') {
                            if (function_interpreter) {
                                self.error(strings.oneInterpreterFunction);
                            } else {
                                function_interpreter = first;
                            }
                        } else if (type === 'object') {
                            $.extend(object, first);
                            recur(rest, success);
                        }
                    } else {
                        success();
                    }
                })(user_interpreter, function() {
                    commands = Object.keys(object);
                    result.interpreter = make_object_interpreter(object, false, function_interpreter);
                    result.completion = function(term, string, callback) {
                        callback(commands);
                    };
                    finalize(result);
                });
            } else if (type === 'string') {
                if (settings.ignoreSystemDescribe) {
                    finalize({
                        interpreter: make_basic_json_rpc_interpreter(user_interpreter),
                        completion: settings.completion
                    });
                } else {
                    self.pause();
                    make_json_rpc_object(user_interpreter, auth, function(object) {
                        if (object) {
                            var commands = Object.keys(object);
                            result.interpreter = make_object_interpreter(object, false);
                            result.completion = function(term, string, callback) {
                                callback(commands);
                            };
                        } else {
                            // no procs in system.describe
                            result.interpreter = make_basic_json_rpc_interpreter(user_interpreter);
                            result.completion = settings.completion;
                        }
                        self.resume();
                        finalize(result);
                    });
                }
            } else if (type === 'object') {
                commands = Object.keys(user_interpreter);
                result.interpreter = make_object_interpreter(user_interpreter, settings.checkArity);
                result.completion = function(term, string, callback) {
                    callback(commands);
                };
                finalize(result);
            } else {
                // allow $('<div/>).terminal();
                if (type === 'undefined') {
                    user_interpreter = $.noop;
                } else if (type !== 'function') {
                    throw type + " is invalid interpreter value";
                }
                finalize({
                    interpreter: user_interpreter,
                    completion: settings.completion
                });
            }
        }
        // -----------------------------------------------------------------------
        // :: Create JSON-RPC authentication function
        // -----------------------------------------------------------------------
        function make_json_rpc_login(url, login) {
            var method = $.type(login) === 'boolean' ? 'login' : login;
            return function(user, passwd, callback, term) {
                self.pause();
                $.jrpc(url,
                       method,
                       [user, passwd],
                       function(response) {
                           self.resume();
                           if (!response.error && response.result) {
                               callback(response.result);
                           } else {
                               // null will trigger message that login fail
                               callback(null);
                           }
                       }, ajax_error);
            };
            //default name is login so you can pass true
        }
        // -----------------------------------------------------------------------
        // :: Return exception message as string
        // -----------------------------------------------------------------------
        function exception_message(e) {
            if (typeof e === 'string') {
                return e;
            } else if (typeof e.fileName === 'string') {
                return e.fileName + ': ' + e.message;
            } else {
                return e.message;
            }
        }
        // -----------------------------------------------------------------------
        // :: display Exception on terminal
        // -----------------------------------------------------------------------
        function display_exception(e, label) {
            if (typeof settings.exceptionHandler == 'function') {
                settings.exceptionHandler.call(self, e);
            } else {
                self.exception(e, label);
            }
        }
        // -----------------------------------------------------------------------
        function scroll_to_bottom() {
            var scrollHeight = scroll_object.prop ? scroll_object.prop('scrollHeight') :
                scroll_object.attr('scrollHeight');
            scroll_object.scrollTop(scrollHeight);
        }
        // -----------------------------------------------------------------------
        // :: validating if object is a string or a function, call that function
        // :: and display the exeption if any
        // -----------------------------------------------------------------------
        function validate(label, object) {
            try {
                if (typeof object === 'function') {
                    object(function() {
                        // don't care
                    });
                } else if (typeof object !== 'string') {
                    var msg = label + ' must be string or function';
                    throw msg;
                }
            } catch (e) {
                display_exception(e, label.toUpperCase());
                return false;
            }
            return true;
        }
        // -----------------------------------------------------------------------
        // :: Draw line - can have line breaks and be longer than the width of
        // :: the terminal, there are 2 options raw and finalize
        // :: raw - will not encode the string and finalize if a function that
        // :: will have div container of the line as first argument
        // :: NOTE: it formats and appends lines to output_buffer. The actual
        // :: append to terminal output happens in the flush function
        // -----------------------------------------------------------------------
        var output_buffer = [];
        var NEW_LINE = 1;
        function draw_line(string, options) {
            // prevent exception in display exception
            try {
                var line_settings = $.extend({
                    raw: false,
                    finalize: $.noop
                }, options || {});
                string = $.type(string) === "function" ? string() : string;
                string = $.type(string) === "string" ? string : String(string);
                var i, len;
                if (!line_settings.raw) {
                    string = $.terminal.encode(string);
                }
                string = $.terminal.overtyping(string);
                string = $.terminal.from_ansi(string);
                output_buffer.push(NEW_LINE);
                if (!line_settings.raw && (string.length > num_chars || string.match(/\n/))) {
                    var array = $.terminal.split_equal(string, num_chars);
                    for (i = 0, len = array.length; i < len; ++i) {
                        if (array[i] === '' || array[i] === '\r') {
                            output_buffer.push('&nbsp;');
                        } else {
                            if (line_settings.raw) {
                                output_buffer.push(array[i]);
                            } else {
                                output_buffer.push($.terminal.format(array[i], {
                                    linksNoReferer: settings.linksNoReferer
                                }));
                            }
                        }
                    }
                } else {
                    if (!line_settings.raw) {
                        string = $.terminal.format(string, {
                            linksNoReferer: settings.linksNoReferer
                        });
                    }
                    output_buffer.push(string);
                }
                output_buffer.push(line_settings.finalize);
            } catch (e) {
                output_buffer = [];
                // don't display exception if exception throw in terminal
                alert('[Internal Exception(draw_line)]:' + exception_message(e) + '\n' +
                      e.stack);
            }
        }
        // -----------------------------------------------------------------------
        // Redraw all lines
        // -----------------------------------------------------------------------
        function redraw() {
            command_line.resize(num_chars);
            var o = output.empty().detach();
            var lines_to_show;
            if (settings.outputLimit >= 0) {
                // flush will limit lines but if there is lot of
                // lines we don't need to show them and then remove
                // them from terminal
                var limit = settings.outputLimit === 0 ?
                    self.rows() :
                    settings.outputLimit;
                lines_to_show = lines.slice(lines.length-limit-1);
            } else {
                lines_to_show = lines;
            }
            $.each(lines_to_show, function(i, line) {
                draw_line.apply(null, line); // line is an array
            });
            command_line.before(o);
            self.flush();
        }
        // -----------------------------------------------------------------------
        // :: Display user greetings or terminal signature
        // -----------------------------------------------------------------------
        function show_greetings() {
            if (settings.greetings === undefined) {
                self.echo(self.signature);
            } else if (settings.greetings) {
                var type = typeof settings.greetings;
                if (type === 'string') {
                    self.echo(settings.greetings);
                } else if (type === 'function') {
                    settings.greetings.call(self, self.echo);
                } else {
                    self.error(strings.wrongGreetings);
                }
            }
        }
        // -----------------------------------------------------------------------
        // :: Display prompt and last command
        // -----------------------------------------------------------------------
        function echo_command(command) {
            command = $.terminal.escape_brackets($.terminal.encode(command, true));
            var prompt = command_line.prompt();
            if (command_line.mask()) {
                command = command.replace(/./g, '*');
            }
            if (typeof prompt === 'function') {
                prompt(function(string) {
                    self.echo(string + command);
                });
            } else {
                self.echo(prompt + command);
            }
        }
        // -----------------------------------------------------------------------
        // :: Wrapper over interpreter, it implements exit and catches all exeptions
        // :: from user code and displays them on the terminal
        // -----------------------------------------------------------------------
        function commands(command, silent, exec) {
            try {
                if (!ghost()) {
                    prev_command = $.terminal.splitCommand(command).name;
                    if (exec && typeof settings.historyFilter == 'function' &&
                        settings.historyFilter(command) || !settings.historyFilter) {
                        command_line.history().append(command);
                    }
                }
                var interpreter = interpreters.top();
                if (command === 'exit' && settings.exit) {
                    var count = interpreters.size();
                        self.token();
                    if (count == 1 && self.token() || count > 1) {
                        if (!silent) {
                            echo_command(command);
                        }
                        self.pop();
                    }
                } else {
                    if (!silent) {
                        echo_command(command);
                    }
                    var position = lines.length-1;
                    if (command === 'clear' && settings.clear) {
                        self.clear();
                    } else {
                        // Execute command from the interpreter
                        var result = interpreter.interpreter(command, self);
                        if (result !== undefined) {
                            // was lines after echo_command (by interpreter)
                            if (position === lines.length-1) {
                                lines.pop();
                                if (result !== false) {
                                    self.echo(result);
                                }
                            } else {
                                if (result === false) {
                                    lines = lines.slice(0, position).
                                        concat(lines.slice(position+1));
                                } else {
                                    lines = lines.slice(0, position).
                                        concat([result]).
                                        concat(lines.slice(position+1));
                                }
                            }
                            self.resize();
                        }
                    }
                }
            } catch (e) {
                display_exception(e, 'USER');
                self.resume();
                throw e;
            }
        }
        // -----------------------------------------------------------------------
        // :: The logout function removes Storage, disables history and runs
        // :: the login function. This function is called only when options.login
        // :: function is defined. The check for this is in the self.pop method
        // -----------------------------------------------------------------------
        function global_logout() {
            if (typeof settings.onBeforeLogout === 'function') {
                try {
                    if (settings.onBeforeLogout(self) === false) {
                        return;
                    }
                } catch (e) {
                    display_exception(e, 'onBeforeLogout');
                    throw e;
                }
            }
            logout();
            if (typeof settings.onAfterLogout === 'function') {
                try {
                    settings.onAfterLogout(self);
                } catch (e) {
                    display_exception(e, 'onAfterlogout');
                    throw e;
                }
            }
            self.login(settings.login, true, initialize);
        }
        // -----------------------------------------------------------------------
        function logout() {
            var name = self.prefix_name(true) + '_';
            $.Storage.remove(name + 'token');
            $.Storage.remove(name + 'login');
        }
        // -----------------------------------------------------------------------
        // :: Save the interpreter name for use with purge
        // -----------------------------------------------------------------------
        function maybe_append_name(interpreter_name) {
            var storage_key = self.prefix_name() + '_interpreters';
            var names = $.Storage.get(storage_key);
            if (names) {
                names = $.parseJSON(names);
            } else {
                names = [];
            }
            if ($.inArray(interpreter_name, names) == -1) {
                names.push(interpreter_name);
                $.Storage.set(storage_key, $.json_stringify(names));
            }
        }
        // -----------------------------------------------------------------------
        // :: Function enables history, sets prompt, runs interpreter function
        // -----------------------------------------------------------------------
        function prepare_top_interpreter(silent) {
            var interpreter = interpreters.top();
            var name = self.prefix_name(true);
            if (!ghost()) {
                maybe_append_name(name);
            }
            command_line.name(name);
            if (typeof interpreter.prompt == 'function') {
                command_line.prompt(function(command) {
                    interpreter.prompt(command, self);
                });
            } else {
                command_line.prompt(interpreter.prompt);
            }
            command_line.set('');
            if (!silent && typeof interpreter.onStart === 'function') {
                interpreter.onStart(self);
            }
        }
        // ---------------------------------------------------------------------
        function initialize() {
            prepare_top_interpreter();
            show_greetings();
            // was_paused flag is workaround for case when user call exec before
            // login and pause in onInit, 3rd exec will have proper timing (will
            // execute after onInit resume)
            var was_paused = false;
            if (typeof settings.onInit === 'function') {
                onPause = function() { // local in terminal
                    was_paused = true;
                };
                try {
                    settings.onInit(self);
                } catch (e) {
                    display_exception(e, 'OnInit');
                    throw e;
                } finally {
                    onPause = $.noop;
                    if (!was_paused) {
                        // resume login if user didn't call pause in onInit
                        // if user pause in onInit wait with exec until it resume
                        self.resume();
                    }
                }
            }
        }
        // ---------------------------------------------------------------------
        // :: function complete the command
        // ---------------------------------------------------------------------
        function complete_helper(command, string, commands) {
            var test = command_line.get().substring(0, command_line.position());
            if (test !== command) {
                // command line changed between TABS - ignore
                return;
            }
            var regex = new RegExp('^' + $.terminal.escape_regex(string));
            var matched = [];
            for (var i=commands.length; i--;) {
                if (regex.test(commands[i])) {
                    matched.push(commands[i]);
                }
            }
            if (matched.length === 1) {
                self.insert(matched[0].replace(regex, '') + ' ');
            } else if (matched.length > 1) {
                if (tab_count >= 2) {
                    echo_command(command);
                    self.echo(matched.join('\t'));
                    tab_count = 0;
                } else {
                    var found = false;
                    var found_index;
                    var j;
                    loop:
                    for (j=string.length; j<matched[0].length; ++j) {
                        for (i=1; i<matched.length; ++i) {
                            if (matched[0].charAt(j) !== matched[i].charAt(j)) {
                                break loop;
                            }
                        }
                        found = true;
                    }
                    if (found) {
                        self.insert(matched[0].slice(0, j).replace(regex, ''));
                    }
                }
            }
        }
        // ---------------------------------------------------------------------
        // :: IF Ghost don't store anything in localstorage
        // ---------------------------------------------------------------------
        function ghost() {
            return in_login || command_line.mask();
        }
        // ---------------------------------------------------------------------
        // :: Keydown event handler
        // ---------------------------------------------------------------------
        function key_down(e) {
            // Prevent to be executed by cmd: CTRL+D, TAB, CTRL+TAB (if more then
            // one terminal)
            var result, i, top = interpreters.top();
            if ($.type(top.keydown) === 'function') {
                result = top.keydown(e, self);
                if (result !== undefined) {
                    return result;
                }
            }
            var completion;
            if ((settings.completion && $.type(settings.completion) != 'boolean') &&
                !top.completion) {
                completion = settings.completion;
            } else {
                completion = top.completion;
            }
            // after text pasted into textarea in cmd plugin
            self.oneTime(10, function() {
                on_scrollbar_show_resize();
            });
            if ($.type(settings.keydown) === 'function') {
                result = settings.keydown(e, self);
                if (result !== undefined) {
                    return result;
                }
            }
            if (!self.paused()) {
                if (e.which !== 9) { // not a TAB
                    tab_count = 0;
                }
                if (e.which === 68 && e.ctrlKey) { // CTRL+D
                    if (!in_login) {
                        if (command_line.get() === '') {
                            if (interpreters.size() > 1 ||
                                settings.login !== undefined) {
                                self.pop('');
                            } else {
                                self.resume();
                                self.echo('');
                            }
                        } else {
                            self.set_command('');
                        }
                    }
                    return false;
                } else if (e.which === 76 && e.ctrlKey) { // CTRL+L
                    self.clear();
                } else if (completion && e.which === 9) { // TAB
                    // TODO: move this to cmd plugin
                    //       add completion = array | function
                    ++tab_count;
                    // cursor can be in the middle of the command
                    // so we need to get the text before the cursor
                    var command = command_line.get().substring(0, command_line.position());
                    var strings = command.split(' ');
                    var string; // string before cursor that will be completed
                    if (strings.length == 1) {
                        string = strings[0];
                    } else {
                        string = strings[strings.length-1];
                        for (i=strings.length-1; i>0; i--) {
                            // treat escape space as part of the string
                            if (strings[i-1][strings[i-1].length-1] == '\\') {
                                string = strings[i-1] + ' ' + string;
                            } else {
                                break;
                            }
                        }
                    }
                    switch ($.type(completion)) {
                    case 'function':
                        completion(self, string, function(commands) {
                            complete_helper(command, string, commands);
                        });
                        break;
                    case 'array':
                        complete_helper(command, string, completion);
                        break;
                    default:
                        // terminal will not catch this because it's an event
                        throw new Error($.terminal.defaults.strings.invalidCompletion);
                    }
                    return false;
                } else if (e.which === 86 && e.ctrlKey) { // CTRL+V
                    self.oneTime(1, function() {
                        scroll_to_bottom();
                    });
                    return;
                } else if (e.which === 9 && e.ctrlKey) { // CTRL+TAB
                    if (terminals.length() > 1) {
                        self.focus(false);
                        return false;
                    }
                } else if (e.which === 34) { // PAGE DOWN
                    self.scroll(self.height());
                } else if (e.which === 33) { // PAGE UP
                    self.scroll(-self.height());
                } else {
                    self.attr({scrollTop: self.attr('scrollHeight')});
                }
            } else if (e.which === 68 && e.ctrlKey) { // CTRL+D (if paused)
                if (requests.length) {
                    for (i=requests.length; i--;) {
                        var r = requests[i];
                        if (4 !== r.readyState) {
                            try {
                                r.abort();
                            } catch (error) {
                                self.error(strings.ajaxAbortError);
                            }
                        }
                    }
                    requests = [];
                    // only resume if there are ajax calls
                    self.resume();
                }
                return false;
            }
        }
        // -----------------------------------------------------------------------
        var self = this;
        if (this.length > 1) {
            return this.each(function() {
                $.fn.terminal.call($(this),
                                   init_interpreter,
                                   $.extend({name: self.selector}, options));
            });
        } else {
            // terminal already exists
            if (self.data('terminal')) {
                return self.data('terminal');
            }
            if (self.length === 0) {
                throw 'Sorry, but terminal said that "' + self.selector +
                    '" is not valid selector!';
            }
            //var names = []; // stack if interpeter names
            var scroll_object;
            var prev_command; // used for name on the terminal if not defined
            var loged_in = false;
            var tab_count = 0; // for tab completion
            // array of line objects:
            // - function (called whenever necessary, result is printed)
            // - array (expected form: [line, settings])
            // - anything else (cast to string when painted)
            var lines = [];
            var output; // .terminal-output jquery object
            var terminal_id = terminals.length();
            var num_chars; // numer of chars in line
            var num_rows; // number of lines that fit without scrollbar
            var command_list = []; // for tab completion
            var url;
            var in_login = false; // some Methods should not be called when login
            // TODO: Try to use mutex like counter for pause/resume
            var onPause = $.noop; // used to indicate that user call pause onInit
            var old_width, old_height;
            var dalyed_commands = []; // used when exec commands with pause
            var settings = $.extend({},
                                    $.terminal.defaults,
                                    {name: self.selector},
                                    options || {});
            var strings = $.terminal.defaults.strings;
            var enabled = settings.enabled;
            var paused = false;
            // -----------------------------------------------------------------------
            // TERMINAL METHODS
            // -----------------------------------------------------------------------
            $.extend(self, $.omap({
                // -----------------------------------------------------------------------
                // :: Clear the output
                // -----------------------------------------------------------------------
                clear: function() {
                    output.html('');
                    command_line.set('');
                    lines = [];
                    try {
                        settings.onClear(self);
                    } catch (e) {
                        display_exception(e, 'onClear');
                        throw e;
                    }
                    self.attr({ scrollTop: 0});
                    return self;
                },
                // -----------------------------------------------------------------------
                // :: Return an object that can be used with import_view to restore the state
                // -----------------------------------------------------------------------
                export_view: function() {
                    if (in_login) {
                        throw new Exception(strings.notWhileLogin);
                    }
                    return {
                        prompt: self.get_prompt(),
                        command: self.get_command(),
                        position: command_line.position(),
                        lines: lines.slice(0)
                    };
                },
                // -----------------------------------------------------------------------
                // :: Restore the state of the previous exported view
                // -----------------------------------------------------------------------
                import_view: function(view) {
                    if (in_login) {
                        throw new Exception(strings.notWhileLogin);
                    }
                    self.set_prompt(view.prompt);
                    self.set_command(view.command);
                    command_line.position(view.position);
                    lines = view.lines;
                    redraw();
                    return self;
                },
                // -----------------------------------------------------------------------
                // :: Execute a command, it will handle commands that do AJAX calls
                // :: and have delays, if the second argument is set to true it will not
                // :: echo executed command
                // -----------------------------------------------------------------------
                exec: function(command, silent) {
                    // both commands executed here (resume will call Terminal::exec)
                    if (paused) {
                        dalyed_commands.push([command, silent]);
                    } else {
                        commands(command, silent, true);
                    }
                    return self;
                },
                // -----------------------------------------------------------------------
                // :: Function changes the prompt of the command line to login
                // :: with a password and calls the user login function with
                // :: the callback that expects a token. The login is successful
                // :: if the user calls it with value that is truthy
                // -----------------------------------------------------------------------
                login: function(auth, infinite, success, error) {
                    if (in_login) {
                        throw new Error(strings.notWhileLogin);
                    }
                    if (typeof auth !== 'function') {
                        throw new Error(strings.loginIsNotAFunction);
                    }
                    if (self.token(true) && self.login_name(true)) {
                        if (typeof success == 'function') {
                            success();
                        }
                        return self;
                    }
                    var user = null;
                    // don't store login data in history
                    if (settings.history) {
                        command_line.history().disable();
                    }
                    in_login = true;
                    return self.push(function(user) {
                        self.set_mask(true).push(function(pass) {
                            try {
                                auth.call(self, user, pass, function(token, silent) {
                                    if (token) {
                                        self.pop().pop();
                                        if (settings.history) {
                                            command_line.history().enable();
                                        }
                                        var name = self.prefix_name(true) + '_';
                                        $.Storage.set(name + 'token', token);
                                        $.Storage.set(name + 'login', user);
                                        in_login = false;
                                        if (typeof success == 'function') {
                                            // will be used internaly since users know
                                            // when login success (they decide when
                                            // it happen by calling the callback -
                                            // this funtion)
                                            success();
                                        }
                                    } else {
                                        if (infinite) {
                                            if (!silent) {
                                                self.error(strings.wrongPasswordTryAgain);
                                            }
                                            self.pop().set_mask(false);
                                        } else {
                                            in_login = false;
                                            if (!silent) {
                                                self.error(strings.wrongPassword);
                                            }
                                            self.pop().pop();
                                        }
                                        // used only to call pop in push
                                        if (typeof error == 'function') {
                                            error();
                                        }
                                    }
                                });
                            } catch(e) {
                                display_exception(e, 'USER(authentication)');
                            }
                        }, {
                            prompt: strings.password + ': '
                        });
                    }, {
                        prompt: strings.login + ': '
                    });
                },
                // -----------------------------------------------------------------------
                // :: User defined settings and defaults as well
                // -----------------------------------------------------------------------
                settings: settings,
                // -----------------------------------------------------------------------
                // :: Return commands function from top interpreter
                // -----------------------------------------------------------------------
                commands: function() {
                    return interpreters.top().interpreter;
                },
                // -----------------------------------------------------------------------
                // :: Low Level method that overwrites interpreter
                // -----------------------------------------------------------------------
                setInterpreter: function(user_interpreter, login) {
                    function overwrite_interpreter() {
                        self.pause();
                        make_interpreter(user_interpreter, login, function(result) {
                            self.resume();
                            var top = interpreters.top();
                            $.extend(top, result);
                            prepare_top_interpreter(true);
                        });
                    }
                    if ($.type(user_interpreter) == 'string' && login) {
                        self.login(make_json_rpc_login(user_interpreter, login),
                                   true,
                                   overwrite_interpreter);
                    } else {
                        overwrite_interpreter();
                    }
                },
                // -----------------------------------------------------------------------
                // :: Show user greetings or terminal signature
                // -----------------------------------------------------------------------
                greetings: function() {
                    show_greetings();
                    return self;
                },
                // -----------------------------------------------------------------------
                // :: Return true if terminal is paused false otherwise
                // -----------------------------------------------------------------------
                paused: function() {
                    return paused;
                },
                // -----------------------------------------------------------------------
                // :: Pause the terminal, it should be used for ajax calls
                // -----------------------------------------------------------------------
                pause: function() {
                    onPause();
                    if (!paused && command_line) {
                        paused = true;
                        self.disable();
                        command_line.hidden();
                    }
                    return self;
                },
                // -----------------------------------------------------------------------
                // :: Resume the previously paused terminal
                // -----------------------------------------------------------------------
                resume: function() {
                    if (paused && command_line) {
                        paused = false;
                        self.enable();
                        command_line.visible();
                        var original = dalyed_commands;
                        dalyed_commands = [];
                        while (original.length) {
                            self.exec.apply(self, original.shift());
                        }
                        scroll_to_bottom();
                    }
                    return self;
                },
                // -----------------------------------------------------------------------
                // :: Return the number of characters that fit into the width of the terminal
                // -----------------------------------------------------------------------
                cols: function() {
                    return num_chars;
                },
                // -----------------------------------------------------------------------
                // :: Return the number of lines that fit into the height of the terminal
                // -----------------------------------------------------------------------
                rows: function() {
                    return num_rows;
                },
                // -----------------------------------------------------------------------
                // :: Return the History object
                // -----------------------------------------------------------------------
                history: function() {
                    return command_line.history();
                },
                // -----------------------------------------------------------------------
                // :: Switch to the next terminal
                // -----------------------------------------------------------------------
                next: function() {
                    if (terminals.length() === 1) {
                        return self;
                    } else {
                        var offsetTop = self.offset().top;
                        var height = self.height();
                        var scrollTop = self.scrollTop();
                        if (!is_scrolled_into_view(self)) {
                            self.enable();
                            $('html,body').animate({scrollTop: offsetTop-50}, 500);
                            return self;
                        } else {
                            terminals.front().disable();
                            var next = terminals.rotate().enable();
                            // 100 provides buffer in viewport
                            var x = next.offset().top - 50;
                            $('html,body').animate({scrollTop: x}, 500);
                            try {
                                settings.onTerminalChange(next);
                            } catch (e) {
                                display_exception(e, 'onTerminalChange');
                                throw e;
                            }
                            return next;
                        }
                    }
                },
                // -----------------------------------------------------------------------
                // :: Make the terminal in focus or blur depending on the first argument.
                // :: If there is more then one terminal it will switch to next one, 
                // :: if the second argument is set to true the events will be not fired.
                // :: Used on init
                // -----------------------------------------------------------------------
                focus: function(toggle, silent) {
                    self.oneTime(1, function() {
                        if (terminals.length() === 1) {
                            if (toggle === false) {
                                try {
                                    if (!silent && settings.onBlur(self) !== false) {
                                        self.disable();
                                    }
                                } catch (e) {
                                    display_exception(e, 'onBlur');
                                    throw e;
                                }
                            } else {
                                try {
                                    if (!silent && settings.onFocus(self) !== false) {
                                        self.enable();
                                    }
                                } catch (e) {
                                    display_exception(e, 'onFocus');
                                    throw e;
                                }
                            }
                        } else {
                            if (toggle === false) {
                                self.next();
                            } else {
                                var front = terminals.front();
                                if (front != self) {
                                    front.disable();
                                    if (!silent) {
                                        try {
                                            settings.onTerminalChange(self);
                                        } catch (e) {
                                            display_exception(e, 'onTerminalChange');
                                            throw e;
                                        }
                                    }
                                }
                                terminals.set(self);
                                self.enable();
                            }
                        }
                    });
                    return self;
                },
                // -----------------------------------------------------------------------
                // :: Enable the terminal
                // -----------------------------------------------------------------------
                enable: function() {
                    if (num_chars === undefined) {
                        //enabling first time
                        self.resize();
                    }
                    if (command_line) {
                        command_line.enable();
                        enabled = true;
                    }
                    return self;
                },
                // -----------------------------------------------------------------------
                // :: Disable the terminal
                // -----------------------------------------------------------------------
                disable: function() {
                    if (command_line) {
                        enabled = false;
                        command_line.disable();
                    }
                    return self;
                },
                // -----------------------------------------------------------------------
                // :: return true if the terminal is enabled
                // -----------------------------------------------------------------------
                enabled: function() {
                    return enabled;
                },
                // -----------------------------------------------------------------------
                // :: Return the terminal signature depending on the size of the terminal
                // -----------------------------------------------------------------------
                signature: function() {
                    var cols = self.cols();
                    var i = cols < 15 ? null : cols < 35 ? 0 : cols < 55 ? 1 : cols < 64 ? 2 : cols < 75 ? 3 : 4;
                    if (i !== null) {
                        return signatures[i].join('\n') + '\n';
                    } else {
                        return '';
                    }
                },
                // -----------------------------------------------------------------------
                // :: Return the version number
                // -----------------------------------------------------------------------
                version: function() {
                    return version;
                },
                // -----------------------------------------------------------------------
                // :: Return actual command line object (jquery object with cmd methods)
                // -----------------------------------------------------------------------
                cmd: function() {
                    return command_line;
                },
                // -----------------------------------------------------------------------
                // :: Return the current command entered by terminal
                // -----------------------------------------------------------------------
                get_command: function() {
                    return command_line.get();
                },
                // -----------------------------------------------------------------------
                // :: Change the command line to the new one
                // -----------------------------------------------------------------------
                set_command: function(command) {
                    command_line.set(command);
                    return self;
                },
                // -----------------------------------------------------------------------
                // :: Insert text into the command line after the cursor
                // -----------------------------------------------------------------------
                insert: function(string) {
                    if (typeof string === 'string') {
                        command_line.insert(string);
                        return self;
                    } else {
                        throw "insert function argument is not a string";
                    }
                },
                // -----------------------------------------------------------------------
                // :: Set the prompt of the command line
                // -----------------------------------------------------------------------
                set_prompt: function(prompt) {
                    if (validate('prompt', prompt)) {
                        if (typeof prompt == 'function') {
                            command_line.prompt(function(command) {
                                prompt(command, self);
                            });
                        } else {
                            command_line.prompt(prompt);
                        }
                        interpreters.top().prompt = prompt;
                    }
                    return self;
                },
                // -----------------------------------------------------------------------
                // :: Return the prompt used by the terminal
                // -----------------------------------------------------------------------
                get_prompt: function() {
                    return interpreters.top().prompt;
                    // command_line.prompt(); - can be a wrapper
                    //return command_line.prompt();
                },
                // -----------------------------------------------------------------------
                // :: Enable or Disable mask depedning on the passed argument
                // -----------------------------------------------------------------------
                set_mask: function(display) {
                    command_line.mask(display);
                    return self;
                },
                // -----------------------------------------------------------------------
                // :: Return the ouput of the terminal as text
                // -----------------------------------------------------------------------
                get_output: function(raw) {
                    if (raw) {
                        return lines;
                    } else {
                        return $.map(lines, function(item) {
                            return typeof item[0] == 'function' ? item[0]() : item[0];
                        }).join('\n');
                    }
                },
                // -----------------------------------------------------------------------
                // :: Recalculate and redraw everything
                // -----------------------------------------------------------------------
                resize: function(width, height) {
                    if (width && height) {
                        self.width(width);
                        self.height(height);
                    }
                    width = self.width();
                    height = self.height();
                    var new_num_chars = get_num_chars(self);
                    var new_num_rows = get_num_rows(self);
                    // only if number of chars changed
                    if (new_num_chars !== num_chars || new_num_rows !== num_rows) {
                        num_chars = new_num_chars;
                        num_rows = new_num_rows;
                        redraw();
                        if (typeof settings.onResize === 'function' &&
                            (old_height !== height || old_width !== width)) {
                            settings.onResize(self);
                        }
                        if (old_height !== height || old_width !== width) {
                            old_height = height;
                            old_width = width;
                        }
                    }
                    return self;
                },
                // -----------------------------------------------------------------------
                // :: Flush the output to the terminal
                // -----------------------------------------------------------------------
                flush: function() {
                    try {
                        var wrapper;
                        // print all lines
                        $.each(output_buffer, function(i, line) {
                            if (line === NEW_LINE) {
                                wrapper = $('<div></div>');
                            } else if (typeof line === 'function') {
                                wrapper.appendTo(output);
                                try {
                                    line(wrapper);
                                } catch (e) {
                                    display_exception(e, 'USER:echo(finalize)');
                                }
                            } else {
                                $('<div/>').html(line).appendTo(wrapper).width('100%');
                            }
                        });
                        if (settings.outputLimit >= 0) {
                            var limit = settings.outputLimit === 0 ?
                                self.rows() :
                                settings.outputLimit;
                            var $lines = output.find('div div');
                            if ($lines.length > limit) {
                                var for_remove = $lines.slice(0, lines.length-limit+1);
                                // you can't get parent if you remove the element so
                                // we first get the parent
                                var parents = for_remove.parent();
                                for_remove.remove();
                                parents.each(function() {
                                    var self = $(this);
                                    if (self.is(':empty')) {
                                        self.remove();
                                    }
                                });
                            }
                        }
                        scroll_to_bottom();
                        output_buffer = [];
                    } catch (e) {
                        alert('[Flush] ' + exception_message(e) + '\n' +
                              e.stack);
                    }
                    return self;
                },
                // -----------------------------------------------------------------------
                // :: Print data to the terminal output. It can have two options:
                // :: a function that is called with the container div that holds the
                // :: output (as a jquery object) every time the output is printed
                // :: (including resize and scrolling)
                // :: If the line is a function it will be called for every redraw.
                // -----------------------------------------------------------------------
                echo: function(string, options) {
                    try {
                        string = string || '';
                        var settings = $.extend({
                            flush: true,
                            raw: false,
                            finalize: $.noop
                        }, options || {});
                        output_buffer = [];
                        draw_line(string, settings);
                        lines.push([string, settings]);
                        if (settings.flush) {
                            self.flush();
                        }
                        on_scrollbar_show_resize();
                    } catch (e) {
                        // if echo throw exception we can't use error to display that
                        // exception
                        alert('[Terminal.echo] ' + exception_message(e) + '\n' +
                              e.stack);
                    }
                    return self;
                },
                // -----------------------------------------------------------------------
                // :: echo red text
                // -----------------------------------------------------------------------
                error: function(message, finalize) {
                    //quick hack to fix trailing back slash
                    return self.echo('[[;#f00;]' + $.terminal.escape_brackets(message).
                                     replace(/\\$/, '&#92;') + ']', finalize);
                },
                // -----------------------------------------------------------------------
                // :: Display Exception on terminal
                // -----------------------------------------------------------------------
                exception: function(e, label) {
                    var message = exception_message(e);
                    if (label) {
                        message = '&#91;' + label + '&#93;: ' + message;
                    }
                    if (message) {
                        self.error(message, {
                            finalize: function(div) {
                                div.addClass('exception message');
                            }
                        });
                    }
                    if (typeof e.fileName === 'string') {
                        //display filename and line which throw exeption
                        self.pause();
                        $.get(e.fileName, function(file) {
                            self.resume();
                            var num = e.lineNumber - 1;
                            var line = file.split('\n')[num];
                            if (line) {
                                self.error('&#91;' + e.lineNumber + '&#93;: ' + line);
                            }
                        });
                    }
                    if (e.stack) {
                        self.error(e.stack, {
                            finalize: function(div) {
                                div.addClass('exception stack-trace');
                            }
                        });
                    }
                },
                // -----------------------------------------------------------------------
                // :: Scroll Div that holds the terminal
                // -----------------------------------------------------------------------
                scroll: function(amount) {
                    var pos;
                    amount = Math.round(amount);
                    if (scroll_object.prop) { // work with jQuery > 1.6
                        if (amount > scroll_object.prop('scrollTop') && amount > 0) {
                            scroll_object.prop('scrollTop', 0);
                        }
                        pos = scroll_object.prop('scrollTop');
                        scroll_object.scrollTop(pos + amount);
                    } else {
                        if (amount > scroll_object.attr('scrollTop') && amount > 0) {
                            scroll_object.attr('scrollTop', 0);
                        }
                        pos = scroll_object.attr('scrollTop');
                        scroll_object.scrollTop(pos + amount);
                    }
                    return self;
                },
                // -----------------------------------------------------------------------
                // :: Exit all interpreters and logout. The function will throw exception
                // :: if there is no login provided
                // -----------------------------------------------------------------------
                logout: settings.login ? function() {
                    while (interpreters.size() > 1) {
                        self.pop();
                    }
                    return self.pop();
                } : function() {
                    self.error(strings.loginFunctionMissing);
                },
                // -----------------------------------------------------------------------
                // :: Function returns the token returned by callback function in login
                // :: function. It does nothing (return undefined) if there is no login
                // -----------------------------------------------------------------------
                token: settings.login ? function(local) {
                    return $.Storage.get(self.prefix_name(local) + '_token');
                } : $.noop,
                // -----------------------------------------------------------------------
                // :: Function return Login name entered by the user
                // -----------------------------------------------------------------------
                login_name: settings.login ? function(local) {
                    return $.Storage.get(self.prefix_name(local) + '_login');
                } : $.noop,
                // -----------------------------------------------------------------------
                // :: Function returns the name of current interpreter
                // -----------------------------------------------------------------------
                name: function() {
                    return interpreters.top().name;
                },
                // -----------------------------------------------------------------------
                // :: Function return prefix name for login/token
                // -----------------------------------------------------------------------
                prefix_name: function(local) {
                    var name = (settings.name ? settings.name + '_' : '') + terminal_id;
                    if (local && interpreters.size() > 1) {
                        name += '_' + interpreters.map(function(intrp) {
                            return intrp.name;
                        }).slice(1).join('_');
                    }
                    return name;
                },
                // -----------------------------------------------------------------------
                // :: Push a new interenter on the Stack
                // -----------------------------------------------------------------------
                push: function(interpreter, options) {
                    options = options || {};
                    options.name = options.name || prev_command;
                    options.prompt = options.prompt || options.name + ' ';
                    //names.push(options.name);
                    var top = interpreters.top();
                    if (top) {
                        top.mask = command_line.mask();
                    }
                    make_interpreter(interpreter, options.login, function(result) {
                        // result is object with interpreter and completion properties
                        interpreters.push($.extend({}, result, options));
                        if (options.login) {
                            var type = $.type(options.login);
                            if (type == 'function') {
                                // self.pop on error
                                self.login(options.login,
                                           false,
                                           prepare_top_interpreter,
                                           self.pop);
                            } else if ($.type(interpreter) == 'string' &&
                                       type == 'string' || type == 'boolean') {
                                self.login(make_json_rpc_login(interpreter, options.login),
                                           false,
                                           prepare_top_interpreter,
                                           self.pop);
                            }
                        } else {
                            prepare_top_interpreter();
                        }
                    });
                    return self;
                },
                // -----------------------------------------------------------------------
                // :: Remove the last interpreter from the Stack
                // -----------------------------------------------------------------------
                pop: function(string) {
                    if (string !== undefined) {
                        echo_command(string);
                    }
                    var token = self.token(true);
                    if (interpreters.size() == 1) {
                        if (settings.login) {
                            global_logout();
                            if ($.type(settings.onExit) === 'function') {
                                try {
                                    settings.onExit(self);
                                } catch (e) {
                                    display_exception(e, 'onExit');
                                    throw e;
                                }
                            }
                        } else {
                            self.error(strings.canExitError);
                        }
                    } else {
                        if (token) {
                            logout();
                        }
                        var current = interpreters.pop();
                        prepare_top_interpreter();
                        if ($.type(current.onExit) === 'function') {
                            try {
                                current.onExit(self);
                            } catch (e) {
                                display_exception(e, 'onExit');
                                throw e;
                            }
                        }
                        // restore mask
                        self.set_mask(interpreters.top().mask);
                    }
                    return self;
                },
                // -----------------------------------------------------------------------
                // :: Return how deep you are in nested interpreters
                // -----------------------------------------------------------------------
                level: function() {
                    return interpreters.size();
                },
                // -----------------------------------------------------------------------
                // :: Reinitialize the terminal
                // -----------------------------------------------------------------------
                reset: function() {
                    self.clear();
                    while(interpreters.size() > 1) {
                        interpreters.pop();
                    }
                    initialize();
                    return self;
                },
                // -----------------------------------------------------------------------
                // :: Remove all local storage left by terminal, it will not logout you
                // :: until you refresh the browser
                // -----------------------------------------------------------------------
                purge: function() {
                    var prefix = self.prefix_name() + '_';
                    var names = $.Storage.get(prefix + 'interpreters');
                    $.each($.parseJSON(names), function(_, name) {
                        $.Storage.remove(name + '_commands');
                        $.Storage.remove(name + '_token');
                        $.Storage.remove(name + '_login');
                    });
                    command_line.purge();
                    $.Storage.remove(prefix + 'interpreters');
                    return self;
                },
                // -----------------------------------------------------------------------
                // :: Remove all events and DOM nodes left by terminal, it will not purge
                // :: the terminal so you will have the same state when you refresh the
                // :: browser
                // -----------------------------------------------------------------------
                destroy: function() {
                    command_line.destroy().remove();
                    output.remove();
                    $(document).unbind('.terminal');
                    $(window).unbind('.terminal');
                    self.unbind('click, mousewheel');
                    self.removeData('terminal').removeClass('terminal');
                    if (settings.width) {
                        self.css('width', '');
                    }
                    if (settings.height) {
                        self.css('height', '');
                    }
                    return self;
                }
            }, function(_, fun) {
                // wrap all functions and display execptions
                return function() {
                    try {
                        return fun.apply(this, Array.prototype.slice.apply(arguments));
                    } catch (e) {
                        // exec catch by command (resume call exec)
                        if (_ !== 'exec' && _ !== 'resume') {
                            display_exception(e, 'TERMINAL');
                        }
                        throw e;
                    }
                };
            }));

            // ---------------------------------------------------------------------
            var on_scrollbar_show_resize = (function() {
                var scroll_bars = have_scrollbars(self);
                return function() {
                    if (scroll_bars !== have_scrollbars(self)) {
                        // if the scollbar appearance changes we will have a different
                        // number of chars
                        self.resize();
                        scroll_bars = have_scrollbars(self);
                    }
                };
            })();

            // ---------------------------------------------------------------------
            // INIT CODE
            // ---------------------------------------------------------------------
            if (settings.width) {
                self.width(settings.width);
            }
            if (settings.height) {
                self.height(settings.height);
            }
            if (!navigator.userAgent.toLowerCase().match(/(webkit)[ \/]([\w.]+)/) &&
                self[0].tagName.toLowerCase() == 'body') {
                scroll_object = $('html');
            } else {
                scroll_object = self;
            }
            // register ajaxSend for cancel requests on CTRL+D
            $(document).bind('ajaxSend.terminal', function(e, xhr, opt) {
                requests.push(xhr);
            });
            output = $('<div>').addClass('terminal-output').appendTo(self);
            self.addClass('terminal');
            // keep focus in clipboard textarea in mobile
            if (('ontouchstart' in window) || window.DocumentTouch &&
                document instanceof DocumentTouch) {
                self.click(function() {
                    self.find('textarea').focus();
                });
                self.find('textarea').focus();
            }
            /*
              self.bind('touchstart.touchScroll', function() {

              });
              self.bind('touchmove.touchScroll', function() {

              });
            */
            //$('<input type="text"/>').hide().focus().appendTo(self);

            // before login event
            if (settings.login && typeof settings.onBeforeLogin === 'function') {
                try {
                    settings.onBeforeLogin(self);
                } catch (e) {
                    display_exception(e, 'onBeforeLogin');
                    throw e;
                }
            }
            var auth = settings.login;
            // create json-rpc authentication function
            if (typeof init_interpreter === 'string' &&
                (typeof settings.login === 'string' || settings.login)) {
                settings.login = make_json_rpc_login(init_interpreter, settings.login);
            }
            terminals.append(self);
            var interpreters;
            var command_line;
            make_interpreter(init_interpreter, auth, function(interpreter) {
                interpreters = new Stack($.extend({
                    name: settings.name,
                    prompt: settings.prompt,
                    greetings: settings.greetings
                }, interpreter));
                // CREATE COMMAND LINE
                command_line = $('<div/>').appendTo(self).cmd({
                    prompt: settings.prompt,
                    history: settings.history,
                    historyFilter: settings.historyFilter,
                    historySize: settings.historySize,
                    width: '100%',
                    keydown: key_down,
                    keypress: settings.keypress ? function(e) {
                        return settings.keypress(e, self);
                    } : null,
                    onCommandChange: function(command) {
                        if ($.type(settings.onCommandChange) === 'function') {
                            try {
                                settings.onCommandChange(command, self);
                            } catch (e) {
                                display_exception(e, 'onCommandChange');
                                throw e;
                            }
                        }
                        scroll_to_bottom();
                    },
                    commands: commands
                });
                if (enabled) {
                    self.focus(undefined, true);
                } else {
                    self.disable();
                }
                $(document).bind('click.terminal', function(e) {
                    if (!$(e.target).closest('.terminal').hasClass('terminal') &&
                        settings.onBlur(self) !== false) {
                        self.disable();
                    }
                });
                self.click(function(e) {
                    if (!self.enabled()) {
                        self.focus();
                    }
                }).mousedown(function(e) {
                    if (e.which == 2) {
                        self.insert(getSelectedText());
                    }
                });
                // ------------------------------------------------
                // Run Login
                if (settings.login) {
                    self.login(settings.login, true, initialize);
                } else {
                    initialize();
                }
                if (self.is(':visible')) {
                    num_chars = get_num_chars(self);
                    command_line.resize(num_chars);
                    num_rows = get_num_rows(self);
                }
                self.oneTime(100, function() {
                    $(window).bind('resize.terminal', function() {
                        if (self.is(':visible')) {
                            var width = self.width();
                            var height = self.height();
                            // prevent too many calculations in IE
                            if (old_height !== height || old_width !== width) {
                                self.resize();
                            }
                        }
                    });
                });
                if ($.event.special.mousewheel) {
                    var shift = false;
                    $(document).bind('keydown.terminal', function(e) {
                        if (e.shiftKey) {
                            shift = true;
                        }
                    }).bind('keyup.terminal', function(e) {
                        // in Google Chromium/Linux shiftKey is false
                        if (e.shiftKey || e.which == 16) {
                            shift = false;
                        }
                    });
                    self.mousewheel(function(event, delta) {
                        if (!shift) {
                            if (delta > 0) {
                                self.scroll(-40);
                            } else {
                                self.scroll(40);
                            }
                            //event.preventDefault();
                        }
                    });
                }
            });
            self.data('terminal', self);
            return self;
        }
    }; //terminal plugin
})(jQuery);
