import Utils from '../utils/utils'
import Cache from '../cache/cache'
import Initial from '../initial/initial'
import Axios from 'axios'
import Path from '../config/path'

export default class Language {

    // 收集模式，收集所有页面语言包数据
    private static collect: boolean = false

    private static language_package: obj

    private static initial: Initial = new Initial(() => {
        Cache.on<string>("language_sign", res => {
            Language.sign = res

            // 更新语言包
            Language.getLanguagePackage()
        })
        
        return Cache.get<string>("language_sign")
    })

    private static sign: string = "cn"

    private static getLanguage(key: string): Promise<obj> {
        return new Promise((resolve, reject) => {

            if (this.language_package) {
                return resolve(this.language_package[key])
            }

            this.getLanguagePackage().then(res => {
                resolve(res[key])
            })
        })
    }

    private static getLanguagePackage(): Promise<obj> {
        this.initial.call()

        return new Promise((resolve, reject) => {
            this.language_package = {}

            Axios.get(`${Path.WEB}/Language/FindLanguageBySign?sign=${this.sign}&terminal=server_admin`).then(res => {
                if (res.status === 200 && res.data.status === 200) {
                    this.language_package = res.data || {}
                    resolve(res)
                }

                let message = res.status === 200 ? res.data.message : res.statusText

                reject(message)
            }).catch(reject)
        })
    }

    public static process(vue: obj): void {
        var name: string = vue.component_name

        if (this.collect) {
            this.getCollect(name, vue)
        }

        let language: string = Cache.get("language")

        if (language !== "cn") {
            this.setLanguage(name, vue)
        }
    }

    public static processModule(clazz: Function, key: string = "language"): void {
        if ("undefined" === typeof clazz[key]) {
            throw "Language attribute does not exist in the class";
        }

        let name = clazz.prototype.constructor.name

        if (this.collect) {
            // Ipc.send("LangugaeIpc/Save", { name: name, value: clazz[key] })
        }

        this.getLanguage(name).then(res => {
            res && (clazz[key] = res)
        })
    }

    private static async setLanguage(name: string, vue: obj): Promise<void> {
        var language: obj = await this.getLanguage(name)

        // 不存在相应语言包时，不执行赋值操作
        if (!language) {
            return
        }

        Utils.eachNode(vue.$el.querySelectorAll("[language]"), e => {
            let _language = language
            let key = e.getAttribute("language")

            Utils.each(key.split("."), (k, i, l) => {
                try {
                    if (l) {
                        _language[k] && (e.textContent = _language[k])
                    } else {
                        _language = _language[k]
                    }
                // eslint-disable-next-line no-empty
                } catch (e) {}
            })
        })

        if (vue.language) {
            Utils.eachObj(vue.language, k => {
                if (language[k]) {
                    return language[k]
                }
            })
        }
    }

    private static getCollect(name: string, vue: obj): void {
        var collect: obj = {}

        Utils.eachNode(vue.$el.querySelectorAll("[language]"), e => {
            let _collect = collect
            let key = e.getAttribute("language")

            Utils.each(key.split("."), (k, i, l) => {
                if (l) {
                    _collect[k] = e.textContent

                    // 不再向下执行
                    return "break"
                } else if(!_collect[k]) {
                    _collect[k] = {}
                }

                _collect = _collect[k]
            })
        })

        if (vue.language) {
            Utils.extend(collect, vue.language)
        }

        // Ipc.send("LangugaeIpc/Save", { name: name, value: collect })
    }
}