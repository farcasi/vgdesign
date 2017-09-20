// This script starts a game
// Based on the code provided by Dr. Cline
//
// Currently only partially works on mobile due to autoplay being disabled.
// Future work would include creating something like a title screen to enable
// user interaction to start the game (and therefore sounds).


var canvas;
var drawing;
var gameState;

var framesPerSecond = 60;
var terminalVelocity = 60;
var credits = [
	["Inspiration", "The Impossible Game"],
	["Images", "Kenney (www.kenney.nl)"],
	["Music", "Spy Hunter by Pascal Tatipata"],
	["Sounds", "Game Audio (freesound.org)"],
	["", "pacdv.com"],
];
var debugInfo = [];
var debugMode = false;
var imageSources = {
	slime:"images/slimeGreen.png",
	slimeWalk:"images/slimeGreen_walk.png",
	slimeLeft:"images/slimeGreen_left.png",
	slimeWalkLeft:"images/slimeGreen_walk_left.png",
	slimeDead:"images/slimeGreen_dead.png",
	block:"images/grassBlock.png",
	spinner:"images/spinnerHalf.png",
	spinnerSpin:"images/spinnerHalf_spin.png",
	alien:"images/alienGreen_stand.png",
	alienHurt:"images/alienGreen_hurt.png",
	grass:"images/grass.png",
};
var musicSources = {
	// Spy Hunter
	// 144 bpm = 2.4 bps, or 25 frames per beat at 60fps
	// 4 beats per measure
	outdoors:"music/Spy Hunter.mp3", 
}
var soundSources = {
	death:"sound/deny.wav",
	hurt:"sound/uh.wav",
}
//-------------------------------------------------------------------
// functions to change the game state
//-------------------------------------------------------------------

/// Adds sprites to the game in their initial positions
/// and calls setGameStart()
var initializeGameState = function () 
{	
	gameState = {};
	gameState.blockSize = 70; // todo: change this when you can get image dimensions
	gameState.floor = canvas.height - 70;
	
	gameState.gameOver = function () {
		return gameState.won || gameState.lost;
	}
	gameState.paused = false;
	
	// audio
	gameState.outdoorMusic = new Audio(musicSources.outdoors);
	gameState.outdoorMusic.addEventListener('ended', function() {
		this.currentTime = 0;
		this.play();
	}, false);
	gameState.framesPerBeat = 25;
	gameState.beatsPerMeasure = 4;
	
	gameState.deathSound = new Audio(soundSources.death);
	gameState.hurtSound = new Audio(soundSources.hurt);
	
	// player
	gameState.slimeSource = makeSprite([imageSources.slime, imageSources.slimeWalk], 0, 0, 0, framesPerSecond/2);
	gameState.slimeLeftSource = makeSprite([imageSources.slimeLeft, imageSources.slimeWalkLeft], 0, 0, 0, framesPerSecond/2);
	gameState.slimeDead = makeSprite([imageSources.slimeDead]);
	
	// floor
	gameState.ground = [];
	for (var i=0; i < 100; i++) {
		var grass = makeSprite([imageSources.grass], i * gameState.blockSize, gameState.floor);
		
		gameState.ground.push(grass);
		
		if (i == 3) {
			gameState.startingBlock = grass;
			gameState.currentGround = grass;
		}
	}
	
	// populate the map
	var start = gameState.startingBlock.x;
	var tiles = gameState.blockSize;
	var bpm = gameState.beatsPerMeasure;
	var floor = gameState.floor;
	
	// blocks and enemies
	// note that slime jumps 3 tiles horizontally, 2 vertically
	gameState.blocks = [];
	gameState.enemies = [];
	
	gameState.blocks.push(makeSprite([imageSources.block], 
		2 * bpm * tiles + start, 1 * tiles * -1 + floor));
	
	gameState.enemies.push(makeSprite(
		[imageSources.spinner, imageSources.spinnerSpin],
		3 * bpm * tiles + start, floor - 31, 3, framesPerSecond/8));
	
	var pitStart = 4 * bpm + 3;
	for (var i = pitStart; i < pitStart + 3; i++) {
		gameState.ground[i].tangible = false;
		gameState.ground[i].visible = false;
	}
	
	gameState.blocks.push(makeSprite([imageSources.block], 
		6 * bpm * tiles + start, 1 * tiles * -1 + floor));
	gameState.blocks.push(makeSprite([imageSources.block], 
		6 * bpm * tiles + start, 2 * tiles * -1 + floor));
	
	// goal
	var alienX = 8 * bpm * tiles + start;
	var alienY = floor - 92;
	gameState.alienSource = makeSprite([imageSources.alien], alienX, alienY, 10);
	gameState.alienHurt = makeSprite([imageSources.alienHurt], alienX, alienY);
	
	setGameStateStart();
}

