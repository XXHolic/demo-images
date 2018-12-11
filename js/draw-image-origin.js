window.onload = function () {

  var canvas = document.getElementById('drawingCanvas');
  var context = canvas.getContext('2d');
  // canvas 的坐标原点是左上角，向右和向下是正值
  context.font = "20px Arial";
  context.fillStyle = "black";
  context.fillText('This is canvas!',10,110);

  var img = new Image();

  img.onload = function() {
    // 样式里面 canvas 用了 100% 虽然有效，但执行下面语句，会无效
    context.drawImage(img, 0, 0, 300, 90);
  };

  img.src = '../../images/html5-rocks.png';

}