# 美债拍卖雷达

金十数据 Plus 移动端设计 Demo，包含七种国债期限切换、需求温度、拍卖指标、历史图表与表格、资金分布、同期限未来三场拍卖及完整月历。

设计参考：https://treasury-auction-radar-jin10.prince9810.chatgpt.site/

## 本地运行

需要 Node.js 22 或以上版本，无需安装第三方依赖。

```sh
npm start
```

打开 http://127.0.0.1:4173/ 。完整日历支持 `/calendar.html` 和 `/calendar` 两种路径。

```sh
npm run check
npm run build
```

`check` 检查脚本语法、资源引用和快照数据完整性；`build` 将静态页面复制到 `dist/`，可交给常规静态站点服务部署。

## 项目结构

- `public/`：首页、完整日历、页面逻辑、样式及全部本地图片、字体、图表库。
- `data/snapshot.json`：拍卖结果及日历的结构化快照。
- `data/source-manifest.json`：公开页面与资源的来源和文件摘要。
- `docs/美债拍卖雷达需求文档.docx`：本次功能需求，各板块下列明数据来源及抓取频次。
- `scripts/`：本地服务、静态构建、完整性检查和快照同步工具。

## 数据

当前设计 Demo 使用截至 **2026年10月15日13:22 北京时间** 的数据快照，覆盖 2、3、5、7、10、20、30 年期，每个期限十三次拍卖，共九十一场。页面直接读取 `public/data.js`，没有后台定时抓取服务。

更新结构化快照后，运行以下命令，将数据同步到页面并检查：

```sh
npm run sync-data
npm run check
```

正式数据接入、刷新频次、会员权限和缺失数据处理等要求，以 `docs/美债拍卖雷达需求文档.docx` 为准。页面内的评论、关注状态和自定义 AI 提示词保存于当前浏览器；“问 AI”提供附带页面数据的提示词复制功能。

官方数据地址：

- Notes 拍卖结果：https://www.treasurydirect.gov/TA_WS/securities/auctioned?format=json&type=Note
- Bonds 拍卖结果：https://www.treasurydirect.gov/TA_WS/securities/auctioned?format=json&type=Bond
- 正式拍卖公告：https://www.treasurydirect.gov/TA_WS/securities/announced?format=json
- 季度暂定日历：https://home.treasury.gov/system/files/221/Tentative-Auction-Schedule.xml

## 计算口径

仅统计普通固定利率国债，续发行按原始期限归类，排除 TIPS 和浮息债。三类获配比例统一除以竞争性获配总额。

需求温度将投标倍数、间接获配和交易商获配与此前六次同期限拍卖比较，采用总体标准差；交易商反向计分，每项偏离值限制在 -3 至 3。温度为 `50 + 15 × 三项偏离值均值`，限制到 0 至 100 后取整。60 分及以上为需求偏强，40 分及以下为需求偏弱，其余为正常。规模不参与评分。

## 第三方资源

ECharts 与 html2canvas 随项目本地提供，原有许可声明保留在对应库文件中。底部操作、品牌图片和字体随设计页面保留。
