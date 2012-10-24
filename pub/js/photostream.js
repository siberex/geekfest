// Flickr API

/*
var apiKey = 'ce8a98262233b4f93746d846725fe6bf';
// http://www.adamwlewis.com/articles/what-is-my-flickr-id
var userId = '54758632@N02';
var userUrl = 'sibli';
var setId = '72157631574222249';
var tag = 'geekfest';
var perPage = '25';

var flickrUrl = 'http://api.flickr.com/services/rest/?format=json&method='
              + 'flickr.photos.search&api_key=' + apiKey + '&user_id=' + userId
              + '&tags=' + tag;

var postfix = '_b';
*/

if (console && console.log && !console.debug)
	console.debug = console.log;
if (!console || !console.debug)
	console = { log: function(){}, debug: function(){} };


var thumbWidth = 86;
//var thumbIndex = 7;

window.currentPage = 0;

var imagesLoaded = [];
var imagesLoadedHash = {};




var fbAppId = '499533806725155';
// access_token = '';
// NB: Access token should be saved in /js/fb-token.js


// Facebook API, how to get album ID:
// List all albums:
// https://graph.facebook.com/itsumma/albums/?fields=id,name,count&limit=0&access_token=...
// https://graph.facebook.com/siberex/albums/?fields=id,name,count&limit=0&access_token=...

// https://graph.facebook.com/ALBUM_ID/photos?... e.g.:
// https://graph.facebook.com/4265070778154/photos?limit=25&access_token=...


var fbAlbumId = '513555281988573'; // its → 513555281988573

// How to use reverse sorting direction without FQL?
// var fbUrlPrefix = 'https://graph.facebook.com/' + fbAlbumId + '/photos/?order_by=created_time';
// &limit=2&offset=2
// More on Facebook pagination: http://developers.facebook.com/docs/reference/api/pagination/
// &fields=id,picture,images,link,created_time

var fbUrlPrefix = 'https://graph.facebook.com/fql?access_token=' + access_token
				+ '&q=SELECT pid,link,created,src,src_width,src_height,images, src_big FROM photo WHERE album_object_id=' + fbAlbumId

/*
{
   "error": {
      "message": "Error validating access token: Session has expired at unix time 1349042400. The current unix time is 1349042782.",
      "type": "OAuthException",
      "code": 190,
      "error_subcode": 463
   }
}
!!!
*/



// FQL: 
/*
https://graph.facebook.com/fql?access_token=AAAHGUscaaCMBALk8XWM8RtbGzF7ETRI5kz04pRPQXZBoOmuQ3YkxzauoPWSaHDZAf406k5XQVwYXPEKAB69nX2x4GZBh3xuRoiXteaRLQZDZD&q=SELECT%20pid,link,created,%20src,src_width,src_height,%20images%20FROM%20photo%20WHERE%20album_object_id%20=%204318461272883%20ORDER%20BY%20created%20DESC%20LIMIT%200,20
*/

var fbUrlSuffix = ' ORDER BY created DESC LIMIT 0,20&callback=?';
var fbUrlSuffixI = ' ORDER BY created DESC LIMIT 0,20&callback=initFacebookData';
//var fbUrlSuffixP = ' ORDER BY created DESC LIMIT 0,20&callback=prependFacebookData';
var fbUrlSuffixA = ' ORDER BY created DESC LIMIT ' + ((window.currentPage-1)*20) + ',20&callback=?';



// Initial load.
function initFacebookData(data) {
	var loaded = addNewImages(data, true);

	if (!loaded.length) {
		console.debug('Error while loading album data!');
		return null;
	}

	var first = loaded[0];
	if ( !$('#wrapper a:first').attr('id') || $('#wrapper a:first').attr('id') == ('I' + first.pid) )
		showImage(loaded[0].pid, null, loaded[1] ? loaded[1].pid : null);

    // Increment page
	window.currentPage++;
}


