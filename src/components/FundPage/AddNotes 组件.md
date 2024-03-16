# AddNotes 组件

## useState 钩子

-   textString: 初始文本字符串
-   initaltextString: 初始文本字符串
-   idNumber: ID 号
-   newDnoteText: 新的 Dnote 文本
-   colorModeNow: 当前颜色模式

## 函数

-   saveHandler: 处理保存笔记的功能
    -   比较 newDnoteText 和 textString
    -   用 textString 更新 newDnoteText
    -   创建 newDnoteNow 对象
    -   检查笔记是否已经存在于本地存储中
    -   更新或添加笔记到本地存储
-   changeColorThemeHandler: 处理主题颜色更改
    -   查找当前笔记
    -   更新 textString 和 colorModeNow

## useEffect 钩子

-   第一个 useEffect: 处理定期保存笔记
    -   设置每秒调用 saveHandler 的间隔
    -   在组件卸载时清除间隔
-   第二个 useEffect: 处理笔记数据的初始化
    -   根据位置路径名设置 idNumber
    -   查找当前笔记
    -   更新 textString，initaltextString 和 colorModeNow

## 渲染的组件

-   MainHeader: 显示主要标题
    -   接收 textString，colorMode 和 changeColorThemeHandler 作为属性
-   RichText: 显示富文本
    -   接收 setTextString，textString 和 colorMode 作为属性
