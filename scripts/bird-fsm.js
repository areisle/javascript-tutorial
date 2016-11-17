$(document).ready(function(){
	//create a new state machine
	var bird = new machina.Fsm({
		//this tells the state machine which state to start in
		//
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
				keydownleft: "shufflingLeft",
				keydownright: "shufflingRight"
			},
			shufflingLeft: {
				//this state will react to left keyup
				_onEnter: function () {
					//start animation
					//after one cycle is complete, check if key is up
					//if it is, pass the keyup action you've defined
					//this.handle("release");
				},
				release: "standing"

			},
			shufflingRight: {
				//this state will react to right keyup
				_onEnter: function () {
					//start animation
					//after one cycle is complete, check if key is up
					//if it is, pass the keyup action you've defined
					//this.handle("release");
				},
				release: "standing"

			}
		},
		//wrappers to make calls prettier
		left: function () {
			this.handle("keydownleft");
		},
		right: function () {
			this.handle("keydownright");
		},
		stop: function () {
            console.log();
			this.handle("release");
		}
	});
	//once the state machine is set up, here's where we'll be using it
	$(document).keydown(function(e) {
		e.preventDefault(); 
    switch(e.which) {
        //controls for animation
        
        case 65: // a (left)
        //this is where we'd like our bird to shuffle left only if he's standing
        bird.left();
        break;
        case 68: // d (right)
        //this is where we'd like our bird to shuffle right only if he's standing
        bird.right();
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
        bird.stop();
        break;
        case 68: // d (right)
        //user releases the right key
        //bird should complete current cycle of animation, then go to standing
        bird.stop();
        break;

        default: return; 
    }
    
	});
	console.log("starting state is " + bird.state);

	bird.on("transition", function (data){
    console.log("current state is " + data.toState);
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
    console.log("x is: " + x);
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

  $(document).on("keydown", function(e) {
    e.preventDefault(); 
    switch(e.which) {
        //controls for animation
        
        case 65: // a (left)
        //this is where we'd like our bird to shuffle left only if he's standing
        console.log("pressed left");
        position = shuffle($circle.offset().left, $circle.width(), path, "left");
        $circle.css({'left': position.x + "px", 'top': position.y + "px"});
        break;
        case 68: // d (right)
        //this is where we'd like our bird to shuffle right only if he's standing
        position = shuffle($circle.offset().left, $circle.width(), path, "right");
        $circle.css({'left': position.x + "px", 'top': position.y + "px"})
        break;

        default: return; 
    }
    
	});


	/* --------------------------------------------
			     position main nav links on wire
	--------------------------------------------- */
	//get links containers
	var $mainNavLi = $('.main-nav li');
	$mainNavLi.each(function(){

		$(this).css('top',newton($(this).offset().left, path));
	});
});