const fs = require('fs');
const https = require('https');
const http = require('http');

const defaultHttpsOptions = {
  method: 'GET',
  timeout: 1 * 60 * 1000,
  encoding:'utf8'
};

function requestPromise(url, options={}) {
  const { reqType } = options
  const reqObj = reqType === 'http'?http:https
  const combineOptions = {...defaultHttpsOptions,...options}
  const { encoding } = combineOptions
  return new Promise((resolve, reject) => {
    // console.log('url',url)
    const urlFormat = new URL(url)
    reqObj.get(urlFormat, combineOptions, (res) => {
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
    console.log(e)
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

function removeRepeat(data) {
  return Array.from(new Set(data))
}

function regMatch(data,reg) {
  const matchResult = data.match(reg) || []
  return matchResult[0]
}


module.exports = {
  requestPromise,
  createFold,
  writeLocalFile,
  readJsonFile,
  removeRepeat,
  regMatch,
}