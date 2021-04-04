// 文件批量重命名
var fs = require("fs");
var path = require("path");

var dealPath = '../comic/demo/serial'
// var dealFile = [141] // 测试 需要重命名的文件夹
var dealFile = [137,138] // 需要重命名的文件夹
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
      if ([".jpg",".png"].includes(path.extname(file))) {
        fileArr.push(pathName);
      }
    }
  }
}



function run() {
  const dealFilePath = dealFile.map(ele => (`${dealPath}/${ele}`))
  dealFilePath.map(ele => {
    readDir(ele);
  })
  // console.log(fileArr)
  fileArr.map(ele => {
    const isNeed = ele.indexOf('_') > -1
    if (isNeed) {
      const eleTypePos =  ele.lastIndexOf('.')
      const fileType = ele.substring(eleTypePos)
      const eleSplit =  ele.split('_')
      const newName = `${eleSplit[0]}${fileType}`
      fs.renameSync(ele, newName)
    }
  })
}

run()