window.onload = function () {

  var getPixelRatio = function (context) {
    var backingStore = context.backingStorePixelRatio ||
      context.webkitBackingStorePixelRatio ||
      context.mozBackingStorePixelRatio ||
      context.msBackingStorePixelRatio ||
      context.oBackingStorePixelRatio ||
      context.backingStorePixelRatio || 1;

    return (window.devicePixelRatio || 1) / backingStore;
  }

  var canvas = document.getElementById('drawingCanvas');
  var context = canvas.getContext('2d');
  var ratio = getPixelRatio(context);
  // canvas 的坐标原点是左上角，向右和向下是正值
  // 图片 src: https://xxholic.github.io/lab/images/css-shape-other-five-start.png

  var img = new Image();

  img.onload = function() {
    // 样式里面 canvas 用了 100% 虽然有效，但执行下面语句，会无效
    context.drawImage(img, 0, 0, 300 * ratio, 90 * ratio);
  };

  img.src = './html5-rocks.png';

  // context.drawImage(document.getElementById("originPic"), 0, 0, 300, 90);

}