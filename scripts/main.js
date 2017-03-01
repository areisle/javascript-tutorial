/*global $, console*/

function navigate(origin, destination, angles, sections) {
    "use strict";
    var diff,
        angle = 0,
        theta;
    //rotate here?
    diff = sections[destination] - sections[origin];
    // if differences is -, -1 or 3 rotate -90, -2 or 2, rotate 180, -3 or 1 rotate 90, 0 rotate 0
    //instead of retrieving the angle, just change depending on what number is
    //overview --starts at 0deg, html 90deg, scss 180deg, js -90deg
    //current rotation will be sections.current * 90 mod 360
    //new angle will be: (previous angle + new angle )%360
    if (diff !== 0) {
        $('section').removeClass('last');
        $('section.' + origin).addClass('last');
    }

    if (diff === 0) {
        //dont rotate
        console.log("temp");
    } else if (diff === -1 || diff === 3) {
        //rotate -90 deg
        angle += 90;
    } else if (diff === 1 || diff === -3) {
        //rotate 90 deg
        angle -= 90;
    } else if (Math.abs(diff) === 2) {
        //rotate 180 deg
        angle += 180;
    } else {
        //throw error: you forgot a case
        console.log("ERRORS!");
    }
    //previous angle
    for (theta in angles) {
        angles[theta] += angle;
        //figure out edges cases later so that this number doesgrow infintely
        $('#' + theta).css('transform', 'translate(-50%, 0) rotateY(' + angles[theta] + 'deg)');
    }
    //remove active class from last one and add to current
    //last one
    $('section.active').toggleClass('active');

    //current one
    $('section.' + destination).toggleClass('active');
}

function copyToClipboard(elementId) {
    
    "use strict";
    // Create a "hidden" input
    var aux = document.createElement("input");

    // Assign it the value of the specified element
    aux.setAttribute("value", document.getElementById(elementId).innerText);

    // Append it to the body
    document.body.appendChild(aux);

    // Highlight its content
    aux.select();

    // Copy the highlighted text
    document.execCommand("copy");

    // Remove it from the body
    document.body.removeChild(aux);

}
 
$(document).ready(function () {
    "use strict";

    //initialize to starting section
    var sections = {'overview': 0, 'html': 1, 'scss': 2, 'js': 3},
        angles = {'overview': 0, 'html': 90, 'scss': 180, 'js': 270},
        keys = ['overview', 'html', 'scss', 'js'];

    
    //events for clicking links
    $('nav.main-nav a').on('click', function (e) {
        e.preventDefault();
        //get where rotating from and to
        console.log("testing");
        var origin = $('section.active').attr('id'),
            destination = $(this).attr('href').substring(1);
        navigate(origin, destination, angles, sections);
        if ($('html').scrollTop() < $('.main-nav').offset().top) {
            $('html').animate({scrollTop: $('.main-nav').offset().top}, 500);
        }
    });
    //link to navigate to start of sections
    $('.wrapper > span > a').on('click', function (e) {
        e.preventDefault();
        console.log("clicked link");
        $('html').animate({scrollTop: $('.main-nav').offset().top}, 500);
    });
    $('section > span > a:first-of-type').on('click', function (e) {
        e.preventDefault();
        $('html').animate({scrollTop: 0}, 500);
    });
    //events for arrow keys
    $(document).keydown(function (e) {
        var origin = $('section.active').attr('id'),
            destination;
        switch (e.which) {
        case 37: // left
            //switch to previous page
            destination = keys[(sections[origin] - 1 + 4) % 4];
            navigate(origin, destination, angles, sections);
            break;

        case 38: // up
            break;

        case 39: // right
            //switch to next page
            destination = keys[(sections[origin] + 1 + 4) % 4];
            navigate(origin, destination, angles, sections);
            break;

        case 40: // down
            break;
        default:
            return; // exit this handler for other keys
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });

});
