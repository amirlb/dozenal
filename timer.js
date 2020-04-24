"use strict";

function TimerWidget (element, options) {
    this._element = element;
    this._color = options.color;
    this._time = null;
    this._last_update = null;
    this._interval_id = null;
    this._init_drawing();
    this._update_display();
    // FIXME: should listen to the "resize" event on the element, but this doesn't work for some reason
    window.addEventListener('resize', this._update_display.bind(this));
    this._element.addEventListener('click', this._on_click.bind(this));
}

TimerWidget.setup = function(element, options) {
    element._timer_widget = new TimerWidget(element, options);
}

TimerWidget.prototype = {
    SVG_NS: 'http://www.w3.org/2000/svg',

    _init_drawing: function() {
        this._marks = [];
        for (let i = 0; i < 60; i++) {
            const mark = document.createElementNS(this.SVG_NS, 'line');
            mark.style.stroke = this._color;
            mark.style.strokeLinecap = 'round';
            this._element.appendChild(mark);
            this._marks.push(mark);
        }

        this._text_group = document.createElementNS(this.SVG_NS, 'text');
        this._text_group.classList.add('timer-time-display');
        this._text_group.style.fill = this._color;
        this._text1 = document.createElementNS(this.SVG_NS, 'tspan');
        this._text_group.appendChild(this._text1);
        this._text2 = document.createElementNS(this.SVG_NS, 'tspan');
        this._text_group.appendChild(this._text2);
        this._element.appendChild(this._text_group);

        this._play_button = document.createElementNS(this.SVG_NS, 'polygon');
        this._play_button.style.stroke = 'none';
        this._element.appendChild(this._play_button);
    },

    _update_display: function() {
        const box = this._element.getBoundingClientRect();
        const size = Math.min(box.width, box.height);

        this._text_group.setAttribute('x', box.width * 0.5 - size * 0.25);
        this._text_group.setAttribute('y', box.height * 0.5 + size * 0.05);
        this._text1.setAttribute('font-size', size * 0.12);
        this._text2.setAttribute('font-size', size * 0.06);

        if (this._time === null) {
            const play_button_points = [
                [box.width * 0.5 - size * 0.06, box.height * 0.5 + size * 0.10],
                [box.width * 0.5 - size * 0.06, box.height * 0.5 - size * 0.10],
                [box.width * 0.5 + size * 0.12, box.height * 0.5],
            ]
            this._play_button.setAttribute('points',
                play_button_points.map(function([x,y]) {return `${x},${y}`;}).join(' '));
            this._play_button.style.fill = this._color;

            this._text1.innerHTML = '';
            this._text2.innerHTML = '';

            for (let i = 0; i < 60; i++) {
                const angle = Math.TAU / 60 * i;
                const start = (i % 12 == 0) ? size * 0.41 : size * 0.43;
                const end = (i % 12 == 0) ? size * 0.47 : size * 0.45;
                const mark = this._marks[i];
                mark.setAttribute('x1', box.width / 2 + Math.cos(angle) * start);
                mark.setAttribute('y1', box.height / 2 - Math.sin(angle) * start);
                mark.setAttribute('x2', box.width / 2 + Math.cos(angle) * end);
                mark.setAttribute('y2', box.height / 2 - Math.sin(angle) * end);
                mark.style.strokeWidth = size * 0.008;
                mark.style.strokeOpacity = 0.5;
            }
        } else {
            this._play_button.style.fill = 'none';

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
                    (i % 12 == 0) ? size * 0.41 : size * 0.43,
                    size * (0.40 + 0.12 * Math.abs(delta_2)),
                    size * (0.415 + 0.12 * Math.abs(delta_1)),
                );
                const end = Math.max(
                    (i % 12 == 0) ? size * 0.47 : size * 0.45,
                    size * (0.49 - 0.12 * Math.abs(delta_1)),
                );
                const mark = this._marks[i];
                mark.setAttribute('x1', box.width / 2 + Math.cos(angle) * start);
                mark.setAttribute('y1', box.height / 2 - Math.sin(angle) * start);
                mark.setAttribute('x2', box.width / 2 + Math.cos(angle) * end);
                mark.setAttribute('y2', box.height / 2 - Math.sin(angle) * end);
                mark.style.strokeWidth = size * 0.008;
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

    stop_if_paused: function() {
        if (this._interval_id === null) {
            this._last_update = null;
            this._time = null;
            this._update_display();
        }
    },

    _on_click: function() {
        if (this._interval_id === null) {
            this.play();
        } else {
            this.pause();
        }
    }
};