import noImg from 'images/placeholder@480.png';
import shareIcon from 'images/share-icon.png';
function canvasTextEllipsis(text, x, y, maxWidth, row) {
  if (typeof text != 'string' || typeof x != 'number' || typeof y != 'number') {
    return;
  }

  var context = this;
  var canvas = context.canvas;

  if (typeof maxWidth == 'undefined') {
    maxWidth = canvas && canvas.width || 300;
  }
  var lineHeight =
    canvas && parseInt(window.getComputedStyle(canvas).lineHeight) ||
    parseInt(window.getComputedStyle(document.body).lineHeight);

  // 字符分隔为数组
  var arrText = text.split('');
  var line = '';
  // 控制行数
  var limitRow = row || 2;
  var rowCount = 0;

  for (var n = 0; n < arrText.length; n++) {
    var testLine = line + arrText[n];
    var isLimitRow = rowCount === limitRow - 1;
    var measureText = isLimitRow ? `${testLine}...` : testLine;
    var metrics = context.measureText(measureText);
    var testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0 && rowCount !== limitRow) {
      context.fillText(measureText, x, y);
      line = '';
      y += lineHeight;
      rowCount++;
      if (isLimitRow) {
        break;
      }
    } else {
      line = testLine;
    }
  }
  if (rowCount !== limitRow) {
    context.fillText(line, x, y);
  }
}

function drawRoundRect(cxt, x, y, width, height, radius) {
  cxt.beginPath();
  cxt.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2);
  cxt.lineTo(width - radius + x, y);
  cxt.arc(width - radius + x, radius + y, radius, Math.PI * 3 / 2, Math.PI * 2);
  cxt.lineTo(width + x, height + y - radius);
  cxt.arc(width - radius + x, height - radius + y, radius, 0, Math.PI * 1 / 2);
  cxt.lineTo(radius + x, height + y);
  cxt.arc(radius + x, height - radius + y, radius, Math.PI * 1 / 2, Math.PI);
  cxt.closePath();
}

function getPixelRatio() {
  var ctx = document.createElement('canvas').getContext('2d'),
    dpr = window.devicePixelRatio || 1,
    bsr =
      ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio ||
      1;

  return dpr / bsr;
}

function createCanvasElement(w, h, ratio) {
  var can = document.createElement('canvas');

  can.width = w * ratio;
  can.height = h * ratio;
  can.style.width = `${w}px`;
  can.style.height = `${h}px`;
  can.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
  return can;
}

function combineImage(params) {
  let { data, mainImage, qrImage, companyIconImage, from } = params;
  var pixelRatio = getPixelRatio();

  var clientWidth = document.documentElement.clientWidth;
  var picWidth = clientWidth * 0.67;
  var picHeight = picWidth * 1.5;
  var productNameMaxWidth = picWidth * 0.62;
  var companyNameMaxWidth = picWidth - 40;

  var canvas = createCanvasElement(picWidth, picHeight, pixelRatio);

  canvas.style.lineHeight = 1.5;
  var context = canvas.getContext('2d');
  // 绘制圆角

  drawRoundRect(context, 0, 0, picWidth, picHeight, 5);
  context.clip();

  // 背景色
  context.fillStyle = '#fff';
  context.fillRect(0, picWidth, picWidth, picHeight - picWidth);

  // 主图展示
  context.drawImage(mainImage, 0, 0, picWidth, picWidth);
  // 二维码
  context.drawImage(qrImage, picWidth - 70, picWidth + 8, 60, 60);
  // 底部icon
  context.drawImage(companyIconImage, 10, picHeight - 20, 12, 12);

  // 商品名称文字描述
  var productName = from === 'list' ? data.productName : data.name;

  context.font = '14px Arial,"Helvetica Neue",Helvetica,"Microsoft Yahei",STHeiTi,sans-serif';
  context.fillStyle = '#33404e';
  canvasTextEllipsis.call(context, productName, 10, picWidth + 22, productNameMaxWidth, 3);

  // 商品价格
  // context.font = '16px Arial,"Helvetica Neue",Helvetica,"Microsoft Yahei",STHeiTi,sans-serif';
  // context.fillStyle = '#ff6a4d';
  // var productShowMoney = from === 'list' ? data.minMarketPrice : data.marketPrice;
  // var productShowMoneyText = `￥${productShowMoney}`;

  // context.fillText(productShowMoneyText, 8, picWidth + 88);

  // 底部文字
  context.fillStyle = '#999faa';
  context.font = '12px Arial,"Helvetica Neue",Helvetica,"Microsoft Yahei",STHeiTi,sans-serif';
  canvasTextEllipsis.call(context, SYSTEM.company.name, 24, picHeight - 10, companyNameMaxWidth, 1);
  context.font = '11px Arial,"Helvetica Neue",Helvetica,"Microsoft Yahei",STHeiTi,sans-serif';
  context.fillText('扫码看详情', picWidth - 68, picWidth + 85);

  // var showEle = document.getElementsByClassName('product-list-body')[0];
  // var showEle = document.getElementsByClassName('product-info')[0];

  // showEle.appendChild(canvas);
  var imageBase64 = canvas.toDataURL();

  // return false;
  // alert(imageBase64);

  let productId = '';
  let productImg = '';

  if (from === 'list') {
    productId = data.productIds.split(',')[0] || '';
    productImg = data.imgUrl_480 || data.mainImg;
  }

  if (from === 'detail') {
    productId = data.id;
    const mainImg = data.mainImg || {};

    productImg = mainImg.imgUrl_480 || mainImg.imgUrl;
  }

  let shareImg = productImg ? window.SYSTEM.product.productImgsUrl + productImg : '';

  let hybridData = {
    isOpenProgram: false,
    isImageShare: true,
    qrImageData: imageBase64,
    isMinProgram: false,
    hdImageData: '',
    url: `${SYSTEM.setting.openMallUrl}#!page=ProductDetail2&sid=${
      data.productSummaryId
      }&id=${productId}&backhome=true`,
    title: `${productName}  火热销售中，快来抢购！`,
    content: SYSTEM.company.name,
    image: shareImg,
  };

  window.Hybrid('biz.shareContent', hybridData).then(() => {
    // window.isSimpleYdhApp && Toast.info('分享成功');
  });
}

