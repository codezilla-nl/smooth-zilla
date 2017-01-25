'use strict'

import { isExternal, whichTransitionEvent } from './utils'
import MyWorker from 'worker-loader!./Worker.js'

const DEFAULTS = {
    worker: true
}

class SmoothZilla {
    constructor(options) {        
        this.options = Object.assign({}, DEFAULTS, options);
             
        if (this.options.debug) {
            this.debug = true;
        }
   
        this.links = this.getLinks();
        this.pageCache = {};

        this.setClickHandlers(this.links);
     
        if (this.options.worker) {
            this.setWorker(this.links);
        }
   
    }

    getLinks() {
        let elements = document.getElementsByTagName('a');
        let links = [];

        for (var i = 0, len = elements.length; i < len; i++) {
            if (!isExternal(elements[i].getAttribute('href'))) {
                links.push({
                    element: elements[i],
                    href: elements[i].getAttribute('href')
                });
            }
        }

        return links;
    }

    setClickHandlers(links) {
        links.forEach((link) => {
            link.element.addEventListener('click', (event) => {
                this.navigateTo(link, true);
                event.preventDefault();
            });
        });
    }

    setWorker(links) {

        if (this.debug) {
            console.log(`Loading '${links.map((link) => link.href).toString()}' via workers`);
        }

        this.worker = new MyWorker();
        this.worker.postMessage(links.map((link) => link.href));
        this.worker.onmessage = (e) => {
            if (this.debug) {
                console.log(`Added '${e.data.url}' to the page cache`);
            }

            this.pageCache[e.data.url] = e.data.html;
        };
    }

    navigateTo(link, pushState) {
        if (!this.pageCache[link.href]) {
            this.loadPage(link.href, (page) => {
                this.swap(page, link.href, pushState);
            });
        } else {
            // loading from cache
            this.swap(this.pageCache[link.href], link.href, pushState);
        }
    }

    loadPage(href, cb) {
        var xmlhttp = new XMLHttpRequest();

        if (this.debug) {
            console.log(`Loading '${href}'`);
        }

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == XMLHttpRequest.DONE) {
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

        xmlhttp.open('GET', href, true);
        xmlhttp.send();
    }

    swap(html, href, pushState) {
        var container = document.getElementById('container');
        var transitionEvent = whichTransitionEvent();
        
        transitionEvent && container.addEventListener(transitionEvent, function() {
            document.write(html);
            document.close();

            var container = document.getElementById('container');
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
    
}

module.exports = SmoothZilla;
export default SmoothZilla;
