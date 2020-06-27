import sys
import os
from PIL import Image, ImageDraw


def isImg(name):
  if name.find('small') == -1:
    return False
  nameSplit = name.split('.')
  ext = nameSplit[len(nameSplit)-1]
  if not ext:
    return False
  ext = ext.lower()
  if ext in ['jpg', 'png', 'jpeg','gif']:
    return True
  else:
    return False

totalCount = {'count':0}

def dealImg(path,type):
  isImage = isImg(path)
  if isImage:
    try:
      with Image.open(path) as im:
        # print(infile, im.format, "%dx%d" % im.size, im.mode)
        height = im.height
        width = im.width
        box = (width-100, height-20, width,height)
        if type == '3':
          box = (width-120, height-50, width,height)
        draw = ImageDraw.Draw(im)
        draw.rectangle(box,'white','white')
        im.save(path)
        totalCount['count'] = totalCount['count'] + 1
    except OSError:
      print('error: '+path)
  print(str(totalCount['count']) + 'done')
  return

# dealImg()

def find_files(path):
  lsdir = os.listdir(path)
  dirs = [i for i in lsdir if os.path.isdir(os.path.join(path, i))]
  if dirs:
    for i in dirs:
      find_files(os.path.join(path, i))
  files = [i for i in lsdir if os.path.isfile(os.path.join(path,i))]
  for f in files:
    dealImg(os.path.join(path, f),'3')
  return


find_files('../ym/detail/3')