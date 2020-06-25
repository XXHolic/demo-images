import requests
import json
import re

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

maxPageNum = 2
reqList="http://appapi2.gamersky.com/v5/getArticle"
reqParams= {
    "app": "GSAPP",
    "deviceType": "Redmi 6",
    "appVersion": "5.5.1",
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

# pageIndex 分页页码
# write 0-获取返回文本内容，1-返回对象
# type 0-动态图，1-囧图 2-今日快乐源泉 3-星期一的丰满
def get_detail(articleId,write=0,type='0'):
  reqParams['request']['articleId'] = articleId
  # reqParams['request']['tags'] = tagsName[type]
  res = requests.post(reqList,json=reqParams,headers={'Content-Type':'chartset="utf-8"'})
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
def deal_str(data):
  pattern = re.compile(r'\<img.*?>')
  result = pattern.findall(data)
  result_len = len(result)
  result_index = 0
  result_format = []
  while result_index < result_len:
    searchObj = re.search(r'src=".*?"', result[result_index])
    url = searchObj.group()
    imgTag = '<img class="detail-img" border="0" alt="" '+url+'>'
    result_format.append(imgTag)
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
    new_content = deal_str(contentText)
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


get_article_id('0')
write_detail()

print('all done')