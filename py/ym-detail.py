import requests
import json
import re
import os
import math
import random

phoneType = ['Redmi K30','RAce2','nova 7 SE','Redmi Note8','HUAWEI P30','HUAWEI Mate 20','nova 5i Pro','nova 5i','HUAWEI Mate 20 X','OPPO Reno3','vivoY5s','vivoNEX3','vivoS6','vivoY9s']
phoneTypeLen = len(phoneType)-1

appVersion = ['5.5.19','5.5.20','5.5.21','5.5.22','5.5.23']
appVersionLen = len(appVersion) - 1

osVersion = ['7','8','9']
osVersionLen = len(osVersion) - 1

jsonListFileName = {
  '0':'list',
  '1':'jlist',
  '2':'hlist',
  '3':'xlist',
}

tagsName = {
  '0':'动态图',
  '1':'囧图',
  '2':'今日快乐源泉',
  '3':'星期一的丰满',
}

maxPageNum = 3
reqList="http://appapi2.gamersky.com/v5/getArticle"
reqParams= {
    "app": "GSAPP",
    "deviceType": "Redmi 6",
    "appVersion": "5.5.21",
    "os": "android",
    "osVersion": "9",
    "deviceId": "862623248437469",
    "request": {
        "extraFiledNames": "",
        "modelFieldNames": "Tag,Tag_Index,pageNames,Title,Subheading,Author,pcPageURL,CopyFrom,UpdateTime,DefaultPicUrl,GameScore,GameLib,TitleIntact,NodeId,editor,Content_Index",
        "articleId": "",
        "appModelFieldNames": "",
        "cacheMinutes": 60
    }
}
id_list = []
# 囧图无法访问，所以要下载下来
jt_img_list = []

# 返回随机数
def random_num(min, max):
  return random.randint(min,max)

# 返回随机设备id
def random_device_id():
  index = 0
  device_id = ''
  while index < 15:
    num = random.randint(0,9)
    device_id = device_id + str(num)
    index += 1
  return device_id

# pageIndex 分页页码
# write 0-获取返回文本内容，1-返回对象
# type 0-动态图，1-囧图 2-今日快乐源泉 3-星期一的丰满
def get_detail(articleId,write=0,type='0'):
  reqParams['request']['articleId'] = articleId
  # reqParams['request']['tags'] = tagsName[type]

  # 制造随机的数据
  deviceTypeRandom = random_num(0,phoneTypeLen)
  reqParams['deviceType']= phoneType[deviceTypeRandom]
  appVersionRandom = random_num(0,appVersionLen)
  reqParams['appVersion']= appVersion[appVersionRandom]
  osVersionRandom = random_num(0,osVersionLen)
  reqParams['osVersion']= osVersion[osVersionRandom]
  deviceIdRandom = random_device_id()
  reqParams['deviceId']= deviceIdRandom


  res = requests.post(reqList,json=reqParams)
  result = res.json()
  # print(res.apparent_encoding)
  if write > 0:
    res.encoding='utf-8'
    return res.text
  else:
    return result

# 获取文章 ID
def get_article_id(type='0'):
  page_num = 1
  while page_num < maxPageNum:
    name = jsonListFileName[type] + str(page_num) +".json"
    filename = "../data/ym/"+ name
    with open(filename, "r",encoding="utf-8") as f:
        content = f.read()
        # print(content)
        data_dict = json.loads(content)
        result = data_dict['result']
        result_index = 0
        result_len = len(result)
        while result_index < result_len:
          result_item = result[result_index]
          id_list.append(result_item['contentId'])
          result_index += 1
        f.close()
    page_num += 1
  # print(id_list)
  return

# 处理内容字符串
# 图无权限访问的链接：https://imggif.gamersky.com/upimg/users/
# http://img1.gamersky.com/image2020/05/20200519_ls_red_141_4/gamersky_047small_094_2020519182898.jpg","http://c-ssl.duitang.com/uploads/item/202005/04/20200504131413_smQWw.gif"
#
invalidHost0 = ['imggif.gamersky.com']
invalidHost1 = ['img1.gamersky.com','c-ssl.duitang.com']

