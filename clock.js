"use strict";

function ClockWidget(element) {
    this._element = element;
    this._init();
    this._show_and_loop();
}

ClockWidget.prototype = {
    _init: function () {
        this._coarse_time = document.createElement('span');
        this._coarse_time.classList.add('minutes');
        this._element.appendChild(this._coarse_time);
        this._fine_time = document.createElement('span');
        this._fine_time.classList.add('seconds');
        this._element.appendChild(this._fine_time);
    },

    _show_and_loop: function () {
        const now = new Date();
        this._coarse_time.innerText =
            `${formatDozenal(now.getHours(), 1)}:${formatDozenal(now.getMinutes(), 2)}`;
        this._fine_time.innerText =
            `:${formatDozenal(now.getSeconds(), 2)}`;
        window.setTimeout(
            function (self) { self._show_and_loop() },
            1000 - now.getMilliseconds(),
            this,
        );
    }
};