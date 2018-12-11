window.onload = function() {
  var canvas = document.getElementById('drawingCanvas');
  var context = canvas.getContext('2d');
  // canvas 的坐标原点是左上角，向右和向下是正值
  context.translate(100,60);

  var copies = 10;
  for (var index = 0; index < copies; index++) {
    context.rotate(2 * Math.PI * 1/(copies-1));
    context.rect(0,0,40,40);
  }

  context.stroke();
}