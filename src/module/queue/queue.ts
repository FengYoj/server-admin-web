class QueueController {
    private _list: Queue[] = []

    private _run: boolean = false

    constructor(queue: Queue) {
        this.push(queue)
    }

    public push(queue: Queue) {
        this._list.push(queue)

        if (!this._run) {
            this.next()
        }
    }

    private next() {
        if (this._list.length <= 0) {
            this._run = false
            return
        }

        this._run = true

        this._list[0].run(() => {
            this._list.splice(0, 1)
            
            // next
            this.next()
        })
    }

    public getRunStatus(): boolean {
        return this._run
    }
}

export default class Queue {
    private static queues: { [key: string]: QueueController } = {}

    private _callback: (next: () => void) => any

    private _key: string

    constructor(key: string, callback: (next: () => void) => any) {
        this._key = key
        this._callback = callback
    }

    public run(next: () => void): (next: () => void) => any {
        return this._callback(next)
    }

    /**
     * 队列任务
     * @param key key 值
     * @param callback 回调函数 
     */
    public static line(key: string, callback: (next: () => void) => any): void {
        const queues = this.queues

        const queue = new Queue(key, callback)

        if (queues[key]) {
            queues[key].push(queue)
        } else {
            queues[key] = new QueueController(queue)
        }
    }

    /**
     * 单次任务
     * @param key key 值
     * @param callback 回调函数 
     */
    public static single(key: string, callback: (next: () => void) => any): void {
        const queues = this.queues

        const queue = new Queue(key, callback)

        if (!queues[key]) {
            queues[key] = new QueueController(queue)
        } else if (!queues[key].getRunStatus()) {
            queues[key].push(queue)
        }
    }
}

export interface Operate {
    key: string
    value: boolean
}