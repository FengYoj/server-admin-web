import Utils from "../utils/utils"
import Theme from "../theme/theme"
import Cache from "../cache/cache"
import Language from "../language/language"
import Path from "../config/path"
import StringUtils from "../utils/string_utils"
import Href from "../config/href"

const internal = {}

class ComponentsUtil {
    private static _excludeMethods: string[] = ["data", "created", "beforeMount", "mounted", "components", "beforeDestroy"]
    private static _excludeData: string[] = ["data", "name", "methods", "internal"]

    /**
     * 获取所有方法
     * @param opt
     */
    public static getMethods(opt: any) {
        const methods: obj = opt.methods || {}
        const exclude = this._excludeMethods

        Utils.each<string>(
            []
                .concat(Object.getOwnPropertyNames(opt))
                // 获取 Component 类所有方法
                .concat(Object.getOwnPropertyNames(opt.__proto__))
                // 获取  Component 类继承的所有方法
                .concat(Object.getOwnPropertyNames(opt.__proto__.__proto__)),
            k => {
                if (exclude.indexOf(k) <= -1 && "function" === typeof opt[k]) {
                    methods[k] = opt[k]
                }
            }
        )

        return methods
    }

    public static processCreated(opt: ComponentEntity) {
        let fun = opt.created

        opt.created = function () {
            // 是否存在内置数据
            internal[this.component_id] && (this.internal = internal[this.component_id])
            // 监听窗口大小变化事件
            opt.onResize && (window.onresize = opt.onResize.bind(this))
            // 监听主题变化
            Theme.onChange(theme => {
                this.theme = theme
                // 回调监听主题变化事件
                this.onChangeTheme && this.onChangeTheme(theme)
            })
            // call created
            fun && fun.call(this)
        }
    }

    public static processMounted(opt: ComponentEntity) {
        let fun = opt.mounted

        opt.mounted = function () {
            // 处理主题数据
            this.$el && Theme.processPage(this.$el)
            // 处理语言包数据
            Language.process(this)
            // call mounted
            fun && fun.call(this)
        }
    }

    public static processWatch(opt: ComponentEntity) {
        const watch: obj = opt.watch || {}

        opt.watch = watch
    }

    /**
     * 处理生命周期事件
     * @param opt 实体
     */
    public static processEvent(opt: ComponentEntity) {
        opt.onShow && (opt.activated = opt.onShow)
        opt.onHide && (opt.deactivated = opt.onHide)
    }

    public static getData(opt: ComponentEntity, ...targets: Object[]): () => Object {
        const exclude = this._excludeData
        let data = opt.data
        var _data: obj = {}

        if (targets.length > 0) {
            // 合并
            _data = Utils.extend(_data, ...targets)
        }

        Utils.each(Object.getOwnPropertyNames(opt), k => {
            if (exclude.indexOf(k) <= -1 && "function" !== typeof opt[k]) {
                _data[k] = opt[k]
            }
        })

        return function () {
            // 如果为 function 则调用获取返回值
            if ("function" === typeof data) {
                _data = Utils.extend(_data, data())
            } else {
                _data = Utils.extend(_data, data)
            }

            return Utils.copy(_data)
        }
    }

    /**
     * 处理内置的数据
     * @param opt Vue 实体
     */
    public static processInternal(opt: ComponentEntity, id: string) {
        if (opt.internal) {
            internal[id] = opt.internal
        }
    }
}

export class ComponentMethods implements ComponentMethods {
    public language_sign: string
    public $data: any
    public $set: any
    public $router: any

    public $emit: (name: string, value: any) => void

    public $refs: obj

    /**
     * 写入缓存
     * @param key 键名
     * @param value 键值
     * @param global 全局写入
     */
    public setCache(key: string | obj, value: any): void {
        if ("string" === typeof key) {
            Cache.set(key, value)
        } else {
            Cache.set(key)
        }
    }

    /**
     * 获取缓存
     * @param key 键名
     * @param global 全局获取
     */
    public getCache(key: string): any {
        return Cache.get(key)
    }

    /**
     * 获取数据
     * @param key 键名
     */
    public getData(key: string): any {
        return this.$data[key]
    }

    /**
     * 监听改变 data 事件
     * @param key 键名
     * @param val 键值
     */
    public setData(key: string | obj, val?: obj): void {
        if ("string" === typeof key) {
            this.__setData(key, val)
        } else {
            Utils.each(Object.keys(key), k => {
                this.__setData(k, key[k])
            })
        }
    }

    private __setData(key: string, val: obj) {
        const keys: string[] = key.split(".")

        var d = this.$data[keys[0]]

        if (keys.length > 1) {
            for (let i = 1; i < keys.length; i++) {
                try {
                    if (i < keys.length - 1) {
                        d = d[keys[i]]
                    }
                } catch (e) {
                    console.error(e)
                    return
                }
            }

            this.$set(d, keys[keys.length - 1], val)
        } else {
            this.$data[keys[0]] = val
        }
    }

    public jump(path: string, query?: obj) {
        let param = Utils.paramsToJson(path)

        if (query) {
            Object.assign(query, param)
        } else {
            query = param
        }

        this.$router.push({
            path: path,
            query: query,
        })
    }

    public setDomain(url: string) {
        if (/^http.*/.test(url)) {
            return url
        }

        return Path.DOMAIN + url
    }

    public onBack() {
        this.onUnload && this.onUnload()

        this.$router.go(-1)
    }

    /**
     * 语言实体获取文本
     * @param obj 实体
     */
    public getLanguageText(entity: obj): string {
        let text = entity[this.language_sign]

        if (Utils.isBlank(text) && this.language_sign !== "cn") {
            text = entity.cn
        }

        return text
    }

    public getLanguageStyle() {
        let sign = Cache.get<string>("language_sign")

        switch (sign) {
            case "wn":
                return {
                    direction: "rtl",
                }
        }
    }

    /**
     * 获取参数
     * @param key 参数名
     */
    public getParam<T>(key: string): T {
        return this.$route.query[key]
    }

    /**
     * 获取所有参数
     */
    public getParams(): obj {
        return this.$route.query
    }

    /**
     * 是否为深色模式
     */
    public isDark() {
        return Theme.getTheme() === "dark"
    }

    /** 设置标题文字 */
    public setTitle(title: string, icon?: string): void {
        this.framework.setTitle(title, icon)
    }

    public isExist(obj: any): boolean {
        return Utils.isExist(obj)
    }

    [key: string]: any
}

export default class Component {
    public static build<D extends ComponentEntity>(e: D): D {
        const id = Utils.getUuid()
        // 获取方法列表
        e.methods = ComponentsUtil.getMethods(e)
        // 处理缓存数据
        ComponentsUtil.processInternal(e, id)
        // 获取 data 属性
        e.data = ComponentsUtil.getData(e, {
            platform: Cache.get("platform") || "win32",
            theme: Theme.getTheme(),
            language_sign: Cache.get<string>("language_sign"),
            component_id: id,
        })
        // 处理 watch 属性
        ComponentsUtil.processWatch(e)
        // 处理 created 事件
        ComponentsUtil.processCreated(e)
        // 处理 mounted 事件
        ComponentsUtil.processMounted(e)
        // 处理生命周期事件
        ComponentsUtil.processEvent(e)
        // 深色模式样式
        e.dark && Theme.addDark(e.dark)
        // 返回实体
        return e
    }
}
