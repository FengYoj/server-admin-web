export default class Timing {

    private _fun: Function

    private _ms: number

    private _runing: boolean = true

    constructor(fun: Function, ms: number, start: boolean = true) {
        this._fun = fun
        this._ms = ms

        // 是否自动启动
        start && this.start()
    }
    
    public start(): void {
        this._runing = true

        this.run()
    }

    public stop(): void {
        this._runing = false
    }

    private async run() {
        const cb = this._fun()

        if (cb instanceof Promise) {
            await cb
        }

        setTimeout(() => {
            this._runing && this.run()
        }, this._ms)
    }
}