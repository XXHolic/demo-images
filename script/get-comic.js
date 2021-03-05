
const fs = require('fs');
const { createFold,LZString,imgHeader,writeLocalFile,requestPromise, } = require('./utils')

const baseRoot = '../comic/test/'
let maxPageNum = 200
const comicMark = '16389'
const imgHost = 'https://i.hamreus.com'
const chapterReqUrl = "https://www.mhgui.com/comic/" + comicMark + '/'
const chapterFile = baseRoot + 'chapter.json'
const imagesJsonFileName = 'images.json'
const titleFileName = 'title.md'
const emptyJsonFileName = 'empty.json'

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
      const allLink = linkMatch.reduce((acc,cur) => {
        const valueSplit = cur.split('/')
        const valueSplit2Len = valueSplit.length
        const chapterLink = valueSplit[valueSplit2Len-1]
        acc.push(chapterLink)
        return acc
      },[])
    // console.log('---allLink---')
    // console.log(allLink)
      writeLocalFile(chapterFile,JSON.stringify(allLink))
      console.log('get all chapter links success')
    }

  }


}

// 获取每个章节下所有图片的链接并存放到本地 json 文件
function getImagesData() {
  // 针对特定网站的扩展，不同网站可能不一样
  String.prototype.splic = function (f) {
    return LZString.decompressFromBase64(this).split(f)
  };

  const content = fs.readFileSync(chapterFile)
  const chapterList = JSON.parse(content)
    // console.log('---chapterList---')
    // console.log(chapterList)
  const chapterNum = chapterList.length
  let startDire = 1
  while (startDire <= chapterNum) {
  // while (startDire <= 1) { // 测试用
    startDownChapter = chapterList[startDire-1]
    createFold(`${baseRoot}${startDire}`)
    getImageSrc(startDire,startDownChapter)
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

    writeLocalFile(imagesFile,imagesContent)
    writeLocalFile(titleFile,cname)
    console.log(`get chapter ${localFold} all image src`)
  }

}

async function downAllImages() {
  const content = fs.readFileSync(chapterFile)
  const chapterList = JSON.parse(content)
    // console.log('---chapterList---')
    // console.log(chapterList)
  const chapterNum = chapterList.length
  let startDire = 1
  // while (startDire <= chapterNum) {
  while (startDire <= 1) { // 测试用
    imgListFile = `${baseRoot}${startDire}/${imagesJsonFileName}`
    const imagesContent = fs.readFileSync(imgListFile)
    const {total,list} = JSON.parse(imagesContent)

    const dataLen = list.length
    for (let index = 0; index < dataLen;) {
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
      const imagePath = `${baseRoot}${startDire}/${index+1}${imagType}`
      if (fs.existsSync(imagePath)) {
        console.log(`image exist ${imagePath}`)
        return;
      }
      const res = await requestPromise(url,{encoding:'binary',headers:imgHeader})
      writeLocalFile(imagePath,res,'binary')
      console.log(`down success ${imagePath}`)
      index++
    }
    startDire += 1
  }
}

// getChaptersData()
// getImagesData()
downAllImages()
