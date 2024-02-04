# DNotes

#### 介绍

DNotes 是一款基于 tauri+react+antd+ts 的跨平台笔记记录软件

软件采用 gitee 提供的接口实现登录，上传，同步功能。

在登录前请自行注册 gitee 账号，登录方式为账号密码登录

#### 软件架构

tauri 框架 + react + ts + antd 组件库

#### 安装教程

1.  若要在本地运行，需要首先安装 rust 和其他系统依赖，参考 tauri 官网文档即可完成。[预先准备 | Tauri Apps](https://tauri.app/zh-cn/v1/guides/getting-started/prerequisites)
2.  安装 node，要求版本号大于 18
3.  克隆该仓库，执行`npm install`或`yarn`安装依赖
4.  运行`yarn tauri dev`开启本地开发模式
5.  运行`yarn tauri build`可以在本地打包

#### 使用说明

应用包含以下功能

1.  新建便笺：可以创建多个便笺，并将活动便笺置顶，支持富文本，支持图片链接，暂不支持本地图片
2.  搜索便笺： 根据关键词搜索便笺内容
3.  删除便笺： 删除不再需要的便笺
4.  修改便笺：

    1.  双击修改便笺内容： 双击新开窗口，修改便笺内容
    2.  修改便笺主题：目前支持五种主题

5.  同步便笺
    1.  需要拥有 gitee 账号，可以前往 gitee[工作台 - Gitee.com](https://gitee.com/)注册
    2.  需要进行手动保存，目前暂不支持自动同步，建议退出前手动点击同步数据

#### 后续 TODO

1.  富文本支持本地图片
2.  定时同步，退出时同步
