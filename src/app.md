-   App
    -   useState
        -   searchText: 搜索文本，初始值为空字符串
    -   return
        -   返回一个 div 元素，包含以下子元素
            -   Routes
                -   Route
                    -   path: - element
                        -   MainHeader: 主页头部组件
                        -   div: 显示"便笺"的标题
                        -   SearchBox: 搜索框组件，传入 setSearchText 作为 props
                        -   DNotesContainer: 笔记容器组件，传入 searchText 作为 props
                -   Route
                    -   path: "/addNew/:id"
                    -   element: AddNotes 组件，用于添加新的笔记
