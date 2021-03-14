
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

const baseRoot = '../comic/yanQuan/'
const comicMark = '2664'
// const chapterReqUrl = "https://www.manhuadb.com/manhua/" + comicMark + '/'
const site = 'https://www.manhuadb.com'
const chapterReqUrl = site + "/manhua/" + comicMark + '/'
const chapterFile = baseRoot + 'chapter.json'
const imagesJsonFileName = 'images.json'
const titleFileName = 'title.md'
const emptyJsonFileName = 'empty.json'
const singleChapterFileName = 'chapter.json' // 这是适用于每张图片源都要单独去请求的情况
const baseEmptyJsonFile = baseRoot+'empty.json'
const baseFailJsonFile = baseRoot+'down-fail.json'

// 获取所有章节数据，并存放到本地
async function getChaptersData() {
  const result = await requestPromise(`${chapterReqUrl}`,{reqType:'https'})

  const linkReg = getChapterContainerReg(2)
  const matchResult = result.match(linkReg)
  // console.log('---matchResult---')
  // console.log(matchResult)

  if (matchResult && matchResult.length) {
    const chapterReg = getChapterReg(2,comicMark)
    // 默认先取第一个，一个结束后，手动修改
    const chapterLink = matchResult[0]
    const linkMatch = chapterLink.match(chapterReg)
    // console.log('---linkMatch---')
    // console.log(linkMatch)

    // return;

    if (linkMatch && linkMatch.length) {
      // 先按照 正式连载,短篇,卷附录，单行本, 进行分类，然后再分别放入数组
      const allLink = classifyData(linkMatch,4)
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
// 这个适用于单个页面就可以获取所有图片源的情况
async function getImagesData() {
  // 有就用
  // globalExpand()
  const fileData = readJsonFile(chapterFile)

  creatClassifyFold(fileData,baseRoot,1)

  let baseFail = readJsonFile(baseEmptyJsonFile)
    // console.log('---chapterList---')
    // console.log(chapterList)
  const classify = 'serial' // 有 4 个值 serial short single appendix
  const chapterList = fileData[classify]
  const chapterNum = chapterList.length
  let startDire = 1 // 跟本地的文件夹命名顺序一致，从 1 开始
  while (startDire <= chapterNum) {
  // while (startDire <= 1) { // 测试用
    let startDownChapterObj = chapterList[startDire-1]
    const startDownChapter = startDownChapterObj.link
    const preBaseRoot = `${baseRoot}${classify}/`

    createFold(`${preBaseRoot}${startDire}`)

    const pathPre = `${preBaseRoot}${startDire}/`
    const imagesFile = `${pathPre}${imagesJsonFileName}`
    const singleChapterFile = `${pathPre}${singleChapterFileName}` // 适用每张图片都要单独请求一个页面的情况
    const titleFile = `${pathPre}${titleFileName}`
    if (fs.existsSync(titleFile) || baseFail.includes(startDownChapter)) {
      // console.log(`chapter ${startDire} all image src exist`)
      startDire += 1
      continue;
    }
    let url = `${site}${startDownChapter}`
    let imageData = {}
    const res = await requestPromise(url,{reqType:'https'}).catch((e) => {
      console.log(`chapter fail ${startDownChapter}`)
      baseFail.push(startDownChapter)
      writeLocalFile(baseEmptyJsonFile,JSON.stringify(baseFail))
    })

    if (!res) {
      startDire += 1
      continue;
    }

    imageData = getChapterImageData(res,3,url)
    if (!imageData.total) {
      return;
    }
    const imagesContent = JSON.stringify(imageData)

    // await writeLocalFile(imagesFile,imagesContent)
    await writeLocalFile(singleChapterFile,imagesContent)
    await writeLocalFile(titleFile,imageData.title)
    console.log(`get chapter ${startDire} all image src`)
    startDire += 1
  }
}

// 每张图片都要单独请求一个页面的情况
async function getImages() {
  const fileData = readJsonFile(chapterFile)
  const classify = 'serial' // 有 4 个值 serial short single appendix
  const preBaseRoot = `${baseRoot}${classify}/`
  const chapterList = fileData[classify]
  const chapterNum = chapterList.length
  let startDire = 67 // 跟本地的文件夹命名顺序一致，从 1 开始
  // while (startDire <= chapterNum) {
  while (startDire <= 67) { // 测试用
    let imageData = {
      list:[],
      total:0,
      title:''
    }
    const pathPre = `${preBaseRoot}${startDire}/`
    const imagesFile = `${pathPre}${imagesJsonFileName}`

    if (fs.existsSync(imagesFile) ) {
      console.log(`all image src exist ${imagesFile} `)
      startDire += 1
      continue;
    }


    const failFilePath = `${pathPre}${emptyJsonFileName}`
    let failData = readJsonFile(failFilePath)
    const singleChapterFileData = readJsonFile(`${pathPre}${singleChapterFileName}`)
    const totalCount = singleChapterFileData.total
    imageData.total = totalCount
    imageData.title = singleChapterFileData.title
    const baseUrl = singleChapterFileData.link

    for (let index = 1; index <= totalCount; index++) {
      const url = baseUrl.replace(/.html/g,`_p${index}.html`)

      if (failData.includes(url)) {
        continue;
      }

      const res = await requestPromise(url,{reqType:'https'}).catch((e) => {
        console.log(`chapter fail ${url}`)
        failData.push(url)
        writeLocalFile(failFilePath,JSON.stringify(failData))
      })

      if (!res) {
        continue;
      }

      imageData.list[index-1] = (formatChapter(res,5))
      console.log(`get image src success ${index} - ${pathPre}`)
    }

    const imagesContent = JSON.stringify(imageData)

    await writeLocalFile(imagesFile,imagesContent)
    console.log(`get all image src success ${pathPre}`)
    startDire += 1
  }

}

// 对获取失败的章节的处理,未完成
async function getDownFailImagesData(type) {
  const useWay2 = type == 2;
  const fileData = readJsonFile(baseFailJsonFile)

    // console.log('---chapterList---')
    // console.log(chapterList)
  const classify = 'appendix' // 有 4 个值 serial short single appendix
  chapterList = fileData[classify]
  const chapterNum = chapterList.length
  let startDire = 1 // 跟本地的文件夹命名顺序一致，从 1 开始
  while (startDire <= chapterNum) {
  // while (startDire <= 1) { // 测试用
    let startDownChapterObj = chapterList[startDire-1]
    let filePos = startDownChapterObj.file
    startDownChapterUrl = startDownChapterObj.link
    let preBaseRoot = `${baseRoot}${classify}/`

    const pathPre = `${preBaseRoot}${filePos}/`
    const imagesFile = `${pathPre}${imagesJsonFileName}`
    const titleFile = `${pathPre}${titleFileName}`
    // if (fs.existsSync(titleFile)) {
      // console.log(`chapter ${startDire} all image src exist`)
      // startDire += 1
      // continue;
    // }
    let url = `${chapterReqUrl}${startDownChapterUrl}`
    let imageData = {}
    let reqOptions = {}
    if (useWay2) {
      reqOptions = {reqType:'http'}
    }
    const res = await requestPromise(url,reqOptions).catch((e) => {
      console.log(`chapter fail ${filePos}`)
    })

    if (!res) {
      startDire += 1
      continue;
    }

    imageData = getChapterImageData(res,2)
    if (!imageData.total) {
      return;
    }
    const imagesContent = JSON.stringify(imageData)

    await writeLocalFile(imagesFile,imagesContent)
    await writeLocalFile(titleFile,imageData.title)
    console.log(`get chapter ${startDire} all image src`)
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

  const url = 'http://www.mangabz.com/m19561/chapterimage.ashx?cid=19561&page=1&key=&_cid=19561&_mid=280&_dt=2021-03-12+203A21%3A27%3A30&_sign=56a8ed542ee44d45b542a249b7683d68'
  // const url = 'http://www.mangabz.com/m19561/'
  const res = await requestPromise(`${url}`,{reqType:'http',headers:{}})
  const result = eval(res)
  console.log('---res---')
  console.log(res)


}

// getChaptersData()
// getImagesData()
getImages()
// downAllImages()
// test()