// Load more from album.
function appendFacebookData(data) {

	var loaded = addNewImages(data, true);

	console.debug(window.currentPage, 'page');

    // Increment page
	window.currentPage++;
	fbUrlSuffixA = ' ORDER BY created DESC LIMIT ' + ((window.currentPage-1)*20) + ',20&callback=?';
}


// Interval update.
function prependFacebookData(data) {
	var loaded = addNewImages(data, false);

	if (!loaded.length)
		return null;

	var first = loaded[0];
	if ( $('#wrapper a:first').attr('id') == ('I' + first.pid) )
		showImage(loaded[0].pid, null, loaded[1] ? loaded[1].pid : null);
}


function addNewImages(data, insertAfter) {
    //console.debug(data);
	var insertAfter = (typeof insertAfter == 'undefined')
					? false
					: insertAfter;


	if (!data || !data.data || !data.data.length)
		return false;

	var iData = null;
	var removeIndexes = [];
	var thumbsStr = '';

	for (var i = 0; i < data.data.length; i++) {
		iData = data.data[i];

		if (imagesLoadedHash[iData.pid]) {
			removeIndexes.push(i);
			continue;
		}

		imagesLoadedHash[iData.pid] = iData;

		thumbsStr += getThumbStr(iData);

		//console.debug(iData);
	}

	for (var j = 0; j < removeIndexes.length; j++) {
		// With delete() undefined will be left in array!
		data.data.splice(removeIndexes[j], 1);
	}

	if (insertAfter) {
		imagesLoaded = imagesLoaded.concat(data.data);
		appendToNavigation(thumbsStr);
	} else {
		imagesLoaded = data.data.concat(imagesLoaded);
		prependToNavigation(thumbsStr);
	}

	return data.data;
} // parseFacebookData






// @deprecated
function resetSizes() {
    var h = $(window).height();
    var w = $(window).width();
    var size = h<w?h:w;
    
    size = h>w?h:w;

    //$(".renderer").width(w);
    //$("#wrapper").height(h);
    //$("#wrapper").width(w);

         if (size > 1024)   postfix = '_b';
    else if (size > 800)    postfix = '_c';
    else if (size > 640)    postfix = '_z';
    else if (size > 500)    postfix = '';
    else if (size > 320)    postfix = '_n';
       else                 postfix = '_m';

};

// Monitor window resize:
$(window).resize(resetSizes);


// @deprecated
function resizeWrapper(width) {
    //$('#wrapper').width(width);
}

function handleImageLoad() {
    //console.debug('OK');

    var img = $( this );
    var imgWidth = img.width();
    var imgHeight = img.height();

    // Sometimes IE fires load event before loading image.
    if ( 0 === imgWidth && 0 === imgHeight ) {
        setTimeout( function (){ img.load(); }, 10 );
        return;
    }

    var boxWidth = $(window).width();
    var boxHeight = $(window).height() - (thumbWidth + 1);

    // We must downsize the image when it is bigger than viewport
    if (
        ( imgWidth > boxWidth ) ||
        ( imgHeight > boxHeight )
    ) {
        var ratio = Math.min(
            boxWidth / imgWidth,
            boxHeight / imgHeight
        );

        imgWidth = Math.round( imgWidth * ratio );
        imgHeight = Math.round( imgHeight * ratio );
    }

    // box.addClass( 'darkbox-loaded' );
    // NOTE: we must show darkboxCanvas to compute dimensions right
	//img.width(imgWidth);
    //img.height(imgHeight);
	
	// This can be optimized by dynamically update <style>
	//img.css('max-width', $(window).width() + 'px');
	//img.css('max-height', ($(window).height() - thumbWidth) + 'px');

    $('#wrapper').width(imgWidth);
    //$('#wrapper').height(imgHeight);
    
    hideSpinner();
    img.show();
} // handleImageLoad

