# -*- coding: UTF-8 -*-
import requests
import json
import re
import os
import urllib.parse
import utils


html_req_headers = {
  "accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
  "accept-encoding":"gzip, deflate, br",
  "accept-language":"zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7",
  "cache-control":"no-cache",
  "cookie":"UM_distinctid=174a991ad1a26c-0afb998ad92617-3323767-1fa400-174a991ad1b5a8; __gads=ID=289a30228745382c-22cecc6d28c500f5:T=1607699470:RT=1607699470:R:S=ALNI_MbODWxVquBiHUrh8moe6CHup0kNMA; CNZZDATA1278325662=1030922568-1600569125-https%253A%252F%252Fcn.bing.com%252F%7C1607772159",
  "Host":"www.manhuaniu.com",
  "pragma":"no-cache",
  "referer":"https://www.manhuaniu.com/manhua/5298/",
  "sec-fetch-dest":"document",
  "sec-fetch-mode":"navigate",
  "sec-fetch-site":"same-origin",
  "Sec-Fetch-User":"?1",
  "Upgrade-Insecure-Requests":"1",
  "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36",
}

img_req_header = {
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

baseRoot= '../comic/guiDengDeLengChe/'
maxPageNum = 200
fileType = ".html"
reqList="https://www.manhuaniu.com/manhua/5298/"

# 一般单页
# img_list = []

# 连页的情况要单独处理
contact_img = []
contact_img_list = []


def create_fold(foldName):
  name = urllib.parse.unquote(foldName)
  utils.mkdir(baseRoot+name)
  return

# 获得图片
def down_img(localFold,data,isDirect):
  img_index = 0
  img_len = len(data)
  while img_index < img_len:
    img_item = data[img_index]
    fold_name = urllib.parse.unquote(localFold) + '/'
    img_item_arr = img_item.split('/')
    img_arr_len = len(img_item_arr)
    img_item_arr_last = img_item_arr[img_arr_len-1]
    imgCount = img_index+1
    if (isDirect):
      filename = baseRoot +fold_name+ img_item_arr_last
    else:
      img_item_spot_arr = img_item_arr_last.split('.')
      img_item_spot_len = len(img_item_spot_arr)
      filename = baseRoot +fold_name+ str(imgCount) + '.' + img_item_spot_arr[img_item_spot_len-1]
    if (os.path.exists(filename)):
      print(str(img_index)+' exists')
    else:
      res = requests.get(img_item,headers=img_req_header)
      # print(res.status_code)
      if (res.status_code == 200):
        with open(filename, "wb") as f:
          f.write(res.content)
          print('chapter '+localFold + '-' + str(imgCount) + ' down success')
          f.close()
      else:
        # 没有正确响应，认定没有接下来的图片了，就跳出循环
        img_index = img_len
    img_index += 1
  return

# 获取图片下载的地址，这种适用于图片后缀有规律递增的情况
def get_img_address_direct(localFold,downChapter):
  page_num = 0
  img_list=[]
  while page_num <= maxPageNum:
    num_format = ""
    if page_num<10:
      num_format = str(page_num)
    if (page_num >= 10 and page_num < 100):
      num_format = str(page_num)
    if (page_num >= 100):
      num_format = str(page_num)
    filename = reqList + downChapter + "/" + num_format + fileType
    img_list.append(filename)
    page_num += 1
  # print(img_list)
  down_img(localFold,img_list,1)
  return


# 获取图片下载的地址，这种适用图片地址无法看出规律，需要先请求 HTML网页，返回网页里面会包含图片得地址
def get_img_address_html(localFold,downChapter):
  page_num = 1
  img_list=[]
  # while page_num <= maxPageNum:
  while page_num <= 1:
    num_format = str(page_num)
    filename = reqList + downChapter+ fileType + "?p=" + num_format
    res = requests.get(filename,headers=html_req_headers)
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

# 处理连页的情况
def deal_contact_img(chapter):
  page_num = 1
  fold_name = urllib.parse.unquote(chapter) + '/'
  while page_num <= maxPageNum:
    num_format = ""
    if page_num<10:
      num_format = '00'+str(page_num)
    if (page_num >= 10 and page_num < 100):
      num_format = '0'+str(page_num)
    if (page_num >= 100):
      num_format = str(page_num)
    filePath = baseRoot +fold_name+ num_format+fileType
    fsize = os.path.getsize(filePath)
    if (fsize/1024 < 1):
      contact_img.append(num_format)
    page_num += 1
  # print(contact_img)
  img_index = 0
  img_len = len(contact_img)
  while img_index < img_len:
    name = contact_img[img_index]+'-'+contact_img[img_index+1]
    filename = reqList + name + fileType
    contact_img_list.append(filename)
    img_index += 2
  # down_img(contact_img_list)
  return

# 清理下载失败的文件
def clear_file(chapter):
  fold_name = urllib.parse.unquote(chapter) + '/'
  list = utils.getFileList(baseRoot +fold_name,[])
  img_index = 0
  img_len = len(list)
  while img_index < img_len:
    filePath = list[img_index]
    if(os.path.exists(filePath)):
      fsize = os.path.getsize(filePath)
      if ( fsize/1024 < 1):
        os.remove(filePath)
    img_index += 1
  return

def main():
  startDire = 11
  startDownChapter = 167757
  while startDire <= 30:
    create_fold(str(startDire))
    get_img_address_html(str(startDire),str(startDownChapter))
    startDire += 1
    startDownChapter += 1
  return

# 主程序
main()
# create_fold()
# deal_img()
# deal_contact_img()
# deal_wired_img()
# clear_file() // 这个建议最后单独执行


print('all done')