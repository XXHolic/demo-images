
const fs = require('fs');
const { createFold,LZString,imgHeader,writeLocalFile,requestPromise,readJsonFile } = require('./utils')

const baseRoot = '../comic/huangJinShenWei/'
let maxPageNum = 200
const comicMark = '16306'
const imgHost = 'https://i.hamreus.com'
const chapterReqUrl = "https://www.mhgui.com/comic/" + comicMark + '/'
const chapterFile = baseRoot + 'chapter.json'
const imagesJsonFileName = 'images.json'
const titleFileName = 'title.md'
const emptyJsonFileName = 'empty.json'
const baseEmptyJsonFile = baseRoot+'empty.json'

// 获取所有章节数据，并存放到本地
async function getChaptersData() {
  const result = await requestPromise(`${chapterReqUrl}`)

  const linkReg = /<div class="chapter-list cf mt10"+.*?>([\s\S]*?)<\/div*?>/g
  const matchResult = result.match(linkReg)
  // console.log('---matchResult---')
  // console.log(matchResult)

  if (matchResult && matchResult.length) {
    const chapterReg = new RegExp('href="\/comic\/'+comicMark+'\/+.*?html','g')
    // 默认先取第一个，一个结束后，手动修改
    const chapterLink = matchResult[0]
    const linkMatch = chapterLink.match(chapterReg)
    // console.log('---linkMatch---')
    // console.log(linkMatch)

    if (linkMatch && linkMatch.length) {
      let allLink = linkMatch.reduce((acc,cur) => {
        const valueSplit = cur.split('/')
        const valueSplit2Len = valueSplit.length
        const chapterLink = valueSplit[valueSplit2Len-1]
        acc.unshift(chapterLink)
        return acc
      },[])
    // console.log('---allLink---')
    // console.log(allLink)
    // 有的情况可以根据数字大小排序,不需要的时候就注释掉
      allLink = allLink.sort((a,b) => {
        const aSplit = a.split('.')
        const aNum = Number(aSplit[0])
        const bSplit = b.split('.')
        const bNum = Number(bSplit[0])
        return aNum - bNum
      })
      writeLocalFile(chapterFile,JSON.stringify(allLink))
      console.log('get all chapter links success')
    }

  }


}

// 获取每个章节下所有图片的链接并存放到本地 json 文件
async function getImagesData() {
  // 针对特定网站的扩展，不同网站可能不一样
  String.prototype.splic = function (f) {
    return LZString.decompressFromBase64(this).split(f)
  };

  const chapterList = readJsonFile(chapterFile)
  let baseFail = readJsonFile(baseEmptyJsonFile)
    // console.log('---chapterList---')
    // console.log(chapterList)
  const chapterNum = chapterList.length
  let startDire = 204
  while (startDire <= chapterNum) {
  // while (startDire <= 1) { // 测试用
    startDownChapter = chapterList[startDire-1]
    createFold(`${baseRoot}${startDire}`)
    // getImageSrc(startDire,startDownChapter)

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
    const reg = /<script type="text\/javascript">window([\s\S]*?)<\/script*?>/g
    const matchResult = res.match(reg)
    // console.log('---matchResult---')
    // console.log(matchResult)

    if (matchResult && matchResult.length) {
      const ele = matchResult[0];
      const eleLen = ele.length;
      const codeStr = ele.substring(57,eleLen-10)
      // console.log('---codeStr---')
      // console.log(codeStr)
      const result = eval(codeStr)
      // console.log('---result---')
      // console.log(result)
      const first = result.indexOf('{')
      const last = result.lastIndexOf('}')

      let newStr = result.substring(first,last+1)
      const mainObj = JSON.parse(newStr)
      const {cname,files,len,path,sl} = mainObj
      const {e,m} = sl
      const listData = files.reduce((acc,cur) => {
        const url = `${imgHost}${path}${cur}?e=${e}&m=${m}`
        acc.push(url)
        return acc;
      },[])
      // console.log(listData)
      const imagesContent = JSON.stringify({
        total:len,
        list:listData,
      })

      await writeLocalFile(imagesFile,imagesContent)
      await writeLocalFile(titleFile,cname)
      await console.log(`get chapter ${localFold} all image src`)
    }

    startDire += 1
  }
}

