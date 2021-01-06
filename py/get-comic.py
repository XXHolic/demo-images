# -*- coding: UTF-8 -*-
import requests
from requests.adapters import HTTPAdapter
import json
import re
import os
import urllib.parse
import utils

retryReq = requests.Session()
retryReq.mount('http://', HTTPAdapter(max_retries=2))
retryReq.mount('https://', HTTPAdapter(max_retries=2))


baseRoot= '../comic//'
# baseRoot= '../comic//'
maxPageNum = 200
fileType = ".html"
imgType = '.png'
comicMark = '15403'
reqList="https://www.manhuaniu.com/manhua/" + comicMark + "/"
chapterFile = baseRoot + 'chapter.json'
imagesJsonFileName = 'images.json'
emptyJsonFileName = 'empty.json'
preChapterFile = '../comic//chapter.json'

chapterListHeaders = {
  "accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
  "accept-encoding":"gzip, deflate, br",
  "accept-language":"zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7",
  "cache-control":"no-cache",
  "cookie":"UM_distinctid=174a991ad1a26c-0afb998ad92617-3323767-1fa400-174a991ad1b5a8; __gads=ID=289a30228745382c-22cecc6d28c500f5:T=1607699470:RT=1607699470:R:S=ALNI_MbODWxVquBiHUrh8moe6CHup0kNMA; CNZZDATA1278325662=1030922568-1600569125-https%253A%252F%252Fcn.bing.com%252F%7C1608114925",
  "pragma":"no-cache",
  "sec-fetch-dest":"document",
  "sec-fetch-mode":"navigate",
  "sec-fetch-site":"none",
  "Sec-Fetch-User":"?1",
  "Upgrade-Insecure-Requests":"1",
  "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36",
}

chapterHeaders = {
  "accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
  "accept-encoding":"gzip, deflate, br",
  "accept-language":"zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7",
  "cache-control":"no-cache",
  "cookie":"UM_distinctid=174a991ad1a26c-0afb998ad92617-3323767-1fa400-174a991ad1b5a8; __gads=ID=289a30228745382c-22cecc6d28c500f5:T=1607699470:RT=1607699470:R:S=ALNI_MbODWxVquBiHUrh8moe6CHup0kNMA; CNZZDATA1278325662=1030922568-1600569125-https%253A%252F%252Fcn.bing.com%252F%7C1608114925",
  "Host":"www.manhuaniu.com",
  "pragma":"no-cache",
  "referer":reqList,
  "sec-fetch-dest":"document",
  "sec-fetch-mode":"navigate",
  "sec-fetch-site":"same-origin",
  "Sec-Fetch-User":"?1",
  "Upgrade-Insecure-Requests":"1",
  "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36",
}

imgHeader = {
  "authority":"res.asemi.tech",
  "scheme":"https",
  "accept":"image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
  "accept-encoding":"gzip, deflate, br",
  "accept-language":"zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7",
  "cache-control":"no-cache",
  "pragma":"no-cache",
  "referer":"https://www.manhuaniu.com/",
  "sec-fetch-dest":"image",
  "sec-fetch-mode":"no-cors",
  "sec-fetch-site":"cross-site",
  "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36",
}

# 下载图片
def down_img(localFold,data,isDirect):
  # 漫画网站本来应该有，但返回了空的数据
  emptyImageList = []
  fold_name = urllib.parse.unquote(localFold) + '/'
  emptyFile = baseRoot+fold_name+ emptyJsonFileName
  emptyRecord = []
  if (os.path.exists(emptyFile)):
    with open(emptyFile, "r",encoding="utf-8") as f:
        content = f.read()
        if (content):
          emptyRecord = json.loads(content)
  img_index = 0
  img_len = len(data)
  while img_index < img_len:
    img_item = data[img_index]
    if (not img_item):
      img_index += 1
      continue

    img_item_arr = img_item.split('/')
    img_arr_len = len(img_item_arr)
    img_item_arr_last = img_item_arr[img_arr_len-1]
    imgCount = img_index+1
    if (isDirect):
      filename = baseRoot +fold_name + str(imgCount) + utils.getImageType(img_item)
    else:
      img_item_spot_arr = img_item_arr_last.split('.')
      img_item_spot_len = len(img_item_spot_arr)
      # filename = baseRoot +fold_name+ str(imgCount) + '.' + img_item_spot_arr[img_item_spot_len-1]
      filename = baseRoot +fold_name+ str(imgCount) + '.' + img_item_spot_arr[img_item_spot_len-1] + imgType
    if (os.path.exists(filename)):
      print(str(img_index)+' exists')
    else:
      res = retryReq.get(img_item,timeout=60)
      # print(res.status_code)
      if (res.status_code == 200):
        with open(filename, "wb") as f:
          f.write(res.content)
          print('chapter '+localFold + '-' + str(imgCount) + ' down success')
          f.close()
      else:
        print('chapter '+localFold + '-' + str(imgCount) + ' down failed')
        # 针对一张情况，没有正确响应，认定没有接下来的图片了，就跳出循环
        # img_index = img_len
        # 知道总数的情况
        if (emptyRecord.count(imgCount) == 0):
          emptyImageList.append(imgCount)
    img_index += 1
  emptyRecord.extend(emptyImageList)
  with open(emptyFile, "wb") as f:
      resultStr = json.dumps(emptyRecord)
      # print(resultStr)
      f.write(resultStr.encode(encoding='UTF-8'))
      f.close()
  return

