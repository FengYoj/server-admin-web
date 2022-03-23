import Theme from "../theme/theme"
import Utils from "../utils/utils"

export default class Modal {
    private type: string = "info"

    private content: string = ""

    private btn_confirm: string = "确定"

    private btn_cancel: string = "取消"

    private title: string = "提示"

    private onComplete: () => boolean | void
    private onCancel: () => boolean | void
    private onConfirm: () => boolean | void

    private box: HTMLDivElement = (function() {
        const box = document.createElement("div")

        box.className = "modal-box"

        Modal.page.appendChild(box)

        return box
    })()

    private static page: HTMLDivElement = (function() {

        const l = document.createElement("link")

        l.rel = "stylesheet"
        l.type = "text/css"
        l.href = "static/interactive/modal/css/modal.css"

        document.head.append(l)

        const page = document.createElement("div")

        page.className = "modal-page"
        page.style.visibility = "hidden"

        if (Theme.isDark()) {
            page.classList.add("modal-page-dark")
        }

        Theme.onChange(theme => {
            page.classList[theme === "dark" ? 'add' : 'remove']("modal-page-dark")
        })

        document.body.appendChild(page)

        return page
    })()

    public show() {
        Modal.page.appendChild(this.getBox())
        // 显示页面
        Modal.changePage(true)
    }

    private getBox(): HTMLDivElement {
        let box = this.box

        box.appendChild(Utils.createElement("div", {
            class: "title-box",
            innerHTML: `
                <div class="icon-box">
                    <img src="static/interactive/icon/${this.type}.svg" />
                </div>
                <p class="title">${this.title}</p>
            `
        }))

        box.appendChild(Utils.createElement("div", {
            class: "content-box",
            innerHTML: this.content
        }))

        const btnBox = Utils.createElement("div", {
            class: "btn-box"
        })

        btnBox.appendChild(Utils.createElement("button", {
            class: ['btn', 'cancel'],
            innerText: this.btn_cancel,
            onclick: () => {
                this.onCallEvent("cancel")
            }
        }))

        btnBox.appendChild(Utils.createElement("button", {
            class: ['btn', 'confirm'],
            innerText: this.btn_confirm,
            onclick: () => {
                this.onCallEvent("confirm")
            }
        }))

        box.appendChild(btnBox)

        return box
    }

    private onCallEvent(type: 'cancel' | 'confirm') {
        var close: boolean | void

        switch (type) {
            case "cancel":
                this.onCancel && (close = this.onCancel())
                break
            case "confirm":
                this.onConfirm && (close = this.onConfirm())
        }

        // 调用完成事件
        close !== false && this.onComplete && (close = this.onComplete())

        // 移除
        close !== false && Modal.remove(this)
    }

    public static info(content: string, param?: ModalParam) {
        const modal = new Modal()

        modal.content = content

        modal.setParam(param)

        modal.show()
    }

    private setParam(param: ModalParam) {
        if (!param) return

        for (let i = 0, k = Object.keys(param), l = k.length; i < l; i++) {
            let key = k[i]
            // 赋值
            this[key] = param[key]
        }
    }

    private static changePage(show: boolean) {
        let page = Modal.page

        if (show && page.style.visibility === 'hidden') {
            page.style.visibility = "initial"
        } else if (!show && page.childNodes.length <= 0) {
            page.style.visibility = "hidden"
        }
    }

    private static remove(modal: Modal) {
        // 移除组件
        Modal.page.removeChild(modal.box)
        // 置空对象
        modal = null
        // 关闭页面
        Modal.changePage(false)
    }
}

interface ModalParam {
    /** 确认按钮 */
    btn_confirm?: string
    /** 取消按钮 */
    btn_cancel?: string
    /** 标题 */
    title?: string
    
    onComplete?: () => boolean | void
    onCancel?: () => boolean | void
    onConfirm?: () => boolean | void
}