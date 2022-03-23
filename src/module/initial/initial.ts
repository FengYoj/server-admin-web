export default class Initial {

    private _initial: boolean = false

    private _callback: () => void

    constructor(callback: () => void) {
        this._callback = callback
    }

    public call() {
        if (!this._initial) {
            this._callback()
            this._initial = true
        }
    }

    public static of(callback: () => void): Initial {
        return new Initial(callback)
    }
}