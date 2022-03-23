import Status from "../status/status"
import Utils from "../utils/utils"

export default class FileUtil {
    public static script(src: string | string[]): Promise<void> {
        return new Promise((resolve) => {
            (async function() {
                const load = (s: string) => {
                    return new Promise(resolve => {
                        var script = document.createElement("script")
                        script.type = "text/javascript"
                        script.src = s
    
                        script.onload = script.onerror = resolve
    
                        Utils.appendChild(script)
                    })
                }
    
                for (let i = 0, a = typeof src === 'string' ? [src] : src; i < a.length; i++) {
                    await load(a[i])
                }
    
                resolve()
            })()
        })
    }

    public static style(src: string | string[]): Promise<void> {
        return new Promise((resolve) => {
            (async function() {
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
    
                for (let i = 0, a = typeof src === 'string' ? [src] : src; i < a.length; i++) {
                    await load(a[i])
                }
    
                resolve()
            })()
        })
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
}
