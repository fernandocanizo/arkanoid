'use strict';
/* global window */
/* global document */

const FPS = 30;
const BRICK_COLS = 10;
const BRICK_ROWS = 5;

const game = {};

const ball = {
  radius: 10,
  position: {
    x: 100,
    y: 100,
  },
  velocity: {
    x: 3,
    y: 3,
  },
  color: 'white',
};

const paddle = {
  position: {
    x: 0,
    y: 0,
  },
  color: 'red',
  width: 100,
  thickness: 10,
};

const mouse = {
  position: {
    x: 0,
    y: 0,
  },
};

const defaultBrick = {
  width: 0,
  height: 0,
  gap: 0,
  visible: true,
};

const position = {
  x: 0,
  y: 0,
};

const bricks = Array(BRICK_COLS * BRICK_ROWS)
  .fill(true)
  .map(() => Object.create({
    position: Object.create(position),
    color: 'blue',
  }));

////////////////////////////////////////////////////////////////////////
// Helpers
////////////////////////////////////////////////////////////////////////
const signSpinner = () => Math.random() > 0.5 ? -1 : 1;
const flipBallVelocity = axis => ball.velocity[axis] *= -1;

////////////////////////////////////////////////////////////////////////
// Initialize
////////////////////////////////////////////////////////////////////////
const initBall = () => {
  const quarterX = game.canvas.width / 4;
  const quarterY = game.canvas.height / 4;
  const middleRectangleXsize = quarterX * 2;
  const middleRectangleYsize = quarterY * 2;

  ball.position.x = Math.floor(
    Math.random() * middleRectangleXsize + quarterX);
  ball.position.y = Math.floor(
    Math.random() * middleRectangleYsize + quarterY);

  ball.velocity.x = Math.floor(Math.random() * 10 + 4) * signSpinner();
  ball.velocity.y = Math.floor(Math.random() * 10 + 4) * signSpinner();
};

const initPaddle = () => {
  paddle.position.x = game.canvas.width / 2 - paddle.width / 2;
  paddle.position.y = game.canvas.height - paddle.thickness;
};

const initBricks = () => {
  // Make all brick defaults dynamic by percentage
  // Percentages crafted on a 800x600 canvas
  defaultBrick.gap = Math.floor(game.canvas.width * 0.25 / 100);
  defaultBrick.width = game.canvas.width / BRICK_COLS - defaultBrick.gap;
  // don't put bricks below half screen
  defaultBrick.height = game.canvas.height / 2 / BRICK_ROWS -
    defaultBrick.gap;

  const currentRow = (brickIndex) => Math.floor(brickIndex / 2 / BRICK_ROWS);

  bricks.forEach((b, i) => {
    const col = i % BRICK_COLS;
    const row = currentRow(i);
    const xGap = defaultBrick.gap * col;
    const yGap = defaultBrick.gap * row;
    b.position.x = defaultBrick.width * col + xGap;
    b.position.y = defaultBrick.height * row + yGap;
    b.visible = true;
  });
};

////////////////////////////////////////////////////////////////////////
// Update
////////////////////////////////////////////////////////////////////////
const ballCanvasHandler = () => {
  // bounce back if out of canvas
  if (ball.position.x > game.canvas.width || ball.position.x < 0) {
    flipBallVelocity('x');
  }

  if (ball.position.y > game.canvas.height) {
    initBall();
  } else if (ball.position.y < 0) {
    flipBallVelocity('y');
  }
};

