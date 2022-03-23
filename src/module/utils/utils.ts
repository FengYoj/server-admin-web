import Status from "../status/status"

function staticImplements<T>() {
    return <U extends T>(constructor: U) => {constructor};
}

@staticImplements<UtilsInterface>()
export default class Utils {

    public static versionToNumber(version: string): number {
        var c = version.split('.')
        var num_place = ["","0","00","000","0000"],
            r = num_place.reverse()
            
        for (var i = 0; i < c.length; i++){ 
            var len = c[i].length
                    c[i]=r[len]+c[i]
        }
        
        return parseInt(c.join(''))
    }

    public static paddingZero(num: number): string {
        return (num >= 10 ? "" : "0") + num;
    }

    public static wait(cb: () => void, ms?: number): void {
        setTimeout(() => cb(), ms)
    }

    /**
     * 拷贝文本到剪切板
     * @param text 文本
     */
    public static copyText(text: string): void {
        var e = document.createElement('input')

        // 添加组件到文档流
        document.body.appendChild(e)

        e.value = text
        e.style.position = "absolute"
        e.style.opacity = "0"

        // 选中
        e.select()

        // 执行拷贝命令
        document.execCommand("copy")
        
        // 移除组件
        document.body.removeChild(e)
    }

    /**
     * json 转换 formdata
     * @param json json
     */
    public static jsonToFormData(json: obj | FormData): FormData {
        if (json instanceof FormData) {
            return json
        }

        const formData = new FormData

        this.each(Object.keys(json), v => {
            formData.append(v, json[v])
        })

        return formData
    }

    public static getUuid(): string {
        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }

    public static getStringId(len: number = 8): string {
        var result = ""
        for (let i = 0; i < len; i++) {
            let ranNum = Math.ceil(Math.random() * 25)
            result += String.fromCharCode(65 + ranNum)
        }
        return result
    }

    public static getNode<T>(evt: any): T {
        return evt.srcElement || evt.target
    }

    /**
     * 获取 HTML Element
     * @param s 选择器
     */
    public static getElement<T extends Element>(s: string, cb?: (e: T) => void, e?: Element): T | null {
        var doc: Document | Element

        if (e && e instanceof Element) {
            doc = e
        } else {
            doc = document
        }

        const dom = doc.querySelector<T>(s)

        cb && dom && cb(dom)

        return dom
    }

    /**
     * 获取 HTML Element 数组
     * @param s 选择器
     */
    public static getElements<T extends Element>(s: string[], cb?: (...e: T[]) => void, e?: Element): T[] | null {
        var doc: Document | Element

        if (e && e instanceof Element) {
            doc = e
        } else {
            doc = document
        }

        const r: T[] = []

        // 循环获取组件
        Utils.each(s, v => {
            let _e = doc.querySelector<T>(v)
            _e && r.push(_e)
        })

        cb && r.length === s.length && cb.apply(cb, r)

        return r
    }

    /**
     * 获取所有 HTML Element
     * @param selectors 选择器
     */
    public static getElementAll<T extends Element>(selectors: string, cb?: (e: T) => void, e?: Element): NodeListOf<T> {
        var doms: NodeListOf<T>

        if (e && e instanceof Element) {
            doms = e.querySelectorAll<T>(selectors)
        } else {
            doms = document.querySelectorAll<T>(selectors)
        }

        cb && doms && Utils.eachNode(doms, cb)

        return doms
    }

    /**
     * 获取事件中的目标组件
     * @param evt 事件
     */
    public static getTarget<T extends HTMLElement>(evt: Event): T {
        const element: any = evt.target || evt.srcElement
        return element
    }

