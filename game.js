'use strict';
/* global window */
/* global document */

const FPS = 30;

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

////////////////////////////////////////////////////////////////////////
// Helpers
////////////////////////////////////////////////////////////////////////
const dice2 = () => Math.random() > 0.5 ? -1 : 1;

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

  ball.velocity.x = Math.floor(Math.random() * 10 + 3) * dice2();
  ball.velocity.y = Math.floor(Math.random() * 10 + 3) * dice2();
};

const initPaddle = (canvasWidth, canvasHeight) => {
  paddle.position.x = canvasWidth / 2 - paddle.width / 2;
  paddle.position.y = canvasHeight - paddle.thickness;
};

////////////////////////////////////////////////////////////////////////
// Update
////////////////////////////////////////////////////////////////////////
const updateBall = (canvasWidth, canvasHeight) => {
  // bounce back if out of canvas
  if (ball.position.x > canvasWidth) {
    ball.velocity.x *= -1;
  } else if (ball.position.x < 0) {
    ball.velocity.x *= -1;
  }

  if (ball.position.y > canvasHeight) {
    initBall(canvasWidth, canvasHeight);
  } else if (ball.position.y < 0) {
    ball.velocity.y *= -1;
  }

  // reflect ball if hits paddle
  const paddleTopEdge = paddle.position.y;
  const paddleLeftEdge = paddle.position.x;
  const paddleRightEdge = paddle.position.x + paddle.width;
  const paddleBottomEdge = canvasHeight;
  if (ball.position.x > paddleLeftEdge &&
    ball.position.x < paddleRightEdge &&
    ball.position.y > paddleTopEdge &&
    ball.position.y < paddleBottomEdge) {

    ball.velocity.y *= -1;

    // aim based on where ball hits the paddle
    const centerOfPaddleX = paddle.position.x + paddle.width / 2;
    const ballDistanceFromPaddleCenterX =
      ball.position.x - centerOfPaddleX;
    ball.velocity.x = ballDistanceFromPaddleCenterX * 0.4;
  }

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

const drawAll = (canvas, context) => {
  drawBackground(context, canvas.width, canvas.height);
  drawBall(context);
  drawPaddle(context);
  drawMousePosition(canvas.width, context, mouse.position);
};

////////////////////////////////////////////////////////////////////////////////
// Main
////////////////////////////////////////////////////////////////////////////////
window.onload = () => {
  const canvas = document.getElementById('playGround');
  const context = canvas.getContext('2d');

  initBall(canvas.width, canvas.height);
  initPaddle(canvas.width, canvas.height);

  canvas.addEventListener('mousemove', (event) =>
    updatePaddlePosition(canvas, event));

  const intervalId = setInterval(() => {
    updateAll(canvas, context);
    drawAll(canvas, context);
  }, 1000 / FPS);
  console.log('intervalId', intervalId);
};
