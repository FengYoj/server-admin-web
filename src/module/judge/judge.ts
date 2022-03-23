import Utils from "../utils/utils"

export default class Judge {
    private static operator: Operate[] = []

    public static of(key: string): Operate {
        const exist = Utils.find(this.operator, v => v.key === key)

        if (exist.data) {
            return exist.data
        }

        const create: Operate = {
            key : key,
            value: false
        }

        this.operator.push(create)

        return create
    }

    public static use(operate: Operate | string): Promise<Operate> {
        var o: Operate

        if ("string" === typeof operate) {
            o = this.of(operate)
        } else {
            o = operate
        }

        return new Promise((resolve) => {
            const value = o.value

            if (!value) {
                o.value = true

                resolve(o)
            }
        })
    }

    public static isPass(operate: Operate): boolean {
        return !operate.value
    }

    public static pass(operate: Operate): void {
        operate && (operate.value = false)
    }

    private static set(operate: Operate, value: boolean): void {
        Utils.each(this.operator, v => {
            v.value = value
        }, v => v.key === operate.key)
    }
}

export interface Operate {
    key: string
    value: boolean
}