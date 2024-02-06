document.addEventListener('DOMContentLoaded', () => {
	const grid = document.querySelector('.grid');
	const lapras = document.createElement('div');
	const banner = document.querySelector('.banner');
	const waves = document.querySelector('.waves');
	const water = document.querySelector('.water');

	let isPlaying = false;
	let isGameOver = true;
	let platformCount = 6;
	let platforms = [];
	let score = 0;
	let highScore = 0;
	let laprasLeftSpace = 50;
	let startPoint = 120;
	let laprasBottomSpace = startPoint;
	let isJumping = true;
	let isGoingLeft = false;
	let isGoingRight = false;
	let upTimerId;
	let downTimerId;
	let leftTimerId;
	let rightTimerId;
	let movePlatformId;

	//for touchscreen start
	var gesture = {
			x: [],
			y: [],
			match: '',
		},
		tolerance = 20;

	var surface = document.getElementById('surface');

	surface.addEventListener('touchstart', function (e) {
		e.preventDefault();
		for (i = 0; i < e.touches.length; i++) {
			var dot = document.createElement('em');
			dot.id = i;
			dot.style.top = e.touches[i].clientY - 25 + 'px';
			dot.style.left = e.touches[i].clientX - 25 + 'px';
			document.body.appendChild(dot);
			gesture.x.push(e.touches[i].clientX);
			gesture.y.push(e.touches[i].clientY);
		}
	});
	surface.addEventListener('touchmove', function (e) {
		e.preventDefault();
		for (var i = 0; i < e.touches.length; i++) {
			var dot = document.getElementById(i);
			dot.style.top = e.touches[i].clientY - 25 + 'px';
			dot.style.left = e.touches[i].clientX - 25 + 'px';
			gesture.x.push(e.touches[i].clientX);
			gesture.y.push(e.touches[i].clientY);
		}
	});
	surface.addEventListener('touchend', function (e) {
		var dots = document.querySelectorAll('em'),
			xTravel = gesture.x[gesture.x.length - 1] - gesture.x[0],
			yTravel = gesture.y[gesture.y.length - 1] - gesture.y[0];

		if (xTravel < -tolerance && isPlaying) {
			moveLeft();
		}
		if (xTravel > tolerance && isPlaying) {
			moveRight();
		}

		gesture.x = [];
		gesture.y = [];
		gesture.match = xTravel = yTravel = '';
		for (i = 0; i < dots.length; i++) {
			dots[i].id = '';
			dots[i].style.opacity = 1;
			setTimeout(function () {
				document.body.removeChild(dots[i]);
			}, 0);
		}
	});

	//for touchscreen end

	const playJump = () => {
		let audio = new Audio('./assets/jump.mp3');
		audio.preload = 'auto';
		audio.play();
	};
	const playCry = () => {
		let audio = new Audio('./assets/cry.mp3');
		audio.preload = 'auto';
		audio.play();
	};

	const playCountdown = () => {
		let audio = new Audio('./assets/countdown.mp3');
		audio.preload = 'auto';
		audio.play();
	};

	class Platform {
		constructor(newPlatBottom) {
			this.left = Math.random() * 319;
			this.bottom = newPlatBottom;
			this.visual = document.createElement('div');
			this.width = 100;

			const visual = this.visual;
			visual.classList.add('platform');
			visual.style.left = this.left + 'px';
			visual.style.bottom = this.bottom + 'px';
			grid.appendChild(visual);
		}
	}

	function createPlatforms() {
		for (let i = 0; i < platformCount; i++) {
			let platGap = 600 / platformCount;
			let newPlatBottom = 50 + i * platGap;
			let newPlatform = new Platform(newPlatBottom);
			platforms.push(newPlatform);
		}
	}

	function movePlatforms() {
		if (laprasBottomSpace > 200) {
			//default 150
			platforms.forEach((platform) => {
				if (score <= 20) {
					platform.bottom -= 2;
				} else if (score <= 50) {
					platform.bottom -= 3;
				} else if (score <= 100) {
					platform.bottom -= 4;
				} else if (score <= 200) {
					platform.bottom -= 5;
				} else platform.bottom -= 6;

				let visual = platform.visual;
				visual.style.bottom = platform.bottom + 'px';

				if (platform.bottom <= 0) {
					let firstPlatform = platforms[0].visual;
					firstPlatform.classList.remove('platform');
					platforms.shift();
					score++;
					banner.innerText = `${score}\u00A0 🌊\u00A0\u00A0\u00A0`;
					let newPlatform = new Platform(600);
					platforms.push(newPlatform);
				}
			});
		}
	}

	function createLapras() {
		lapras.classList.add('lapras');
		laprasLeftSpace = platforms[0].left - 5;
		lapras.style.left = laprasLeftSpace + 'px';
		lapras.style.bottom = laprasBottomSpace + 'px';
		grid.appendChild(lapras);
	}

	function fall() {
		setTimeout(() => {
			isJumping = false;
		}, 100);

		clearTimeout(upTimerId);
		downTimerId = setInterval(() => {
			laprasBottomSpace -= 3;
			lapras.style.bottom = laprasBottomSpace + 'px';
			if (laprasBottomSpace <= -200) {
				gameOver();
			}
			platforms.map((platform, index) => {
				if (
					laprasBottomSpace >= platform.bottom &&
					laprasBottomSpace <= platform.bottom + 15 &&
					laprasLeftSpace + 95 >= platform.left &&
					laprasLeftSpace <= platform.left + platform.width - 10 &&
					!isJumping &&
					laprasBottomSpace < 500
				) {
					startPoint = laprasBottomSpace;
					platform.width = 65;
					jump();
					playJump();
					setTimeout(() => {
						platform.visual.style.backgroundImage = 'url(./assets/ice.png)';
						platform.visual.style.width = platform.width + 'px';
					}, 100);
				}
			});
		}, 5);
	}

	function jump() {
		clearInterval(downTimerId);
		isJumping = true;
		if (isGoingLeft) {
			lapras.classList.add('jumping-left');
		}
		if (isGoingRight) {
			lapras.classList.add('jumping-right');
		}
		upTimerId = setInterval(() => {
			laprasBottomSpace += 3;
			lapras.style.bottom = laprasBottomSpace + 'px';
			if (laprasBottomSpace > startPoint + 210) {
				lapras.classList.remove('jumping-left');
				lapras.classList.remove('jumping-right');
				fall();
			}
		}, 5);
	}

	function moveLeft() {
		clearInterval(leftTimerId);
		clearInterval(rightTimerId);
		isGoingLeft = true;
		isGoingRight = false;
		lapras.classList.remove('jumping-right');

		leftTimerId = setInterval(() => {
			if (laprasLeftSpace >= -50) {
				laprasLeftSpace -= 3;
				lapras.style.left = laprasLeftSpace + 'px';
				lapras.style.transform = 'scale(1, 1)';
			}
		}, 10);
	}

	function moveRight() {
		clearInterval(leftTimerId);
		clearInterval(rightTimerId);
		isGoingLeft = false;
		isGoingRight = true;
		lapras.classList.remove('jumping-left');

		rightTimerId = setInterval(() => {
			if (laprasLeftSpace <= 347) {
				laprasLeftSpace += 3;
				lapras.style.left = laprasLeftSpace + 'px';
				lapras.style.transform = 'scale(-1, 1)';
			}
		}, 10);
	}

	function moveStraight() {
		clearInterval(leftTimerId);
		clearInterval(rightTimerId);
	}

	function control(e) {
		lapras.style.bottom = laprasBottomSpace + 'px';
		if (isGameOver && e.key === ' ') {
			start();
		}
		if (isPlaying && e.key === 'a') {
			moveLeft();
		} else if (isPlaying && e.key === 'd') {
			moveRight();
		} else if (e.key === 's' || 'w') {
			moveStraight();
		}
	}
	function gameOver() {
		surface.style.zIndex = -2;
		isPlaying = false;
		isGameOver = true;
		banner.classList.add('clickable');
		banner.classList.remove('disabled');
		banner.innerText = `🎮\u00A0\u00A0\u00A0PLAY AGAIN\u00A0\u00A0\u00A0🎮`;
		while (grid.firstChild) {
			grid.removeChild(grid.firstChild);
		}

		if (highScore < score) {
			highScore = score;
			grid.innerHTML = `<div class="game-over"a>Game Over</div>
			<div class="score">Your Score: ${score}</div>
			<div class="score">High Score: ${highScore} <span class="new">&nbspNEW!</span></div>`;
		} else {
			grid.innerHTML = `<div class="game-over"a>Game Over</div>
		<div class="score">Your Score: ${score}</div>
		<div class="score">High Score: ${highScore}</div>`;
		}
		clearInterval(downTimerId);
		clearInterval(upTimerId);
		clearInterval(leftTimerId);
		clearInterval(rightTimerId);
		clearInterval(movePlatformId);
	}

	function countdown() {
		banner.classList.remove('clickable');
		banner.classList.add('disabled');
		banner.classList.add('countdown');
		banner.innerText = `3`;
		playCountdown();
		setTimeout(() => {
			banner.innerText = `2`;
		}, 1000);
		setTimeout(() => {
			banner.innerText = `1`;
		}, 2000);
		setTimeout(() => {
			banner.innerText = `JUMP!`;
		}, 3000);
		setTimeout(() => {
			fall();
			isPlaying = true;
			banner.classList.remove('countdown');
			banner.innerText = `${score}\u00A0 🌊\u00A0\u00A0\u00A0`;
		}, 4000);
	}

	function start() {
		surface.style.zIndex = 20;
		isGameOver = false;
		if (!isGameOver) {
			laprasLeftSpace = 50;
			startPoint = 120;
			laprasBottomSpace = startPoint;
			score = 0;
			platforms = [];
			grid.innerHTML = '';
			createPlatforms();
			createLapras();
			countdown();
			movePlatformId = setInterval(movePlatforms, 10);
		}
	}

	function initialize() {
		grid.innerHTML =
			'<div class="title"a>Lapras Jump</div><div class="version">ver. 1.5a</div><img class= "title-img" src="./assets/lapras.gif" alt="">';
		const titleImg = document.querySelector('.title-img');
		titleImg.addEventListener('click', playCry);
		document.addEventListener('keydown', control);
		banner.addEventListener('click', start);
		waves.addEventListener('click', () => {
			if (isGameOver) {
				start();
			}
		});
		water.addEventListener('click', () => {
			if (isGameOver) {
				start();
			}
		});
	}
	initialize();
});
