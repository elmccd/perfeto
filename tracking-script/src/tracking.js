(function () {
    var url = 'http://localhost:3005';

    function request(data) {
        fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        })
            .catch(error => console.error('Error:', error))
            .then(response => console.log('Success:', response));
    }

    function track() {
        var perf = window.performance;
        if (!perf || !perf.timing || !perf.timing.navigationStart) {
            return;
        }

        var navigationStart = perf.timing.navigationStart;

        var data = {
            id: '9d1c03a0f3f',
            host: window.location.host,
            path: window.location.pathname,
            domContentLoadedEventEnd: perf.timing.domContentLoadedEventEnd - navigationStart,
            loadEventEnd: perf.timing.loadEventEnd - navigationStart,
            responseEnd: perf.timing.responseEnd - navigationStart,
        };

        request(data);
    }

    var waitForLoad = function () {
        console.log('wait');
        if (performance.timing.loadEventEnd) {
            track();
            return;
        } else {
            setTimeout(waitForLoad, 500);
        }
    };

    waitForLoad();
}());