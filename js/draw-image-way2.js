window.onload = function () {

  var PIXEL_RATIO = (function () {
    var ctx = document.createElement("canvas").getContext("2d"),
      dpr = window.devicePixelRatio || 1,
      bsr = ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio || 1;

    return dpr / bsr;
  })();

  var createHiDPICanvas = function (w, h, ratio) {
    if (!ratio) { ratio = PIXEL_RATIO; }
    var can = document.createElement("canvas");
    can.width = w * ratio;
    can.height = h * ratio;
    can.style.width = w + "px";
    can.style.height = h + "px";
    can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
    return can;
  }

  var canvas = createHiDPICanvas(400,100);
  var context = canvas.getContext('2d');

  var img = new Image();

  img.onload = function () {
    // 样式里面 canvas 用了 100% 虽然有效，但执行下面语句，会无效
    context.drawImage(img, 0, 0, 300, 90);
    document.getElementsByTagName('body')[0].appendChild(canvas);
  };

  img.src = '../../images/html5-rocks.png';

  // context.drawImage(document.getElementById("originPic"), 0, 0, 300, 90);

}