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

////////////////////////////////////////////////////////////////////////////////
// Update
////////////////////////////////////////////////////////////////////////////////
const updateBall = (canvasWidth, canvasHeight) => {
  // bounce back if out of canvas
  if (ball.position.x > canvasWidth) {
    ball.velocity.x *= -1;
  } else if (ball.position.x < 0) {
    ball.velocity.x *= -1;
  }

  if (ball.position.y > canvasHeight) {
    ball.velocity.y *= -1;
  } else if (ball.position.y < 0) {
    ball.velocity.y *= -1;
  }

  ball.position.x += ball.velocity.x;
  ball.position.y += ball.velocity.y;
};

const updateAll = (canvas) => {
  updateBall(canvas.width, canvas.height);
};

////////////////////////////////////////////////////////////////////////////////
// Draw
////////////////////////////////////////////////////////////////////////////////
const drawBackground = (canvas, context) => {
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);
};

const drawBall = (canvas, context) => {
  context.fillStyle = ball.color;
  context.beginPath();
  context.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
  context.fill();
};

const drawAll = (canvas, context) => {
  drawBackground(canvas, context);
  drawBall(canvas, context);
};

////////////////////////////////////////////////////////////////////////////////
// Main
////////////////////////////////////////////////////////////////////////////////
window.onload = () => {
  const canvas = document.getElementById('playGround');
  const context = canvas.getContext('2d');

  const intervalId = setInterval(() => {
    updateAll(canvas, context);
    drawAll(canvas, context);
  }, 1000 / FPS);
  console.log('intervalId', intervalId);
};
