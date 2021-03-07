
const fs = require('fs');
const {
  createFold,
  writeLocalFile,
  requestPromise,
  readJsonFile,
} = require('./utils')
const {
  getChapterContainerReg,
  getChapterReg,
  formatChapter,
  sortChapterLink,
  globalExpand,
  getChapterImageData,
  getImageType,
  getImageHeader,
} = require('./helper')

const baseRoot = '../comic/huangJinShenWei/'
const comicMark = 'huangjinshenwei'
const chapterReqUrl = "https://www.ykmh.com/manhua/" + comicMark + '/'
const chapterFile = baseRoot + 'chapter.json'
const imagesJsonFileName = 'images.json'
const titleFileName = 'title.md'
const emptyJsonFileName = 'empty.json'
const baseEmptyJsonFile = baseRoot+'empty.json'

// 获取所有章节数据，并存放到本地
async function getChaptersData() {
  const result = await requestPromise(`${chapterReqUrl}`)

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

    if (linkMatch && linkMatch.length) {
      let allLink = linkMatch.reduce((acc,cur) => {
        acc.push(formatChapter(cur,1))
        return acc
      },[])
    // console.log('---allLink---')
    // console.log(allLink)
      // 有的情况可以根据数字大小排序
      allLink = sortChapterLink(allLink,1)
      writeLocalFile(chapterFile,JSON.stringify(allLink))
      console.log('get all chapter links success')
    }

  }


}

// 获取每个章节下所有图片的链接并存放到本地 json 文件
async function getImagesData() {
  // 有就用
  // globalExpand()

  const chapterList = readJsonFile(chapterFile)
  let baseFail = readJsonFile(baseEmptyJsonFile)
    // console.log('---chapterList---')
    // console.log(chapterList)
  const chapterNum = chapterList.length
  let startDire = 1 // 跟本地的文件夹命名顺序一致，从 1 开始
  while (startDire <= chapterNum) {
  // while (startDire <= 204) { // 测试用
    startDownChapter = chapterList[startDire-1]
    createFold(`${baseRoot}${startDire}`)

    const pathPre = `${baseRoot}${startDire}/`
    const imagesFile = `${pathPre}${imagesJsonFileName}`
    const titleFile = `${pathPre}${titleFileName}`
    if (fs.existsSync(titleFile) || baseFail.includes(startDownChapter)) {
      // console.log(`chapter ${startDire} all image src exist`)
      startDire += 1
      continue;
    }
    const url = `${chapterReqUrl}${startDownChapter}`
    const res = await requestPromise(url).catch((e) => {
      console.log(`chapter fail ${startDownChapter}`)
      baseFail.push(startDownChapter)
      writeLocalFile(baseEmptyJsonFile,JSON.stringify(baseFail))
    })
    if (!res) {
      startDire += 1
      continue;
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

// getChaptersData()
// getImagesData()
downAllImages()
