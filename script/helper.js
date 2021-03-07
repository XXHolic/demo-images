
// 不同的网站，解析的正则不一样，在这里统一区分
const getChapterContainerReg = (type) => {
  switch(type){
    case 1:
    return /<div class="chapter-list cf mt10"+.*?>([\s\S]*?)<\/div*?>/g
    case 2:
    return /<div class="zj_list_con autoHeight"+.*?>([\s\S]*?)<\/div*?>/g
  }
}

const getChapterReg = (type,comicMark) => {
  switch(type){
    case 1:
    return new RegExp('href="\/comic\/'+comicMark+'\/+.*?html','g')
    case 2:
    return new RegExp('href="\/manhua\/'+comicMark+'\/+.*?html','g')
  }
}

const formatChapter = (data,type) => {
  let chapterLink = ''
  if (type === 1) {
    const valueSplit = data.split('/')
    const valueSplit2Len = valueSplit.length
    chapterLink = valueSplit[valueSplit2Len-1]
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
}

// 获取每个章节下所有图片链接
const getChapterImageData = (pageData,type) => {
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
    const imagePrefix = 'https://pic.w1fl.com'
    const reg = /<script>;var chapterImages([\s\S]*?)<\/script*?>/g
    const matchResult = pageData.match(reg)
    if (matchResult && matchResult.length) {
      const content = matchResult[0];
      const contentSplit = content.split(';')
      // console.log('---contentSplit----')
      // console.log(contentSplit)
      const contentListStr = contentSplit[1]
      // const eleLen = contentListStr.length;
      const codeStr = contentListStr.substring(20)
      // console.log('---codeStr---')
      // console.log(codeStr)
      let result = eval(codeStr)
      result = result.map(ele => {
        return `${imagePrefix}${ele}`
      })

      const titleContent = contentSplit[5]
      const title = titleContent.substring(17,titleContent.length-1)
      data.list = result
      data.total = result.length
      data.title = title
    }
  }

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
  sortChapterLink,
  globalExpand,
  getChapterImageData,
  getImageType,
  getImageHeader,
}