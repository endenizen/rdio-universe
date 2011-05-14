var universe;

function log() {
  if(console && console.log) {
    console.log.apply(console, arguments);
  }
}

// add albums by year
function addAlbums(data) {
  // process the data into years
  log('adding albums');
  for (var i=0; i<data.length; i++) {
    var album = data[i];
    universe.addPlanet(album);
  }
}

function addArtists(data) {
  $.each(data, function() {
    var artist = this;
    universe.addStar(artist);
  });
}

function loadArtists(user) {
  var artistCount = 0;
  var artists = [];

  function loadNextArtists(page) {
    log('loading artists page ' + page);
    $.getJSON('/artists/' + encodeURIComponent(user['key']) + '/' + page, function(a) {
      if(a.length > 0) {
        artists = artists.concat(a);
        loadNextArtists(page + 1);
      } else {
        // done
        var titleH = $('#title h1');
        titleH.find('.userinfo').show();
        var userlink = titleH.find('.userlink');
        userlink.text(user['username']);
        userlink.attr('href', 'http://www.rdio.com' + user['url']);

        titleH.find('.reset').click(function() { location.reload(); });
        $('#loading').slideUp(function() {
          artistCount = artists.length;
          addArtists(artists);
        });
      }
    });
  }

  loadNextArtists(0);
  return;
}

function loadUser(username) {
  // find the user
  $.getJSON('/user/'+encodeURIComponent(username), function(u) {
    loadArtists(u);
  });
}

// load data from the server.
function load() {
  var username = $('#username').val();
  $('#dialog').slideUp();
  $('#loading').slideDown(function() {
    loadUser(username);
  });
}

var rdio_cb = {};
rdio_cb.ready = function() {
}
rdio_cb.playStateChanged = function(playState) {
}
rdio_cb.playingTrackChanged = function(playingTrack, sourcePosition) {
  console.log('PLAYING TRACK CHANGED: '+sourcePosition);
  $('.track').removeClass('playing');
  if (sourcePosition >= 0) {
    $($('.track').get(sourcePosition)).addClass('playing');
  }
}

rdio_cb.playingSourceChanged = function(playingSource) {
  $('#controls .listen').attr('href', playingSource['shortUrl']);
  $('#tracks').empty();
  $.each(playingSource['tracks'], function(i, track) {
    var e = $('<li>').addClass('track').text(track.name).appendTo($('#tracks'))
    e.click(function() { player().rdio_setCurrentPosition(i); });
  })
}

function player() {
  return $('#api_swf').get(0);
}

function play(key, art) {
  log('playing ' + key);
  player().rdio_play(key);
  $('#player').show();
  $('#art').attr('src', art);
  $('#play').hide();
  $('#pause').show();
}

$(document).ready(function() {

  if(!Detector.webgl) {
    Detector.addGetWebGLMessage();
    $('#dialog,#player,#footer,#poweredby').hide();
    return;
  }

  universe = new Universe();

  // when the user clicks "go", go.
  $('#go').click(function(){load()});

  // when the user presses enter, likewise

  $('#username').focus().keypress(function(e) {
    var c = e.which ? e.which : e.keyCode;
    if (c == 13) {
      load();
    }
  });

  $.getJSON('/flashvars', function(flashvars) {
    // load the swf
    var swf = 'http://www.rdio.com/api/swf/';
    flashvars['listener'] = 'rdio_cb';
    var params = {
      'allowScriptAccess': 'always'
    };
    var attributes = {};
    swfobject.embedSWF(swf, 'api_swf', 1, 1, '9.0.0', 'expressInstall.swf', flashvars, params, attributes);
  });

  // set up playback controls
  $('#prev').click(function() {
    player().rdio_previous();
  })
  $('#play').click(function() {
    player().rdio_play();
    $('#play').hide();
    $('#pause').show();
  })
  $('#pause').click(function() {
    player().rdio_pause();
    $('#play').show();
    $('#pause').hide();
  })
  $('#next').click(function() {
    player().rdio_next();
  })

});

/**
 * Provides requestAnimationFrame in a cross browser way.
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 */
if ( !window.requestAnimationFrame ) {
  window.requestAnimationFrame = ( function() {
    return window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
        window.setTimeout( callback, 1000 / 60 );
      };
  } )();
}