// 针对所有的图片链接隐藏在同一个页面的情况
async function getImageSrc(localFold,downChapter) {
  const pathPre = `${baseRoot}${localFold}/`
  const imagesFile = `${pathPre}${imagesJsonFileName}`
  const titleFile = `${pathPre}${titleFileName}`
  if (fs.existsSync(titleFile)) {
    console.log(`chapter ${localFold} all image src exist`)
    return;
  }

  const url = `${chapterReqUrl}${downChapter}`
  const res = await requestPromise(url)
  const reg = /<script type="text\/javascript">window([\s\S]*?)<\/script*?>/g
  const matchResult = res.match(reg)
  // console.log('---matchResult---')
  // console.log(matchResult)

  if (matchResult && matchResult.length) {
    const ele = matchResult[0];
    const eleLen = ele.length;
    const codeStr = ele.substring(57,eleLen-10)
    // console.log('---codeStr---')
    // console.log(codeStr)
    const result = eval(codeStr)
    // console.log('---result---')
    // console.log(result)
    const first = result.indexOf('{')
    const last = result.lastIndexOf('}')

    let newStr = result.substring(first,last+1)
    const mainObj = JSON.parse(newStr)
    const {cname,files,len,path,sl} = mainObj
    const {e,m} = sl
    const listData = files.reduce((acc,cur) => {
      const url = `${imgHost}${path}${cur}?e=${e}&m=${m}`
      acc.push(url)
      return acc;
    },[])
    // console.log(listData)
    const imagesContent = JSON.stringify({
      total:len,
      list:listData,
    })

    await writeLocalFile(imagesFile,imagesContent)
    await writeLocalFile(titleFile,cname)
    await console.log(`get chapter ${localFold} all image src`)
  }

}

async function downAllImages() {
  const chapterList = readJsonFile(chapterFile)
    // console.log('---chapterList---')
    // console.log(chapterList)
  const chapterNum = chapterList.length
  let startDire = 46
  while (startDire <= chapterNum) {
  // while (startDire <= 1) { // 测试用
    const pre = `${baseRoot}${startDire}/`
    const emptyJsonFile = `${pre}${emptyJsonFileName}`
    const imgListFile = `${pre}${imagesJsonFileName}`
    const imagesContent = readJsonFile(imgListFile)
    const {total,list} = JSON.parse(imagesContent)
    let failData = readJsonFile(emptyJsonFile)

    const dataLen = list.length
    for (let index = 0; index < dataLen;index++) {
      const url = list[index];
      // console.info('url',url)
      const split1 = url.split('?');
      const split1Res = split1[0];
      const split2 = split1Res.split('/');
      const split2Res = split2[split2.length-1];
      const reg = /\.[a-z]{1,4}/g;
      const matchResult = split2Res.match(reg);
      // const imagType = matchResult.join('')
      const imagType = matchResult[0]
      const imagePath = `${pre}${index+1}${imagType}`
      if (fs.existsSync(imagePath)) {
        console.log(`image exist ${imagePath}`)
        continue;
      }
      if (failData.includes(imagePath)) {
        continue;
      }
      const res = await requestPromise(url,{encoding:'binary',headers:imgHeader}).catch((e) =>{
        console.log(`down fail ${imagePath}`)
        failData.push(url)
        writeLocalFile(emptyJsonFile,JSON.stringify(failData))
      })

      if (!res) {
        continue;
      }

      await writeLocalFile(imagePath,res,'binary')
      await console.log(`down success ${imagePath}`)
    }
    startDire += 1
  }
}

// getChaptersData()
getImagesData()
// downAllImages()