# 获取图片下载的地址，这种适用图片地址无法看出规律，
# 需要先请求 HTML 网页，返回网页里面会包含图片得地址
# 同一章节的所有图片地址在一个页面上
def get_img_address_html(localFold,downChapter):
  page_num = 1
  img_list=[]
  # while page_num <= maxPageNum:
  while page_num <= 1:
    num_format = str(page_num)
    filename = reqList + downChapter+ fileType + "?p=" + num_format
    res = requests.get(filename,headers=chapterHeaders)
    titleText = 'not found'
    if (res.status_code == 200):
      # print(res.text)chapterImages
      pattern = re.compile(r'\["images/comic.*?\]')
      titlePattern = re.compile(r'<h2>.*?<\/h2>')
      result = pattern.findall(res.text)
      titleResult = titlePattern.findall(res.text)
      # print('result',titleResult)
      if (len(result)):
        img_list = json.loads(result[0])
        for index,value in enumerate(img_list):
          img_list[index] = 'https://res.asemi.tech//'+value
        # print('img_list',img_list)
      if (len(titleResult)):
        titleText = titleResult[0]
      #   img_list.append(fileAddress)
      page_num += 1
    else:
      # 没有正确响应，认定没有接下来的图片了，就跳出循环
      page_num = maxPageNum
  # print(img_list)
  name = "title.md"
  fold_name = urllib.parse.unquote(localFold) + '/'
  dataFilename = baseRoot+fold_name+ name
  with open(dataFilename, "w+",encoding="utf-8") as f:
      f.write(titleText)
      f.close()
  down_img(localFold,img_list,0)
  return

# 获取图片下载的地址，这种适用图片地址无法看出规律，
# 需要先请求 HTML网页，返回网页里面会包含图片得地址
# 每一张图片要请求一次 html，这种形式的要把数据先存放到本地
def get_every_img_address_html(localFold,downChapter):
  # 漫画网站本来应该有，但返回了空的数据
  emptyImageList = []
  img_list=[]
  fold_name = urllib.parse.unquote(localFold) + '/'
  imgListFile = baseRoot+fold_name+ imagesJsonFileName
  emptyFile = baseRoot+fold_name+ emptyJsonFileName
  emptyRecord = []
  if (os.path.exists(emptyFile)):
    with open(emptyFile, "r",encoding="utf-8") as f:
        content = f.read()
        if (content):
          emptyRecord = json.loads(content)
  imageExistList = []
  if (os.path.exists(imgListFile)):
    with open(imgListFile, "r",encoding="utf-8") as f:
        content = f.read()
        if (content):
          imageExistList = json.loads(content)
  page_num = len(imageExistList) + 1
  while page_num <= maxPageNum:
  # while page_num <= 1:
    num_format = str(page_num)
    filename = reqList + downChapter + "_p"+ num_format + fileType
    res = requests.get(filename)
    titleText = 'not found'
    if (res.status_code == 200):

      pattern = re.compile(r'<img class="img-fluid show-pic"+.*?\/>')
      result = pattern.findall(res.text)
      titlePattern = re.compile(r'<title>+.*?<\/title>')
      titleResult = titlePattern.findall(res.text)
      # 可以从页面中拿到总页数
      totalPattern = re.compile(r'data-total="+.*?"')
      totalResult = totalPattern.findall(res.text)
      # print('result',totalResult)
      # return

        # print('img_list',img_list)
      if (len(titleResult)):
        titleText = titleResult[0]
      if (len(totalResult)):
        totalCount = utils.getQuoteNumValue(totalResult[0])
        if (totalCount != maxPageNum):
          global maxPageNum
          maxPageNum = totalCount
      if (len(result)):
        print('get chapter '+ localFold +' image '+str(page_num) + ' url success')
        imgSrcValue = utils.getImgSrc(result[0])
        img_list.append(imgSrcValue)
      else:
          print('get chapter '+ localFold +' image ' + str(page_num) + ' empty')
          # 放一个占位符，这样生成图片顺序就保持一致，也好知道那里出问题了
          img_list.append('')
          if (emptyRecord.count(page_num) == 0):
            emptyImageList.append(page_num)
      page_num += 1
    else:
      # 没有正确响应，认定没有接下来的图片了，就跳出循环，把获取成功的数据保存
      print('get chapter '+ localFold +' image ' + str(page_num) + ' error')
      page_num = maxPageNum
  # print(img_list)
  imageExistList.extend(img_list)
  emptyRecord.extend(emptyImageList)
  name = "title.md"
  dataFilename = baseRoot+fold_name+ name
  with open(dataFilename, "w+",encoding="utf-8") as f:
      f.write(titleText)
      f.close()

  with open(imgListFile, "wb") as f:
      resultStr = json.dumps(imageExistList)
      # print(resultStr)
      f.write(resultStr.encode(encoding='UTF-8'))
      f.close()
  with open(emptyFile, "wb") as f:
      resultStr = json.dumps(emptyRecord)
      # print(resultStr)
      f.write(resultStr.encode(encoding='UTF-8'))
      f.close()
  # down_img(localFold,img_list,0)
  return


