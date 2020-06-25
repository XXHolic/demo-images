## 每日趣味动态图

### 列表
- URL：https://appapi2.gamersky.com/v5/getCMSNewsList
- type：POST
- 参数

IOS deviceId 40 位数字和字母

```json

{
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
```
分页字段：pageIndex

## 详情接口：

- URL：http://appapi2.gamersky.com/v5/getArticle
- type：POST
- 参数：

```js
{
    "app": "GSAPP",
    "deviceType": "Redmi 6",
    "appVersion": "5.5.22",
    "os": "android",
    "osVersion": "9",
    "deviceId": "862622048437469",
    "request": {
        "extraFiledNames": "",
        "modelFieldNames": "Tag,Tag_Index,pageNames,Title,Subheading,Author,pcPageURL,CopyFrom,UpdateTime,DefaultPicUrl,GameScore,GameLib,TitleIntact,NodeId,editor,Content_Index",
        "articleId": "1298386",
        "appModelFieldNames": "",
        "cacheMinutes": 60
    }
}
```