def deal_str(data,type):
  pattern = re.compile(r'\<img.*?>')
  result = pattern.findall(data)
  result_len = len(result)
  result_index = 0
  result_format = []
  while result_index < result_len:
    searchObj = re.search(r'src=".*?"', result[result_index])
    url = searchObj.group()
    url_split = url.split('"')
    img_url = url_split[1]
    if type == '0':
      if img_url.find(invalidHost0[0]) > -1:
        print('invalid: ' + img_url)
      else:
        result_format.append(img_url)
    elif type == '1':
      img_url_split = img_url.split('/')
      img_url_split_len = len(img_url_split)
      if img_url.find(invalidHost1[0]) > -1:
        level_1 = img_url_split[img_url_split_len-5]
        level_2 = img_url_split[img_url_split_len-4]
        level_3 = img_url_split[img_url_split_len-3]
        level_4 = img_url_split[img_url_split_len-2]
        name = img_url_split[img_url_split_len-1]
        use_data = [level_1, level_2,level_3,level_4, name]
        img_url_1 = '/'.join(use_data)
        jt_img_list.append({'level_1':level_1,'level_2':level_2,'level_3':level_3,'level_4':level_4,'name':name,'src':img_url,'type':invalidHost1[0]})
        result_format.append(img_url_1)
      elif img_url.find(invalidHost1[1]) > -1:
        level_1 = img_url_split[2]
        level_2 = img_url_split[img_url_split_len-3]
        level_3 = img_url_split[img_url_split_len-2]
        name = img_url_split[img_url_split_len-1]
        use_data = [level_1, level_2,level_3, name]
        img_url_1 = '/'.join(use_data)
        jt_img_list.append({'level_1':level_1,'level_2':level_2,'level_3':level_3,'name':name,'src':img_url,'type':invalidHost1[1]})
        result_format.append(img_url_1)
    result_index += 1
  # print(result)
  return result_format

# 获取详情并提取关键信息
def write_detail(type='0'):
  id_index = 0
  id_len = len(id_list)
  while id_index < id_len:
    res = get_detail(id_list[id_index],0,type)
    res_data = res['result'][0]
    contentText = res_data['Content_Index']
    new_content = deal_str(contentText,type)
    write_data = {
      'title':res_data['Title'],
      'time':res_data['UpdateTime'],
      'content':new_content,
    }

    name = str(id_list[id_index]) +".json"
    filename = "../data/ym-detail/"+ name
    with open(filename, "w+",encoding="utf-8") as f:
        f.write(json.dumps(write_data,ensure_ascii=False))
        print(str(id_index) + filename + ' write success')
        f.close()
    id_index += 1
  return


# jt_img_list = [{'level_1':'06','level_2':'20200623_zy_red_164_2','name':'014_S.jpg','src':'https://img1.gamersky.com/image2020/06/20200623_zy_red_164_2/014_S.jpg'}]
# 获得图片并下载
def down_img():
  img_index = 0
  img_len = len(jt_img_list)
  while img_index < img_len:
    img_item = jt_img_list[img_index]
    print(img_item)
    img_type = img_item['type']
    name = img_item['name']
    src = img_item['src']
    level_1 = img_item['level_1']
    level_2 = img_item['level_2']
    level_3 = img_item['level_3']
    level_1_dir = "../ym/detail/"+level_1
    level_2_dir = level_1_dir+"/"+level_2
    level_3_dir = level_2_dir+"/"+level_3
    if not os.path.exists(level_1_dir):
      os.mkdir(level_1_dir)
    if not os.path.exists(level_2_dir):
      os.mkdir(level_2_dir)
    if not os.path.exists(level_3_dir):
      os.mkdir(level_3_dir)

    if img_type == invalidHost1[0]:
      level_4 = img_item['level_4']
      level_4_dir = level_3_dir+"/"+level_4
      if not os.path.exists(level_4_dir):
        os.mkdir(level_4_dir)
      filename = level_4_dir + "/" +name
    elif img_type == invalidHost1[1]:
      filename = level_3_dir + "/" +name

    if (os.path.exists(filename)):
      print('exists')
    else:
      res = requests.get(src)
      with open(filename, "wb") as f:
          f.write(res.content)
          print(str(img_index) + filename + ' down success')
          f.close()
    img_index += 1
  return

# 分析图片域名


def main(type):
  type = str(type)
  if type == '0':
    get_article_id(type)
    write_detail(type)
  elif type == '1':
    get_article_id(type)
    write_detail(type)
    down_img()
  print('all done')
  return

main(1)

