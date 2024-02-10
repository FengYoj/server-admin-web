import Judge, { Operate } from "../judge/judge"
import Theme from "../theme/theme"
import Utils from "../utils/utils"

export default class Loading {
    private static box: HTMLDivElement

    private static nameBox: HTMLDivElement

    private static timeout: number

    private static closeTimeout: number

    private static judge: Operate

    private static status: 'show' | 'hide' = 'hide'

    public static init = (function() {
        Loading.initBox()
        Loading.initStyle()

        Theme.addDark([
            {
                class: ".loading-page-box",
                value: `
                    background: #191d23
                `
            }
        ])
    })()

    private static initBox() {
        const box = document.createElement("div")

        box.id = "loading-box"
        // 初始为隐藏
        box.style.visibility = "hidden"

        const iconBox = Utils.createElement("img", { class: "icon", src: "static/module/loading/loading.svg" })

        const nameBox = this.nameBox = Utils.createElement("div", { class: "name", innerText: "Loading..." })

        box.appendChild(iconBox)
        box.appendChild(nameBox)

        document.body.appendChild(box)

        Loading.box = box
    }

    private static initStyle() {
        const isExist = !!document.querySelector("link[href='static/module/loading/loading.css']")

        if (!isExist) {
            const link = document.createElement("link")

            link.rel = "stylesheet"
            link.href = "static/module/loading/loading.css"

            document.head.appendChild(link)
        }
    }

    public static show(name: string = "加载中..."): void {
        if (this.status === 'show') {
            return
        }

        this.status = 'show'

        clearTimeout(this.closeTimeout)

        // 修改文本
        this.nameBox.innerText = name

        // 显示加载框
        this.changeVisibility(true)

        // 超时自动关闭
        this.timeout = setTimeout(() => {
            this.changeVisibility(false)
        }, 30 * 1000)
    }

    public static hide() {
        if (this.status === 'hide') {
            return
        }

        this.status = 'hide'

        this.closeTimeout = setTimeout(() => {
            this.changeVisibility(false)
        }, 500);

        // 取消延迟关闭
        clearTimeout(this.timeout)
    }

    public static page(el: HTMLDivElement): PageLoading {
        return new PageLoading(el)
    }

    private static changeVisibility(show: boolean) {
        this.box.style.visibility = show ? "initial" : "hidden"
    }

    private static getPageBox() {
        const box = document.createElement("div")

        box.id = "loading-page-box"
        // 初始为隐藏
        box.style.visibility = "hidden"

        const iconBox = Utils.createElement("img", { class: "icon", src: "static/module/loading/loading.svg" })

        const nameBox = this.nameBox = Utils.createElement("div", { class: "name", innerText: "Loading..." })

        box.appendChild(iconBox)
        box.appendChild(nameBox)

        return box
    }

    public static changeStatus(status: 'show' | 'hide'): void {
        this.status = status
    }

    public static getStatus(): 'show' | 'hide' {
        return this.status
    }
}

export class PageLoading {

    private box: HTMLDivElement

    private nameBox: HTMLDivElement

    private timeout: number

    private status: 'show' | 'hide' = 'hide'

    private el: HTMLDivElement

    constructor(el: HTMLDivElement) {
        const box = document.createElement("div")

        box.className = "loading-page-box"

        const iconBox = Utils.createElement("img", { class: "icon", src: "static/module/loading/loading.svg" })

        const nameBox = this.nameBox = Utils.createElement("div", { class: "name", innerText: "Loading..." })

        box.appendChild(iconBox)
        box.appendChild(nameBox)

        el.style.position = "relative"

        el.appendChild(box)

        this.el = el
        this.box = box
    }

    public show(name: string = "加载中..."): void {
        if (this.status === 'show') {
            return
        }

        this.status = "show"

        // 修改文本
        this.nameBox.innerText = name

        // 显示加载框
        this.changeVisibility(true)

        // 超时自动关闭
        this.timeout = setTimeout(() => {
            this.changeVisibility(false)
        }, 30 * 1000)
    }

    public hide() {
        if (this.status === 'hide') {
            return
        }

        this.status = "hide"

        this.changeVisibility(false)

        // 取消延迟关闭
        clearTimeout(this.timeout)
    }

    private changeVisibility(show: boolean) {
        if (show) {
            this.box.className = "loading-page-box loading-page-box-show"
        } else {
            this.box.className = "loading-page-box loading-page-box-hide"
        }
    }
}