    /**
     * 设置表单组件数据
     * @param form 表单
     * @param data 数据
     */
    public static setFormData(form: HTMLFormElement | string, data: { [key: string]: any }): HTMLFormElement {
        var fe: HTMLFormElement

        if ("string" === typeof form) {
            fe = <HTMLFormElement>Utils.getElement(form)
        } else {
            fe = form
        }

        const es: any = fe.elements

        for (let i = 0; i < es.length; i++) {
            const e: HTMLInputElement = es[i]

            const n: string = e.name

            if (n === "") {
                continue
            }

            switch (e.type) {
                case "checkbox":
                    data[n] && e.setAttribute("checked", "")
                    break
                case "select-one":
                    var o = e.querySelector("option[value=\"" + data[n] + "\"]")
                    o && o.setAttribute("selected", "")
                    break
                default:
                    e.value = data[n]
            }
        }

        return fe
    }

    /**
     * 获取表单组件数据
     * @param form 表单
     */
    public static getFormData(form: HTMLFormElement | string): Promise<Status<{[key: string]: any}>> {
        return new Promise(resolve => {
            var fe: any

            if ("string" === typeof form) {
                fe = Utils.getElement(form)
            } else {
                fe = form
            }

            const es: any = fe.querySelectorAll("[name]")

            const data = {}

            const getData = async(resolve: (res: Status<{[key: string]: any}>) => void) => {
                for (let i = 0; i < es.length; i++) {
                    const e: any = es[i]
    
                    if (!e.name) {
                        continue
                    }
    
                    var val: any
    
                    // 判断是否存在自定 getValue 方法
                    if (e.getValue) {
                        var cb_value = e.getValue()
    
                        // 判断是否为 Promise 方法
                        if (cb_value instanceof Promise) {
                            cb_value = await cb_value
                        }

                        if (cb_value instanceof Status) {
                            if (cb_value.isBlank()) {
                                return resolve(cb_value)
                            }

                            val = cb_value.getData()
                        } else {
                            val = cb_value
                        }
                    } else {
                        val = e.value
                    }
    
                    if (val && e.type === "number") {
                        val = Number(val)
                    }
    
                    // 是否为必选项
                    if (e.hasAttribute("required") && e.getAttribute("required") !== "false" && this.isBlank(val)) {
                        let str = e.getAttribute("message")
                        let msg = this.isExist(str) ? str : ((e.title || e.name) + " 不能为空")
                        return resolve(new Status(400).setMessage(msg).setData(e))
                    }
    
                    if (e.hasAttribute("verify") && val) {
                        let verify: any = e.getAttribute("verify")
    
                        // 判断是否为正则表达式
                        if (/^\/+[\\/g]$/.test(verify) ? new RegExp(verify).test(val) : this.verify(verify, val)) {
                            return resolve(new Status(400).setMessage(e.getAttribute("verify-message") || ((e.title || e.name) + " 格式不正确")))
                        }
                    }
    
                    switch(e.type) {
                        case "checkbox":
                            data[e.name] = e.checked
                            break
                        default:
                            this.setStringObject(data, e.name, val)
                    }
                }

                resolve(new Status(200).setData(data))
            }

            getData(resolve)
        })
    }

    public static verify(type: string, value: any): boolean {
        var verify: RegExp | null = null

        switch(type) {
            case "english": 
                verify = /^[^\u4e00-\u9fa5]+$/g
                break
            case "phone":
                verify = /^1\d{10}$/
                break
            case "email":
                verify = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/
                break
            case "id_number":
                verify = /^[1-9]\d{5}(18|19|20|(3\d))\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
                break
            case "password":
                verify = /^(?![^a-zA-Z]+$)(?!\D+$).{8,15}$/
        }

        if (verify) {
            return new RegExp(verify).test(value)
        }

        return true
    }