const ballPaddleBrickHandler = () => {
  // calculate ball row, col for ball-brick collision detection
  const ballCol = Math.floor(ball.position.x / (defaultBrick.width + defaultBrick.gap));
  const ballRow = Math.floor(ball.position.y / (defaultBrick.height + defaultBrick.gap));
  const brickArrayIndex = ballRow * BRICK_COLS + ballCol;
  const gotBricksLeft = brickArrayIndex >= 0;
  const ballInsideBrickGrid = brickArrayIndex < BRICK_COLS * BRICK_ROWS &&
    ballCol < BRICK_COLS && ballCol > -1 &&
    ballRow < BRICK_ROWS && ballRow > -1;

  // reflect ball if hits paddle (ball-paddle collision detection)
  const paddleTopEdge = paddle.position.y;
  const paddleLeftEdge = paddle.position.x;
  const paddleRightEdge = paddle.position.x + paddle.width;
  const paddleBottomEdge = game.canvas.height;

  // if/else because either we're near bricks or near paddle, but not both
  if (gotBricksLeft && ballInsideBrickGrid && bricks[brickArrayIndex].visible) {
    bricks[brickArrayIndex].visible = false;

    const prevBallPosition = {
      x: ball.position.x - ball.velocity.x,
      y: ball.position.y - ball.velocity.y,
    };
    const prevBallCol = Math.floor(prevBallPosition.x / (defaultBrick.width + defaultBrick.gap));
    const prevBallRow = Math.floor(prevBallPosition.y / (defaultBrick.height + defaultBrick.gap));

    let bothTestFailed = true;
    if (prevBallCol != ballCol) {
      // column has changed, ball comes from the side
      const adjacentBrickIndex = ballRow * BRICK_COLS + prevBallCol;
      if (! bricks[adjacentBrickIndex].visible) {
        // bounce only if brick has no neighbor brick on the side ball came
        flipBallVelocity('x');
        bothTestFailed = false;
      }
    }

    if (prevBallRow != ballRow) {
      // row has changed, ball comes brom above or below
      const adjacentBrickIndex = prevBallRow * BRICK_COLS + ballCol;
      if (! bricks[adjacentBrickIndex].visible) {
        // bounce only if brick has no neighbor brick on the side ball came
        flipBallVelocity('y');
        bothTestFailed = false;
      }
    }

    if (bothTestFailed) {
      flipBallVelocity('x');
      flipBallVelocity('y');
    }
  } else if (ball.position.x > paddleLeftEdge &&
    ball.position.x < paddleRightEdge &&
    ball.position.y > paddleTopEdge &&
    ball.position.y < paddleBottomEdge) {

    flipBallVelocity('y');

    // aim based on where ball hits the paddle
    const centerOfPaddleX = paddle.position.x + paddle.width / 2;
    const ballDistanceFromPaddleCenterX =
      ball.position.x - centerOfPaddleX;
    ball.velocity.x = ballDistanceFromPaddleCenterX * 0.4;
  }
};

const updateBall = () => {
  ballCanvasHandler(game.canvas.width, game.canvas.height);
  ballPaddleBrickHandler();

  ball.position.x += ball.velocity.x;
  ball.position.y += ball.velocity.y;
};

const updatePaddlePosition = (event) => {
  // Note: this function is not tick-based, but event-based

  const rect = game.canvas.getBoundingClientRect();
  const docRoot = document.documentElement;

  // adjust to canvas x
  mouse.position.x = event.clientX - rect.left - docRoot.scrollLeft;
  mouse.position.y = event.clientY - rect.top - docRoot.scrollTop;
  paddle.position.x = mouse.position.x - paddle.width / 2;

  if (paddle.position.x < rect.left) {
    paddle.position.x = 0;
  } else if (paddle.position.x + paddle.width > rect.left + game.canvas.width) {
    paddle.position.x = game.canvas.width - paddle.width;
  }
};

const updateAll = () => {
  updateBall();
};

////////////////////////////////////////////////////////////////////////////////
// Draw
////////////////////////////////////////////////////////////////////////////////
const drawBackground = () => {
  game.context.fillStyle = 'black';
  game.context.fillRect(0, 0, game.canvas.width, game.canvas.height);
};

const drawBall = () => {
  game.context.fillStyle = ball.color;
  game.context.beginPath();
  game.context.arc(ball.position.x, ball.position.y, ball.radius,
    0, Math.PI * 2);
  game.context.fill();
};

const drawPaddle = () => {
  game.context.fillStyle = paddle.color;
  game.context.fillRect(paddle.position.x, paddle.position.y,
    paddle.width, paddle.thickness);
};

const drawMousePosition = (mousePosition) => {
  game.context.fillStyle = 'yellow';
  game.context.fillText(`x: ${mousePosition.x}, y: ${mousePosition.y}`,
    game.canvas.width - 100, 10);
};

const drawBricks = () => {
  bricks.forEach(b => {
    if (b.visible) {
      game.context.fillStyle = b.color;
      game.context.fillRect(b.position.x, b.position.y,
        defaultBrick.width, defaultBrick.height);
    }
  });
};


const drawAll = () => {
  drawBackground();
  drawBall();
  drawPaddle();
  drawMousePosition(mouse.position);
  drawBricks();
};

////////////////////////////////////////////////////////////////////////////////
// Main
////////////////////////////////////////////////////////////////////////////////
window.onload = () => {
  game.canvas = document.getElementById('playGround');
  game.context = game.canvas.getContext('2d');

  initBall();
  initPaddle();
  initBricks();

  game.canvas.addEventListener('mousemove', event => updatePaddlePosition(event));

  const intervalId = setInterval(() => {
    updateAll();
    drawAll();
  }, 1000 / FPS);
  console.log('intervalId', intervalId);
};
