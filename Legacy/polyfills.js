/**
 * Polyfills for ES6+ features used in the Legacy build.
 * Loaded as a plain script BEFORE the bundled IIFE.
 * Assumes ES5 baseline (forEach, map, filter, reduce, indexOf, JSON, etc.)
 */

/* ── Object.assign ────────────────────────────────── */
if (!Object.assign) {
  Object.assign = function (target) {
    if (target == null) throw new TypeError("Cannot convert undefined or null to object");
    var to = Object(target);
    for (var i = 1; i < arguments.length; i++) {
      var src = arguments[i];
      if (src != null) {
        for (var key in src) {
          if (Object.prototype.hasOwnProperty.call(src, key)) {
            to[key] = src[key];
          }
        }
      }
    }
    return to;
  };
}

/* ── Array.prototype.find ─────────────────────────── */
if (!Array.prototype.find) {
  Array.prototype.find = function (callback, thisArg) {
    for (var i = 0; i < this.length; i++) {
      if (callback.call(thisArg, this[i], i, this)) return this[i];
    }
    return undefined;
  };
}

/* ── Array.prototype.findIndex ─────────────────────── */
if (!Array.prototype.findIndex) {
  Array.prototype.findIndex = function (callback, thisArg) {
    for (var i = 0; i < this.length; i++) {
      if (callback.call(thisArg, this[i], i, this)) return i;
    }
    return -1;
  };
}

/* ── Array.prototype.includes ─────────────────────── */
if (!Array.prototype.includes) {
  Array.prototype.includes = function (searchElement, fromIndex) {
    var len = this.length;
    var k = fromIndex >= 0 ? fromIndex : Math.max(len + fromIndex, 0);
    for (; k < len; k++) {
      if (this[k] === searchElement) return true;
    }
    return false;
  };
}

/* ── Array.from ───────────────────────────────────── */
if (!Array.from) {
  Array.from = function (arrayLike, mapFn, thisArg) {
    var result = [];
    for (var i = 0; i < arrayLike.length; i++) {
      result.push(mapFn ? mapFn.call(thisArg, arrayLike[i], i) : arrayLike[i]);
    }
    return result;
  };
}

/* ── String.prototype.startsWith ──────────────────── */
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function (search, pos) {
    pos = pos || 0;
    return this.indexOf(search, pos) === pos;
  };
}

/* ── String.prototype.endsWith ────────────────────── */
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function (search, thisLen) {
    if (thisLen === undefined || thisLen > this.length) thisLen = this.length;
    return this.substring(thisLen - search.length, thisLen) === search;
  };
}

/* ── String.prototype.padStart ────────────────────── */
if (!String.prototype.padStart) {
  String.prototype.padStart = function (targetLength, padString) {
    targetLength = targetLength >> 0;
    padString = padString !== undefined ? String(padString) : " ";
    if (this.length >= targetLength) return String(this);
    targetLength = targetLength - this.length;
    if (targetLength > padString.length) {
      padString += padString.repeat(targetLength / padString.length);
    }
    return padString.slice(0, targetLength) + String(this);
  };
}

/* ── Object.entries ───────────────────────────────── */
if (!Object.entries) {
  Object.entries = function (obj) {
    var result = [];
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result.push([key, obj[key]]);
      }
    }
    return result;
  };
}

/* ── Object.keys ──────────────────────────────────── */
if (!Object.keys) {
  Object.keys = function (obj) {
    var result = [];
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) result.push(key);
    }
    return result;
  };
}

/* ── Set (minimal) ────────────────────────────────── */
if (typeof Set === "undefined") {
  (function () {
    var PREFIX = "@@setItem_";

    function Set(iterable) {
      this._items = {};
      this.size = 0;
      if (iterable) {
        for (var i = 0; i < iterable.length; i++) {
          this.add(iterable[i]);
        }
      }
    }

    Set.prototype.add = function (value) {
      var key = PREFIX + value;
      if (!this._items[key]) this.size++;
      this._items[key] = value;
      return this;
    };

    Set.prototype.has = function (value) {
      return !!this._items[PREFIX + value];
    };

    Set.prototype.delete = function (value) {
      var key = PREFIX + value;
      if (this._items[key]) {
        delete this._items[key];
        this.size--;
        return true;
      }
      return false;
    };

    Set.prototype.forEach = function (callback, thisArg) {
      for (var key in this._items) {
        if (Object.prototype.hasOwnProperty.call(this._items, key)) {
          callback.call(thisArg, this._items[key], this._items[key], this);
        }
      }
    };

    window.Set = Set;
  })();
}
