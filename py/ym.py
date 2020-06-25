import requests

reqList="https://appapi2.gamersky.com/v5/getCMSNewsList"
reqParams= {
  "app":"GSAPP",
  "deviceType":"Redmi 6",
  "appVersion":"5.5.22",
  "os":"android",
  "osVersion":"9",
  "deviceId":"862622048437469",
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
list = []

def get_list(pageIndex=1,write=0):
  reqParams['request']['pageIndex'] = pageIndex
  res = requests.post(reqList,json=reqParams,headers={'Content-Type':'chartset="utf-8"'})
  result = res.json()
  # print(res.apparent_encoding)
  if write > 0:
    res.encoding='utf-8'
    return res.text
  else:
    return result

# 写入 json 数据文件
def write_json():
  page_num = 1
  while page_num < 4:
    back_data = get_list(page_num,1)
    name = "list"+ str(page_num) +".json"
    filename = "../data/ym/"+ name
    with open(filename, "w+",encoding="utf-8") as f:
        f.write(back_data)
    page_num += 1
  return


# backData = get_list()
# list = backData['result']
# write_json()
# print(backData)
print('done')