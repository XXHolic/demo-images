# -*- coding: UTF-8 -*-
import os

def mkdir(path):

  folder = os.path.exists(path)

  if not folder:                   #判断是否存在文件夹如果不存在则创建为文件夹
    os.makedirs(path)            # makedirs 创建文件时如果路径不存在会创建这个路径
    print ("add new folder")
  else:
    print ("folder exit")

# 文件遍历
def getFileList(dir, Filelist):

  newDir = dir

  if os.path.isfile(dir):

    Filelist.append(dir)

    # # 若只是要返回文件文，使用这个

    # Filelist.append(os.path.basename(dir))

  elif os.path.isdir(dir):

    for s in os.listdir(dir):

      # 如果需要忽略某些文件夹，使用以下代码

      #if s == "xxx":

          #continue

      newDir=os.path.join(dir,s)

      getFileList(newDir, Filelist)
  return Filelist


  # 冰海战记的配置
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

baseRoot= '../comic/binghaizhanji/'
maxPageNum = 50
fileType = ".webp"
reqList="https://res.wnixk.com/image/view/"