(function() {
    var pages = [];
    var pagesHtml = {};

    function isExternal(url) {
        var match = url.match(/^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/);
        if (typeof match[1] === "string" && match[1].length > 0 && match[1].toLowerCase() !== location.protocol) return true;
        if (typeof match[2] === "string" && match[2].length > 0 && match[2].replace(new RegExp(":("+{"http:":80,"https:":443}[location.protocol]+")?$"), "") !== location.host) return true;
        return false;
    }    

    function whichTransitionEvent(){
        var t;
        var el = document.createElement('fakeelement');
        var transitions = {
        'transition':'transitionend',
        'OTransition':'oTransitionEnd',
        'MozTransition':'transitionend',
        'WebkitTransition':'webkitTransitionEnd'
        }

        for(t in transitions){
            if( el.style[t] !== undefined ){
                return transitions[t];
            }
        }
    }

    function navigateTo(href, pushState) {
        var container = document.getElementById('container')

        function swap(html, href) {

            var transitionEvent = whichTransitionEvent();
            console.log('transitionEvent', transitionEvent);
            
            transitionEvent && container.addEventListener(transitionEvent, function() {
                document.write(html);
                document.close();

                var container = document.getElementById('container')
                container.setAttribute('class', 'fade');

                // Barf, just for demo purposes
                setTimeout(function() {
                    container.setAttribute('class', 'fade in');
                }, 100);

            });
      
            container.setAttribute('class', 'fade out');
            
            if (pushState && window.history.pushState) {
                window.history.pushState('', '', href);
            }
        }

        
    

        if (!pagesHtml[href]) {
            document.body.style.cursor = 'progress';

            loadPage(href, function(page) {
                document.body.style.cursor = 'default';

                swap(page, href)
            })
        } else {
            // Loading from cache!
            console.log('loading from cache!');
            
            swap(pagesHtml[href], href);
        }
    }

    function loadPage(href, cb) {
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
                if (xmlhttp.status == 200) {
                    cb(xmlhttp.responseText);
                }
                else if (xmlhttp.status == 400) {
                    throw Error('There was an error 400');
                }
                else {
                    throw Error('something else other than 200 was returned');
                }
            }
        };

        xmlhttp.open("GET", href, true);
        xmlhttp.send();
    }

    function loadLinkListener() {
        var links = document.getElementsByTagName('a');

        for (var i = 0, len = links.length; i < len; i++) {
            if (!isExternal(links[i].getAttribute('href'))) {
                console.log('ohai', links[i]);

                pages.push(links[i].getAttribute('href'));
                
                links[i].addEventListener('click', function(event) {

                    navigateTo(this.getAttribute('href'), true);
                    event.preventDefault();
                    
                });
            }
        }
        
    }

    function loadBrowserNavListener() {
        window.addEventListener('popstate', function() {
            navigateTo(location.pathname, false);
        })
    }

    loadLinkListener();
    loadBrowserNavListener();

    if (window.Worker) {

        var myWorker = new Worker('js/worker.js');
        myWorker.postMessage(pages);

        myWorker.onmessage = function(e) {
            console.log('Message received from worker', e.data);
            pagesHtml[e.data.url] = e.data.html;
        }
    }

})();