/// Sets the gameState to a new game
var setGameStateStart = function ()
{
	// reset initial variables
	gameState.won = false;
	gameState.lost = false;
	gameState.paused = false;
	gameState.lostGameCounter = framesPerSecond/2;
	gameState.jumpInput = false;
	gameState.wonGameReset = false;
	
	// reset slime
	gameState.slime = gameState.slimeSource;
	gameState.slime.x = gameState.startingBlock.x;
	gameState.slime.y = gameState.startingBlock.y - gameState.slime.height();
	gameState.slime.border = 3;
	gameState.slime.tangible = true;
	
	// we want to move approximately 2 blocks per beat
	// i.e. (blockSize * 2) / framesPerBeat
	gameState.slime.vx = gameState.blockSize * 2 / gameState.framesPerBeat;
	
	// reset alien
	gameState.alien = gameState.alienSource;
	gameState.alien.tangible = true;
	gameState.enemies.forEach(function (sprite) {
		sprite.tangible = true;
	});
	
	// reset audio
	if (gameState.bgm !== undefined) {
		gameState.bgm.pause();
		gameState.bgm.currentTime = 0;
	}
	
	gameState.bgm = gameState.outdoorMusic;
	gameState.bgm.currentTime = 0;
	if (gameState.bgm.paused) {
		gameState.bgm.play();
	}
}

/// Sets the gameState to a game the player lost.
/// Freezes the slime in place and replaces its image.
var setGameStateLost = function () 
{
	gameState.lost = true;
	
	// replace slime image with dead slime
	// and make the center of dead slime the same as slime
	var s = gameState.slime;
	var sd = gameState.slimeDead;
	
	sd.x = Math.floor(s.centerX() - sd.width()/2);
	sd.y = s.bottom() - sd.height();
	
	gameState.slime = sd;
	
	// play death sound effect
	gameState.bgm.pause();
	gameState.deathSound.play();
}

/// Sets the gameState to a game the player won.
/// Freezes the slime in place
var setGameStateWon = function () 
{
	gameState.won = true;
	
	// replace alien image with hurt alien
	gameState.alien = gameState.alienHurt;
	
	// play alien hurt sound
	gameState.bgm.pause();
	gameState.hurtSound.play();
	
	// stop slime movement
	gameState.slime.vx = 0;
	gameState.slime.vy = 0;
	
	// make everything except floors intangible
	gameState.alien.tangible = false;
	gameState.enemies.forEach(function (sprite) {
		sprite.tangible = false;
	});
}

//-------------------------------------------------------------------
// functions to work with sprites
//-------------------------------------------------------------------

/// Creates an image tag with the given source
/// @return the tag
var createImage = function (imageSrc) 
{
	var myImage = new Image();
	myImage.src = imageSrc;
	myImage.style = "display:none;";
	myImage.alt = "Please enable javascript to see this image";
	
	return myImage;
}

