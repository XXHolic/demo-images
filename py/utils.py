# -*- coding: UTF-8 -*-
import os
import re
import urllib.parse

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

# 从 <img src="33333" /> 这样的标签中提取出 src 的值
def getImgSrc(data):
  searchObj = re.search(r'src=".*?"', data)
  url = searchObj.group()
  url_split = url.split('"')
  return url_split[1]

# 从 'data-total="265"' 这样的数据中提取出引号内的数字值
def getQuoteNumValue(data):
  url_split = data.split('"')
  return int(url_split[1])

# 删除符合一定条件的文件
def removeFile(path,size=1):
  if(os.path.exists(path)):
    fileSize = os.path.getsize(path)
    if ( fileSize/1024 < size):
      os.remove(path)
  return

# 从 <ol class="links-of-books num_div"></ol> 这样的标签中提取出包含的内容
def getHtmlLabelContent(data):
  searchObj = re.match(r'<ol class="links-of-books num_div"+.*?>([\s\S]*?)</ol*?>', data)
  content = ''
  if (searchObj):
    content = searchObj.group()
  else:
    print ("No match: ",data)
  return content

# 获取文件类型，例如这类数据 https://i1.manhuadb.com/ccbaike/1088/10911/106_pmcfartg.jpg
def getImageType(data):
  urlSplit = data.split('.')
  urlSplitLen = len(urlSplit)
  type = '.' + urlSplit[urlSplitLen-1]
  return type

# 创建文件夹
def createFold(baseRoot, foldName):
  name = urllib.parse.unquote(foldName)
  mkdir(baseRoot+name)
  return


# 下面变量临时存放，可能用不到
chapterHeaders = {
  "accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
  "accept-encoding":"gzip, deflate, br",
  "accept-language":"zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7",
  "cache-control":"no-cache",
  "cookie":"UM_distinctid=174a991ad1a26c-0afb998ad92617-3323767-1fa400-174a991ad1b5a8; __gads=ID=289a30228745382c-22cecc6d28c500f5:T=1607699470:RT=1607699470:R:S=ALNI_MbODWxVquBiHUrh8moe6CHup0kNMA; CNZZDATA1278325662=1030922568-1600569125-https%253A%252F%252Fcn.bing.com%252F%7C1608114925",
  "Host":"www.manhuaniu.com",
  "pragma":"no-cache",
  "sec-fetch-dest":"document",
  "sec-fetch-mode":"navigate",
  "sec-fetch-site":"same-origin",
  "Sec-Fetch-User":"?1",
  "Upgrade-Insecure-Requests":"1",
  "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36",
}

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

imgHeader = {
  "authority":"i.hamreus.com",
  "scheme":"https",
  "accept":"image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
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