    /**
     * 写入对象值
     * @param o 对象
     * @param str 字符串 key
     * @param val 值
     */
    public static setStringObject(o: Object, str: string, val: any): void {
        if (str.indexOf(".") <= -1) {
            o[str] = val
        } else {

            var strs = str.split(".")

            for (let i = 0, l = strs.length; i < l; i++) {

                var s = strs[i]

                if (i === l - 1) {
                    if (/.*\[\d+\]$/.test(strs[i - 1])) {
                        let idx = strs[i - 1].replace(/.*\[(\d+)\]$/, "$1")

                        o[idx] ? o[idx][s] = val : o[idx] = {
                            [s]: val
                        }
                    } else {
                        o[s] = val
                    }
                } else {
                    if (/.*\[\d+\]$/.test(s)) {

                        s = s.replace(/\[\d+\]$/, "")

                        if (!o[s]) {
                            o[s] = []
                        }
    
                        o = o[s]
    
                    } else {
    
                        if (!o[s]) {
                            o[s] = {}
                        }
        
                        o = o[s]
    
                    }
                }
            }
        }
    }

    public static getStringObject(o: Object, str: string) {
        if (str.indexOf(".") <= -1) {
            if (/.*\[\d+\]$/.test(str)) {
                str.replace(/(.*)\[(\d+)\]$/, "$1")
                return o[RegExp.$1][RegExp.$2]
            } else {
                return o[str]
            }
        } else {
            var strs = str.split(".")

            for (let i = 0, l = strs.length; i < l; i++) {

                var s = strs[i]

                if (i === l - 1) {
                    if (/.*\[\d+\]$/.test(strs[i - 1])) {
                        let idx = strs[i - 1].replace(/.*\[(\d+)\]$/, "$1")

                        return o[idx]
                    } else {
                        return o[s]
                    }
                } else {
                    if (/.*\[\d+\]$/.test(s)) {

                        s = s.replace(/\[\d+\]$/, "")

                        if (!o[s]) {
                            return null
                        }
    
                        o = o[s]
    
                    } else {
    
                        if (!o[s]) {
                            return null
                        }
        
                        o = o[s]
    
                    }
                }
            }
        }
    }

    /**
     * 判断值是否为 JSON
     */
    public static isJson(value: any): boolean {
        if (typeof value === "object") {
            return true
        }

        if (typeof value === "string") {
            return /^(\[|{).*(\]|})$/.test(value)
        }

        return false
    }

    /**
     * 临时组件
     * @param n 组件名称
     * @param cb 回调函数
     */
    public static shortElement<K extends keyof HTMLElementTagNameMap>(n: K, cb: (e: HTMLElementTagNameMap[K]) => void): void {
        const e = document.createElement(n)
        // 临时组件应当隐藏
        e.style.display = 'none'
        // 添加至 body
        this.appendChild(e)
        // 处理事务
        cb && cb(e)
        // 删除组件
        this.removeChild(e)
    }

    /**
     * 仿 forEach 循环
     * @param a 数组
     * @param cb 回调函数
     * @param condition 条件
     */
    public static each<T>(a: T[], cb: (v: T, i: number, e: boolean) => void | "break" | "delete" | "move-after" | "move-before" | T | null | undefined, condition?: (v: T) => boolean): T[] {

        for (let i = 0, len = a.length; i < len; i++) {

            if (condition ? !condition(a[i]) : false) {
                continue
            }

            let _cb = cb(a[i], i, i === len - 1)

            if (_cb === "delete") {
                a.splice(i, 1)
                i-- // 下标自减
                len-- // 总长度自减
            } else if (_cb === "break") {
                break
            } else if (_cb === "move-after") {
                i < (len - 1) && (a[i] = a.splice(i + 1, 1, a[i])[0])
                break
            } else if (_cb === "move-before") {
                i > 0 && (a[i] = a.splice(i - 1, 1, a[i])[0])
                break
            } else if (_cb) {
                a[i] = _cb
            }
        }

        return a
    }

    /**
     * 对象 遍历
     * @param obj 对象
     * @param cb 回调函数
     * @param condition 条件
     */
    public static eachObj<T>(obj: Obj<T>, cb: (k: string, v: T, i: number, e: boolean) => void | "break" | "delete" | T, condition?: (v: T) => boolean): Obj<T> {

        for (let i = 0, keys = Object.keys(obj), len = keys.length; i < len; i++) {

            let key: string = keys[i]

            if (condition ? !condition(obj[key]) : false) {
                continue
            }

            let _cb = cb(key, obj[key], i, i === len - 1)

            if (_cb === "delete") {
                delete obj[key]
                i--
            } else if (_cb === "break") {
                break
            } else if (_cb) {
                obj[key] = _cb
            }
        }

        return obj
    }

