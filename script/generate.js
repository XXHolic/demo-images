// 有些是直接打包下载的，要根据已有的文件生产 JSON 文件
const fs = require("fs");
const path = require("path");
const {
  createFold,
  writeLocalFile,
  requestPromise,
  readJsonFile,
  removeRepeat,
} = require('./utils')
const {sortChapterLink} = require('./helper')
const comicMark = 'yiShouMoDu'
const baseRoot = `../comic/${comicMark}/`
const chapterFile = baseRoot + 'chapter.json' // 包含总的信息，也方便获取解析
const defaultPrefix = 'https://github.com/XXHolic/demo-images/' // 给的假定的图片前缀，目前无其它用处
const imagesJsonFileName = 'images.json'

// 有 4 个值 serial short single appendix
const globalClassify = 'appendix'
let dealPath = `${baseRoot}${globalClassify}`
let dealFile = [11,12,13,14,15,16,17,18,19,20,21,22,23] // 需要提取的文件夹

/**
 * 递归目录及下面的文件，找出目标文件，这里只针对只有一层，不支持多层递归
 * @param {String} dir 文件夹路径
 */
function readDirFile(dir) {
  var exist = fs.existsSync(dir);
  // console.info('dir',dir)
  // 排除不需要遍历的文件夹或文件
  var excludeDir = /^(\.|node_module)/;
  if (!exist) {
    console.error("目录路径不存在");
    return;
  }
  var pa = fs.readdirSync(dir);
  // console.info('pa',pa)
  let fileArr = []

  for (let index = 0; index < pa.length; index++) {
    let file = pa[index];
    var pathName = path.join(dir, file);
    var info = fs.statSync(pathName);
    if (info.isDirectory() && !excludeDir.test(file)) {
      // readDirFile(pathName);
    } else {

      if ([".jpg",".png",".jpeg"].includes(path.extname(file))) {
        const pathSplit = pathName.split('\\')
        const fileName = pathSplit[pathSplit.length-1]
        fileArr.push(`${fileName}`);
      }
    }
  }

  return fileArr;
}

// 只读文件夹，不读文件
function readDir(dir) {
  var exist = fs.existsSync(dir);
  // console.log(dir)
  // 排除不需要遍历的文件夹或文件
  var excludeDir = /^(\.|node_module)/;
  if (!exist) {
    console.error("目录路径不存在");
    return;
  }
  var pa = fs.readdirSync(dir);
  // console.log(pa)

  let fileArr = []
  for (let index = 0; index < pa.length; index++) {
    let file = pa[index];
    var pathName = path.join(dir, file);
    var info = fs.statSync(pathName);
    if (info.isDirectory() && !excludeDir.test(file)) {
      fileArr.push(file);
    }
  }
  return fileArr
}

function generateChapter() {
  let fileData = readJsonFile(chapterFile,{})
  let directoryArr = readDir(dealPath);
  const directoryNum = directoryArr.length
  let obj = []
  for (let index = 1; index <= directoryNum; index++) {
  // for (let index = 1; index <= 1; index++) {
    const temp = {
      name: `第 ${index} 卷`,
      link: '',
      order: index
    }
    obj.push(temp)
  }
  fileData[globalClassify] = obj
  writeLocalFile(chapterFile,JSON.stringify(fileData))
  console.log('generated chapter.json')
}

function generateImages() {
  let directoryArr = [];
  directoryArr = readDir(dealPath)
  const directoryNum = directoryArr.length
  for (let index = 1; index <= directoryNum; index++) {
  // for (let index = 1; index <= 1; index++) {
    const ele = directoryArr[index-1];
    const imagePath = `${ele}/${imagesJsonFileName}`
    let localFileData = readJsonFile(`${dealPath}/${imagePath}`,{})
    if (localFileData.total) {
      console.log(`existed ${imagePath}`)
      continue;
    }
    const wholePath = path.join(dealPath, ele)
    const allImages = sortChapterLink(readDirFile(wholePath),1)
    const sortAllImages = allImages.map(ele => {
      return `${defaultPrefix}${ele}`
    })
    let listData = {
      list:sortAllImages,
      total:sortAllImages.length,
      title:`第 ${ele} 卷`
    }

    writeLocalFile(`${dealPath}/${imagePath}`,JSON.stringify(listData))
    console.log(`generated ${imagePath}`)
  }

}

// generateChapter()
generateImages()