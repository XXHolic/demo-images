# -*- coding: UTF-8 -*-
import requests
import json
import os
import urllib.parse
import utils

req_headers = {
  "authority":"res.wnixk.com",
  # "path":"/image/view/",
  "scheme":"https",
  "accept":"image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
  "accept-encoding":"gzip, deflate, br",
  "accept-language":"zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7",
  "cache-control":"no-cache",
  "pragma":"no-cache",
  "referer":"https://www.shut123.com/",
  "sec-fetch-dest":"image",
  "sec-fetch-mode":"no-cors",
  "sec-fetch-site":"cross-site",
  "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36",
}

# baseRoot= '../comic/一拳超人/'
# maxPageNum = 49
# chapter='%E7%AC%AC143%E5%9B%9E'
# fileType = ".jpg.webp"
# reqList="https://i.hamreus.com/ps3/y/yiquanchaoren/"+chapter+"/"


baseRoot= '../comic/冰海战记/'
maxPageNum = 50
fileType = ".webp"
reqList="https://res.wnixk.com/image/view/"

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
def down_img(localFold,data):
  img_index = 0
  img_len = len(data)
  while img_index < img_len:
    img_item = data[img_index]
    img_item_arr = img_item.split('/')
    img_arr_len = len(img_item_arr)
    fold_name = urllib.parse.unquote(localFold) + '/'
    filename = baseRoot +fold_name+ img_item_arr[img_arr_len-1]
    if (os.path.exists(filename)):
      print(str(img_index)+'exists')
    else:
      res = requests.get(img_item,headers=req_headers)
      # print(res.status_code)
      if (res.status_code == 200):
        with open(filename, "wb") as f:
          f.write(res.content)
          print('chapter '+localFold + '-' + str(img_index+1) + ' down success')
          f.close()
    img_index += 1
  return

# 一般图片下载
def deal_img(localFold,downChapter):
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
  down_img(localFold,img_list)
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
  startDire = 71
  startDownChapter = 1618190
  while startDire <= 90:
    create_fold(str(startDire))
    deal_img(str(startDire),str(startDownChapter))
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