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

const drawBackground = (canvas, context) => {
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);
};

const updateBall = () => {
};

const drawBall = (canvas, context) => {
  context.fillStyle = ball.color;
  context.beginPath();
  context.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
  context.fill();
};

const updateAll = () => {
  updateBall();
};

const drawAll = (canvas, context) => {
  drawBackground(canvas, context);
  drawBall(canvas, context);
};


window.onload = () => {
  const canvas = document.getElementById('playGround');
  const context = canvas.getContext('2d');

  const intervalId = setInterval(() => {
    updateAll(canvas, context);
    drawAll(canvas, context);
  }, 1000 / FPS);
  console.log('intervalId', intervalId);
};
