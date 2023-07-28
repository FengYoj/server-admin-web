import Status from "../status/status"
import Utils from "../utils/utils"

export default class FileUtil {
    public static async script(src: string | string[]): Promise<void> {
        const load = (s: string) => {
            return new Promise(resolve => {
                var script = document.createElement("script")
                script.type = "text/javascript"
                script.src = s

                script.onload = script.onerror = resolve

                Utils.appendChild(script)
            })
        }

        for (let i = 0, a = typeof src === "string" ? [src] : src; i < a.length; i++) {
            await load(a[i])
        }
    }

    public static async style(src: string | string[]): Promise<void> {
        const load = (s: string) => {
            return new Promise(resolve => {
                var link = document.createElement("link")
                link.rel = "stylesheet"
                link.type = "text/css"
                link.href = s

                link.onload = link.onerror = resolve

                Utils.appendChild(link, "head")
            })
        }

        for (let i = 0, a = typeof src === "string" ? [src] : src; i < a.length; i++) {
            await load(a[i])
        }
    }

    public static getContent(url: string): Promise<Status<string>> {
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
     * DataUrl转为File
     * @param {String} dataUrl - dataUrl地址
     * @param {String} fileName - file文件名
     */
    public static dataURLtoFile(dataUrl: string, fileName: string = Utils.getUuid()): File {
        var arr = dataUrl.split(","),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n)
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n)
        }
        return new File([u8arr], fileName, { type: mime })
    }

    /**
     * File转为DataUrl
     * @param {File} file - file文件
     * @returns {Promise<String>} - dataUrl地址
     */
    public static fileToUri(file: File): string {
        return URL.createObjectURL(file)
    }
}
