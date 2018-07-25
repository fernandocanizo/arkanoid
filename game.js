'use strict';
/* global window */
/* global document */

const FPS = 30;
const BRICK_COLS = 10;
const BRICK_ROWS = 5;

const ball = {
  radius: 10,
  position: {
    x: 100,
    y: 100,
  },
  velocity: {
    x: 5,
    y: 5,
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
const initBall = (canvasWidth, canvasHeight) => {
  const quarterX = canvasWidth / 4;
  const quarterY = canvasHeight / 4;
  const middleRectangleXsize = quarterX * 2;
  const middleRectangleYsize = quarterY * 2;

  ball.position.x = Math.floor(
    Math.random() * middleRectangleXsize + quarterX);
  ball.position.y = Math.floor(
    Math.random() * middleRectangleYsize + quarterY);

  ball.velocity.x = Math.floor(Math.random() * 10 + 7) * signSpinner();
  ball.velocity.y = Math.floor(Math.random() * 10 + 7) * signSpinner();
};

const initPaddle = (canvasWidth, canvasHeight) => {
  paddle.position.x = canvasWidth / 2 - paddle.width / 2;
  paddle.position.y = canvasHeight - paddle.thickness;
};

const initBricks = (canvasSize) => {
  // Make all brick defaults dynamic by percentage
  // Percentages crafted on a 800x600 canvas
  defaultBrick.gap = Math.floor(canvasSize.width * 0.25 / 100);
  defaultBrick.width = canvasSize.width / BRICK_COLS - defaultBrick.gap;
  // don't put bricks below half screen
  defaultBrick.height = canvasSize.height / 2 / BRICK_ROWS -
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
const ballCanvasHandler = (canvasWidth, canvasHeight) => {
  // bounce back if out of canvas
  if (ball.position.x > canvasWidth || ball.position.x < 0) {
    flipBallVelocity('x');
  }

  if (ball.position.y > canvasHeight) {
    initBall(canvasWidth, canvasHeight);
  } else if (ball.position.y < 0) {
    flipBallVelocity('y');
  }
};

const ballPaddleBrickHandler = (canvasHeight) => {
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
  const paddleBottomEdge = canvasHeight;

  // if/else because either we're near bricks or near paddle, but not both
  if (gotBricksLeft && ballInsideBrickGrid && bricks[brickArrayIndex].visible) {
    bricks[brickArrayIndex].visible = false;

    const prevBallPosition = {
      x: ball.position.x - ball.velocity.x,
      y: ball.position.y - ball.velocity.y,
    };
    const prevBallCol = Math.floor(prevBallPosition.x / (defaultBrick.width + defaultBrick.gap));
    const prevBallRow = Math.floor(prevBallPosition.y / (defaultBrick.height + defaultBrick.gap));

    if (prevBallCol != ballCol) {
      // column has changed, ball comes from the side
      flipBallVelocity('x');
    }

    if (prevBallRow != ballRow) {
      // row has changed, ball comes brom above or below
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

const updateBall = (canvasWidth, canvasHeight) => {
  ballCanvasHandler(canvasWidth, canvasHeight);
  ballPaddleBrickHandler(canvasHeight);

  ball.position.x += ball.velocity.x;
  ball.position.y += ball.velocity.y;
};

const updatePaddlePosition = (canvas, event) => {
  // Note: this function is not tick-based, but event-based

  const rect = canvas.getBoundingClientRect();
  const docRoot = document.documentElement;

  // adjust to canvas x
  mouse.position.x = event.clientX - rect.left - docRoot.scrollLeft;
  mouse.position.y = event.clientY - rect.top - docRoot.scrollTop;
  paddle.position.x = mouse.position.x - paddle.width / 2;

};

const updateAll = (canvas) => {
  updateBall(canvas.width, canvas.height);
};

////////////////////////////////////////////////////////////////////////////////
// Draw
////////////////////////////////////////////////////////////////////////////////
const drawBackground = (context, canvasWidth, canvasHeight) => {
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvasWidth, canvasHeight);
};

const drawBall = (context) => {
  context.fillStyle = ball.color;
  context.beginPath();
  context.arc(ball.position.x, ball.position.y, ball.radius,
    0, Math.PI * 2);
  context.fill();
};

const drawPaddle = (context) => {
  context.fillStyle = paddle.color;
  context.fillRect(paddle.position.x, paddle.position.y,
    paddle.width, paddle.thickness);
};

const drawMousePosition = (canvasWidth, context, mousePosition) => {
  context.fillStyle = 'yellow';
  context.fillText(`x: ${mousePosition.x}, y: ${mousePosition.y}`,
    canvasWidth - 100, 10);
};

const drawBricks = (context) => {
  bricks.forEach(b => {
    if (b.visible) {
      context.fillStyle = b.color;
      context.fillRect(b.position.x, b.position.y,
        defaultBrick.width, defaultBrick.height);
    }
  });
};


const drawAll = (canvas, context) => {
  drawBackground(context, canvas.width, canvas.height);
  drawBall(context);
  drawPaddle(context);
  drawMousePosition(canvas.width, context, mouse.position);
  drawBricks(context);
};

////////////////////////////////////////////////////////////////////////////////
// Main
////////////////////////////////////////////////////////////////////////////////
window.onload = () => {
  const canvas = document.getElementById('playGround');
  const context = canvas.getContext('2d');

  initBall(canvas.width, canvas.height);
  initPaddle(canvas.width, canvas.height);
  initBricks({ width: canvas.width, height: canvas.height });

  canvas.addEventListener('mousemove', (event) =>
    updatePaddlePosition(canvas, event));

  const intervalId = setInterval(() => {
    updateAll(canvas, context);
    drawAll(canvas, context);
  }, 1000 / FPS);
  console.log('intervalId', intervalId);
};
