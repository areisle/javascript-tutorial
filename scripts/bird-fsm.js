/*global $, console, machina*/
//given x, find y of given curve
function newton(x, path) {
    //pick a starting point
    //try halfway between x value and total length
    //since length(x) >= x
    "use strict";
    var scale = $(path).parent('svg').width() / path.getBBox().width,
        end,
        start,
        testlength,
        testpoint;
    x /= scale;
    start = x;
    end = path.getTotalLength();

    //algorithm part
    //edge cases: at end of path, at start of path
    while (true) {
      //try middle of current bounding region
        testlength = Math.floor((start + end) / 2);
        testpoint = path.getPointAtLength(testlength);
        if (testlength === end || testlength === start) {
            break;
        } else if (testpoint.x > x) {
            //guess was too high
            end = testlength;
        } else if (testpoint.x < x) {
            //guess was too low
            start = testlength;
        } else {
            //guess is correct
            break;
        }
    }
    return testpoint.y * scale;
}

//get position to shuffle to
function shuffle(x, step, path, direction) {
    //move set distance (step) in specified direction
    //parameters:
    //x: current x position
    //step: distance to shift
    //path: curve to move along
    //direction: which way to move along curve
    //returns: 
    //{x,y}: new position on curve
    "use strict";
    var newposition = {};
    newposition.x = x;
    //console.log("x is: " + x);
    if (direction === "left") {
        //new x value
        newposition.x -= step;
        //new y value
    } else if (direction === "right") {
        //new x value
        newposition.x += step;

    } else {
        //else throw error? 
        //add one in later
        console.log("error!");
        return;
    }
    newposition.y = newton(newposition.x, path);
    return newposition;
}

//start the shuffling animation in the specified direction
function startShuffling($thing, direction, path, $birdBefore) {
    "use strict";
    $thing.off("webkitAnimationIteration");
    $birdBefore.off("webkitAnimationIteration");
    //get next position on curve
    var position = shuffle($thing.offset().left + 0.5 * $thing.width(), 0.5 * $thing.width(), path, direction),
        angle,
        opposite,
        adjacent;
    //find the slope of the curve at the birds current position
    opposite = newton($thing.offset().left, path) - newton($thing.offset().left + $thing.width(), path);
    adjacent = $thing.width();
    angle = -1 * Math.atan(opposite / adjacent) / Math.PI * 180;
    //set the css variables
    document.documentElement.style.setProperty('--position-x', position.x - 0.5 * $thing.width());
    document.documentElement.style.setProperty('--position-y', position.y - 0.9 * $thing.width());
    document.documentElement.style.setProperty('--angle', angle + 'deg');
    //start the animations
    $thing.css('animation-play-state', 'running');
    $birdBefore.css('animation-play-state', 'running');
    //get and set next animation end points after an iteration
    $thing.on("webkitAnimationIteration", function (e) {
        var animName = e.originalEvent.animationName;
        if (animName === "move") {
            $thing.css({'top': position.y - 0.9 * $thing.width(), 'left': position.x - 0.5 * $thing.width()});
        }
        //sets angle of bird
        opposite = newton($thing.offset().left, path) - newton($thing.offset().left + $thing.width(), path);
        adjacent = $thing.width();
        angle = -1 * Math.atan(opposite / adjacent) / Math.PI * 180;
        position = shuffle($thing.offset().left + 0.5 * $thing.width(), 0.5 * $thing.width(), path, direction);
        //set the css variables
        document.documentElement.style.setProperty('--position-x', position.x - 0.5 * $thing.width());
        document.documentElement.style.setProperty('--position-y', position.y - 0.9 * $thing.width());
        document.documentElement.style.setProperty('--angle', angle + 'deg');
    });
}

//turns off the animations after they've completed their current iteration
function stopShuffling($thing, position, $birdBefore) {
    //calls at start of iteration (except first one, kind of like fence post issue)
    "use strict";
    $thing.on("webkitAnimationIteration", function (e) {
        var animName = e.originalEvent.animationName;
        if (animName === "move") {
            $thing.css({'top': position.y - 0.9 * $thing.width(), 'left': position.x - 0.5 * $thing.width()});
        }
        $thing.css('animation-play-state', 'paused');
    });
    $birdBefore.on("webkitAnimationIteration", function (e) {
        $birdBefore.css('animation-play-state', 'paused');
    });
}

