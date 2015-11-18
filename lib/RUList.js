"use strict";

class RUList {
    constructor (maxItems) {
        this.items = [];
        this.maxItems = maxItems || 5;
    }

    getLength() {
        return this.items.length;
    }

    add(item) {
        var i = this.items.indexOf(item);
        if (i !== -1) {
            this.items.splice(i, 1);
        }
        this.items.unshift(item);

        this.items.splice(this.maxItems);
    }

    get(i) {
        return this.items[i];
    }

    toArray() {
        return this.items.slice(0);
    }
}

Object.defineProperty(RUList.prototype, 'length', {
    get: RUList.prototype.getLength
});

module.exports = RUList;
