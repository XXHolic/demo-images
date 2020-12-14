# -*- coding: UTF-8 -*-
import os
import re

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


# 从 <h2>some content</h2> 这样的标签中提取出 some content
# def getHtmlLabelContent(data): 无效，先放这里
#   searchObj = re.match(r'<[a-zA-Z]+.*?>([\s\S]*?)<\/[a-zA-Z]+.*?>', data)
#   content = ''
#   if (searchObj):
#     content = searchObj.group()
#   else:
#     print ("No match: ",data)
#   return content

# 删除符合一定条件的文件
def removeFile(path,size=1):
  if(os.path.exists(path)):
    fileSize = os.path.getsize(path)
    if ( fileSize/1024 < size):
      os.remove(path)
  return