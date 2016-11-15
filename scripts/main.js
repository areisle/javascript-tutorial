$(document).ready(function(){
    //set height of main element
    var maxHeight = -1;
   $('section').each(function() {
     maxHeight = maxHeight > $(this).height() ? maxHeight : $(this).height();
   });
    $('main').css('height', maxHeight);
    //initialize to starting section
    var previousHref = '#overview';
    //will need to have a flag for current/last page, and the new page
    //just have all positioned on a cube relative to each other and rotate all and change opacity
    //get links working
    //give active class to current window
    $('nav.main-nav a').on('click', function(e){
        e.preventDefault();
        var lastHref = $('section.active').attr('id');
        //get href
        href = $(this).attr('href');
        //remove active class from last one and add to current
        //last one
        $('section.active').removeClass('active');
        //current one
        $(this).addClass('active');
    });
});