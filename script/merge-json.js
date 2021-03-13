var fs = require("fs");
var path = require("path");
var currentPath = process.cwd(); // 获取当前执行路径

var dealPath = '../comic/diYuLe/serial'
var failFilePath = '../comic/diYuLe/down-fail.json'
var fileArr = []; // 存储目标文件路径

/**
 * 递归目录及下面的文件，找出目标文件
 * @param {String} dir 文件夹路径
 */
function readDir(dir) {
  var exist = fs.existsSync(dir);
  // 排除不需要遍历的文件夹或文件
  var excludeDir = /^(\.|node_module)/;
  if (!exist) {
    console.error("目录路径不存在");
    return;
  }
  var pa = fs.readdirSync(dir);

  for (let index = 0; index < pa.length; index++) {
    let file = pa[index];
    var pathName = path.join(dir, file);
    var info = fs.statSync(pathName);
    if (info.isDirectory() && !excludeDir.test(file)) {
      readDir(pathName);
    } else {
      if (pathName.indexOf('empty')>-1 && path.extname(file) === ".json") {
        fileArr.push(pathName);
      }
    }
  }
}

/**
 * 合并文件内容
 * @param {Array} arr 包含了所有 JSON 文件的路径
 * @returns {String} 返回合并后 JSON 字符串
 */
function combineFile(arr) {
  var obj = [];
  arr.length &&
    arr.forEach(ele => {
      var str = deleDom(ele);
      var contentObj = JSON.parse(str);
      if (contentObj && contentObj.length) {
        const eleMath = ele.match(/\d{1,5}/g)
        obj.push(eleMath[0])
      }
    });
  return JSON.stringify(obj);
}

/**
 * 删除 dom 符号，防止异常
 * @param {String} filePath 文件路径
 */
function deleDom(filePath) {
  var bin = fs.readFileSync(filePath);
  if (bin[0] === 0xef && bin[1] === 0xbb && bin[2] === 0xbf) {
    bin = bin.slice(3);
  }

  return bin.toString("utf-8");
}

readDir(dealPath);

var jsonStr = combineFile(fileArr);

fs.writeFile(failFilePath, jsonStr, function(err) {
  if (err) {
    console.error("文件写入失败");
  } else {
    console.info("文件写入成功");
  }
});