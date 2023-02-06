export default class Headway {
    
    obj
    key
    config

    /**
     * 构造函数
     * @param {object} obj 对象
     * @param {string} key 键值
     * @param {number} time 检查时间间隔
     */
    constructor(obj, key, config = { time: 100, condition: (c) =>  "undefined" !== typeof c && c !== null }) {
        this.obj = obj
        this.key = key
        this.config = {
            time: config.time || 100,
            condition: config.condition || ((c) =>  "undefined" !== typeof c && c !== null)
        }
    }

    /**
     * 开始监听
     * @param {number} timeout 超时时间，默认 60 秒
     * @returns 返回 key 对应的值
     */
    on (timeout = 60000) {
        return new Promise((resolve, reject) => {
            // 当前时间
            const now = new Date()
            // 超时时间
            const out = new Date(now.getTime() + timeout)
            // 检查函数
            const _check = () => {
                let c = this.check(now, out)
                if (c === "success")
                    resolve(this.obj[this.key])
                else if (c === "timeout")
                    reject("Executive monitoring timeout")
                else
                    setTimeout(_check, this.config.time)
            }
            // 开始检查
            _check()
        })
    }

    /**
     * 检查是否符合条件
     * @param {Deta} now 当前时间
     * @param {Deta} out 超时时间
     */
    check (now, out) {
        // 是否超时
        if (now.getTime() > out.getTime()) return "timeout"
        // 获取值
        const v = this.obj[this.key]
        // 判断是否已定义
        return this.config.condition(v) ? "success" : "undefined"
    }
}