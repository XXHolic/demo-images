
// 不同的网站，解析的正则不一样，在这里统一区分

const {
  createFold,
  writeLocalFile,
  requestPromise,
  readJsonFile,
  regMatch,
} = require('./utils')

const base64 = require('./base64')

const getChapterContainerReg = (type) => {
  switch(type){
    case 1:
    return /<div class="chapter-list cf mt10"+.*?>([\s\S]*?)<\/div*?>/g
    case 2:
    // return /<ul id="chapter-list-1"+.*?>([\s\S]*?)<\/ul*?>/g
    return /<ol class="links-of-books num_div"+.*?>([\s\S]*?)<\/ol*?>/g
    case 3:
    return /<div class="detail-list-form-con"+.*?>([\s\S]*?)<\/div*?>/g
  }
}

const getChapterReg = (type,comicMark) => {
  switch(type){
    case 1:
    return new RegExp('href="\/manhua\/'+comicMark+'\/+.*?html','g')
    case 2:
    return new RegExp('<a href="\/manhua\/'+comicMark+'\/+.*?\/a>','g')
    case 3:
    return new RegExp('<a class="" href="\/+.*?>([\\s\\S]*?)<\/a>','g')
    case 4:
    return new RegExp('<a href="\/'+comicMark+'\/+.*?\/a>','g')
  }
}

