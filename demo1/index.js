window.onload = function() {
  var canvas = document.getElementById('drawingCanvas');
  var context = canvas.getContext('2d');
  // canvas 的坐标原点是左上角，向右和向下是正值
  // 画直线
  context.lineWidth = 2; // 线条宽度和颜色
  context.strokeStyle = "rgba(205,40,40)";

  context.moveTo(10,10);
  context.lineTo(290,10);
  context.stroke();

  // 绘制第二条线
  context.beginPath(); // 想绘制新的内容，必须要调用这个
  context.lineWidth = 4; // 线条宽度
  context.strokeStyle = "rgba(205,40,30)"; // 线条颜色

  context.moveTo(10,20);
  context.lineTo(290,20);
  context.stroke();

  // 画三角形
  context.beginPath();
  context.moveTo(150,30);
  context.lineTo(100,60);
  context.lineTo(200,60);

  // 绘制形状要关闭路径，使用这个方法，会自动将第一个点和最后一个点间绘制一条线
  context.closePath();

  // 填充颜色
  context.fillStyle = 'blue';
  context.fill();

  // 绘制轮廓
  context.lineWidth = 2;
  context.strokeStyle = 'red';
  context.stroke();

  // 绘制矩形，主要提供左上角的坐标、宽度和高度即可。
  context.beginPath();
  context.fillRect(10,70,100,20);

  // 曲线
  context.beginPath();
  context.moveTo(10,100);

  var control1X = 30;
  var control1Y = 80;
  var control2X = 70;
  var control2Y = 140;
  var endPointX = 80;
  var endPointY = 120;

  context.bezierCurveTo(control1X,control1Y,control2X,control2Y,endPointX,endPointY);
  context.stroke();

}