function showImage(id, prevId, nextId) {
    //console.debug( imagesLoadedHash[id], prevId, nextId );
    
    showSpinner();

    var strEl = getImageStr( imagesLoadedHash[id] );
    var strPrev = '<a href="#" id="prev">←</a>';
	var strNext = '<a href="#" id="next">→</a>';
    var $el = $(strEl + strPrev + strNext);
    var $img = $el.children('img:first');

	$img.css('max-width', $(window).width() + 'px');
	$img.css('max-height', ($(window).height() - thumbWidth - 1) + 'px');

    /*$img.on('load', function(e) {
        resizeWrapper( $('#wrapper img:first').width() );
    });*/

    var $wrapper = $('#wrapper');
    $wrapper.empty();
    $wrapper.append($el);
    
    //$img.width(250);
    //$img.height(250);

    $img.load( handleImageLoad );
} // showImage



$(function() {
    resetSizes();

    //updateNavigation();
        



    $(document).on('click', '#container a', function(e) {
        // Fires on dynamically loaded items.

        if (window.navScroll.scrollingInProgress)
            return false;

        var $item = $(this);
        var id = $item.attr('id');
        var prevId = null;
        var nextId = null;

        var $prev = $item.parent().prev();
        if ($prev) {
            prevId = $prev.children('a:first').attr('id');
        }

        var $next = $item.parent().next();
        if ($next) {
            nextId = $next.children('a:first').attr('id');
        }

        showImage(id, prevId, nextId);
    });



    //#carousel .es-nav-prev
    //.es-nav-next


    // Autoupdating
    window.loadNew = setInterval(function() {
        $.getJSON(fbUrlPrefix + fbUrlSuffix, prependFacebookData);
    }, 120000);
    

    window.loadMore = setInterval(function() {

        //console.log('Loading more...');
        $.getJSON(fbUrlPrefix + fbUrlSuffixA, appendFacebookData); // json
    }, 10000); // setInterval





}); // document.ready




function getImageStr(im) {
    var pageUrl = im.link;
    
    var strEl = '<a href="' + pageUrl + '" id="I' + im.pid + '">'
              + '<img src="' + im.src_big + '" alt="" />'
              + '</a>';
    return strEl;
} // getImageStr


function getThumbStr(im) {
    var strEl = '<li><a href="#'+im.pid+'" id="'+im.pid+'" style="background-image: url('+im.src+')">'
              + '</a></li>';
    return strEl;
} // getThumbStr



function appendToNavigation(html) {
	var $items  = $(html);
	$('#container').append($items);
	updateNavigation();
}
function prependToNavigation(html) {
	var $items  = $(html);
	$('#container').prepend($items);
	updateNavigation();
}

function updateNavigation() {
    //console.log('Updating navigation');

    $container = $("#container");

    var width = $container.children('li').length * (thumbWidth + 1);
	// Set fixed width for thumbnail container (important!):
    $container.width(width);

    if (window.navScroll) {
        setTimeout(function () {
            window.navScroll.refresh();
        }, 0);
    } else {
        window.navScroll = new iScroll('iscroll', {
            vScroll: false
           ,vScrollbar: false
           ,wheelHorizontal: true
            //,scrollbarClass: 'iScrollbar'
           ,onScrollMove : function(e) {
                if (!this.scrollingInProgress)
                    this.scrollingInProgress = true;
            }
           ,onScrollEnd: function() {
                var that = this;
                setTimeout(function () {
                    that.scrollingInProgress = false;
                }, 10);

            }
        });
    }

} // updateNavigation



/**
 * Show loading spinner.
 */
function showSpinner() {
    // Animate loading spinner.
    $spinner = $('#spinner');

    if (!window.timerSpinner) {
        var spinnerStep = 0;
        window.timerSpinner = setInterval( function () {
            var shift = 24 - ( 56 * spinnerStep );
            $spinner.css( 'background-position', '24px ' + shift + 'px' );
            spinnerStep = ( 7 <= spinnerStep ) ? 0 : spinnerStep + 1;
        }, 90 );
    }

    $spinner.show();
} // showSpinner

/**
 * Hide loading spinner.
 */
function hideSpinner() {
    clearInterval(window.timerSpinner);
    window.timerSpinner = null;
    $spinner.hide();
} // hideSpinner