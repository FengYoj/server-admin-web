import Utils from "../utils/utils"
import Path from "../config/path"
import Cache from "../cache/cache"
import Message from "../interactive/message"
import Queue from "../queue/queue"
import Loading from "../loading/loading"

export default class Request {
    /**
     * 网络状态
     */
    public static online: boolean = (function () {
        window.addEventListener(
            "online",
            () => {
                Request.online = true
            },
            false
        )

        window.addEventListener(
            "offline",
            () => {
                Request.online = false
            },
            false
        )

        return window.navigator.onLine
    })()

    public static get<T extends Object>(url: string, data?: obj | FormData | string, config: RequestConfig = {}): Promise<T> {
        return this.request<T>("GET", url, data, config)
    }

    public static post<T extends Object>(url: string, data?: obj | FormData | string, config: RequestConfig = {}): Promise<T> {
        return this.request<T>("POST", url, data, config)
    }

    public static delete<T extends Object>(url: string, data?: obj | FormData | string, config: RequestConfig = {}): Promise<T> {
        return this.request<T>("DELETE", url, data, config)
    }

    public static method<T extends Object>(method: RequestType, url: string, data?: obj | FormData | string, config: RequestConfig = {}): Promise<T> {
        return this.request<T>(method, url, data, config)
    }

    public static async page<T extends Object>(page: RequestPage<T>): Promise<ResponsePage<T>> {
        return new Promise((resolve, reject) => {
            // 是否加载完毕
            if (page.isLoaded()) {
                return reject("Finished loading")
            }

            var data = page.getData()

            // 写入页面数据
            data.page = page.getPage()
            data.size = page.getSize()

            this.request<ResponsePage<T>>(page.getMethod(), page.getUrl(), data, page.getConfig())
                .then(cb => {
                    var content = page.getContent().concat(cb.content)

                    page.__onChange(content)

                    page.setContent(content)

                    if (cb.last) {
                        page.__onLoaded()
                    }

                    // 返回 Page 实体
                    resolve(cb)
                })
                .catch(reject)
        })
    }

    /**
     * request 请求
     * @param method 请求类型
     * @param url 请求链接
     * @param data 请求参数
     * @param config 配置
     */
    private static request<T extends Object>(method: RequestType, url: string, data?: obj | FormData | string, config: RequestConfig = {}): Promise<T> {
        return new Promise((resolve, reject) => {
            // 请求队列
            Queue.line("Request", next => {
                this.send<T>(method, url, data, config).then(resolve).catch(reject)
                Utils.wait(() => {
                    next()
                }, 100)
            })
        })
    }

    /**
     * 发送请求
     * @param method 请求类型
     * @param url 请求链接
     * @param data 请求参数
     * @param config 配置
     */
    private static send<T extends Object>(method: RequestType, url: string, data: obj | FormData | string, config: RequestConfig): Promise<T> {
        return new Promise((resolve, reject) => {
            // 显示加载框
            !config.hideLoading && Loading.show()

            const request = new XMLHttpRequest()

            var formData: FormData | string

            // 处理 url 参数
            url = this.processUrl(url)

            if (data) {
                if ("string" === typeof data) {
                    formData = data
                } else if (config.json) {
                    formData = JSON.stringify(data)
                } else if (method === "POST") {
                    formData = Utils.jsonToFormData(data)
                } else {
                    url = Utils.jsonToParams(data, url)
                }
            }

            request.open(method, url, true)

            if (config.json) {
                // Set json request header
                request.setRequestHeader("Content-Type", "application/json")
            }

            if (config.responseType) {
                request.responseType = config.responseType
            }

            // Set language sign
            request.setRequestHeader("Language-Sign", Cache.get("language_sign"))
            request.setRequestHeader("Authorization-Token", Cache.get("admin_token", ""))
            request.setRequestHeader("Authorization-Id", Cache.get("admin_id", ""))

            const onerror = (request.onerror = () => {
                // 403 权限异常
                if (request.status === 403) {
                    return this.authority(method, url, data, config, resolve, reject)
                }

                let cb: boolean | void = config.onFail ? config.onFail(request) : null

                if (cb !== false && !config.hideMessage) Message.error(config.message || "Request error, go to console for details")

                console.error(request)

                reject()
            })

            request.onload = () => {
                // 403 权限异常
                if (request.status === 403) {
                    return this.authority(method, url, data, config, resolve, reject)
                }

                if (request.status !== 200) {
                    return onerror()
                }

                let response = request.response

                if (!this.isJson(response)) {
                    return resolve(response)
                }

                const res = JSON.parse(response)

                if (res.status === 200) resolve(res.data)
                else {
                    let cb: boolean | void = config.onFail ? config.onFail(res) : null

                    if (cb !== false && !config.hideMessage) {
                        Message[res.status === 203 ? 'info' : 'error'](config.message || res.message)
                    }

                    reject()
                }
            }

            request.onprogress = config.onProgress

            request.onloadend = () => {
                config.onComplete && config.onComplete()

                Loading.hide()
            }

            request.send(formData)
        })
    }

