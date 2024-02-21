# RichText 组件

## 导入模块

-   引入样式文件
-   引入 React 相关模块
-   引入富文本编辑器相关模块
    -   `Editor`
    -   `Toolbar`
    -   `IDomEditor`
    -   `IEditorConfig`
    -   `IToolbarConfig`
    -   `DomEditor`
-   引入颜色模式接口

## 定义组件

-   定义富文本编辑器组件`RichText`
    -   定义接口`IRichTextProps`
        -   `setTextString`: 函数，接收一个字符串参数
        -   `textString`: 可选，字符串
        -   `colorMode`: 可选，颜色模式接口
    -   定义状态
        -   `editor`: 编辑器实例，初始值为`null`
        -   `html`: 编辑器内容，初始值为`textString`或`'<p></p>'`
    -   定义`useEffect`钩子函数
        -   当`textString`改变时，更新`html`状态
        -   当`html`改变时，调用`setTextString`函数
    -   定义工具栏配置`toolbarConfig`
        -   定义菜单键
    -   定义编辑器配置`editorConfig`
        -   定义占位符
    -   定义`useEffect`钩子函数
        -   组件卸载时，销毁编辑器实例
    -   返回 JSX 元素
        -   编辑器组件`Editor`
        -   工具栏组件`Toolbar`

## 导出组件

-   导出`RichText`组件
