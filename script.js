document.addEventListener('DOMContentLoaded', () => {
	const grid = document.querySelector('.grid');
	const lapras = document.createElement('div');
	const banner = document.querySelector('.banner');
	const waves = document.querySelector('.waves');

	let isPlaying = false;
	let isGameOver = true;
	let platformCount = 8;
	let platforms = [];
	let score = 0;
	let highScore = 0;
	let laprasLeftSpace = 50;
	let startPoint = 150;
	let laprasBottomSpace = startPoint;
	let isJumping = true;
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

		if (xTravel < -tolerance) {
			moveLeft();
		}
		if (xTravel > tolerance) {
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
		audio.play();
	};
	const playCry = () => {
		let audio = new Audio('./assets/cry.mp3');
		audio.play();
	};

	class Platform {
		constructor(newPlatBottom) {
			this.left = Math.random() * 335;
			this.bottom = newPlatBottom;
			this.visual = document.createElement('div');

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
			platforms.forEach((platform) => {
				if (score <= 20) {
					platform.bottom -= 2;
				} else if (score <= 50) {
					platform.bottom -= 3;
				} else if (score <= 100) {
					platform.bottom -= 4;
				} else if (score <= 200) {
					platform.bottom -= 5;
				} else platform.bottom -= 7;

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
		laprasLeftSpace = platforms[0].left - 20;
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
					laprasBottomSpace >= platform.bottom - 10 &&
					laprasBottomSpace <= platform.bottom + 10 &&
					laprasLeftSpace + 70 >= platform.left &&
					laprasLeftSpace <= platform.left + 50 &&
					!isJumping &&
					laprasBottomSpace < 500
				) {
					startPoint = laprasBottomSpace;
					jump();
					playJump();
					setTimeout(() => {
						platform.visual.style.backgroundImage = 'url(./assets/ice.png)';
						platform.visual.style.width = '60px';
					}, 100);
				}
			});
		}, 5);
	}

	function jump() {
		clearInterval(downTimerId);
		isJumping = true;
		upTimerId = setInterval(() => {
			laprasBottomSpace += 3;
			lapras.style.bottom = laprasBottomSpace + 'px';
			if (laprasBottomSpace > startPoint + 210) {
				fall();
			}
		}, 5);
	}

	function moveLeft() {
		clearInterval(leftTimerId);
		clearInterval(rightTimerId);

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
		if (e.key === 'a') {
			moveLeft();
		} else if (e.key === 'd') {
			moveRight();
		} else if (e.key === 's' || 'w') {
			moveStraight();
		}
	}
	function gameOver() {
		surface.style.zIndex = -2;
		isGameOver = true;
		banner.classList.add('clickable');
		banner.classList.remove('disabled');
		banner.innerText = `PLAY AGAIN`;
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

	function start() {
		surface.style.zIndex = 20;
		isGameOver = false;
		if (!isGameOver) {
			laprasLeftSpace = 50;
			startPoint = 150;
			laprasBottomSpace = startPoint;
			score = 0;
			banner.classList.remove('clickable');
			banner.classList.add('disabled');
			banner.innerText = `${score}\u00A0 🌊\u00A0\u00A0\u00A0`;
			platforms = [];
			grid.innerHTML = '';
			createPlatforms();
			createLapras();
			movePlatformId = setInterval(movePlatforms, 10);
			fall();
		}
	}
	grid.innerHTML =
		'<div class="title"a>Lapras Jump</div><div class="version">ver. 1.3b</div><img class= "title-img" src="./assets/lapras.gif" alt="">';
	document.addEventListener('keydown', control);
	banner.addEventListener('click', start);
	const titleImg = document.querySelector('.title-img');
	titleImg.addEventListener('click', playCry);
	waves.addEventListener('click', () => {
		if (isGameOver) {
			start();
		}
	});
});