function getQd(params) {
  let { data, from } = params;
  let productId = '';

  if (from === 'list') {
    productId = data.productIds.split(',')[0] || '';
  }
  if (from === 'detail') {
    productId = data.id;
  }
  let urlParams = {
    action: 'encode',
    url: escape(
      `${SYSTEM.setting.openMallUrl}#!page=ProductDetail2&sid=${data.productSummaryId}&id=${productId}&backhome=true`
    ),
    size: 150,
    format: 'png',
  };
  var logoInfo = {};
  // var qrLogo = SYSTEM.setting.qrLogo;
  var qrLogo = SYSTEM.company.corpLogo;

  if (qrLogo) {
    let qrLogoArr = qrLogo.split('images');
    let qrLogoPart = qrLogoArr[1].split('@');
    let qrLogoImage = `images${qrLogoPart[0]}`;

    logoInfo = {
      isWithLogo: true,
      logo: escape(qrLogoImage),
      logoWidth: 40,
      logoHeight: 40,
    };
  }

  let combineParams = Object.assign(urlParams, logoInfo);
  let baseUrl = 'https://corp.dinghuo123.com/alert/qrcode?';

  for (const key in combineParams) {
    if (combineParams.hasOwnProperty(key)) {
      baseUrl += `${key}=${combineParams[key]}&`;
    }
  }
  return baseUrl;
  // console.info('url', baseUrl);
}

export const shareImage = ({ data, from }) => {
  let productImg = '';

  if (from === 'list') {
    productImg = data.imgUrl_480 || data.mainImg;
  }

  if (from === 'detail') {
    const mainImg = data.mainImg || {};

    productImg = mainImg.imgUrl_480 || mainImg.imgUrl;
  }

  // 多张图片加载，要全部加载完才行
  var loadFlag = 0;

  var mainImage = new Image();
  var mainImageURL = productImg ? window.SYSTEM.product.productImgsUrl + productImg : noImg;

  console.info('mainImageURL', mainImageURL);
  mainImage.crossOrigin = 'Anonymous';
  mainImage.src = mainImageURL;

  var qrImage = new Image();

  qrImage.crossOrigin = 'Anonymous';
  var qrCodeUrl = getQd({ data, from });

  // console.info('qrCodeUrl2', qrCodeUrl);
  // var qrCodeUrl ='https://corp.dinghuo123.com/alert/qrcode?action=encode&url=https%3A%2F%2Fagent.dinghuo123.com%2Fv2%2Fshare%2FopenMall%2Fstore%2F24482622%2Fregister%3Fpromoter%3D24495397%26companyUserId%3D24495397%26themeColor%3DFF7000&size=370&format=png';

  qrImage.src = qrCodeUrl;

  var companyIconImage = new Image();

  companyIconImage.src = shareIcon;

  mainImage.onload = function () {
    // alert('mainImage load');
    loadFlag++;
    if (loadFlag === 3) {
      combineImage({ data, mainImage, qrImage, companyIconImage, from });
    }
  };

  qrImage.onload = function () {
    // alert('qrImage load');
    loadFlag++;
    if (loadFlag === 3) {
      combineImage({ data, mainImage, qrImage, companyIconImage, from });
    }
  };

  companyIconImage.onload = function () {
    // 底部图片
    loadFlag++;
    if (loadFlag === 3) {
      combineImage({ data, mainImage, qrImage, companyIconImage, from });
    }
  };
};
