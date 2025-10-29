import Utils from "../utils/utils"

const Cache: Cache = class {
    private static __default = {
        answer_setting: {
            font_size: 1,
            auto_next: true,
            auto_audio: true,
        },
        setting: {
            theme: "auto",
            close: "minimize",
            checkUpdates: true,
        },
        language_sign: "cn",
    }

    // 全局缓存
    private static __data: Obj<CacheData> = (function () {
        const cache = localStorage.getItem("cache")
        const session = sessionStorage.getItem("cache")
        let data: obj = cache ? JSON.parse(cache) : {}

        // 判断 sessionStorage 是否有值
        if (session) {
            Utils.extend(data, JSON.parse(session))
        }

        return data
    })()

    // 监听事件存储
    private static __on: Obj<((d: any) => void)[]> = {}

    private static _set(key: string, value: any, config: CacheSetConfig = {}): void {
        var obj: CacheData = {
            value: value,
            storage: config.storage,
            expires: config.expires,
            date: config.expires ? new Date() : null,
        }

        this.__data[key] = obj

        // 触发改变事件
        this._onChange(key, value)
    }

    public static set(key: string | obj, value: any | CacheSetConfig, config?: CacheSetConfig): void {
        if ("string" === typeof key) {
            this._set(key, value, config)
        } else {
            Utils.eachObj(key, (k, v) => {
                this._set(k, v, value)
            })
        }
    }

    public static get<T extends Object>(key: string, defaults?: T): T {
        var value = this.__data[key]

        // 判断数据是否存在有效期参数，如有则判断是否过期
        if (value && value.expires && value.date && new Date(value.date).getTime() + value.expires < Date.now()) {
            value = null
        }

        // 当 value 为 null 时返回默认值（如有）
        return Utils.isExist(value) ? value.value : defaults || this.__default[key]
    }

    /**
     * 是否存在对应 Key 的数据
     * @param key key
     */
    public static containsKey(key: string): boolean {
        return !!this.__data[key]
    }

    public static onGet<T>(key: string, cb: (res: T) => void): void {
        const d = this.get<T>(key)

        if (d) {
            cb(d)
        }

        this.on(key, cb)
    }

    public static on<T>(key: string, cb: (res: T) => void): void {
        var o = this.__on[key]

        if (o) {
            o.push(cb)
        } else {
            this.__on[key] = [cb]
        }
    }

    private static _onChange(key: string, value: any): void {
        const o = this.__on[key]

        o &&
            Utils.each(o, v => {
                v && v(value)
            })
    }

    public static clear(): void {
        // 置空对象
        this.__data = {}

        // 获取所有 Cookie
        Utils.each(document.cookie.split(";"), v => {
            let strs = v.replace(/\s/g, "").split("=")
            document.cookie = strs[0] + "=0;expires=" + new Date(0).toUTCString()
        })

        // 清除本地缓存
        sessionStorage.clear()
        localStorage.clear()
    }

    /**
     * 移除指定 Key 对应的缓存
     * @param key Key
     * @param storage 缓存类型，默认为所有
     */
    public static remove(key: string, storage?: storageType): void {
        const val = this.__data[key]

        if (Utils.isBlank(val)) {
            return
        }

        if (storage === undefined) {
            delete this.__data[key]
        } else if (storage === "local") {
            this.removeLocal(key)
            if (val.storage === "local") {
                delete this.__data[key]
            }
        }
    }

    private static removeLocal(key: string): void {
        // 判断是否存在对应
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key)
        }
    }

    /**
     * 监听浏览器关闭事件
     */
    public static onUnload(): void {
        const local: Obj<CacheData> = {}
        const data = this.__data

        for (let keys = Object.keys(data), i = 0, l = keys.length; i < l; i++) {
            let k = keys[i],
                d = data[k]

            if (Utils.isBlank(d.storage)) {
                continue
            }

            if (d.expires && d.date.getTime() + d.expires < new Date().getTime()) {
                continue
            }

            if (d.storage === "local") {
                local[k] = d
            }
        }

        localStorage.setItem("cache", JSON.stringify(local))
        // 缓存到 sessionStorage，刷新时不丢失缓存
        sessionStorage.setItem("cache", JSON.stringify(this.__data))
    }
}

// 监听浏览器关闭事件
window.addEventListener("beforeunload", () => {
    Cache.onUnload.call(Cache)
})

interface Cache {
    /**
     * 写入数据（参数模式）
     * @param key 键名
     * @param val 键值
     * @param config 配置属性
     */
    set(key: string, value: any, config?: CacheSetConfig): void

    /**
     * 写入数据（对象模式）
     * @param obj 对象
     * @param config 配置属性
     */
    set(obj: obj, config?: CacheSetConfig): void

    /**
     * 获取数据
     * @param key 键值
     * @param page 对应页面
     */
    get<T extends Object>(key: string, defaults?: T): T

    /**
     * 获取数据同时监听
     * @param key 键名
     * @param cb 回调函数
     * @param page 对应页面
     */
    onGet<T extends Object>(key: string, cb: (res: T) => void): void

    /**
     * 监听数据变化
     * @param key 键名
     * @param cb 回调函数
     * @param page 对应页面
     */
    on<T extends Object>(key: string, cb: (res: T) => void): void

    /**
     * 是否存在对应 Key 的数据
     * @param key key
     */
    containsKey(key: string): boolean

    /**
     * 清除缓存
     */
    clear(): void

    /**
     * 移除指定 Key 对应的缓存
     * @param key Key
     * @param storage 缓存类型，默认为所有
     */
    remove(key: string, storage?: storageType): void

    onUnload(): void
}

type storageType = "local"

interface CacheData {
    value: any
    date?: Date
    storage?: storageType
    expires?: number
}

interface CacheSetConfig {
    storage?: storageType
    expires?: number
}

export default Cache
