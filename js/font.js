window.onload = function () {

  CanvasRenderingContext2D.prototype.wrapText = function (text, x, y, maxWidth, lineHeight,row) {
    if (typeof text != 'string' || typeof x != 'number' || typeof y != 'number') {
        return;
    }

    var context = this;
    var canvas = context.canvas;

    if (typeof maxWidth == 'undefined') {
        maxWidth = (canvas && canvas.width) || 300;
    }
    if (typeof lineHeight == 'undefined') {
        lineHeight = (canvas && parseInt(window.getComputedStyle(canvas).lineHeight)) || parseInt(window.getComputedStyle(document.body).lineHeight);
    }

    // 字符分隔为数组
    var arrText = text.split('');
    var line = '';
    // 控制行数
    var limitRow = row || 2;
    var row = 0;

    for (var n = 0; n < arrText.length; n++) {
        var testLine = line + arrText[n];
        var isLimitRow = row === (limitRow-1);
        var measureText = isLimitRow? (testLine+'...'):testLine;
        var metrics = context.measureText(measureText);
        var testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            context.fillText(measureText, x, y);
            line = "";
            y += lineHeight;
            row++;
            if (isLimitRow) {
              break;
            }
        } else {
            line = testLine;
        }
    }
    if (row!==limitRow) {
      context.fillText(line, x, y);
    }

};

  var canvas = document.getElementById('drawingCanvas');
  var context = canvas.getContext('2d');
  // canvas 的坐标原点是左上角，向右和向下是正值
  context.font = "20px Arial";
  context.fillStyle = "black";
  context.fillText('This is canvas!',10,20);

  context.fillStyle = "red";
  context.fillText('This is canvas row2',10,40);

  context.fillStyle = "#333";
  context.wrapText('我是一段会换行的文字啦啦啦是一段会换行的文字啦啦啦', 0, 60, 140);


  context.wrapText('我是一段不会换行', 0, 110, 140);


}