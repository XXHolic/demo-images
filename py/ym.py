import requests
import json

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

maxPageNum = 4
reqList="https://appapi2.gamersky.com/v5/getCMSNewsList"
reqParams= {
  "app":"GSAPP",
  "deviceType":"Redmi 7",
  "appVersion":"5.5.23",
  "os":"android",
  "osVersion":"9",
  "deviceId":"9232666446537989",
  "request":{
    "modelFieldNames":"Title,Author,ThumbnailsPicUrl,updateTime,mark",
    "tagIds":"",
    "pageSize":20,
    "cacheMinutes":1,
    "tags":"动态图",
    "recommendedIndex":0,
    "nodeIds":"",
    "systemFieldNames":"DefaultPicUrl",
    "pageIndex":1,
    "UpdateTime":0,
    "topicIds":"",
    "GameLib":"0",
    "order":"timeDesc"
  }
}
img_list = []

# pageIndex 分页页码
# write 0-获取返回文本内容，1-返回对象
# type 0-动态图，1-囧图 2-今日快乐源泉 3-星期一的丰满
def get_list(pageIndex=1,write=0,type='0'):
  reqParams['request']['pageIndex'] = pageIndex
  reqParams['request']['tags'] = tagsName[type]
  res = requests.post(reqList,json=reqParams,headers={'Content-Type':'chartset="utf-8"'})
  result = res.json()
  # print(res.apparent_encoding)
  if write > 0:
    res.encoding='utf-8'
    return res.text
  else:
    return result

# 写入 json 数据文件
def write_json(type='0'):
  page_num = 1
  while page_num < maxPageNum:
    back_data = get_list(page_num,1,type)
    name = jsonListFileName[type] + str(page_num) +".json"
    filename = "../data/ym/"+ name
    with open(filename, "w+",encoding="utf-8") as f:
        f.write(back_data)
        f.close()
    page_num += 1
  return

# 获取图片链接
def get_img_src(type='0'):
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
          img_list.append(result_item['thumbnails'][0])
          result_index += 1
        f.close()
    page_num += 1
  print(img_list)
  return

# 分析获取的 JSON 数据，获得图片
def down_img():
  img_index = 0
  img_len = len(img_list)
  while img_index < img_len:
    img_item = img_list[img_index]
    img_item_arr = img_item.split('/')
    img_arr_len = len(img_item_arr)
    filename = "../ym/cover/"+ img_item_arr[img_arr_len-1]
    res = requests.get(img_item)
    with open(filename, "wb") as f:
        f.write(res.content)
        print(str(img_index) + filename + ' down success')
        f.close()
    img_index += 1
  return


# 获取列表数据
# write_json('3')

# 下载图片
# get_img_src('3')
# down_img()

print('all done')