    /**
     * 访问权限异常
     */
    private static authority(method: RequestType, url: string, data: obj | FormData | string, config: RequestConfig, resolve, reject) {
        Queue.single("RequesttTimeOut", next => {
            Message.error("登录超时，是否重新登录？", true)
                .onConfirm(() => {
                    Login.do(() => {
                        this.request(method, url, data, config).then(resolve).catch(reject)
                    })
                })
                .onComplete(() => {
                    next()
                })
                .build()
        })
    }

    private static isJson(value: string): boolean {
        return /^{.*}$/.test(value)
    }

    private static processUrl(url: string): string {
        if (~/^\S+:\/\/.*/.test(url)) {
            url.replace(/^(\S+):\/\/(\/*)?(.*)/, "")

            let path = Path[RegExp.$1]

            if (path) {
                url = path + RegExp.$3
            }
        }

        return url
    }

    public static isConnection(): Promise<boolean> {
        return new Promise(resolve => {
            this.get(Path.DOMAIN, null, {
                onFail() {
                    resolve(false)
                },
            }).then(() => {
                resolve(true)
            })
        })
    }

    public static download(name: string, method: RequestType, url: string, data?: obj | FormData | string, config: RequestConfig = {}): void {
        this.request<Blob>(method, url, data, { ...config, responseType: "blob" }).then(res => {
            Utils.shortElement("a", e => {
                var reader = new FileReader()
                reader.readAsDataURL(res)
                reader.onload = function (evt: obj) {
                    // 转换完成，创建一个a标签用于下载
                    e.href = evt.target.result
                    e.download = name
                    e.click()
                }
            })
        })
    }
}

export class RequestPage<T> {
    // 页码
    private page: number = 0

    private loaded: boolean = false

    private url: string

    private data: obj

    private config: RequestPageArgs<T>

    private content: T[] = []

    private _onChange: (data: T[]) => any

    private _onLoaded: () => any

    private method: RequestType = "GET"

    constructor(url: string, config: RequestPageArgs<T> = {}) {
        this.url = url
        this.data = config.data || {}
        this.method = config.method || "GET"
        this.config = config

        this._onChange = config.onChange
        this._onLoaded = config.onLoaded

        if (config.load !== false) {
            this.load()
        }
    }

    public getPage(): number {
        // 自增
        return this.page++
    }

    public getSize(): number {
        return this.config.size || 10
    }

    public __onLoaded(): void {
        // 已加载完毕
        this.loaded = true
        // 回调
        this._onLoaded && this._onLoaded()
    }

    public __onChange(data: T[]): void {
        this._onChange && this._onChange(data)
    }

    public isLoaded() {
        return this.loaded
    }

    public load(): Promise<ResponsePage<T>> {
        return Request.page(this)
    }

    public getContent(): T[] {
        return this.content
    }

    public setContent(content: T[]): void {
        this.content = content
    }

    public getData() {
        return this.data
    }

    public getUrl() {
        return this.url
    }

    public getConfig() {
        return this.config
    }

    public setData(data: obj, load: boolean = true) {
        this.data = data

        // 更改 data 后重置
        this.reset(load)
    }

    public setUrl(url: string, load: boolean = true) {
        this.url = url

        // 更改 url 后重置
        this.reset(load)
    }

    /**
     * 重置
     * @param load 重置后是否立即加载，默认 true
     */
    public reset(load: boolean = true) {
        // 重置基础属性
        this.page = 0
        this.loaded = false
        this.content = []

        // 重置后是否立即重新加载
        load && this.load()
    }

    public getMethod() {
        return this.method
    }
}

interface RequestConfig {
    message?: string
    header?: obj
    hideMessage?: boolean
    hideLoading?: boolean
    json?: boolean
    responseType?: XMLHttpRequestResponseType
    onComplete?: () => void
    onFail?: (err: any) => void | boolean
    onProgress?: ((this: XMLHttpRequest, ev: ProgressEvent<EventTarget>) => any) | null | any
}

interface RequestPageArgs<T> extends RequestConfig {
    load?: boolean
    data?: obj
    size?: number
    method?: RequestType
    onChange?: (data: T[]) => any
    onLoaded?: () => any
}