/// Creates an array of Image() objects from an array of image paths
var createImageArray = function (imageSourceArray) 
{
	var imageArray = [];
	imageSourceArray.forEach(function (src) {
		imageArray.push(createImage(src));
	});
	
	return imageArray;
}

/// Define a sprite object with sprite-specific functions 
var sprite = function (imageSourceArray, x = 0, y = 0, border = 0.0, imageChangeRate = 0, vx = 0.0, vy = 0.0)
{
	if (imageSourceArray === undefined || imageSourceArray.length < 1) {
		// invalid constructor call
		return;
	}
	
	this.x = x;
	this.y = y;
	this.vx = vx;
	this.vy = vy;
	this.border = border;
	this.isGrounded = true;
	this.tangible = true;
	this.visible = true;
	this.gravity = 0.4;
	this.jumpForce = 12.5 * this.gravity; // at 25 f/b, we need jumpForce = 12.5 * gravity 
										  // for our jumps and landing to stay on-beat
	this.currentImage = 0;
	this.imageArray = createImageArray(imageSourceArray);
	this.numImages = imageSourceArray.length;
	this.imageChangeRate = imageChangeRate;
	this.imageChangeCounter = 0;
	
	/// @return width of the sprite's image
	this.width = function () {
		return this.imageArray[this.currentImage].width;
	}
	
	/// @return height of the sprite's image
	this.height = function () {
		return this.imageArray[this.currentImage].height;
	}
	
	/// @return the center x-coordinate of the sprite's image
	this.centerX = function () {
		return this.x + this.width()/2
	}
	
	/// @return the y-coordinate of the bottom of the sprite's image
	this.bottom = function () {
		return this.y + this.height();
	}
	
	/// Gets the sprite image to display on the next frame
	this.getNextAnimation = function () {
		if (this.imageChangeRate > 0 &&
			gameState.gameOver() == false &&
			gameState.paused == false) {
			// Update image counter
			this.imageChangeCounter = (this.imageChangeCounter + 1) % this.imageChangeRate;
			
			// after imageChangeRate checks, return the next image
			if (this.imageChangeCounter < 1)
			{
				this.setNextAnimation();
			}
		}
		
		return this.imageArray[this.currentImage];
	}
	
	/// Changes sprite image to the next image in its image array
	this.setNextAnimation = function () {
		var oldw = this.width();
		var oldh = this.height();
		
		// change sprite image
		this.currentImage = (this.currentImage + 1) % this.numImages;
		
		// reposition the sprite around its center
		var dx = (oldw - this.width())/2;
		var dy = oldh - this.height();
		this.move(dx, dy);
	}
	
	/// Gets boundaries of the sprite for collision-detection
	/// @return an object with {xmin, xmax, ymin, ymax}
	this.getCollisionBounds = function () {
        var bounds = {};
		var border = this.border;
		bounds.xmin = this.x + border;
		bounds.ymin = this.y + border;
		bounds.xmax = this.x + this.width() - border;
		bounds.ymax = this.y + this.height() - border;
		
        return bounds;
    }
	
	/// Checks if sprite collides with the other sprite 
	/// @return true if the two sprites collide
	this.collidesWith = function (other) {
		if (this.tangible == false || other.tangible == false) {
			return false;
		}
		
        // get collision bounds for sprite and other
        var a = this.getCollisionBounds(); 
        var b = other.getCollisionBounds();
		
        // a is to the right or left of a
        if (b.xmin > a.xmax) return false;
        if (b.xmax < a.xmin) return false;

        // b is above or below a
        if (b.ymax < a.ymin) return false;
        if (b.ymin > a.ymax) return false;

        // The two sprites collide if a is not
        // left of, right of, above, or below b
        return true;
	}
	
	/// Checks if sprite on on a floor this.
	/// @return true if moving down would collide with the floor
	this.collidesWithFloor = function (floor) {
		var onFloor = false;
		
		this.move(0, this.border+1);
		if (this.collidesWith(floor)) {
			onFloor = true;
		}
		this.move(0, -(this.border+1));
		
		return onFloor;
	}
	
	/// Changes the sprite's x and y position based on its velocity
	this.moveSprite = function () {
		if (this.isGrounded) {
			this.vy = Math.min(this.vy, 0);
		}
		else {
			this.vy = Math.min(this.vy + this.gravity, terminalVelocity);
		}
		
		if (gameState.jumpInput && this.isGrounded) {
			this.vy = -2 * this.jumpForce;
			
			if (this.vy < 0) {
				this.isGrounded = false;
			}
		}
		
		this.move(this.vx, this.vy);
	}
	
	/// Moves the sprite by the given distance
	this.move = function (dx, dy) {
		this.x += Math.floor(dx);
		this.y += Math.floor(dy)
	}
	
	/// Replaces the properties of this sprite except its image
	/// with those of the other sprite
	this.copyPropertiesFrom = function (other) {
		this.x = other.x;
		this.y = other.y;
		this.vx = other.vx;
		this.vy = other.vy;
		this.border = other.border;
		this.isGrounded = other.isGrounded;
		this.tangible = other.tangible;
		this.jumpForce = other.jumpForce;
		this.gravity = other.gravity;
	}
}

