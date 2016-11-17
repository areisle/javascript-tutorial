$(document).ready(function(){
    //set height of main element
    //not currently using this, might get rid of later
    var maxHeight = -1;
   $('section').each(function() {
     maxHeight = maxHeight > $(this).height() ? maxHeight : $(this).height();
   });
    $('main').css('height', maxHeight);

    //initialize to starting section
    var sections = {'overview':0,'html':1,'scss':2,'js':3},
        angles = {'overview':0, 'html':90, 'scss':180, 'js':270},
        keys = ['overview','html','scss','js'];

    function navigate(origin, destination) {
        var diff,
            angle = 0;
        //rotate here?
        diff = sections[destination]-sections[origin];
        console.log((sections[destination]-sections[origin]));
        // if differences is -, -1 or 3 rotate -90, -2 or 2, rotate 180, -3 or 1 rotate 90, 0 rotate 0
        //instead of retrieving the angle, just change depending on what number is
        //overview --starts at 0deg, html 90deg, scss 180deg, js -90deg
        //current rotation will be sections.current * 90 mod 360
        //new angle will be: (previous angle + new angle )%360
        if (diff!=0) {
            $('section').removeClass('last');
            $('section.' + origin).addClass('last');
        }
        
        if (diff === 0) {
            //dont rotate
            console.log("don't rotate");
        } else if (diff===-1 || diff===3) {
            //rotate -90 deg
            console.log("rotate 270deg");
            angle +=90;
            //$('section').css('transform','translate(-50%, 0) rotateY(' + 90deg))
        } else if (diff===1 || diff===-3) {
            //rotate 90 deg
            console.log("rotate 90deg");
            angle -=90;
        } else if (Math.abs(diff)===2) {
            //rotate 180 deg
            console.log("rotate 180deg");
            angle +=180;
        } else {
            //throw error: you forgot a case
            console.log("ERRORS!");
        }
        //previous angle
        for (var theta in angles) {
            angles[theta] += angle;
            //figure out edges cases later so that this number doesgrow infintely
            //angles[theta] %= 360;
            $('#' + theta).css('transform', 'translate(-50%, 0) rotateY(' + angles[theta] + 'deg)' );
        }
        console.log(angles);
        //remove active class from last one and add to current
        //last one
        //return id (no hash!)
        $('section.active').toggleClass('active');
        
        //current one
        $('section.' + destination).toggleClass('active');
        console.log("link clicked: " + destination);
        console.log("current page: " + $('section.active').attr('class'));
    }
    //events for clicking links
    $('nav.main-nav a').on('click', function(e){
        e.preventDefault();
        //get where rotating from and to
        var origin = $('section.active').attr('id'),
            destination = $(this).attr('href').substring(1);
        navigate(origin, destination);
    });
    //link to navigate to start of sections
    $('.wrapper > a').on('click', function (e){
        e.preventDefault();
        //$('body').animate({scrollTop: $('main').offset().top - $(window).height()/5}, 1000);
        $('body').animate({scrollTop: $('#line').offset().top}, 500);
    });
    //events for arrow keys
    $(document).keydown(function(e) {
        var origin = $('section.active').attr('id');
        switch(e.which) {
            case 37: // left
            //switch to previous page
            destination = keys[(sections[origin] -1 + 4)%4];
            console.log(destination);
            navigate(origin,destination);
            break;

            case 38: // up
            break;

            case 39: // right
            //switch to next page
            destination = keys[(sections[origin] +1 + 4)%4];
            console.log(destination);
            navigate(origin,destination);
            break;

            case 40: // down
            break;
            default: return; // exit this handler for other keys
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });



    /* ------ POWERLINE -------*/
    //get coordinates of powerline position, and well and direction of next coordinate?
    //no idea how to do this
});