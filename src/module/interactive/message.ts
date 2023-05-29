import Utils from "../utils/utils"
import Theme from "../theme/theme"
import Language from "../language/language"

type type = "info" | "error" | "success" | "progress"
type btnType = "all" | "confirm" | "close"

class MessageController {
    private static messages: Message[] = []

    private static page: HTMLDivElement = (() => {
        const e = document.createElement("div")

        e.className = "msg-page"
        e.id = "MSG-PAGE"

        document.body.appendChild(e)

        const l = document.createElement("link")

        l.rel = "stylesheet"
        l.type = "text/css"
        l.href = "static/interactive/message/css/message.css"

        document.head.append(l)

        if (Theme.isDark()) {
            e.classList.add("msg-page-dark")
        }

        Theme.onChange(t => {
            e.classList[t === "dark" ? "add" : "remove"]("msg-page-dark")
        })

        return e
    })()

    public static remove(msg: Message): void {
        Utils.getElement(
            ".msg-transform",
            e => {
                e.classList.add("msg-hide")
            },
            msg.getElement()
        )

        setTimeout(() => {
            this.page.removeChild(msg.getElement())

            Utils.each(
                this.messages,
                () => "delete",
                c => c === msg
            )
        }, 1000)
    }

    public static add(msg: Message): void {
        // 缓存数组
        this.messages.push(msg)

        // 添加到文档流
        this.page.appendChild(msg.getElement())
    }

    public static onConfirm(id: string): void {
        Utils.each(
            this.messages,
            (m: Message) => {
                m.onConfirm()
            },
            c => c.getId() === id
        )
    }

    public static onClose(id: string): void {
        Utils.each(
            this.messages,
            (m: Message) => {
                m.onClose()
            },
            c => c.getId() === id
        )
    }

    public static onCancel(id: string): void {
        Utils.each(
            this.messages,
            (m: Message) => {
                m.onCancel()
            },
            c => c.getId() === id
        )
    }

    public static info<B extends Object>(content: string, build?: B): B extends boolean ? MessageBuilder : Message {
        return this._build("info", content, build)
    }

    public static error<B extends Object>(content: string, build?: B): B extends boolean ? MessageBuilder : Message {
        return this._build("error", content, build)
    }

    public static success<B extends Object>(content: string, build?: B): B extends boolean ? MessageBuilder : Message {
        return this._build("success", content, build)
    }

    public static progress<B extends Object>(content: string, build?: B): B extends boolean ? MessageProgressBuilder : MessageProgress {
        const m = new MessageProgressBuilder(content)

        if (typeof build === "boolean") {
            return m as any
        }

        return m.build() as any
    }

    private static _build<B extends Object>(type: type, content: string, build?: B): B extends boolean ? MessageBuilder : Message {
        const m = new MessageBuilder(type, content)

        if (typeof build === "boolean") {
            return m as any
        }

        return m.build() as any
    }

    public static closeAll() {
        Utils.each(this.messages, m => {
            m.onClose()
        })
    }
}

window["MessageController"] = MessageController

class MessageBuilder {
    public _content: string
    public _timeout: number
    public _button: {
        confirm?: string
        cancel?: string
    }
    public _type: type
    public _onTimeout: () => void
    public _onConfirm: () => void
    public _onCancel: () => void
    public _onComplete: (type: "cancel" | "confirm") => void

    constructor(type: type, content?: string) {
        this._type = type
        this._content = content
    }

    public setContent(content: string): MessageBuilder {
        this._content = content
        return this
    }

    public setTimeout(timeout: number): MessageBuilder {
        this._timeout = timeout
        return this
    }

    public setButton(button: { confirm?: string; cancel?: string }): MessageBuilder {
        this._button = button
        return this
    }

    public setType(type: type): MessageBuilder {
        this._type = type
        return this
    }

    public onTimeout(callback: () => void): MessageBuilder {
        this._onTimeout = callback
        return this
    }

    public onConfirm(callback: (data?: any) => void): MessageBuilder {
        this._onConfirm = callback
        return this
    }

    public onCancel(callback: () => void): MessageBuilder {
        this._onCancel = callback
        return this
    }

