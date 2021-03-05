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


baseRoot= '../comic/test/'
# baseRoot= '../comic//'
maxPageNum = 200
fileType = ".html"
comicMark = '933'
reqList="https://www..com/manhua/" + comicMark + "/"
chapterFile = baseRoot + 'chapter.json'
imagesJsonFileName = 'images.json'
emptyJsonFileName = 'empty.json'
totalJsonFileName = 'total.json'


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

    if (os.path.exists(filename)):
      print('chapter '+ localFold + '-' +str(img_index)+' exists')
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
# 需要先请求 HTML网页，返回网页里面会包含图片得地址
# 每一张图片要请求一次 html，这种形式的要把数据先存放到本地
def get_every_img_address_html(localFold,downChapter):
  # 漫画网站本来应该有，但返回了空的数据
  emptyImageList = []
  img_list=[]
  fold_name = urllib.parse.unquote(localFold) + '/'
  imgListFile = baseRoot+fold_name+ imagesJsonFileName
  emptyFile = baseRoot+fold_name+ emptyJsonFileName
  totalFile = baseRoot+fold_name+ totalJsonFileName
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
  localTotalNum = 0
  if (os.path.exists(totalFile)):
    with open(totalFile, "r",encoding="utf-8") as f:
        content = f.read()
        if (content):
          localTotalNumObj = json.loads(content)
          localTotalNum = localTotalNumObj['total']
  page_num = len(imageExistList) + 1
  titleText = 'not found'

  while page_num <= maxPageNum:
  # while page_num <= 1:
    num_format = str(page_num)
    filename = reqList + downChapter + "_p"+ num_format + fileType
    res = requests.get(filename)

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
        if(totalCount != localTotalNum):
          localTotalNum = totalCount
        if (totalCount != maxPageNum):
          global maxPageNum
          maxPageNum = totalCount
      if (len(result)):
        print('get chapter '+ localFold +' image '+str(page_num) + ' url success')
        imgSrcValue = utils.getImgSrc(result[0])
        img_list.append(imgSrcValue)
      else:
        # 避免多余的数据添加
        if (localTotalNum and page_num <= localTotalNum):
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
  with open(totalFile, "wb") as f:
      resultStr = json.dumps({'total':localTotalNum})
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


# 获取所有章节数据，并存放到本地
def getChaptersData():
  reqUrl = 'https://www..com/manhua/'+ comicMark +'/'
  res = requests.get(reqUrl)
  # print(res.status_code)
  if (res.status_code == 200):
    pattern = re.compile(r'<ol class="links-of-books num_div"+.*?>([\s\S]*?)</ol*?>')
    versionResult = pattern.findall(res.text)
    # 可能有多个版本，例如黑白和彩色，所以这里需要再处理一次
    pattern2 = re.compile(r'href="/manhua/'+comicMark+'/+.*?html"')
    result = pattern2.findall(versionResult[0])

    # 正传
    zhengZhuan = []
    # print(len(result))
    # print(result)
    if (len(result)):
      for index,value in enumerate(result):
        valueSplit1 = value.split('.')
        valueSplit2 = valueSplit1[0].split('/')
        valueSplit2Len = len(valueSplit2)
        chapterLink = valueSplit2[valueSplit2Len-1]
        zhengZhuan.append(chapterLink)


    # print(len(result))
      with open(chapterFile, "wb") as f:
        resultStr = json.dumps(zhengZhuan)
        f.write(resultStr.encode(encoding='UTF-8'))
        print('get chapter list success')
        f.close()
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
  getChaptersData()
  # getImagesData()
  # downAllImages()
  return


# 主程序
main()

print('all done')