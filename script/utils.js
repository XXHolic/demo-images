const fs = require('fs');
const https = require('https');

const defaultHttpsOptions = {
  method: 'GET',
  timeout: 1 * 60 * 1000,
  encoding:'utf8'
};

function requestPromise(url, options={}) {
  const combineOptions = {...defaultHttpsOptions,...options}
  const { encoding } = combineOptions
  return new Promise((resolve, reject) => {
    // console.log('url',url)
    const urlFormat = new URL(url)
    https.get(urlFormat, combineOptions, (res) => {
      // console.log('状态码:', res.statusCode);
      const { statusCode } = res

      let error;
      // 任何 2xx 状态码都表示成功的响应，但是这里只检查 200。
      if (statusCode !== 200) {
        error = new Error('请求失败\n' +
          `状态码: ${statusCode}`);
      }
      if (error) {
        reject(error.message);
        // 消费响应的数据来释放内存。
        res.resume();
        return;
      }

      res.setEncoding(encoding);
      let backData = '';
      res.on('data', (data) => {
        backData += data;
      });
      res.on('end', () => {
        // console.log(backData)
        resolve(backData)
      })

    }).on('error', (e) => {
      reject(e);
    });
  }).catch(e => {
    reject(e)
    console.error('request error', e)
  })
}

const createFold = (path) => {
  if (fs.existsSync(path)) {
    console.log(`fold exist ${path} `)
  } else {
    fs.mkdirSync(path);
    console.log(`creat fold ${path} `)
  }

}

function writeLocalFile(name,content,encoding='utf8') {
  fs.writeFileSync(name, content,encoding, function(err) {
    if (err) {
      console.error(`write fail ${name}`);
    }
  });
}

function readJsonFile(path,init=[]) {
  if (fs.existsSync(path)) {
    const content = fs.readFileSync(path)
    return JSON.parse(content)
  }

  return init
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


const imgHeader = {
  "authority":"i.hamreus.com",
  "scheme":"https",
  "accept":"image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.9",
  "accept-encoding":"gzip, deflate, br",
  "accept-language":"zh-CN,zh;q=0.9",
  "cache-control":"no-cache",
  "pragma":"no-cache",
  "referer":"https://www.mhgui.com/",
  "sec-fetch-dest":"image",
  "sec-fetch-mode":"no-cors",
  "sec-fetch-site":"cross-site",
  "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36",
}

module.exports = {requestPromise,createFold,writeLocalFile,readJsonFile,LZString,imgHeader}