    public onComplete(callback: (type: "cancel" | "confirm") => void): MessageBuilder {
        this._onComplete = callback
        return this
    }

    public build(): Message {
        return new Message(this)
    }

    public isCallback() {
        return !!this._onConfirm || !!this._onCancel || !!this._onComplete
    }
}

class MessageProgressBuilder {
    public _content: string
    public _onMinimize: () => void
    public _onCancel: () => void
    public _onComplete: () => void

    constructor(content?: string) {
        this._content = content
    }

    public setContent(content: string): MessageProgressBuilder {
        this._content = content
        return this
    }

    public onMinimize(onMinimize: () => void): MessageProgressBuilder {
        this._onMinimize = onMinimize
        return this
    }

    public onCancel(onCancel: () => void): MessageProgressBuilder {
        this._onCancel = onCancel
        return this
    }

    public onComplete(onComplete: () => void): MessageProgressBuilder {
        this._onComplete = onComplete
        return this
    }

    public build(): MessageProgress {
        return new MessageProgress(this)
    }
}

class Message {
    private id: string = `MessageBase_${Utils.getUuid()}`

    private status: "display" | "hide" = "display"

    private type: type

    /** 文本内容 */
    private content: string

    /** 按钮类型 */
    private btnType: btnType

    private build: MessageBuilder

    private timeout: number

    private elem: HTMLDivElement

    private static theme = Theme.getTheme()

    private static language = {
        confirm: "确认",
        cancel: "取消",
    }

    constructor(build: MessageBuilder) {
        this.build = build
        this.content = build._content

        const msg = (this.elem = document.createElement("div"))

        msg.className = "msg-base"
        msg.innerHTML = this.getHtml()

        MessageController.add(this)

        if (!build.isCallback() && build._type !== "progress") {
            this.onTimeout()

            msg.onmouseover = () => {
                clearTimeout(this.timeout)
            }

            msg.onmouseout = () => {
                this.onTimeout()
            }
        }

        if (build._onTimeout) {
            setTimeout(() => {
                build._onTimeout()
            }, build._timeout || 1000)
        }
    }

    /**
     * 监听延时关闭事件
     */
    public onTimeout(): void {
        this.timeout = setTimeout(() => {
            this.onClose()
        }, 5000)
    }

    /**
     * 监听取消事件
     */
    public onCancel(): void {
        this.build._onCancel && this.build._onCancel()

        // 触发完成事件
        this.onComplete("cancel")
    }

    /**
     * 监听确认事件
     */
    public onConfirm(): void {
        this.build._onConfirm && this.build._onConfirm()

        // 触发完成事件
        this.onComplete("confirm")
    }

    /**
     * 监听完成事件
     */
    public onComplete(type: "confirm" | "cancel"): void {
        this.build._onComplete && this.build._onComplete(type)

        // 关闭消息框
        this.onClose()
    }

    /**
     * 监听关闭事件
     */
    public onClose(): void {
        // 移除定时任务
        clearTimeout(this.timeout)

        MessageController.remove(this)
    }

    /**
     * 获取按钮类型
     */
    private getBtnType(): btnType {
        const config = this.build

        if (!config || (!config._onConfirm && !config._onCancel && !config._onComplete)) {
            return "close"
        }

        if (config._onConfirm || config._onCancel) {
            return "all"
        }

        if (config._onComplete) {
            return "confirm"
        }
    }

