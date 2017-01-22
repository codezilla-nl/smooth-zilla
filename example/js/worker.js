function loadPage(href, cb) {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
            if (xmlhttp.status == 200) {
                cb(xmlhttp.responseText);
                // console.log(xmlhttp.responseText);
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

onmessage = function(e) {
//   console.log('Message received from main script');
//   console.log(e.data);

  e.data.forEach(function(page) {
      loadPage('/' + page, function(html) {
          postMessage({
              url: page,
              html: html
          });
      })
  });
}
