window.onload = function () {

  var canvas = document.getElementById('drawingCanvas');
  var context = canvas.getContext('2d');
  // canvas 的坐标原点是左上角，向右和向下是正值
  context.font = "20px Arial";
  context.fillStyle = "black";
  context.fillText('This is canvas!',10,20);

  context.fillStyle = "red";
  context.fillText('This is canvas row2',10,40);


  var canvasDeal = document.getElementById('drawingCanvasDeal');
  var contextDeal = canvasDeal.getContext('2d');

  contextDeal.font = "20px Arial";
  contextDeal.fillStyle = "black";
  contextDeal.fillText('This is canvas!',10,20);

  contextDeal.fillStyle = "red";
  contextDeal.fillText('This is canvas row2',10,40);

}