var universe;

// albums by year
//var years = {};

function log() {
  if(console && console.log) {
    console.log.apply(console, arguments);
  }
}

// add albums by year
function addAlbums(data) {
  // process the data into years
  for (var i=0; i<data.length; i++) {
    var album = data[i];
    universe.addPlanet(album);
  }
}


// load data from the server.
function load() {
  universe = new Universe();
  var username = $('#username').val();
  $('#dialog').slideUp();
  $('#loading').slideDown();

  // find the user
  $.getJSON('/user/'+encodeURIComponent(username), function(u) {
    var user = u['key'];
    var albumCount = 0;
    function loadNextAlbums(page) {
      $.getJSON('/albums/'+encodeURIComponent(user)+'/'+page, function(a) {
        if (a.length > 0) {
          // loaded some albums
          addAlbums(a);
          // update the ui
          albumCount += a.length
          $('#loading').text('Loaded '+albumCount+' albums...');
          // go look for some more
          loadNextAlbums(page+1);
        } else {
          // looks like there's nothing left to load
          $('#loading').slideUp();
          $('#instructions').show();
          $('#title h1 .userinfo').show();
          $('#title h1 .userlink').text(username).attr('href', function(i, val) { return 'http://www.rdio.com/people/' + username });
          $('#title h1 .reset').click(function() { location.reload(); });
        }
      })
    }

    loadNextAlbums(0);
  })
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

