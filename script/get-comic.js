
const fs = require('fs');
const {
  createFold,
  writeLocalFile,
  requestPromise,
  readJsonFile,
  removeRepeat,
} = require('./utils')
const {
  getChapterContainerReg,
  getChapterReg,
  classifyData,
  formatChapter,
  sortChapterLink,
  globalExpand,
  creatClassifyFold,
  getChapterImageData,
  getImageType,
  getImageHeader,
} = require('./helper')

const baseRoot = '../comic/diYuLe/'
const comicMark = '280bz'
// const chapterReqUrl = "https://www.ykmh.com/manhua/" + comicMark + '/'
const chapterReqUrl = "http://www.mangabz.com/" + comicMark + '/'
const chapterFile = baseRoot + 'chapter.json'
const imagesJsonFileName = 'images.json'
const titleFileName = 'title.md'
const emptyJsonFileName = 'empty.json'
const baseEmptyJsonFile = baseRoot+'empty.json'

// 获取所有章节数据，并存放到本地
async function getChaptersData() {
  const result = await requestPromise(`${chapterReqUrl}`,{reqType:'http',headers:{"cookie":"mangabz_lang=2"}})

  const linkReg = getChapterContainerReg(3)
  const matchResult = result.match(linkReg)
  // console.log('---matchResult---')
  // console.log(matchResult)

  if (matchResult && matchResult.length) {
    const chapterReg = getChapterReg(3,comicMark)
    // 默认先取第一个，一个结束后，手动修改
    const chapterLink = matchResult[0]
    const linkMatch = chapterLink.match(chapterReg)
    // console.log('---linkMatch---')
    // console.log(linkMatch)

    // return;

    if (linkMatch && linkMatch.length) {
      // 先按照 正式连载,短篇,卷附录，单行本, 进行分类，然后再分别放入数组
      const allLink = classifyData(linkMatch)
      // let allLink = linkMatch.reduce((acc,cur) => {
      //   acc.push(formatChapter(cur,1))
      //   return acc
      // },[])
    // console.log('---allLink---')
    // console.log(allLink)
      // 有的情况可以根据数字大小排序
      // allLink = sortChapterLink(allLink,1)
      writeLocalFile(chapterFile,JSON.stringify(allLink))
      console.log('get all chapter links success')
    }

  }


}

// 获取每个章节下所有图片的链接并存放到本地 json 文件
async function getImagesData(type) {
  // 有就用
  // globalExpand()
  const useWay2 = type == 2;
  const fileData = readJsonFile(chapterFile)

  creatClassifyFold(fileData,baseRoot,1)

  let baseFail = readJsonFile(baseEmptyJsonFile)
    // console.log('---chapterList---')
    // console.log(chapterList)
  let chapterList = fileData
  const classify = 'serial'
  if (useWay2) {
    chapterList = fileData[classify]
  }
  const chapterNum = chapterList.length
  let startDire = 1 // 跟本地的文件夹命名顺序一致，从 1 开始
  while (startDire <= chapterNum) {
  // while (startDire <= 204) { // 测试用
    let startDownChapter = chapterList[startDire-1]
    let preBaseRoot = `${baseRoot}`
    if (useWay2) {
      startDownChapter = startDownChapter.page
      preBaseRoot = `${baseRoot}${classify}/`
    }
    createFold(`${preBaseRoot}${startDire}`)

    const pathPre = `${preBaseRoot}${startDire}/`
    const imagesFile = `${pathPre}${imagesJsonFileName}`
    const titleFile = `${pathPre}${titleFileName}`
    if (fs.existsSync(titleFile) || baseFail.includes(startDownChapter)) {
      // console.log(`chapter ${startDire} all image src exist`)
      startDire += 1
      continue;
    }
    let url = `${chapterReqUrl}${startDownChapter}`
    if (useWay2) {
      url = `${chapterReqUrl}${startDownChapter.substr(1)}`
    }
    // const res = await requestPromise(url).catch((e) => {
    //   console.log(`chapter fail ${startDownChapter}`)
    //   baseFail.push(startDownChapter)
    //   writeLocalFile(baseEmptyJsonFile,JSON.stringify(baseFail))
    // })

    // if (!res) {
    //   startDire += 1
    //   continue;
    // }

    for (let index = 0; index < array.length; index++) {
      const element = array[index];

    }

    const imageData = getChapterImageData(res,2)
    const imagesContent = JSON.stringify(imageData)

    await writeLocalFile(imagesFile,imagesContent)
    await writeLocalFile(titleFile,imageData.title)
    console.log(`get chapter ${startDire-1} all image src`)
    startDire += 1
  }
}

async function downAllImages() {
  const chapterList = readJsonFile(chapterFile)
    // console.log('---chapterList---')
    // console.log(chapterList)
  const chapterNum = chapterList.length
  let startDire = 1
  while (startDire <= chapterNum) {
  // while (startDire <= 204) { // 测试用
    const pre = `${baseRoot}${startDire}/`
    const emptyJsonFile = `${pre}${emptyJsonFileName}`
    const imgListFile = `${pre}${imagesJsonFileName}`
    const imagesContent = readJsonFile(imgListFile)
    const {total,list} = imagesContent
    let failData = readJsonFile(emptyJsonFile)

    const dataLen = list.length
    for (let index = 0; index < dataLen;index++) {
      const url = list[index];
      // console.info('url',url)
      const imagType = getImageType(url,2)
      const imagePath = `${pre}${index+1}${imagType}`
      if (fs.existsSync(imagePath)) {
        console.log(`image exist ${imagePath}`)
        continue;
      }
      if (failData.includes(imagePath)) {
        continue;
      }
      const imgHeader = getImageHeader(2)
      const res = await requestPromise(url,{encoding:'binary',headers:imgHeader}).catch((e) =>{
        console.log(`down fail ${imagePath}`)
        failData.push(url)
        writeLocalFile(emptyJsonFile,JSON.stringify(failData))
      })

      if (!res) {
        continue;
      }

      await writeLocalFile(imagePath,res,'binary')
      console.log(`down success ${imagePath}`)
    }
    startDire += 1
  }
}

async function test () {

  // const url = 'http://www.mangabz.com/m19568/chapterimage.ashx?cid=19568&key=&_cid=19568&_mid=280&_dt=2021-03-11+22%3A22%3A37&_sign=df733a207da179f7173022a324544612'
  // const result = await requestPromise(`${url}`,{reqType:'http',headers:{}})

  // console.log('---result---')
  // console.log(result)

}

// getChaptersData()
// getImagesData()
// downAllImages()
test()