/// Creates a sprite object with the given parameters
/// @return the sprite
var makeSprite = function (imageSrcArray, x = 0, y = 0, border = 0.0, imageChangeRate = 0, vx = 0.0, vy = 0.0)
{
	return new sprite(imageSrcArray, x, y, border, imageChangeRate, vx, vy);
}

/// Checks if the slime collided with anything and handles collisions
var checkCollisions = function () 
{
	var slime = gameState.slime;
	
	// first check if slime is at the goal
	checkGoalReached();
	if (gameState.gameOver()) return;
	
	// then for objects slime can stand on
	checkSlimeIsGrounded();
	
	// last check for things that could make the player lose
	var enemies = gameState.enemies;
	for (var i = 0; i < enemies.length; i++) {
		if (slime.collidesWith(enemies[i])) {
			setGameStateLost();
			return;
		}
	}
	checkSlimeHitWall();
	if (gameState.gameOver()) return;
	
	checkSlimeFellIntoAPit();
}

/// Checks if slime reached goal
var checkGoalReached = function () 
{
	var slime = gameState.slime;``
	var alien = gameState.alien;
	
	if (slime.collidesWith(alien)) {
		setGameStateWon();
		return;
	}
	
	// turn towards alien
	var b = alien.getCollisionBounds();
	if (slime.x - b.xmax > 0) {
		slime.vx *= -1;
		gameState.slimeLeftSource.copyPropertiesFrom(slime);
		gameState.slime = gameState.slimeLeftSource;
		slime = gameState.slime;
	}
	
	if (slime.x + slime.width < b.xmin) {
		slime.vx = Math.abs(slime.vx);
	}
}

/// Checks if slime is on the ground or a platform
var checkSlimeIsGrounded = function () 
{
	var slime = gameState.slime;
	
	// First check the last sprite slime was on.
	if (gameState.currentGround != null && 
		slime.collidesWithFloor(gameState.currentGround)) {
		return;
	} else {
		slime.isGrounded = false;
		gameState.currentGround = null;
	}
	
	// It's not on that sprite, so check the rest.
	checkSlimeIsOnSprites(gameState.ground);
	if (slime.isGrounded) return;
	
	checkSlimeIsOnSprites(gameState.blocks);
}

/// Checks if slime is on one of the objects in spriteArray
var checkSlimeIsOnSprites = function (spriteArray) 
{
	var slime = gameState.slime;
	
	for (var i = 0; i < spriteArray.length; i++) {
		if (slime.collidesWithFloor(spriteArray[i]) == true) 
		{
			slime.isGrounded = true;
			gameState.currentGround = spriteArray[i];
			
			// put slime directly on top of floor
			var difference = spriteArray[i].y - slime.bottom();
			slime.move(0, difference);
			return;
		}
	}
}