    public static eachNode<T extends Element>(a: NodeListOf<T>, cb: (v: T, i: number, e: boolean) => void | "break"): NodeListOf<T> {
        for (let i = 0, l = a.length; i < l; i++) {

            let _cb = cb(a[i], i, i === l - 1)

            if (_cb === "break") {
                break
            }
        }

        return a
    }

    /**
     * 查找数组指定元素
     * @param d 数组
     * @param cb 回调函数
     */
    public static find<T>(d: T[], condition: (d: T) => boolean, cb?: (p: { i: number, data: T }) => void): { i: number, data: T | null } {
        for (let i = 0, l = d.length; i < l; i++) {
            const _cb = condition(d[i])

            if (_cb) {
                const res = { i, data: d[i] }

                // 回调处理事件
                cb && cb(res)

                // 返回结果
                return res
            }
        }

        return { i: -1, data: null }
    }

    /**
     * 查找数组所有指定元素
     * @param d 数组
     * @param cb 回调函数
     */
    public static findAll<T>(d: T[], cb: (d: T) => boolean): T[] {
        const res: T[] = []

        for (let i = 0, l = d.length; i < l; i++) {
            const _cb = cb(d[i])

            if (_cb) {
                res.push(d[i])
            }
        }

        return res
    }

    /**
     * 检验是否为空
     */
    public static verifyIsEmpty(d: { [key: string]: any }, j: { [key: string]: string }): string | null {
        var msg: string | null = null

        this.each(Object.keys(j), v => {
            var item = d[v]

            if (!item) {
                msg = j[v]

                return "break"
            } else if (item instanceof Array && item.length <= 0) {
                msg = j[v]

                return "break"
            } else if (item instanceof Object && Object.keys(item).length <= 0) {
                msg = j[v]

                return "break"
            }
        })

        return msg
    }

    private static untie(fun: string): { name: string, param: string[] | null } {
        fun.match(/^(\w+)\((.*)\)$/)
        const name = RegExp.$1
            , param = RegExp.$2

        return { name: name, param: param ? param.split(",") : null }
    }

    public static getFunByStr(obj: any, str: string): { fun: (...param: any[]) => void | any, params: string[] | null } {
        var fun: ((...param: any[]) => void) | any = null
            , params: string[] | null = null

        this.each(str.split('.'), (v, i, e) => {
            if (e) {
                let { name, param } = this.untie(v)
                fun = fun ? fun[name] : obj[name]
                params = param
            } else if (!fun && obj[v]) {
                fun = obj[v]
            } else if (fun && fun[v]) {
                fun = fun[v]
            } else {
                return 'break'
            }
        })

        return { fun, params }
    }

    public static appendChild(element: HTMLElement | HTMLStyleElement | HTMLScriptElement, place: 'body' | 'head' = 'body'): void {
        if (document[place]) {
            document[place].appendChild(element)
        } else {
            document.getElementsByTagName(place)[0].appendChild(element)
        }
    }

    public static removeChild(el: string | HTMLElement): void {
        // 检索组件
        const e: any = "string" === typeof el ? Utils.getElement<HTMLElement>(el) : el
        // 存在则移除
        e && document.body.removeChild(e)
    }

    public static removeChildAll(el: string | NodeListOf<Element>): void {
        // 检索全部组件
        const e = "string" === typeof el ? Utils.getElementAll<HTMLElement>(el) : el
        // 存在则循环移除
        if (e) {
            for (var i = 0; i < e.length; i++) {
                document.body.removeChild(e[i])
            }
        }
    }

