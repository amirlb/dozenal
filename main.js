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

function fix_navbar() {
    const scroll = document.getElementById('tabs-container').scrollLeft;
    if (scroll === document.getElementById('tab-clock').offsetLeft) {
        document.getElementById('choose-clock').classList.add('selected');
        document.getElementById('choose-timer').classList.remove('selected');
    }
    if (scroll === document.getElementById('tab-timer').offsetLeft) {
        document.getElementById('choose-timer').classList.add('selected');
        document.getElementById('choose-clock').classList.remove('selected');
    }
    document.getElementById('tabs-container').focus();
}

document.addEventListener('DOMContentLoaded', function () {

    const clock_widget = new ClockWidget(document.getElementById('digital-clock'));
    const timer_widget = new TimerWidget(document.getElementById('stopwatch'), { color: 'white' });

    document.getElementById('tabs-container').addEventListener('scroll', fix_navbar);
    fix_navbar();

    document.getElementById('choose-clock').addEventListener('click', function() {
        document.getElementById('tab-clock').scrollIntoView({behavior: 'smooth'});
    });
    document.getElementById('choose-timer').addEventListener('click', function() {
        timer_widget.update_display();
        document.getElementById('tab-timer').scrollIntoView({behavior: 'smooth'});
    });
    document.getElementById('tab-clock').addEventListener('scroll', function() {console.log('clock');});
    document.getElementById('tab-timer').addEventListener('scroll', function() {console.log('timer');});
    document.getElementById('reset-timer').addEventListener('click', timer_widget.stop.bind(timer_widget));

    window.addEventListener('keyup', function (e) {
        if (e.key === ' ') {
            if (document.getElementById('choose-timer').classList.contains('selected'))
                timer_widget.play_or_pause();
        }
    });

});