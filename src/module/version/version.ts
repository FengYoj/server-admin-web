import Request from "../request/request"
import Message from "../interactive/message"

import Package from "@/../package.json"
import Modal from "../interactive/modal"

export default class Version {
    private static framework_version: string

    private static socket: WebSocket

    /**
     * 检查版本更新
     */
    public static check() {
        Request.get<obj>(
            "ADMIN://Update/Check",
            { version: Package.version },
            {
                onFail: () => {
                    Message.success("当前版本为最新版！")
                    // 不显示异常消息框
                    return false
                },
            }
        ).then(res => {
            if (res.isLatest) {
                Message.success("当前版本为最新版！")
            } else {
                Modal.info(
                    `
                    <p>当前版本：${Package.version}</p>
                    <p>最新版本：${res.latestVersion}</p>
                    <p style="margin-top: 10px">更新日志：</p>
                    ${res.log}
                `,
                    {
                        title: "发现新版本",
                        btn_confirm: "立即升级",
                        btn_cancel: "稍后",
                        onConfirm: () => {
                            this.update(res.latestVersion)
                        },
                    }
                )
            }
        })
    }

    public static update(version: string) {
        // 判断当前浏览器是否支持 WebSocket
        if (!("WebSocket" in window)) {
            return
        }

        const socket = (this.socket = new WebSocket("ws://localhost/WebSocket/Update"))

        // 连接发生错误的回调方法
        socket.onerror = function (evt) {
            Message.error("连接更新服务器出错")
        }

        // 接收到消息的回调方法
        socket.onmessage = event => {
            const data = JSON.parse(event.data)

            switch (data.method) {
                case "Info":
                    Message.info(data.message)
                    break
                case "Error":
                    Message.error(data.message)
                    break
                case "Success":
                    Message.success(data.message)
                    break
                case "SuccessUpdate":
                    Message.success("升级成功，是否立即刷新？", true)
                        .onConfirm(() => {
                            window.location.reload()
                        })
                        .build()
            }
        }

        socket.onopen = () => {
            socket.send(
                JSON.stringify({
                    method: "Update",
                    version,
                })
            )
        }

        // 监听窗口关闭事件
        window.onbeforeunload = function () {
            socket.close()
        }
    }

    /**
     * 获取版本号
     * @returns 版本号
     */
    public static get(): Promise<obj> {
        return new Promise((resolve, reject) => {
            var v: obj = {
                admin: Package.version,
                min_framework: Package.min_framework,
            }

            if (this.framework_version) {
                v.framework = this.framework_version

                resolve(v)
            } else {
                Request.get<string>("WEB://System/GetFrameworkVersion")
                    .then(res => {
                        this.framework_version = v.framework = res

                        resolve(v)
                    })
                    .catch(reject)
            }
        })
    }

    /**
     * 校验当前版本号是否大于等于框架版本号
     */
    public static checkFrameworkVersion(v: string): boolean {
        if (!this.framework_version) return false
        return this.compareVersions(v, this.framework_version)
    }

    private static compareVersions(v1: string, v2: string): boolean {
        var v1parts = v1.split(".")
        var v2parts = v2.split(".")

        for (var i = 0; i < v1parts.length; ++i) {
            if (v2parts.length == i) {
                return true
            }

            if (v1parts[i] == v2parts[i]) {
                continue
            } else if (v1parts[i] > v2parts[i]) {
                return true
            } else {
                return false
            }
        }

        if (v1parts.length != v2parts.length) {
            return false
        }

        return true
    }
}
