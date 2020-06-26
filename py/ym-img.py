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

def dealImg():
  root = '../origin'
  items = os.listdir(root)
  for infile in items:
      isImage = isImg(infile)
      path = root + '/' + infile
      writePath = './'+infile
      if isImage:
        try:
          with Image.open(path) as im:
            # print(im.height)
            # print(infile, im.format, "%dx%d" % im.size, im.mode)
            height = im.height
            width = im.width
            box = (width-100, height-20, width,height)
            draw = ImageDraw.Draw(im)
            draw.rectangle(box,'white','white')
            im.save(writePath)
        except OSError:
          print('rrr')
  return

dealImg()