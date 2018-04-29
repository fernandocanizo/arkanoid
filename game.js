'use strict';
/* global window */
/* global document */

const FPS = 30;

const updateAll = (canvas, context) => {
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = 'white';
  context.beginPath();
  context.arc(100, 100, 10, 0, Math.PI * 2, true);
  context.fill();
};

window.onload = () => {
  const canvas = document.getElementById('playGround');
  const context = canvas.getContext('2d');

  const intervalId = setInterval(() => updateAll(canvas, context), 1000 / FPS);
  console.log(intervalId);
};
