/*
 * @Author: Jemmy
 * @Date: 2022-01-17 09:36:12
 * @Last Modified by: Jemmy
 * @Last Modified time: 2023-08-21 09:50:06
 * @Version: 1.1.2
 */

import Utils from "../utils/utils"
import Request from "./request"

export default class RequestPage<T> {
    url: string
    data: T[]
    config: obj
    param: obj
    total: number
    // 页码
    page = 0
    // 大小
    size = 20
    // 是否加载完毕
    loaded = false
    // 内容
    content = []

    constructor(url: string, config: obj = {}) {
        this.url = this.processUrl(url)
        this.data = config.data
        this.page = config.page || 0
        this.size = config.size || 20
        this.config = config

        if (config.load !== false) {
            this.load()
        }
    }

    async request(current = false) {
        return new Promise((resolve, reject) => {
            // 是否加载完毕
            if ((this.loaded && !current) || !this.url) {
                return
            }

            const cfg = this.config

            // 触发加载前置事件
            cfg.onLoadBefore && cfg.onLoadBefore()

            var data = {}

            // 写入页面数据
            if (current) {
                data[cfg.keys?.page || "page"] = this.page
            } else {
                data[cfg.keys?.page || "page"] = this.content.length > 0 ? ++this.page : this.page
            }

            data[cfg.keys?.size || "pageSize"] = this.size

            if (cfg.processPageConfig) {
                data = cfg.processPageConfig(data) || data
            }

            // 发起请求
            Request.method<obj>(
                cfg.method || "get",
                this.url +
                    Utils.jsonToParams({
                        ...this.param,
                        ...data,
                    }),
                this.data,
                {
                    json: cfg.json,
                    onFail: cfg.onFail,
                }
            )
                .then(res => {
                    if (cfg.processData) {
                        res = cfg.processData(res) || res
                    }

                    var content: obj[]

                    // 是否为 内容分块 类型
                    if (cfg.type === "block" || current) {
                        content = res.content
                    } else {
                        // 合并所有数组
                        content = this.content.concat(res.content)
                    }

                    this.total = res.totalElements

                    // 判断是否加载完毕
                    if (res.last) {
                        this.__onLoaded()
                    }

                    // 缓存数据
                    this.content = content
                    // 触发变化事件
                    cfg.onChange && cfg.onChange.call(this, content, res)

                    // 返回 Page 实体
                    resolve(res)
                })
                .catch(reject)
                .finally(() => {
                    // 触发加载后置事件
                    cfg.onLoadAfter && cfg.onLoadAfter()
                })
        })
    }

    /** 监听加载完毕 */
    __onLoaded() {
        // 已加载完毕
        this.loaded = true
        // 回调
        this.config.onLoaded?.()
    }

    /**
     * 是否加载完毕
     */
    isLoaded() {
        return this.loaded
    }

    /**
     * 触发加载
     */
    load(current = false) {
        return this.request(current)
    }

    /**
     * 获取内容
     */
    getContent() {
        return this.content
    }

    /**
     * 获取请求数据
     */
    getData() {
        return this.data
    }

    /**
     * 获取页码
     */
    getPage() {
        return this.page
    }

    /**
     * 获取页面大小
     */
    getSize() {
        return this.size
    }

    /**
     * 获取 URL
     */
    getUrl() {
        return this.url
    }

    /**
     * 获取配置
     */
    getConfig() {
        return this.config
    }

    /**
     * 获取总记录数量
     */
    getTotal() {
        return this.total || this.content?.length || 0
    }

    /**
     * 设置请求数据
     * @param {Object} data 请求数据
     * @param {Boolean} load 是否立即加载，默认 true
     */
    setData(data, load = true) {
        this.data = data

        // 更改 data 后重置
        this.reset(load, false)
    }

    /**
     * 设置请求链接
     * @param {String} url 请求链接
     * @param {Boolean} load 是否立即加载，默认 true
     */
    setUrl(url, load = true) {
        this.url = this.processUrl(url)
        // 更改 url 后重置
        this.reset(load)
    }

    /**
     * 设置索引值
     * @param {number} page 页码
     * @param {number} size 大小
     * @param {boolean} load 是否立即加载
     */
    setIndex(page, size, load = true) {
        this.page = page
        this.size = size || this.size
        // 重置基础属性
        this.loaded = false
        this.content = []
        // 重置后是否立即重新加载
        load && this.load()
    }

    /**
     * 重置
     * @param load 重置后是否立即加载，默认 true
     */
    reset(load = true, initData = true) {
        // 重置基础属性
        this.page = 0
        this.loaded = false
        initData && (this.data = this.config.data || {})
        this.content = []

        // 重置后是否立即重新加载
        load && this.load()
    }

    /**
     * 刷新，不改变页码和页数
     */
    refresh() {
        return this.load(true)
    }

    /**
     * 处理 URL
     */
    processUrl(url) {
        if (Utils.isBlank(url)) {
            return ""
        }

        // 存储 url 的参数
        this.param = Utils.paramsToJson(url)

        // 截取 url 的参数
        return ~url.indexOf("?") ? url.substring(0, url.indexOf("?")) : url
    }
}
