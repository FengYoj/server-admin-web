export default [{
    sub: [{
        id: "back",
        icon: "back",
        name: "返回",
        onClick: () => {
            window.history.back()
        }
    }, {
        id: "forward",
        icon: "forward",
        name: "前进",
        onClick: () => {
            window.history.go(1)
        }
    }, {
        id: "refresh",
        icon: "refresh",
        name: "刷新页面",
        onClick: () => {
            window.location.reload()
        }
    }, {
        id: "copy",
        icon: "copy",
        name: "复制",
        onClick: () => {
            document.execCommand("copy")
        }
    }, {
        id: "select_all",
        icon: "select_all",
        name: "全选",
        onClick: (evt) => {
            var e: HTMLElement = evt.target

            if (e instanceof HTMLInputElement) {
                e.focus()
                e.select()
            } else {
                var range = document.createRange()
                range.selectNodeContents(e)
                var selection = window.getSelection()
                selection.removeAllRanges()
                selection.addRange(range)
            }
        }
    }]
}]