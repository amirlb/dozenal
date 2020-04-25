"use strict";

function ClockWidget (element, options) {
    this._element = element;
    this._show_seconds = options.show_seconds;
    this._show_and_loop();
}

ClockWidget.prototype = {
    _show_and_loop: function() {
        const now = new Date();
        const text = this._show_seconds
            ? `${formatDozenal(now.getHours(), 2)}:${formatDozenal(now.getMinutes(), 2)}:${formatDozenal(now.getSeconds(), 2)}`
            : `${formatDozenal(now.getHours(), 2)}:${formatDozenal(now.getMinutes(), 2)}`;
        const millisecondsInMinute = now.getSeconds()*1000 + now.getMilliseconds();
        const period = this._show_seconds ? 1000 : 60*1000;
        const millisecondsLeft = period - millisecondsInMinute % period;
        this._element.innerText = text;
        window.setTimeout(
            function (self) {self._show_and_loop()},
            millisecondsLeft,
            this,
        );
    }
};