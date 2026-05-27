'use strict';

var Hook = {};

var lazysetup = function(name, pres, posts) {
    if (pres.length === 0 && posts.length === 0) {
        var cache = this[name];

        this[name] = function() {            
            var args = Array.prototype.slice.call(arguments);
            var i, l;

            for (i = 0, l = pres.length; i < l; i++) {
                if (pres[i].apply(this, args)) break;
            }

            cache.apply(this, args);

            for (i = 0, l = posts.length; i < l; i++) {
                if (posts[i].apply(this, args)) break;
            }
        };
    }
};

Hook.pre = function(name, fn) {
    if (typeof name !== 'string' || typeof this[name] !== 'function') {
        return this;
    }

    var pres = this._pres = this._pres || {};
    var posts = this._posts = this._posts || {};
    pres[name] = pres[name] || [];
    posts[name] = posts[name] || [];

    lazysetup.call(this, name, pres[name], posts[name]);

    pres[name].push(fn);

    return this;
};

Hook.post = function(name, fn) {
    if (typeof name !== 'string' || typeof this[name] !== 'function') {
        return this;
    }

    var pres = this._pres = this._pres || {};
    var posts = this._posts = this._posts || {};
    pres[name] = pres[name] || [];
    posts[name] = posts[name] || [];

    lazysetup.call(this, name, pres[name], posts[name]);

    posts[name].push(fn);

    return this;
};

Hook.extend = function(obj) {
    if (!obj || typeof obj !== 'object') return false;

    obj.pre = Hook.pre;
    obj.post = Hook.post;

    return true;
};

module.exports = Hook;
