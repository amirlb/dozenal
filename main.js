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
    const fraction = document.getElementById('tabs-container').scrollLeft / document.getElementById('tab-timer').offsetLeft;
    if (fraction < 0.5) {
        document.getElementById('choose-clock').classList.add('selected');
        document.getElementById('choose-timer').classList.remove('selected');
    } else {
        document.getElementById('choose-timer').classList.add('selected');
        document.getElementById('choose-clock').classList.remove('selected');
    }
    document.getElementById('reset-timer').style.transform = `translate(0, ${20*(1-fraction)}vmin)`;
}

document.addEventListener('DOMContentLoaded', function () {

    const clock_widget = new ClockWidget(document.getElementById('digital-clock'));
    const timer_widget = new TimerWidget(document.getElementById('stopwatch'), { color: 'white' });

    document.getElementById('tabs-container').addEventListener('scroll', fix_navbar);
    document.getElementById('tabs-container').addEventListener('wheel', fix_navbar);
    fix_navbar();

    document.getElementById('choose-clock').addEventListener('click', function() {
        document.getElementById('tab-clock').scrollIntoView({behavior: 'smooth'});
    });
    document.getElementById('choose-timer').addEventListener('click', function() {
        timer_widget.update_display();
        document.getElementById('tab-timer').scrollIntoView({behavior: 'smooth'});
    });
    document.getElementById('reset-timer').addEventListener('click', function() {
        timer_widget.stop();
    });

    window.addEventListener('keyup', function (e) {
        switch (e.key) {
            case 'ArrowLeft':
                document.getElementById('tab-clock').scrollIntoView({behavior: 'smooth'});
                break

            case 'ArrowRight':
                timer_widget.update_display();
                document.getElementById('tab-timer').scrollIntoView({behavior: 'smooth'});
                break;

            case ' ':
                if (document.getElementById('choose-timer').classList.contains('selected'))
                    timer_widget.play_or_pause();
                break;
        }
    });

});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/dozenal/service_worker.js', {scope: '/dozenal/'});
}
