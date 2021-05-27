### 使用前
- 更新package.json中的name、description、repository\url字段信息
- 替换project.config.json中的appid和projectname字段信息

### 项目结构

```
|-- app                         应用目录
|---- assets                    存放主包或公共资源文件
|------ images                  存放主包或公共图片资源
|---- behaviors                 存放主包或通用行为
|---- components                存放公共组件
|---- constant                  存放通用常量，如API、路径、正则、日志、配置信息等
|---- environment               环境配置
|---- pages                     存放主包页面
|------login                    验证码登录页
|------protocol                 协议页
|------exception                登录异常页

|---- ywqr                      某分包模块，当前指业务确认分包
|------ assets                  存放模块资源，当前指存放业务确认模块资源
|------ behaviors               存放模块行为，当前指存放业务确认模块行为
|------ components              存放模块组件，当前指存放业务确认模块组件
|------ pages                   存放模块页面，当前指存放业务确认模块页面
|-------- main                  主页
|------ ywqr-module.js          业务确认模块统一入口

|---- sass                      存放 sass 通用变量、函数、混合
|---- utils                     存放通用工具函数
|---- app.js                    小程序启动入口
|---- app.json                  全局配置
|---- app.scss                  全局样式
|---- modules.js                主包模块统一入口
|---- sitemap.json              小程序及其页面是否允许被微信索引配置
|-- gulpfile.js                 存放 gulp 处理脚本
|-- package.json                包依赖配置
|-- project.config.json         小程序项目配置文件
|-- README.md                   readme 文件
```

### 使用 Sass 书写样式

#### 安装依赖（已安装 node 和 npm 的前提下）

```bash
npm install -D
```

#### 启动 gulp 脚本

```bash
npm run start
```

### 查看日志

#### 登录微信公众平台

  平台地址：https://mp.weixin.qq.com/

  账号：

  密码：

#### 访问路径
  
  开发--运维中心--实时日志

#### 日志用途

- 查看接口日志
  
  ##### 接口日志信息
    
    由两部分组成，前端传递参数和接口响应内容；接口异常使用error日志级别，否则默认info级别。注意，如果数据量太大，数据不会显示。

  ##### 筛选条件

    - 时间段(最近 7 天记录)
    
    - 用户微信号或 openID
    
    - 访问页面路径

    - 日志级别
    
    - 自定义的过滤字段：只支持单字段过滤查询，不支持多字段。字段输入说明如下，

      手机查询，直接输入手机号即可，如 13325748685

      API 查询，输入 api:XXX 即可，如 api:insertlog

      环境查询，输入 env:XXX 即可，如 env:release

      unionId查询，输入 unionId:XXX 即可

      单位查询，输入 comp:XXX 即可

- 查看线上小程序版本更新情况

  ##### 版本更新信息

    更新状态status、当前线上版本cur-online-ver、设备信息device-info。使用warn日志级别，以与接口日志信息区别。

  ##### 筛选条件

    除使用时间段、用户微信号或 openID、访问页面路径、日志级别外，在自定义过滤字段，输入 version 可以过滤出版本更新信息。
