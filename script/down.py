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


baseRoot= '../comic/huangJinShenWei/'
# baseRoot= '../comic//'
chapterFile = baseRoot + 'chapter.json'
imagesJsonFileName = 'images.json'
emptyJsonFileName = 'empty.json'
totalJsonFileName = 'total.json'

# 下载图片
def down_img(localFold,data):
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
    filename = baseRoot +fold_name + str(imgCount) + utils.getImageType(img_item)

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
        if (emptyRecord.count(img_item) == 0):
          emptyImageList.append(img_item)
    img_index += 1
  emptyRecord.extend(emptyImageList)
  with open(emptyFile, "wb") as f:
      resultStr = json.dumps(emptyRecord)
      # print(resultStr)
      f.write(resultStr.encode(encoding='UTF-8'))
      f.close()
  return

# 根据本地图片 json 文件区请求相应图片，并保存到本地
def downAllImages():
  with open(chapterFile, "r",encoding="utf-8") as f:
    content = f.read()
    chapterList = json.loads(content)
    chapterNum = len(chapterList)
    startDire = 209
    while startDire <= chapterNum:
      fold_name = urllib.parse.unquote(str(startDire)) + '/'
      imgListFile = baseRoot + fold_name + imagesJsonFileName
      with open(imgListFile, "r",encoding="utf-8") as f:
        imgContent = f.read()
        imgList = json.loads(imgContent)
        # print(imgList)
        down_img(str(startDire),imgList['list'])
      startDire += 1
  return


downAllImages()