    private getHtml(): string {
        const build = this.build,
            type = build._type,
            btnType = this.getBtnType()

        return `
            <div class="msg-transform msg-display" :style="topHeight ? ('margin-top: ' + item.status === 'display' ? (topHeight + 'px') : 0) : ''">
                <div v-else class="msg-box" type="${btnType}">
                    <div class="msg-info">
                        ${
                            type === "progress"
                                ? this.getProgressHtml()
                                : `
                            <div class="msg-icon">
                                <div class="icon-box">
                                    <img class="icon icon-light" src="static/interactive/icon/${type}.svg">
                                    <img class="icon icon-dark" src="static/interactive/icon/${type}_dark.svg">
                                </div>
                            </div>
                        `
                        }
                        <div class="msg-content">
                            <p class="text">${build._content}</p>
                        </div>
                    </div>
                    <div class="msg-operating ${btnType === "close" ? "msg-operating-margin" : ""}">
                        ${
                            btnType === "close"
                                ? `
                            <div class="msg-operating-close" onclick="MessageController.onClose('${this.id}')">
                                <div class="icon-box">
                                    <img class="icon icon-light" src="static/interactive/icon/close.svg">
                                    <img class="icon icon-dark" src="static/interactive/icon/close_dark.svg">
                                </div>
                            </div>
                        `
                                : `
                            <div class="msg-operating-button">
                                ${
                                    btnType === "all" || btnType === "confirm"
                                        ? `
                                    <button class="msg-button msg-button-confirm" onclick="MessageController.onConfirm('${this.id}')">${
                                              (build._button ? build._button.confirm : null) || Message.language.confirm
                                          }</button>
                                `
                                        : ""
                                }
                                ${
                                    btnType === "all"
                                        ? `
                                    <button class="msg-button msg-button-cancel" onclick="MessageController.onCancel('${this.id}')">${
                                              (build._button ? build._button.cancel : null) || Message.language.cancel
                                          }</button>
                                `
                                        : ""
                                }
                            </div>
                        `
                        }
                    </div>
                </div>
            </div>
        `
    }

    private getProgressHtml(): string {
        return `
        <div class="progress-base">
            <div class="progress-bar-box">
                <div class="right-bar"></div>
                <div class="right-cover"></div>
                <div class="left-bar"></div>
            </div>

            <div class="inside-box" :style="getInsideStyle()" dark-class="inside-box-dark">
                <p class="title" :style="getTitleStyle()">0%</p>
            </div>
        </div>`
    }

    public setContent(content: string): void {
        this.__getContentElem().innerHTML = content
    }

    public getId(): string {
        return this.id
    }

    public getElement(): HTMLDivElement {
        return this.elem
    }

    private _contentElem: HTMLDivElement

    private __getContentElem(): HTMLDivElement {
        if (this._contentElem) {
            return this._contentElem
        }

        const e = (this._contentElem = Utils.getElement(".msg-content .text", null, this.getElement()))

        return e
    }
}

export class MessageProgress {
    private rightBar: HTMLDivElement

    private leftBar: HTMLDivElement

    private titleElem: HTMLDivElement

    private rightCoverElem: HTMLDivElement

    private displayRightCover: boolean = true

    private build: MessageProgressBuilder

    private message: Message

    constructor(build: MessageProgressBuilder) {
        this.build = build

        const messageBuilder = new MessageBuilder("progress", build._content)

        messageBuilder.onConfirm(this.onMinimize.bind(this))
        messageBuilder.onCancel(this.onCancel.bind(this))
        messageBuilder.setButton({
            confirm: "最小化",
            cancel: "取消",
        })

        const message = (this.message = messageBuilder.build())

        Utils.getElements<HTMLDivElement>(
            [".left-bar", ".right-bar", ".title", ".right-cover"],
            (e1, e2, e3, e4) => {
                this.leftBar = e1
                this.rightBar = e2
                this.titleElem = e3
                this.rightCoverElem = e4
            },
            message.getElement()
        )
    }

    public progress(sc: number): void {
        // 向下取整
        sc = Math.floor(sc)

        if (sc > 100) {
            return
        }

        this.leftBar.style.transform = `rotate(${((sc > 50 ? 50 : sc) / 100) * 360}deg)`
        this.rightBar.style.transform = `rotate(${(sc / 100) * 360}deg)`
        this.titleElem.innerText = `${sc}%`

        if (this.displayRightCover && sc > 50) {
            this.rightCoverElem.hidden = true
            this.displayRightCover = false
        }

        if (sc === 100) {
            this.onComplete()
        }
    }

    public setContent(content: string): void {
        this.message.setContent(content)
    }

    private onComplete() {
        this.build._onComplete && this.build._onComplete()

        // 关闭
        this.message.onClose()
    }

    private onMinimize() {
        this.build._onMinimize && this.build._onMinimize()
    }

    private onCancel() {
        this.build._onCancel && this.build._onCancel()
    }
}

Language.processModule(Message)

export default MessageController