    /**
     * 拷贝对象
     * @param obj 对象
     */
    public static copy<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj))
    }

    /**
     * 对象转 URL 参数
     * @param obj 对象
     * @param url 请求链接（可选，用于判断链接是否带参数）
     */
    public static jsonToParams(json: obj, url?: string): string {
        var s: string = ""
        var p: boolean = url ? /\?/.test(url) : false

        this.each(Object.keys(json), (n, i) => {
            let v: string | number = json[n]

            if ("undefined" !== typeof v) {
                s += `${s.length === 0 && !p ? '?' : '&'}${n}=${v}`
            }
        })

        return url ? url + s : s
    }

    public static paramsToJson(url: string): { [keyName: string]: string } {
        // 没有参数，返回空对象
        if (!/\?/.test(url)) {
            return {}
        }

        var parames: obj = {}
        
        url = decodeURI(url)

        var vars = url.substr(url.indexOf("?") + 1).split("&")

        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=")
            parames[pair[0]] = pair[1]
        }

        return parames;
    }

    /**
     * 延时
     * @param ms 毫秒
     */
    public static delay(ms: number): Promise<void> {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        })
    }

    /**
     * 设置属性
     * @param e 组件
     * @param attribute 属性
     */
    public static setAttribute(e: Element, attribute: { [n: string]: string }) {
        const keys = Object.keys(attribute)
        for (let i = 0; i < keys.length; i++) {
            let item = keys[i]
            e.setAttribute(item, attribute[item])
        }
    }

    /**
     * 创建组件
     * @param tagName 标签名称
     * @param attribute 属性
     */
    public static createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, a: { id?: string, class?: string | string[], attribute?: { [key: string]: string }, style?: CSSStyleDeclaration | { [key: string]: string }, event?: GlobalEventHandlers | { [key: string]: any } , [key: string]: any }): HTMLElementTagNameMap[K] {
        const e = document.createElement(tagName)

        for (let i = 0, keys = Object.keys(a); i < keys.length; i++) {
            let key = keys[i]

            switch (key) {
                case "id":
                    a.id && (e.id = a.id)
                    break
                case "class":
                    typeof a.class === 'string' ?
                        e.classList.add(a.class) :
                        a.class && Utils.each(a.class, v => {
                            e.classList.add(v)
                        })
                    break
                case "attribute":
                    a.attribute && this.setAttribute(e, a.attribute)
                    break
                case "style":
                    Object.assign(e.style, a.style)
                    break
                case "event":
                    Object.assign(e, a.event)
                    break
                default:
                    e[key] = a[key]
            }   
        }

        return e
    }

    public static isPlainObject(obj: obj) {
        var proto, Ctor;

        // Detect obvious negatives
        // Use toString instead of jQuery.type to catch host objects
        if (!obj || Object.toString.call(obj) !== "[object Object]") {
            return false;
        }

        proto = Object.getPrototypeOf(obj);

        // Objects with no prototype (e.g., `Object.create( null )`) are plain
        if (!proto) {
            return true;
        }

        const hasOwnProperty = Object.hasOwnProperty
        const toString = hasOwnProperty.toString

        // Objects with prototype are plain iff they were constructed by a global Object function
        Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
        return typeof Ctor === "function" && toString.call(Ctor) === toString.call(Object);
    }

    public static isFunction(obj: any): boolean {
        return typeof obj === "function" && typeof obj.nodeType !== "number";
    }

    public static extend(target: obj, ...targets: Object[]) {
        var options, name, src, copy, copyIsArray, clone,
            i = 1,
            length = arguments.length,
            deep = false;

        // Handle a deep copy situation
        if (typeof target === "boolean") {
            deep = target;

            // Skip the boolean and the target
            target = arguments[i] || {};
            i++;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if (typeof target !== "object" && !this.isFunction(target)) {
            target = {};
        }

        // Extend jQuery itself if only one argument is passed
        if (i === length) {
            target = this;
            i--;
        }

        for (; i < length; i++) {

            // Only deal with non-null/undefined values
            if ((options = arguments[i]) != null) {

                // Extend the base object
                for (name in options) {
                    copy = options[name];

                    // Prevent Object.prototype pollution
                    // Prevent never-ending loop
                    if (name === "__proto__" || target === copy) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if (deep && copy && (this.isPlainObject(copy) ||
                        (copyIsArray = Array.isArray(copy)))) {
                        src = target[name];

                        // Ensure proper type for the source value
                        if (copyIsArray && !Array.isArray(src)) {
                            clone = [];
                        } else if (!copyIsArray && !this.isPlainObject(src)) {
                            clone = {};
                        } else {
                            clone = src;
                        }
                        copyIsArray = false;

                        // Never move original objects, clone them
                        target[name] = this.extend(deep, clone, copy);

                        // Don't bring in undefined values
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;
    }

    public static extendPrototype<T>(target: any): T {
        const p = Object.getPrototypeOf(target)

        this.each(Object.getOwnPropertyNames(p), k => {
            if ("constructor" !== k) {
                target[k] = p[k]
            }
        })

        return target
    }

    public static HTMLEncode(html: string) {
        return this.createEscaper(this.escapeMap)(html)
    }

    public static HTMLDecode(text: string) {
        return this.createEscaper(this.invert(this.escapeMap))(text)
    }

    public static invert(obj: any): any {
        var result: obj = {}
        var keys = Object.keys(obj)
        for (var i = 0, length = keys.length; i < length; i++) {
            result[obj[keys[i]]] = keys[i]
        }
        return result
    }

    private static escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '`': '&#x60;'
    }

    private static createEscaper(map: obj) {
        // Functions for escaping and unescaping strings to/from HTML interpolation.
        var escaper = function (match: string) {
            return map[match]
        }
        // Regexes for identifying a key that needs to be escaped.
        var source = '(?:' + Object.keys(map).join('|') + ')'
        var testRegexp = RegExp(source)
        var replaceRegexp = RegExp(source, 'g')

        return function (string: string) {
            string = string == null ? '' : '' + string
            return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string
        }
    }

    /**
     * 判断当前环境是否为移动端
     */
    public static isMobile(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }

    /**
     * 判断是否为空
     * @param target 目标值
     */
    public static isBlank(target: any): boolean {
        if ("undefined" === typeof target || target === null) {
            return true
        }

        if ("number" === typeof target || "boolean" === typeof target) {
            return false
        }

        return !target
    }

    /**
     * 判断是否存在
     * @param target 目标值
     */
    public static isExist(target: any): boolean {
        return !this.isBlank(target)
    }

    public static search(obj: any, name: string): string | null {
        if ("object" !== typeof obj) {
            return "obj must be an object"
        }

        function s_j(json: any): string | null {
            for (let n in json) {
                if (n === name) {
                    return n
                }

                const v = json[n]

                if (v instanceof Array) {
                    return s_a(v)
                } else if (v instanceof Object) {
                    return s_j(v)
                }
            }

            return null
        }

        function s_a(arr: any[]): string | null {
            for (let i = 0; i < arr.length; i++) {
                const v = arr[i]

                if (v instanceof Array) {
                    return s_a(v)
                } else if (v instanceof Object) {
                    return s_j(v)
                }
            }

            return null
        }

        if (obj instanceof Array) {
            return s_a(obj)
        } else {
            return s_j(obj)
        }
    }
}

// 加载文件类
class LoadFile {
    /**
     * 判断文件是否存在
     * @param url 路径
     */
    private static isExist(url: string): boolean {

        // 不支持检测将跳过检测
        if (!XMLHttpRequest) {
            console.log("当前浏览器不支持XMLHttpRequest")
            return true
        }

        var xmlhttp = new XMLHttpRequest()

        xmlhttp.open("GET", url, false)

        try {
            xmlhttp.send()

            return (xmlhttp.readyState == 4) && (xmlhttp.status == 0)
        } catch (e) {
            return false
        }
    }

    public static getResponseTextBySync(url: string): Status<string> {
        var xmlhttp = new XMLHttpRequest()

        xmlhttp.open("GET", url, false)

        try {
            xmlhttp.send()

            return new Status<string>(xmlhttp.status).setMessage(xmlhttp.statusText).setData(xmlhttp.responseText);
        } catch (e) {
            return Status.of(500)
        }
    }

    public static getResponseText(url: string): Promise<Status<string>> {
        return new Promise(resolve => {
            const xmlhttp = new XMLHttpRequest()

            xmlhttp.open("GET", url, true)

            try {
                xmlhttp.send()

                xmlhttp.onreadystatechange = () => {
                    if (xmlhttp.readyState === 4) {
                        resolve(new Status<string>(xmlhttp.status).setMessage(xmlhttp.statusText).setData(xmlhttp.responseText))
                    }
                }
            } catch (e) {
                resolve(new Status(500))
            }
        })
    }

    /**
     * 加载 script 文件
     * @param src 路径
     * @param cb 加载完成回调函数
     */
    // public static script(src: string | string[]): Promise<void> {
    //     return new Promise(async (resolve) => {
    //         Utils.removeChildAll("script[page-js]")

    //         const load = (s: string) => {
    //             return new Promise(resolve => {
    //                 var script = document.createElement("script")
    //                 script.type = "text/javascript"
    //                 script.src = s
    //                 script.setAttribute("page-js", s)

    //                 script.onload = script.onerror = resolve

    //                 Utils.appendChild(script)
    //             })
    //         }

    //         for (let i = 0, a = typeof src === 'string' ? [src] : src; i < a.length; i++) {
    //             await load(a[i])
    //         }

    //         resolve()
    //     })
    // }

    /**
     * 加载 script 文本文件
     * @param text 文本
     */
    // public static scriptText(text: string | string[]): Promise<void> {
    //     return new Promise(async resolve => {
    //         const load = (t: string) => {
    //             return new Promise(resolve => {
    //                 var script = document.createElement('script')
    //                 script.type = 'text/javascript'
    //                 script.innerHTML = t
    //                 script.setAttribute('page-js', 'internal')

    //                 script.onload = resolve

    //                 Utils.appendChild(script)
    //             })
    //         }

    //         for (let i = 0, a = typeof text === 'string' ? [text] : text; i < a.length; i++) {
    //             await load(a[i])
    //         }

    //         resolve()
    //     })
    // }

    /**
     * 加载 style 文件
     * @param src 路径
     * @param cb 加载完成回调函数
     */
    // public static style(src: string | string[]): Promise<void> {
    //     return new Promise(async resolve => {
    //         Utils.removeChildAll("script[page-css]")

    //         const load = (s: string) => {
    //             return new Promise(resolve => {
    //                 var link = document.createElement('link')
    //                 link.rel = 'stylesheet'
    //                 link.href = s
    //                 link.setAttribute("page-css", s)

    //                 link.onload = link.onerror = resolve

    //                 Utils.appendChild(link, 'head')
    //             })
    //         }

    //         for (let i = 0, a = typeof src === 'string' ? [src] : src; i < a.length; i++) {
    //             await load(a[i])
    //         }

    //         resolve()
    //     })
    // }

    public static html(src: string): Promise<Status<string>> {
        return this.getResponseText(src)
    }
}

interface UtilsInterface {

    /**
     * 拷贝文本到剪切板
     * @param text 文本
     */
    copyText(text: string): void

    getElement<T extends Element>(s: string, cb?: (e: T) => void, e?: Element): T | null
    getElements<T extends Element>(s: string[], cb?: (...e: T[]) => void, e?: Element): T[] | null

    /**
     * json 转换 formdata
     * @param json json
     */
    jsonToFormData(json: { [key: string]: any } | FormData): FormData

    getUuid(): string

    getStringId(len?: number): string

    getNode<T>(evt: any): T

    /**
     * 获取所有 HTML Element
     * @param selectors 选择器
     */
    getElementAll<T extends Element>(selectors: string, cb?: (e: T) => void, e?: Element): NodeListOf<T>

    /**
     * 获取事件中的目标组件
     * @param evt 事件
     */
    getTarget<T extends HTMLElement>(evt: Event): T

    /**
     * 获取表单组件数据
     * @param form 表单
     */
    getFormData(form: HTMLFormElement | string): Promise<Status<{[key: string]: any}>>

    /**
     * 写入对象值
     * @param o 对象
     * @param str 字符串 key
     * @param val 值
     */
    setStringObject(o: Object, str: string, val: any): void

    /**
     * 设置表单组件数据
     * @param form 表单
     * @param data 数据
     */
    setFormData(form: HTMLFormElement | string, data: { [key: string]: any }): HTMLFormElement

    /**
     * 临时组件
     * @param n 组件名称
     * @param cb 回调函数
     */
    shortElement(n: string, cb: (e: HTMLElement) => void): void

    /**
     * 仿 forEach 循环
     * @param a 数组
     * @param cb 回调函数
     */
    each<T>(a: T[], cb: (v: T, i: number, e: boolean) => void | "break" | "delete" | "move-after" | "move-before" | T, condition?: (v: T) => boolean): T[]

    /**
     * 对象 遍历
     * @param obj 对象
     * @param cb 回调函数
     * @param condition 条件
     */
    eachObj<T>(obj: Obj<T>, cb: (k: string, v: T, i: number, e: boolean) => void | "break" | "delete" | T, condition?: (v: T) => boolean): Obj<T>

    eachNode<T extends Element>(a: NodeListOf<T>, cb: (v: T, i: number, e: boolean) => void | "break"): NodeListOf<T>

    /**
     * 查找数组指定元素
     * @param d 数组
     * @param cb 回调函数
     */
    find<T>(d: T[], cb: (d: T) => boolean): { i: number, data: T | null }

    /**
     * 查找数组所有指定元素
     * @param d 数组
     * @param cb 回调函数
     */
    findAll<T>(d: T[], cb: (d: T) => boolean): T[]

    /**
     * 检验是否为空
     */
    verifyIsEmpty(d: { [key: string]: any }, j: { [key: string]: string }): string | null

    getFunByStr(obj: any, str: string): { fun: (...param: any[]) => void | any, params: string[] | null }

    appendChild(element: HTMLElement | HTMLStyleElement | HTMLScriptElement, place?: 'body' | 'head'): void

    removeChild(el: string | HTMLElement): void

    removeChildAll(el: string | NodeListOf<Element>): void

    /**
     * 拷贝对象
     * @param obj 对象
     */
    copy<T>(obj: T): T

    /**
     * 对象转 URL 参数
     * @param obj 对象
     */
    jsonToParams(json: { [keyName: string]: string | number } | FormData): string

    paramsToJson(url: string): { [keyName: string]: string }

    /**
     * 延时
     * @param ms 毫秒
     */
    delay(ms: number): Promise<void>

    /**
     * 设置属性
     * @param e 组件
     * @param attribute 属性
     */
    setAttribute(e: Element, attribute: { [n: string]: string }): void

    /**
     * 创建组件
     * @param tagName 标签名称
     * @param attribute 属性
     */
    createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, a: { id?: string, class?: string | string[], attribute?: { [key: string]: string }, style?: CSSStyleDeclaration | { [key: string]: string }, event?: GlobalEventHandlers | { [key: string]: any } }): HTMLElementTagNameMap[K]

    isPlainObject(obj: any): any

    isFunction(obj: any): boolean

    extend(target: Object, ...targets: Object[]): Object

    HTMLEncode(html: string): string

    HTMLDecode(text: string): string

    invert(obj: any): any

    /**
     * 判断当前环境是否为移动端
     */
    isMobile(): boolean

    search(obj: any, name: string): string | null

    /**
     * 延伸原型链
     * @param target 目标对象
     */
    extendPrototype<T extends Object>(target: T): T
}

interface RequestConfig {
    message?: string
    header?: Object
    hideMessage?: boolean
    hideLoading?: boolean
    onComplete?: () => void
    onFail?: (err: any) => void | boolean
}