/// Checks if slime is on a block sprite.
/// This method may set gameState.lost to true.
var checkSlimeHitWall = function () 
{
	var slime = gameState.slime;
	
	var blocks = gameState.blocks;
	for (var i = 0; i < blocks.length; i++) {
		if (slime.collidesWith(blocks[i])) {
			setGameStateLost();
			return;
		}
	}
}

var checkSlimeFellIntoAPit = function ()
{	
	var slime = gameState.slime;
	
	if (slime.y > canvas.height) {
		setGameStateLost();
	}
}

//-------------------------------------------------------------------
// functions to work with the drawing
//-------------------------------------------------------------------

/// Adds the sprite to drawing
var drawSprite = function (s)
{
	if (s.visible) {
		drawing.drawImage(s.getNextAnimation(), s.x, s.y, s.width(), s.height());
	}
}

/// Redraws the canvas from drawing
var drawGame = function ()
{
	var w = canvas.width;
	var h = canvas.height;
	
	// Draw the background rectangle
	drawing.clearRect(0, 0, w, h);
	drawing.fillStyle = "#BBBBFF";  // light blue fill color
	drawing.fillRect(0,0,w,h);      // fill the canvas with light blue
	
	drawing.save();
	drawing.translate(w/4 - gameState.slime.centerX(), 0);
	if (gameState.slime.bottom() < gameState.floor) {
		drawing.translate(0, h - 70 - gameState.slime.bottom());
	}

	// Draw sprites
	gameState.enemies.forEach(drawSprite);
	gameState.ground.forEach(drawSprite);
	gameState.blocks.forEach(drawSprite);
	drawSprite(gameState.alien);
	drawSprite(gameState.slime);
	
	drawing.restore();

	if (gameState.gameOver() == false && gameState.paused) {
		drawing.font = "32px Garamond";
		drawing.fillStyle = "#ffffff";
		drawing.textAlign = "center";
		drawing.fillText("Paused", canvas.width/2, canvas.height/2 - 10);
	}
	
	// when game is over, roll credits
	if (gameState.won == true) {
		drawing.font = "72px Garamond";
		drawing.fillStyle = "#ffffff";
		drawing.textAlign = "center";
		drawing.fillText("YOU WIN!", canvas.width/2, canvas.height/2 - 72);
		
		drawing.font = "20px Garamond";
		drawing.textAlign = "left";
		var height = -10;
		credits.forEach(function (textArray) {
			drawing.fillText(textArray[0], 20, canvas.height/2 + height);
			drawing.fillText(textArray[1], canvas.width/3 + 70, canvas.height/2 + height);
			height += 30;
		});
	}
	
	// display debug info
	if (debugMode) {
		var i = 0;
		drawing.font = "12px Garamond";
		drawing.fillStyle = "#ffffff";
		debugInfo.forEach(function (messages) {
			drawing.textAlign = "right";
			drawing.fillText(messages[0], 95, 15 + 12 * i);
			drawing.textAlign = "left";
			drawing.fillText(messages[1], 100, 15 + 12 * i);
			i++;
		});
	}
	
	// draw a black border
	drawing.strokeRect(0,0,w,h);
}

//-------------------------------------------------------------------
// functions to work with timing and user input
//-------------------------------------------------------------------

