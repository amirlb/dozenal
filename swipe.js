"use strict";

function SwipeDetector() {
    this.touch_start = null;
    this.touch_now = null;
    this.touch_move_handler = this.on_touch_move.bind(this);
    this.callbacks = [];

    window.addEventListener('touchstart', this.on_touch_start.bind(this));
    window.addEventListener('touchcancel', this.on_touch_cancel.bind(this));
    window.addEventListener('touchend', this.on_touch_end.bind(this));
}

SwipeDetector.prototype = {
    LONG_TIME: 2000,
    LONG_VERTICAL: 0.25,
    SHORT_HORIZONTAL: 0.3,

    add_callback: function(cb) {
        this.callbacks.push(cb);
    },

    on_touch_start: function(e) {
        this.touch_start = this.touch_now = {
            time: Date.now(),
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
        };
        window.addEventListener('touchmove', this.touch_move_handler);
    },

    on_touch_move: function(e) {
        this.touch_now = {
            time: Date.now(),
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
        };
    },

    on_touch_cancel: function() {
        window.removeEventListener('touchmove', this.touch_move_handler);
        this.touch_start = null;
        this.touch_now = null;
    },

    on_touch_end: function() {
        window.removeEventListener('touchmove', this.touch_move_handler);
        if (this.touch_start === null || this.touch_now === null) {
            return;
        }
        if (this.touch_now.time > this.touch_start.time + this.LONG_TIME) {
            return;
        }
        if (Math.abs(this.touch_now.y - this.touch_start.y) > window.innerHeight * this.LONG_VERTICAL) {
            return;
        }
        if (Math.abs(this.touch_now.x - this.touch_start.x) < window.innerWidth * this.SHORT_HORIZONTAL) {
            return;
        }
        const direction = this.touch_now.x < this.touch_start.x ? 'left' : 'right';
        this.callbacks.forEach(function(cb) {
            cb(direction);
        });
    }
};