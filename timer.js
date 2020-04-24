"use strict";

function TimerWidget (element) {
    this._element = element;
    this._time = null;
    this._last_update = null;
    this._interval_id = null;
    this._init_drawing();
    this._update_display();
    // FIXME: should listen to the "resize" event on the element, but this doesn't work for some reason
    window.addEventListener('resize', this._update_display.bind(this));
    this._element.addEventListener('click', this._on_click.bind(this));
}

TimerWidget.setup = function(element) {
    element._timer_widget = new TimerWidget(element);
}

TimerWidget.prototype = {
    SVG_NS: 'http://www.w3.org/2000/svg',

    _init_drawing: function() {
        this._marks = [];
        for (let i = 0; i < 60; i++) {
            const mark = document.createElementNS(this.SVG_NS, 'line');
            mark.style.stroke = 'white';
            mark.style.strokeWidth = 3;
            mark.style.strokeLinecap = 'round';
            this._element.appendChild(mark);
            this._marks.push(mark);
        }

        this._text_group = document.createElementNS(this.SVG_NS, 'text');
        this._text_group.id = 'analog-time-text';
        this._text_group.style.fill = 'white';
        this._text1 = document.createElementNS(this.SVG_NS, 'tspan');
        this._text1.id = 'analog-time-text-coarse';
        this._text_group.appendChild(this._text1);
        this._text2 = document.createElementNS(this.SVG_NS, 'tspan');
        this._text2.id = 'analog-time-text-fine';
        this._text_group.appendChild(this._text2);
        this._element.appendChild(this._text_group);
    },

    _update_display: function() {
        const box = this._element.getBoundingClientRect();
        const size = Math.min(box.width, box.height);

        this._text_group.setAttribute('x', box.width * 0.5 - size * 0.25);
        this._text_group.setAttribute('y', box.height * 0.5 + size * 0.05);
        this._text1.setAttribute('font-size', size * 0.12);
        this._text2.setAttribute('font-size', size * 0.06);

        if (this._time === null) {
            this._text1.innerHTML = '';
            this._text2.innerHTML = '';

            for (let i = 0; i < 60; i++) {
                const angle = Math.TAU / 60 * i;
                const start = (i % 12 == 0) ? size / 2 - 37 : size / 2 - 30;
                const end = (i % 12 == 0) ? size / 2 - 15 : size / 2 - 22;
                const mark = this._marks[i];
                mark.setAttribute('x1', box.width / 2 + Math.cos(angle) * start);
                mark.setAttribute('y1', box.height / 2 - Math.sin(angle) * start);
                mark.setAttribute('x2', box.width / 2 + Math.cos(angle) * end);
                mark.setAttribute('y2', box.height / 2 - Math.sin(angle) * end);
                mark.style.strokeOpacity = 0.5;
            }
        } else {
            const minutes = Math.trunc(this._time / 60000);
            const seconds = Math.trunc(this._time / 1000) % 60;
            const millis = Math.trunc((this._time % 1000) * 0.144);
            this._text1.innerHTML = `${formatDozenal(minutes, 2)}:${formatDozenal(seconds, 2)}`;
            this._text2.innerHTML = `.${formatDozenal(millis, 2)}`;

            for (let i = 0; i < 60; i++) {
                const angle = Math.TAU / 60 * i;
                const delta_1 = this._angle_diff(angle, Math.TAU / 60000 * this._time);
                const delta_2 = this._angle_diff(angle, Math.TAU / 1000 * this._time);
                const start = Math.min(
                    (i % 12 == 0) ? size / 2 - 37 : size / 2 - 30,
                    size / 2 - 42 + 50 * Math.abs(delta_2),
                    size / 2 - 35 + 50 * Math.abs(delta_1),
                );
                const end = Math.max(
                    (i % 12 == 0) ? size / 2 - 15 : size / 2 - 22,
                    size / 2 - 8 - 50 * Math.abs(delta_1),
                );
                const mark = this._marks[i];
                mark.setAttribute('x1', box.width / 2 + Math.cos(angle) * start);
                mark.setAttribute('y1', box.height / 2 - Math.sin(angle) * start);
                mark.setAttribute('x2', box.width / 2 + Math.cos(angle) * end);
                mark.setAttribute('y2', box.height / 2 - Math.sin(angle) * end);
                mark.style.strokeOpacity = delta_1 < 0 ? 0.5
                    : Math.max(0.5, 1 - delta_1 * 1.2);
            }
        }
    },

    // Returns -TAU/2 <= x <= TAU/2 such that b = a + x (mod TAU)
    _angle_diff: function(a, b) {
        return ((b - a) % Math.TAU + Math.TAU * 1.5) % Math.TAU - Math.TAU * 0.5;
    },

    _update_time_and_display: function() {
        const now = Date.now();
        this._time += now - this._last_update;
        this._last_update = now;
        this._update_display();
    },

    play: function() {
        this._last_update = Date.now();
        if (this._time === null) {
            this._time = 0;
        }
        this._interval_id = window.setInterval(this._update_time_and_display.bind(this), 20);
        this._update_display();
    },

    pause: function() {
        if (this._interval_id !== null) {
            window.clearInterval(this._interval_id);
            this._interval_id = null;
            this._update_time_and_display();
        }
    },

    stop: function() {
        if (this._interval_id !== null) {
            window.clearInterval(this._interval_id);
            this._interval_id = null;
        }
        this._last_update = null;
        this._time = null;
        this._update_display();
    },

    _on_click: function() {
        if (this._interval_id === null) {
            this.play();
        } else {
            this.pause();
        }
    }
};