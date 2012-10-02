// Flickr API
var apiKey = 'ce8a98262233b4f93746d846725fe6bf';
// http://www.adamwlewis.com/articles/what-is-my-flickr-id
var userId = '54758632@N02';
var userUrl = 'sibli';
var setId = '72157631574222249';
var tag = 'geekfest';
var perPage = '25';

var flickrUrl = 'http://api.flickr.com/services/rest/?format=json&method='
              + 'flickr.photos.search&api_key=' + apiKey + '&user_id=' + userId
              + '&sort=date-taken-desc'
              + '&tags=' + tag;

var postfix = '_b';

window.currentPage = 1;

var imagesLoaded = [];
var imagesLoadedHash = {};


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
//resetSizes();
$(window).resize(resetSizes);



function resizeWrapper(width) {
    //$('#wrapper').width(width);
}

function handleImageLoad() {

    var img = $( this );
    var imgWidth = img.width();
    var imgHeight = img.height();

    // Sometimes IE fires load event before loading image.
    if ( 0 === imgWidth && 0 === imgHeight ) {
        setTimeout( function (){ img.load(); }, 10 );
        return;
    }

    var boxWidth = $(window).width();
    var boxHeight = $(window).height() - 76;

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
    img.width(imgWidth);
    img.height(imgHeight);
    $('#wrapper').width(imgWidth);
    $('#wrapper').height(imgHeight);
    
    hideSpinner();
    img.show();
} // handleImageLoad

function showImage(id, prevId, nextId) {
    
    showSpinner();

    var strEl = getImageStr( imagesLoadedHash[id] );
    var strPrev = '<a href="#" id="prev">←</a>';
	var strNext = '<a href="#" id="next">→</a>';
    var $el = $(strEl + strPrev + strNext);
    var $img = $el.children('img:first');

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

        //return false;

        // NB! rand is not necessary, jQuery will pass own random string like: &_=1348912959589
        $.getJSON(flickrUrl + '&per_page=' + perPage + '&jsoncallback=?', function(data) {
            // New data

            if (!data.photos || !data.photos.photo || !data.photos.photo.length)
                return false;

            var first = imagesLoaded[0];
            var newIm = [];
            var items = '';
            $.each(data.photos.photo, function(i, p) {
                if ( typeof imagesLoadedHash[p.id] == 'object' )
                    return 1;

                var im = getImgObj(p);
                
                newIm.push(im);
                imagesLoadedHash[p.id] = im;

                var strEl = getThumbStr(im);
                items += strEl;
            }); // each
            
            if (newIm.length == 0)
                return false;

            imagesLoaded = newIm.concat(imagesLoaded);
            
            var $items  = $(items);
            $('#container').prepend($items);
            setTimeout(function () {
                window.navScroll.refresh();
            }, 0);
            //$('#carousel').elastislide( 'add', $items );
            
            if ($('#wrapper a:first').attr('id') == 'I' + first.id )
                showImage(newIm[0].id, null, newIm[1] ? newIm[1].id : null);
        }); 
    
    }, 120000);
    
//window.loadMore = function(page) {

    //return false;

    window.loadMore = setInterval(function() {

        $.getJSON(flickrUrl + '&per_page=' + perPage + '&page=' + window.currentPage + '&jsoncallback=?', function(data) {
            // More data

            if (!data.photos || !data.photos.photo || !data.photos.photo.length)
                return false;

            var items = '';
            $.each(data.photos.photo, function(i, p) {
                if ( typeof imagesLoadedHash[p.id] == 'object' )
                    return 1;

                var im = getImgObj(p);

                imagesLoaded.push(im);
                imagesLoadedHash[p.id] = im;

                var strEl = getThumbStr(im);
                items += strEl;
            }); // each
            
            var $items  = $(items);
            $('#container').append($items);

            updateNavigation();

            // @todo Check total, not page!
            // @todo Check if loaded less than 25 items in page
            // Less than {perPage} items can be loaded on last page AND...
            // Flickr API sometimes gives less than 25 on other pages randomly!
            if (window.currentPage >= data.photos.pages) {
                clearInterval(window.loadMore);
            } else {
                window.currentPage++;
            }
        }); // json
    }, 5000); // setInterval
//}; // loadMore





}); // document.ready





function jsonFlickrApi(data) {

    if (!data.photos || !data.photos.photo || !data.photos.photo.length)
        return false;


    $.each(data.photos.photo, function(i, p) {
        var im = getImgObj(p);
        //var im = getImgObj({"id":"8003949008", "owner":"54758632@N02", "secret":"3c77170355", "server":"8031", "farm":9, "title":"_SIB1270.JPG", "ispublic":1, "isfriend":0, "isfamily":0});
        imagesLoaded.push(im);
        imagesLoadedHash[p.id] = im;

        var strEl = getThumbStr(im);

        $(strEl).appendTo("#container");
    }); // each

    showImage(imagesLoaded[0].id, null, imagesLoaded[1] ? imagesLoaded[1].id : null);

    updateNavigation();

    // Increment page
    window.currentPage++;

} // jsonFlickrApi

function getImageStr(im) {
    //var pageUrl = 'http://www.flickr.com/photos/' + userId + '/' + im.id;
    var pageUrl = 'http://www.flickr.com/photos/' + userUrl + '/' + im.id + '/in/set-' + setId;
    

    var strEl = '<a href="' + pageUrl + '" id="I'+im.id+'">'
              + '<img src="'+im.url+postfix+'.jpg" alt="'+im.title+'" />'
              + '</a>';
    return strEl;
} // getThumb

function getThumbStr(im) {
    var strEl = '<li><a href="#" id="'+im.id+'">'
              + '<img src="'+im.thumb+'" alt="'+im.title+'" width="75" height="75" />'
              + '</a></li>';
    return strEl;
} // getThumb

function getImgObj(p) {
    var url = 'http://farm' + p.farm + '.static.flickr.com/'
            + p.server + '/' + p.id + '_' + p.secret;            
    
    var thumb = url + '_s.jpg';
    var title = p.title;

    var im = {
        id      : p.id,
        url     : url,
        thumb   : thumb,
        title   : title
    };
    return im;
} // getImgObj



function updateNavigation() {

    $container = $("#container");

    var width = $container.children('li').length * 76;
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