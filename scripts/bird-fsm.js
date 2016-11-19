$(document).ready(function(){
	//create a new state machine
	var bird = new machina.Fsm({
        namespace: "bird",
		//any local variables and functions you'd like for your state machine
        initialize: function (){
            _keyspressed = {
                'left':false, //a key
                'right':false //d key
           };
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
                _onEnter: function() {
                    //switch to standing animation (if there is one)
                },
				keydownleft: function() {
                    this.transition("shufflingLeft");
                },
				keydownright: function() {
                    this.transition("shufflingRight");
                }
			},
			shufflingLeft: {
				_onEnter: function () {
					//start animation
                    //use jquery animate for moving div, and css animation for sprite loops?
					//after one cycle is complete, check if key is up
					//if it is, pass the keyup action you've defined
                    startShuffling($circle, "left");
				},
                keydownright: function() {
                    //instead of switching directly, emit event and add to queue?
                    //this.clearQueue();
                    this.deferAndTransition("standing");
                },
                keyupleft: function() {
                    console.log("kepupleft");
                    //this.clearQueue();
                    if (_keyspressed.right) {
                        this.handle("keydownright");
                    } else {
                        this.transition("standing");
                    }
                },
                _onExit: function (){
                    stopShuffling($circle, "left");
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
                    startShuffling($circle, "right")
                },
                keydownleft: function() {
                    //this.clearQueue();
                    this.deferAndTransition("standing");
                },
                keyupright: function() {
                    //this.clearQueue();
                    if (_keyspressed.left) {
                        this.handle("keydownleft");
                    } else {
                        this.transition("standing");
                    }
                },
                _onExit: function (){
                    stopShuffling($circle, "right");
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
	$(document).keydown(function(e) {
		e.preventDefault(); 
        switch(e.which) {
            //controls for animation
            
            case 65: // a (left)
            //this is where we'd like our bird to shuffle left only if he's standing
            bird.leftdown();
            
            break;
            case 68: // d (right)
            //this is where we'd like our bird to shuffle right only if he's standing
            bird.rightdown();
            break;

            default: return; 
        }
    
	});
	$(document).keyup(function(e) {
		e.preventDefault(); 
        switch(e.which) {
            //controls for animation

            case 65: // a (left)
            //user releases the left key
            //bird should complete current cycle of animation, then go to standing
            bird.leftup();
            break;
            case 68: // d (right)
            //user releases the right key
            //bird should complete current cycle of animation, then go to standing
            bird.rightup();
            break;

            default: return; 
        }
	});

	console.log("starting state is " + bird.state);

	bird.on("transition", function (data){
        console.log(data.toState);
	});


	var $circle = $("#bird"),
			path = document.getElementById("powerline"),
  		//get length of powerline
  		pathLength = path.getTotalLength();

  //given x, find y
    function newton(x, path) {
        //use newtons method
        //pick a starting point
        //try halfway between x value and total length
        //since length(x) >= x
        var scale = $(path).parent('svg').width()/path.getBBox().width;
         x /= scale;
        var start = x,
            end = path.getTotalLength(),
            testlength,
            testpoint;

        //recursive ish part
        //edge cases: at end of path, at start of path
        while(true) {
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
        return testpoint.y*scale;
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
        var newposition = {};
        newposition.x = x;
        //console.log("x is: " + x);
        if (direction==="left") {
          //new x value
          newposition.x -= step;
          //new y value
        } else if (direction==="right") {
          //new x value
          newposition.x += step;
          
        } else {
          //else throw error?d
          //add one in later
          console.log("error!");
          return;
        }
        newposition.y = newton(newposition.x, path);
        //newposition.x += $(path).parent('svg').offset().left;
        //newposition.y += $(path).parent('svg').offset().top;
        return newposition;
    }

    //start the shuffling animation in the specified direction
    function startShuffling($thing, direction){
        $thing.off("webkitAnimationIteration");
        //get next position on curve
        var position = shuffle($thing.offset().left+ 0.5*$thing.width(), 0.5*$thing.width(), path, direction);
        //set the css variables
        console.log(position.x - ($thing.offset().left+ 0.5*$thing.width()));
        console.log(($thing.offset().top+0.9*$thing.width()-$('#line').offset().top) - position.y);
        var angle, opposite, adjacent;
        opposite = position.y - ($thing.offset().top+0.9*$thing.width()-$('#line').offset().top);
        adjacent = position.x - ($thing.offset().left+ 0.5*$thing.width());
        angle = Math.floor(Math.atan(opposite/adjacent)/Math.PI*180);
        console.log(angle);
        $thing.css('transform','rotate(' + angle + 'deg)');
        console.log("position.y: "+ position.y);
        console.log("offset: "+ ($thing.offset().top+0.9*$thing.width()-$('#line').offset().top));
        document.documentElement.style.setProperty('--position-x', position.x-0.5*$thing.width())
        document.documentElement.style.setProperty('--position-y', position.y - 0.9*$thing.width())
        //start the animation
        $thing.css('animation-play-state','running');
        $thing.on("webkitAnimationIteration", function(e) {
            var animName = e.originalEvent.animationName;
            if (animName === "move") {
               $thing.css({'top': position.y -0.9*$thing.width(), 'left':position.x-0.5*$thing.width()}); 
            }
            position = shuffle($thing.offset().left+0.5*$thing.width(), 0.5*$thing.width(), path, direction);
            //set the css variables
            document.documentElement.style.setProperty('--position-x', position.x-0.5*$thing.width());
            document.documentElement.style.setProperty('--position-y', position.y - 0.9*$thing.width());
        });
    }

    function stopShuffling($thing, position){
        $thing.on("webkitAnimationIteration", function(e) {
            var animName = e.originalEvent.animationName;
            if (animName === "move") {
               $thing.css({'top': position.y - 0.9*$thing.width(), 'left':position.x-0.5*$thing.width()});  
            }
            //calls at start of iteration (except first one, kind of like fence post issue)
            $thing.css('animation-play-state','paused');
        });
    }

	/* --------------------------------------------
			     position main nav links on wire
	--------------------------------------------- */
	//get links containers
	var $mainNavLi = $('.main-nav li');
	$mainNavLi.each(function(){
		$(this).css('top',newton($(this).offset().left, path) - $(window).width()/100);
	});
    // $circle.on("webkitAnimationIteration", function() {
    //     //calls at start of iteration (except first one, kind of like fence post issue)
    //     console.log("iterated");
    // });
});