$(document).ready(function () {
    "use strict";
    var $bird = $("#bird"),
        $birdBefore = $('#bird div'),
        path = document.getElementById("powerline"),
        bird,
        $mainNavLi,
        _keyspressed;
    
	//create a new state machine
	bird = new machina.Fsm({
        namespace: "bird",
		//any local variables and functions you'd like for your state machine
        initialize: function () {
            _keyspressed = {
                'left': false, //a key
                'right': false //d key
            };
            var initialPosition = newton($(window).width() * 0.8, path);
            $bird.css({'top': (initialPosition - 0.9 * $bird.width()) + 'px', 'left': ($(window).width() * 0.8 - 0.5 * $bird.width()) + 'px'});
            //console.log($bird.css('left'));
            //this is also where I think i'll set up my event listeners for the animations
            //also, initialize play-state
        },
        //this tells the state machine which state to start in
		initialState: "standing",
		//this is where you include all the different states you like to have
		//in this example, this will be the different actions the bird will be doing
		//standing, shuffling left, and shuffling right
		states: {
			//inside each state, you give it which inputs it will handle, and how
			//the inputs for this example will be the arrow keys (well, actually, aswd)
			//machina also has builtin events for states you can use
			// _onEnter ---- lets you define actions to take upon entering a state
			//_onExit   ---- lets you define actions to take upen exiting a state
			standing: {
				//this state will react to both left and right keydown
                _onEnter: function () {
                    //switch to standing animation (if there is one)
                },
				keydownleft: function () {
                    this.transition("shufflingLeft");
                },
				keydownright: function () {
                    this.transition("shufflingRight");
                }
			},
			shufflingLeft: {
				_onEnter: function () {
					//start animation
                    //use jquery animate for moving div, and css animation for sprite loops?
					//after one cycle is complete, check if key is up
					//if it is, pass the keyup action you've defined
                    startShuffling($bird, "left", path, $birdBefore);
				},
                keydownright: function () {
                    //instead of switching directly, emit event and add to queue?
                    this.deferAndTransition("standing");
                },
                keyupleft: function () {
                    console.log("kepupleft");
                    if (_keyspressed.right) {
                        this.handle("keydownright");
                    } else {
                        this.transition("standing");
                    }
                },
                _onExit: function () {
                    stopShuffling($bird, "left", $birdBefore);
                }
			},
            shuffleLeftInterrupt: {

            },
			shufflingRight: {
				_onEnter: function () {
                    //start animation
                    //use jquery animate for moving div, and css animation for sprite loops?
                    //after one cycle is complete, check if key is up
                    //if it is, pass the keyup action you've defined
                    startShuffling($bird, "right", path, $birdBefore);
                },
                keydownleft: function () {
                    //this.clearQueue();
                    this.deferAndTransition("standing");
                },
                keyupright: function () {
                    //this.clearQueue();
                    if (_keyspressed.left) {
                        this.handle("keydownleft");
                    } else {
                        this.transition("standing");
                    }
                },
                _onExit: function () {
                    stopShuffling($bird, "right", $birdBefore);
                }
			}
		},
		//wrappers to make calls prettier
		leftdown: function () {
			if (!_keyspressed.left) {
                _keyspressed.left = true;
                this.handle("keydownleft");
            }
		},
        leftup: function () {
            if (_keyspressed.left) {
                _keyspressed.left = false;
                this.handle("keyupleft");
            }
        },
		rightdown: function () {
			if (!_keyspressed.right) {
                _keyspressed.right = true;
                this.handle("keydownright");
            }
		},
        rightup: function () {
            if (_keyspressed.right) {
                _keyspressed.right = false;
                this.handle("keyupright");
            }
        }
	});
    
	//once the state machine is set up, here's where we'll be using it
	$(document).keydown(function (e) {
		e.preventDefault();
        switch (e.which) {
            //controls for animation
            
        case 65: // a (left)
            //this is where we'd like our bird to shuffle left
            bird.leftdown();
            
            break;
        case 68: // d (right)
            //this is where we'd like our bird to shuffle right
            bird.rightdown();
            break;

        default:
            return;
        }
    
	});
	$(document).keyup(function (e) {
		e.preventDefault();
        switch (e.which) {
            //controls for animation

        case 65: // a (left)
            //user releases the left key
            //bird should complete current cycle of animation, 
            //then go to standing then right if right key is down
            bird.leftup();
            break;
        case 68: // d (right)
            //user releases the right key
            //bird should complete current cycle of animation, 
            //then go to standing then left if left key is down
            bird.rightup();
            break;

        default:
            return;
        }
	});

    
	/* --------------------------------------------
			     position main nav links on wire
	--------------------------------------------- */
	//get links containers
	$mainNavLi = $('.main-nav li');
	$mainNavLi.each(function () {
		$(this).css('top', newton($(this).offset().left, path) - $(window).width() / 100);
	});
    $(window).on('resize', function () {
        //get links containers
        path = document.getElementById("powerline");
        $mainNavLi.each(function () {
            $(this).css('top', newton($(this).offset().left, path) - $(window).width() / 100);
        });
        $bird.css('top', newton($bird.offset().left, path) - $(window).width() / 100 - $bird.height() * 0.8);
    });
});