/// The animate function gets called for each frame. It updates
/// the gameState variable and then calls drawGame.
var animateGame = function ()
{
	if (debugMode) {
		debugInfo.length = 0;
		debugInfo.push(["x:",gameState.slime.x]);
		debugInfo.push(["y:",gameState.slime.y]);
		debugInfo.push(["vx:",gameState.slime.vx]);
		debugInfo.push(["vx:",gameState.slime.vy]);
		debugInfo.push(["width:",gameState.slime.width()]);
		debugInfo.push(["height:",gameState.slime.height()]);
		debugInfo.push(["centerX:",gameState.slime.centerX()]);
		debugInfo.push(["bottom:",gameState.slime.bottom()]);
		debugInfo.push(["isGrounded:",gameState.slime.isGrounded]);
		debugInfo.push(["currentImage:",gameState.slime.currentImage]);
	}
	
	// Call animateGame again in about 1/60 of a second
	window.requestAnimationFrame(animateGame);
	
	// Draw the game
	drawGame();
	
	// continue until the game is over
	if (gameState.gameOver() == false) {
		if (gameState.paused == true) {
			// pause the game
			gameState.bgm.pause();
			return;
		} else if (gameState.bgm.paused) {
			gameState.bgm.play();
		}
		
		gameState.slime.moveSprite();
		checkCollisions();
	}
	
	if (gameState.gameOver() == true) {
		gameState.bgm.pause();
	}
	
	// if the player loses, countdown to reset
	if (gameState.lost == true) {
		gameState.lostGameCounter--;
		if (gameState.lostGameCounter < 0) {
			// restart the game
			setGameStateStart();
		}
	}
	
	// if the player won, but wants to reset
	if (gameState.won == true && gameState.wonGameReset == true) {
		setGameStateStart();
	}
}

/// Tells slime to jump when user presses any key 
/// Partial source: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
var onkeydown = function(event) {
	if (event.defaultPrevented) {
		return; // Should do nothing if the default action has been cancelled
	}

	var handled = false;
	if (event.keyCode !== undefined) {
		switch (event.keyCode) {
		case 192: debugMode = !debugMode; break;
		case 80: gameState.paused = !gameState.paused; break;
		default: 
			gameState.wonGameReset = true; // reset if game won
			gameState.jumpInput = true;
			break;
		}
		
		handled = true;
	}

	if (handled) {
		// Suppress "double action" if event handled
		event.preventDefault();
	}
}

/// Tells slime to stop jumping when user releases a key
/// Partial source: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
var onkeyup = function(event) {
	if (event.defaultPrevented) {
		return; // Should do nothing if the default action has been cancelled
	}

	var handled = false;
	if (event.keyCode !== undefined) {
		switch (event.keyCode) {
		case 192: break;
		case 80: break;
		default: 
			gameState.wonGameReset = false; // reset if game won
			gameState.jumpInput = false;
			break;
		}
		
		handled = true;
	}

	if (handled) {
		// Suppress "double action" if event handled
		event.preventDefault();
	}
}

/// Tells slime to jump when user presses mobile screen 
/// Partial source: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
var ontouchstart = function(event) {
	if (event.defaultPrevented) {
		return; // Should do nothing if the default action has been cancelled
	}

	var handled = false;
	if (event.touches !== undefined) {
		gameState.wonGameReset = true; // reset if game won
		gameState.jumpInput = true;
		
		handled = true;
	}

	if (handled) {
		// Suppress "double action" if event handled
		//event.preventDefault();
	}
}

/// Tells slime to stop jumping when user releases a key
/// Partial source: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
var ontouchend = function(event) {
	if (event.defaultPrevented) {
		return; // Should do nothing if the default action has been cancelled
	}

	var handled = false;
	if (event.touches !== undefined) {
		gameState.wonGameReset = false; // reset if game won
		gameState.jumpInput = false;
		
		handled = true;
	}

	if (handled) {
		// Suppress "double action" if event handled
		//event.preventDefault();
	}
}

//-------------------------------------------------------------------
// The window.onload function will run when the page first loads
//-------------------------------------------------------------------

window.onload = function () 
{
	// Create a canvas and drawing context
	canvas = document.createElement('canvas');
	canvas.id = 'myCanvas';
	canvas.width = '640';
	canvas.height = '360';
	document.getElementById('centerFrame').appendChild(canvas);
	
	drawing = canvas.getContext('2d');

	initializeGameState();
	
	animateGame();
}
