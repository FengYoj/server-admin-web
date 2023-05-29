import Utils from "../utils/utils"
import Cache from "../cache/cache"
import Request from "../request/request"
import axios from "axios"

export default class Theme {
    private static _theme: string = Cache.get<string>("theme", "auto")

    private static _is_dark = false

    private static _customize_style: string

    private static __customize_style: string = ""

    private static __dark_style: string = (function () {
        axios.get("static/css/theme.css").then(res => {
            if (res.status === 200) {
                Theme._dark_style = res.data

                console.log(Theme.__dark_style)
            }
        })

        return `
            html,.page {
                background: linear-gradient(45deg, #1f2331 5%, #070a0d);
            }

            *,*::after {
                color: #ffffff;
                border-color: #272938;
            }
        `
    })()

    private static _dark_style: string = ""

    private static _changeCallbcak: ((theme: "dark" | "light") => void)[] = []

    private static doms: Element[] = []

    private static style = (function () {
        // 创建 style 标签节点
        let style = document.createElement("style")

        // 添加到文档流
        document.body.appendChild(style)

        Object.defineProperty(Theme, "_dark_style", {
            set: function (value) {
                // 添加到文档流
                if (Theme._is_dark) {
                    // 添加到文档流
                    style.innerHTML = value + this.__customize_style
                }

                Theme.__dark_style = value
            },
            get: function () {
                return Theme.__dark_style
            },
        })

        Object.defineProperty(Theme, "_customize_style", {
            set: function (value) {
                // 添加到文档流
                if (Theme._is_dark) {
                    // 添加到文档流
                    style.innerHTML = this._dark_style + value
                }

                Theme.__customize_style = value
            },
            get: function () {
                return Theme.__customize_style
            },
        })

        // 返回对象
        return style
    })()

    private static main = (function () {
        let media = window.matchMedia("(prefers-color-scheme: dark)")

        media.addEventListener("change", evt => {
            if (Theme._theme === "auto") {
                Theme.onRefresh(evt)
            }
        })

        Cache.on<any>("theme", v => {
            Theme._theme = v
            Theme.initial(media)
        })

        Theme.initial(media)
    })()

    /**
     * 初始化
     */
    private static initial(media: MediaQueryList) {
        if (this._theme === "auto") {
            this.onRefresh(media)
        } else {
            this._is_dark = this._theme === "dark"

            this.onRefresh()
        }
    }

    private static onRefresh(e?: MediaQueryListEvent | MediaQueryList) {
        let prefersDarkMode: boolean

        if (e) {
            prefersDarkMode = this._is_dark = e.matches
        } else {
            prefersDarkMode = this._is_dark
        }

        if (prefersDarkMode) {
            Theme.dark()
        } else {
            Theme.light()
        }

        let theme: "dark" | "light" = prefersDarkMode ? "dark" : "light"

        Utils.each(this._changeCallbcak, f => {
            if ("function" === typeof f) {
                f(theme)
            }
        })
    }

    /**
     * 监听主题变化
     * @param callback 回调事件
     */
    public static onChange(callback: (theme: "dark" | "light") => void): void {
        this._changeCallbcak.push(callback)
    }

    /**
     * 获取主题信息
     */
    public static getTheme(): "dark" | "light" {
        return this._is_dark ? "dark" : "light"
    }

    /**
     * 是否为深色模式
     */
    public static isDark(): boolean {
        return this._is_dark
    }

    /**
     * 改变主题
     */
    public static changeTheme(theme?: "light" | "dark" | "auto") {
        if (!theme) {
            switch (this._theme) {
                case "light":
                    theme = "dark"
                    break
                case "dark":
                    theme = "auto"
                    break
                case "auto":
                    theme = "light"
            }
        }

        Cache.set("theme", theme, { storage: "local" })
    }

    /**
     * 深色模式
     */
    public static dark() {
        let nodes = this.doms

        for (let i = 0; i < nodes.length; i++) {
            let node: Element = nodes[i]
            let dark_class: string = node.getAttribute("dark-class")
            dark_class && node.classList.add(dark_class)
        }

        console.log(Theme._dark_style)

        this.style.innerHTML = this._dark_style + this._customize_style
    }

    /**
     * 浅色模式
     */
    public static light() {
        if (!this.style.innerHTML) {
            return
        }

        let nodes = this.doms

        for (let i = 0; i < nodes.length; i++) {
            let node: Element = nodes[i]
            node.classList.remove(node.getAttribute("dark-class"))
        }

        this.style.innerHTML = ""
    }

    /**
     * 处理页面
     * @param page 页面实体
     */
    public static processPage(page: HTMLDivElement): void {
        if (page.hasAttribute("dark-class")) {
            this.processElement(page)
        }

        Utils.eachNode<HTMLDivElement>(page.querySelectorAll("[dark-class]"), e => {
            this.processElement(e)
        })
    }

    private static processElement(e: HTMLDivElement) {
        e.classList[this._is_dark ? "add" : "remove"](e.getAttribute("dark-class"))

        this.doms.push(e)
    }

    /**
     * 添加深色模式样式
     * @param style 样式对象
     */
    public static addDark(style: { class: string; value: string }[]): void {
        var dark_style: string[] = []

        Utils.each(style, v => {
            dark_style.push(`${v.class} { ${v.value} }`)
        })

        this._customize_style = this._customize_style + dark_style.join()
    }
}

window["Theme"] = Theme
