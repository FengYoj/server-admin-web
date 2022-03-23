export default class Status<T extends Object> implements StatusConstructor<T> {
    private status: number = 200

    private message: string = "success"

    private data: T | null = null

    private code: number

    private info: string | undefined

    constructor(status: any) {
        if (Status.equal(status)) {
            this.data = status.data
            this.status = status.status
            this.message = status.message
            this.code = status.code
            this.info = status.info
        } else {
            this.status = status
        }
    }

    public setMessage(msg: string): StatusMethods<T> {
        this.message = msg
        return this
    }

    public setData(data: T): StatusMethods<T> {
        this.data = data
        return this
    }

    public setCode(code: number): StatusMethods<T> {
        this.code = code
        return this
    }

    public setInfo(info: string): StatusMethods<T> {
        this.info = info
        return this
    }

    public getStatus(): number {
        return this.status
    }

    public getMessage(): string {
        return this.message
    }

    public getData(): T | null {
        return this.data
    }

    public getCode(): number {
        return this.code
    }

    public getInfo(): string | undefined {
        return this.info
    }

    public isNormal(): boolean {
        return this.status === 200
    }

    public isBlank(): boolean {
        return this.status !== 200
    }

    public static of<S>(status: number | Status<S>): StatusMethods<S> {
        return new Status<S>(status)
    }

    /**
     * 判断是否为 Status 对象
     * @param status 目标变量
     */
    public static equal(target: any): boolean {
        if ("object" === typeof target &&
            Object.prototype.hasOwnProperty.call(target, 'status') &&
            Object.prototype.hasOwnProperty.call(target, 'message')) {
            return true
        }

        return false
    }
}

interface StatusMethods<T> extends Status<T> {
    setMessage(msg: string): Status<T>

    setData(data: T): Status<T>

    getStatus(): number

    getMessage(): string

    getData(): T | null

    getInfo(): string | undefined

    isNormal(): boolean

    isBlank(): boolean
}

interface StatusConstructor<T extends Object> extends obj {
    new?(status: number) : StatusMethods<T>

    new?(status: Status<T>) : StatusMethods<T>
}

declare interface StatusInf<T> {
    status: number
    message: string
    data: T | null
    code: number
    info: string | undefined
}