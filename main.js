"use strict";

Math.TAU = Math.PI * 2;

function formatDozenal(number, digits) {
    const DIGITS = 'O123456789XԐ';
    let fmt = '';
    while (digits-- > 0 || number) {
        fmt = DIGITS[number % 12] + fmt;
        number = Math.floor(number / 12);
    }
    return fmt;
}

document.addEventListener('DOMContentLoaded', function () {

    const clock_widget = new ClockWidget(document.getElementById('digital-clock'));
    const timer_widget = new TimerWidget(document.getElementById('stopwatch'), { color: 'white' });

    function choose_clock() {
        document.getElementById('choose-clock').classList.add('selected');
        document.getElementById('choose-timer').classList.remove('selected');
        document.getElementById('tab-clock').classList.remove('hidden');
        document.getElementById('tab-timer').classList.add('hidden');
    }
    function choose_timer() {
        document.getElementById('choose-clock').classList.remove('selected');
        document.getElementById('choose-timer').classList.add('selected');
        document.getElementById('tab-clock').classList.add('hidden');
        document.getElementById('tab-timer').classList.remove('hidden');
        timer_widget.update_display();
    }

    document.getElementById('choose-clock').addEventListener('click', choose_clock);
    document.getElementById('choose-timer').addEventListener('click', choose_timer);
    document.getElementById('reset-timer').addEventListener('click', timer_widget.stop.bind(timer_widget));

    window.addEventListener('keyup', function (e) {
        if (e.key === 'ArrowLeft')
            choose_clock();
        if (e.key === 'ArrowRight')
            choose_timer();
        if (e.key === ' ') {
            if (document.getElementById('choose-timer').classList.contains('selected'))
                timer_widget.play_or_pause();
        }
    });

    const swipe_detector = new SwipeDetector();
    swipe_detector.add_callback(function (direction) {
        if (direction === 'left')
            choose_clock();
        if (direction === 'right')
            choose_timer();
    });
});