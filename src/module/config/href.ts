import Request from "../request/request"
import Utils from "../utils/utils"

export default class Href {

    private static config: obj

    public static get(): Promise<obj> {
        return new Promise((resolve, reject) => {
            if (this.config) {
                resolve(this.config)
            } else {
                this.__get()
                    .then(resolve)
                    .catch(reject)
            }
        })
    }

    public static getPage(name: string): Promise<obj> {
        return new Promise((resolve, reject) => {
            this.get().then(res => {
                resolve(Utils.find<obj>(res.pages, c => c.name === name).data)
            }).catch(reject)
        })
    }

    private static __get(): Promise<obj> {
        return new Promise((resolve, reject) => {
            Request.get<obj>("ADMIN://Config/HrefConfig/Get").then(res => {
                Href.config = res
                resolve(res)
            }).catch(reject)
        })
    }
}