const formatChapter = (data,type) => {
  let chapterLink = ''
  if (type === 1) {
    // <a href="/manhua/jinjidejuren/57916.html"><span class="list_con_tb"></span><span class="list_con_zj">138话</span><span class="list_con_tips"></span></a>
    const matchResult = data.match(/\/+.*?.html/g)
    const page = matchResult[0]
    // 有的可能没有数字，就设为 0
    const orderMatch = page.match(/\d{1,7}/g)
    const order = orderMatch?Number(orderMatch[0]):0

    const pattern = /<(\S*?)[^>]*>.*?|<.*? \/>/g
    const value1 = data.replace(pattern,'')
    // const value2 = value1.replace(/\s+/g,'') // 去掉全部空格，有英文的时候，中间空格要保留
    const value2 = value1.replace(/(^\s*)|(\s*$)/g,"") // 去掉两边空格
    chapterLink = {
      name: value2,
      link: page,
      order: order
    }
  }
  if (type === 2) {
    // <a href="/m132667/" class="detail-list-form-item" title="" target="_blank">第106话<span>（19P）</span></a>
    const matchResult = data.match(/\/m+.*?\//g)
    const page = matchResult[0]
    const pattern = /<(\S*?)[^>]*>.*?|<.*? \/>/g
    const value1 = data.replace(pattern,'')
    const value2 = value1.replace(/\s+/g,'')
    chapterLink = {
      name: value2,
      link: page
    }
  }
  if(type == 3) {
    const pattern = new RegExp('var isVip =+.*?reseturl','g')
    const totalStrMatch = data.match(pattern)
    const totalStr = totalStrMatch[0]
    const codeStr = totalStr.substring(0,totalStr.indexOf('reseturl'))
    const codeFormat = `(function(){${codeStr}return{total:MANGABZ_IMAGE_COUNT,cid:MANGABZ_CID,mid:MANGABZ_MID,title:MANGABZ_CTITLE,sign:MANGABZ_VIEWSIGN,dt:MANGABZ_VIEWSIGN_DT}})()`
    const msgObj = eval(codeFormat)
    chapterLink = msgObj
  }
  if (type === 4) {
    // <a href="/31737/051.html" title="42话" class="status0" target="_blank"><span>42话<i>22p</i></span></a>
    const matchResult = data.match(/\/+.*?.html/g)
    const page = matchResult[0]
    // const titleMatch = data.match(/title="+.*?"/g)
    // console.log('data',data)
    // console.log('titleMatch',titleMatch)
    // 有的可能没有数字，就设为 0
    const orderMatch = page.match(/\d{1,7}/g)
    const order = orderMatch?Number(orderMatch[0]):0

    const pattern = /<(\S*?)[^>]*>.*?|<.*? \/>/g
    const value1 = data.replace(pattern,'')
    const value2 = value1.replace(/\s+/g,'')
    chapterLink = {
      name: value2,
      link: page,
      order: order
    }
  }
  if (type === 5) {
    // <img class="img-fluid show-pic src="" />
    const imgReg = /<img class="img-fluid show-pic"+.*?\/>/g
    const imgStr = regMatch(data,imgReg)
    const srcReg = /"http+.*?"/g
    const imgSrcStr = regMatch(imgStr,srcReg)
    chapterLink = imgSrcStr.substring(1,imgSrcStr.length-1)
  }
  if (type === 6) {
    // <a class="" href="/manhua/420/413_4650.html" title="[异能者][山本英夫][文传][C.C]Vol_01">1</a>
    const linkMatchResult = data.match(/\/+.*?.html/g)
    const link = linkMatchResult[0]
    const pattern = /<(\S*?)[^>]*>.*?|<.*? \/>/g
    const value = data.replace(pattern,'')
    const order = value?Number(value):0
    const nameMatchResult = data.match(/title=+.*?."/g)
    const nameStr = nameMatchResult[0]
    const name = nameStr.substring(7,nameStr.length-1)
    chapterLink = {
      name: name,
      link: link,
      order: order
    }
  }

  return chapterLink
}

const sortChapterLink = (data,type) => {
  if (type === 1) {
    // 有的情况可以根据数字大小排序
    return data.sort((a,b) => {
      const aSplit = a.split('.')
      const aNum = Number(aSplit[0])
      const bSplit = b.split('.')
      const bNum = Number(bSplit[0])
      return aNum - bNum
    })
  }
  if (type === 2) {
    // 有的情况可以根据数字大小排序
    return data.sort((a,b) => {
      const aNum = a.order
      const bNum = b.order
      return aNum - bNum
    })
  }
}

// 如果本地原本就有数据，则要进行合并，而不是全覆盖
const classifyData = (data,type,localData) => {
  // 常见的有 serial-正式连载，short-短篇，single-单行本，appendix-卷附录，
  let intiData = {
    serial:[],
    short:[],
    single:[],
    appendix:[],
  }
  for (let index = 0; index < data.length; index++) {
    const element = data[index];
    if (element.indexOf('短篇')>-1 || element.indexOf('番外')>-1||element.indexOf('同人')>-1 || element.indexOf('小四格')>-1) {
      const formatData = formatChapter(element,type)
      intiData.short.unshift(formatData)
      continue;
    }
    if (element.indexOf('before')>-1) {
      const formatData = formatChapter(element,type)
      intiData.appendix.unshift(formatData)
      continue;
    }
    // if (element.indexOf('单行')>-1) {
      const formatData = formatChapter(element,type)
      intiData.single.unshift(formatData)
      // continue;
    // }

    // if (element.indexOf('before')>-1) {
    //   continue;
    // }

    // const formatData = formatChapter(element,type)
    // intiData.serial.unshift(formatData)

  }

  // 有的网站并不是按照正确顺序排列，所以还是排序一下
  if (localData && localData.serial) {
    // 可以根据情况覆盖不同的部分
    // localData.serial = sortChapterLink(intiData.serial,2)
    // localData.short = sortChapterLink(intiData.short,2)
    // localData.single = sortChapterLink(intiData.single,2)
    localData.appendix = sortChapterLink(intiData.appendix,2)
    return localData
  }

  intiData.serial = sortChapterLink(intiData.serial,2)
  intiData.short = sortChapterLink(intiData.short,2)
  intiData.single = sortChapterLink(intiData.single,2)
  intiData.appendix = sortChapterLink(intiData.appendix,2)

  return intiData

}



const creatClassifyFold = (data,baseRoot,type) => {
  if (type == 1) {
    for (const iterator of Object.keys(data)) {
      createFold(`${baseRoot}${iterator}`)
    }
  }

}

// 获取每个章节下所有图片链接
const getChapterImageData = (pageData,type,url) => {
  let data = {
    list:[],
    total:0,
    title:''
  }

  if (type === 1) {
    // 需要获取页面返回的函数，全局执行的情况，一般跟 globalExpand 配套
    const reg = /<script type="text\/javascript">window([\s\S]*?)<\/script*?>/g
    const matchResult = pageData.match(reg)
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
      data.list = listData
      data.total = len
      data.title = cname
    }
  }

  if (type === 2) {
    const reg = /eval([\s\S]*?)\$/g
    const matchResult = pageData.match(reg)
    if (matchResult && matchResult.length) {
      let content = matchResult[0];
      const endIndex = content.lastIndexOf(')')
      let mainCode = content.substring(5,endIndex)
      const codeStr = `(${mainCode})`
      // console.log('---codeStr---')
      // console.log(codeStr)
      // console.log(mainCode.length)
      let result = eval(codeStr)
      // console.log('---result---')
      // console.log(result)

      const first = result.indexOf('{')
      const last = result.lastIndexOf('}')

      let newStr = result.substring(first,last+1)
      newStr = newStr.replace(/'/g,'"')
      // console.log('---newStr---')
      // console.log(newStr)
      const mainObj = JSON.parse(newStr)
      const {ctitle,fs} = mainObj
      data.list = fs
      data.total = fs.length
      data.title = ctitle
    }
  }

  if (type === 3) {
    // <div class="d-none vg-r-data"
    // <img class="img-fluid show-pic
    const titleReg = /<title>+.*?<\/title>/g
    const titleStr = regMatch(pageData,titleReg)
    const divReg = /<div class="d-none vg-r-data"+.*?>([\s\S]*?)<\/div*?>/g
    const divStr = regMatch(pageData,divReg)
    const totalReg = /data-total="\d{1,4}"/g
    const totalStr = regMatch(divStr,totalReg)
    const totalNumReg = /\d{1,4}/g
    const totalNum = Number(regMatch(totalStr,totalNumReg))
    data.total = totalNum
    data.link = url
    data.title = titleStr
  }

  if (type === 4) {
    // <script>;var chapterImages =
    const reg = /<script>;var chapterImages([\s\S]*?)<\/script*?>/g
    const matchResult = pageData.match(reg)
    // console.log('---matchResult---')
    // console.log(matchResult)
    const titleReg = /pageTitle+.*?;/g
    const titleStr = regMatch(pageData,titleReg)
    const titleStrSplit = titleStr.split('=')
    let title = titleStrSplit[1]
    title = title.substring(2,title.length-2)

    const chapterReg = /chapterImages+.*?;/g
    const chapterStr = regMatch(pageData,chapterReg)
    const chapterStrSplit = chapterStr.split('=')
    const chapterArrStr = chapterStrSplit[1]
    const chapterArr =JSON.parse(chapterArrStr.substring(1,chapterArrStr.length-1))
    const imgPre = 'https://pic.w1fl.com'

    const listData = chapterArr.reduce((acc,cur) => {
      const url = `${imgPre}${cur}`
      acc.push(url)
      return acc;
    },[])
    data.list = listData
    data.total = chapterArr.length
    data.title = title
  }

  if (type === 5) {
    // <script>var img_data =
    const reg = /<script>var img_data([\s\S]*?)<\/script*?>/g
    const matchResult = regMatch(pageData,reg)
    const chapterReg = /'+.*?'/g
    const chapterStr = regMatch(matchResult,chapterReg)
    const mainStr = chapterStr.substring(1,chapterStr.length-1)
    // console.log('---chapterStr---')
    // console.log(chapterStr)
    const chapterArr = JSON.parse(base64.decode(mainStr))

    const divReg = /<div class="d-none vg-r-data"+.*?>([\s\S]*?)<\/div*?>/g
    const divStr = regMatch(pageData,divReg)
    const totalReg = /data-total="\d{1,4}"/g
    const totalStr = regMatch(divStr,totalReg,2)
    const totalNum = Number(totalStr)

    const hostReg = /data-host="+.*?"/g
    const hostStr = regMatch(divStr,hostReg,2)

    const preReg = /data-img_pre="+.*?"/g
    const preStr = regMatch(divStr,preReg,2)

    const imgPre = `${hostStr}${preStr}`

    const listData = chapterArr.reduce((acc,cur) => {
      const url = `${imgPre}${cur.img}`
      acc.push(url)
      return acc;
    },[])



    const titleReg = /<title>+.*?<\/title>/g
    const titleStr = regMatch(pageData,titleReg)
    const pattern = /<(\S*?)[^>]*>.*?|<.*? \/>/g
    const title = titleStr.replace(pattern,'')

    data.list = listData
    data.total = totalNum
    data.title = title
  }
  // console.log('data',data)

  return data;
}

const getImageType = (data,type) => {
  let fileType = '.jpg'
  if (type === 1) {
    const split1 = data.split('?');
    const split1Res = split1[0];
    const split2 = split1Res.split('/');
    const split2Res = split2[split2.length-1];
    const reg = /\.[a-z]{1,4}/g;
    const matchResult = split2Res.match(reg);
    // const imagType = matchResult.join('')
    fileType = matchResult[0]
  }
  if (type === 2) {
    const split1 = data.split('/');
    const split1Res = split1[split1.length-1];
    const split2 = split1Res.split('.');
    const split2Res = split2[split2.length-1];
    fileType = `.${split2Res}`
  }

  return fileType
}

const getImageHeader = (type) => {
  let headerParams = {
    "scheme":"https",
    "accept":"image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.9",
    "accept-encoding":"gzip, deflate, br",
    "accept-language":"zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
    "sec-fetch-dest":"image",
    "sec-fetch-mode":"no-cors",
    "sec-fetch-site":"cross-site",
    "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36",
  }

  if (type === 1) {
    headerParams.authority = 'i.hamreus.com'
    headerParams.referer = 'https://www.mhgui.com/'
  }

  if (type === 2) {
    headerParams.authority = 'pic.w1fl.com'
    headerParams.referer = 'https://www.ykmh.com/'
  }

  return headerParams
}

// 某一个网站特定的加密方法
const LZString = (function () {
  var f = String.fromCharCode;
  var keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var baseReverseDic = {};

  function getBaseValue(alphabet, character) {
      if (!baseReverseDic[alphabet]) {
          baseReverseDic[alphabet] = {};
          for (var i = 0; i < alphabet.length; i++) {
              baseReverseDic[alphabet][alphabet.charAt(i)] = i
          }
      }
      return baseReverseDic[alphabet][character]
  }
  var LZString = {
      decompressFromBase64: function (input) {
          if (input == null) return "";
          if (input == "") return null;
          return LZString._0(input.length, 32, function (index) {
              return getBaseValue(keyStrBase64, input.charAt(index))
          })
      },
      _0: function (length, resetValue, getNextValue) {
          var dictionary = [],
              next, enlargeIn = 4,
              dictSize = 4,
              numBits = 3,
              entry = "",
              result = [],
              i, w, bits, resb, maxpower, power, c, data = {
                  val: getNextValue(0),
                  position: resetValue,
                  index: 1
              };
          for (i = 0; i < 3; i += 1) {
              dictionary[i] = i
          }
          bits = 0;
          maxpower = Math.pow(2, 2);
          power = 1;
          while (power != maxpower) {
              resb = data.val & data.position;
              data.position >>= 1;
              if (data.position == 0) {
                  data.position = resetValue;
                  data.val = getNextValue(data.index++)
              }
              bits |= (resb > 0 ? 1 : 0) * power;
              power <<= 1
          }
          switch (next = bits) {
              case 0:
                  bits = 0;
                  maxpower = Math.pow(2, 8);
                  power = 1;
                  while (power != maxpower) {
                      resb = data.val & data.position;
                      data.position >>= 1;
                      if (data.position == 0) {
                          data.position = resetValue;
                          data.val = getNextValue(data.index++)
                      }
                      bits |= (resb > 0 ? 1 : 0) * power;
                      power <<= 1
                  }
                  c = f(bits);
                  break;
              case 1:
                  bits = 0;
                  maxpower = Math.pow(2, 16);
                  power = 1;
                  while (power != maxpower) {
                      resb = data.val & data.position;
                      data.position >>= 1;
                      if (data.position == 0) {
                          data.position = resetValue;
                          data.val = getNextValue(data.index++)
                      }
                      bits |= (resb > 0 ? 1 : 0) * power;
                      power <<= 1
                  }
                  c = f(bits);
                  break;
              case 2:
                  return ""
          }
          dictionary[3] = c;
          w = c;
          result.push(c);
          while (true) {
              if (data.index > length) {
                  return ""
              }
              bits = 0;
              maxpower = Math.pow(2, numBits);
              power = 1;
              while (power != maxpower) {
                  resb = data.val & data.position;
                  data.position >>= 1;
                  if (data.position == 0) {
                      data.position = resetValue;
                      data.val = getNextValue(data.index++)
                  }
                  bits |= (resb > 0 ? 1 : 0) * power;
                  power <<= 1
              }
              switch (c = bits) {
                  case 0:
                      bits = 0;
                      maxpower = Math.pow(2, 8);
                      power = 1;
                      while (power != maxpower) {
                          resb = data.val & data.position;
                          data.position >>= 1;
                          if (data.position == 0) {
                              data.position = resetValue;
                              data.val = getNextValue(data.index++)
                          }
                          bits |= (resb > 0 ? 1 : 0) * power;
                          power <<= 1
                      }
                      dictionary[dictSize++] = f(bits);
                      c = dictSize - 1;
                      enlargeIn--;
                      break;
                  case 1:
                      bits = 0;
                      maxpower = Math.pow(2, 16);
                      power = 1;
                      while (power != maxpower) {
                          resb = data.val & data.position;
                          data.position >>= 1;
                          if (data.position == 0) {
                              data.position = resetValue;
                              data.val = getNextValue(data.index++)
                          }
                          bits |= (resb > 0 ? 1 : 0) * power;
                          power <<= 1
                      }
                      dictionary[dictSize++] = f(bits);
                      c = dictSize - 1;
                      enlargeIn--;
                      break;
                  case 2:
                      return result.join('')
              }
              if (enlargeIn == 0) {
                  enlargeIn = Math.pow(2, numBits);
                  numBits++
              }
              if (dictionary[c]) {
                  entry = dictionary[c]
              } else {
                  if (c === dictSize) {
                      entry = w + w.charAt(0)
                  } else {
                      return null
                  }
              }
              result.push(entry);
              dictionary[dictSize++] = w + entry.charAt(0);
              enlargeIn--;
              w = entry;
              if (enlargeIn == 0) {
                  enlargeIn = Math.pow(2, numBits);
                  numBits++
              }
          }
      }
  };
  return LZString
})();

const globalExpand = (type) => {

  if (type === 1) {
  // 针对特定网站的扩展，不同网站可能不一样
    String.prototype.splic = function (f) {
      return LZString.decompressFromBase64(this).split(f)
    };
  }

}


module.exports = {
  getChapterContainerReg,
  getChapterReg,
  formatChapter,
  classifyData,
  sortChapterLink,
  globalExpand,
  creatClassifyFold,
  getChapterImageData,
  getImageType,
  getImageHeader,
}