# 获取章节数据，并存放到本地
def getChaptersData():
  reqUrl = 'https://www..com/manhua/'+ comicMark +'/'
  res = requests.get(reqUrl)
  # print(res.status_code)
  if (res.status_code == 200):
    pattern = re.compile(r'<ol class="links-of-books num_div"+.*?>([\s\S]*?)</ol*?>')
    versionResult = pattern.findall(res.text)
    # 可能有多个版本，例如黑白和彩色，所以这里需要再处理一次
    pattern2 = re.compile(r'href="/manhua/119/+.*?html"')
    result = pattern2.findall(versionResult[2])
    # 前传
    qianZhuan = []
    # 正传
    zhengZhuan = []
    # print(len(result))
    # print(result)
    # return
    if (len(result)):
      for index,value in enumerate(result):
        valueSplit1 = value.split('.')
        valueSplit2 = valueSplit1[0].split('/')
        valueSplit2Len = len(valueSplit2)
        chapterLink = valueSplit2[valueSplit2Len-1]
        # if(chapterLink >= 355906 and chapterLink <= 355971 ):
        #   qianZhuan.append(chapterLink)
        # else:
        #   zhengZhuan.append(chapterLink)
        zhengZhuan.append(chapterLink)


    # print(len(result))
      with open(chapterFile, "wb") as f:
        resultStr = json.dumps(zhengZhuan)
        f.write(resultStr.encode(encoding='UTF-8'))
        print('get chapter list success')
        f.close()
      # with open(preChapterFile, "wb") as f:
      #   resultStr = json.dumps(qianZhuan)
      #   f.write(resultStr.encode(encoding='UTF-8'))
      #   print('get qianZhuan chapter list success')
      #   f.close()
  else:
    print('get chapter failed')
  return

# 单独获取图片并存放到本地 json 文件
def getImagesData():
  with open(chapterFile, "r",encoding="utf-8") as f:
    content = f.read()
    chapterList = json.loads(content)
    chapterNum = len(chapterList)
    startDire = 1
    while startDire <= chapterNum:
      startDownChapter = chapterList[startDire-1]
      utils.createFold(baseRoot, str(startDire))
      get_every_img_address_html(str(startDire),str(startDownChapter))
      startDire += 1
  return

# 根据本地图片 json 文件区请求相应图片，并保存到本地
def downAllImages():
  with open(chapterFile, "r",encoding="utf-8") as f:
    content = f.read()
    chapterList = json.loads(content)
    chapterNum = len(chapterList)
    startDire = 1
    while startDire <= chapterNum:
      fold_name = urllib.parse.unquote(str(startDire)) + '/'
      imgListFile = baseRoot + fold_name + imagesJsonFileName
      with open(imgListFile, "r",encoding="utf-8") as f:
        imgContent = f.read()
        imgList = json.loads(imgContent)
        down_img(str(startDire),imgList,1)
      startDire += 1
  return

def main():
  # getChaptersData()
  # getImagesData()
  # downAllImages()
  return


# 主程序
main()

print('all done')