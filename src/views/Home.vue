<template>
    <div class="home-page" id="HomePage" @click="onClickPage" dark-class="home-page-dark">
        <div class="data-preview" v-if="info">
            <div class="preview-item">
                <div class="icon-box">
                    <elem-icon name="visits"></elem-icon>
                </div>
                <p class="name">今日总访问量</p>
                <div class="value-box">
                    <p class="value">{{ info.visitsToday }}</p>
                    <p class="compare">{{ getCompare(info.visitsCompare) }}</p>
                </div>
            </div>
            <div class="preview-item">
                <div class="icon-box">
                    <elem-icon name="add_user"></elem-icon>
                </div>
                <p class="name">今日新增用户量</p>
                <div class="value-box">
                    <p class="value">{{ info.usersToday }}</p>
                    <p class="compare">{{ getCompare(info.usersCompare) }}</p>
                </div>
            </div>
            <div class="preview-item preview-yellow">
                <div class="icon-box">
                    <elem-icon name="order"></elem-icon>
                </div>
                <p class="name">本月订单总额</p>
                <div class="value-box">
                    <p class="value">{{ info.orderToday }}</p>
                    <p class="compare">{{ getCompare(info.orderCompare) }}</p>
                </div>
            </div>
            <div class="preview-item preview-red">
                <div class="icon-box">
                    <elem-icon name="exception"></elem-icon>
                </div>
                <p class="name">程序异常警告</p>
                <div class="value-box">
                    <p class="value">{{ info.exceptionsToday }}</p>
                    <p class="compare">{{ getCompare(info.exceptionsCompare) }}</p>
                </div>
            </div>
        </div>
        <div class="visits-box">
            <div class="title">近14天访问量</div>
            <div class="visits-chart" id="VisitsChart"></div>
        </div>
        <div class="module-half">
            <div class="item-box">
                <div class="title">近 30 天订单金额</div>
                <div class="orders-chart" id="OrdersChart">
                    <div class="empty">
                        <div class="icon">
                            <elem-icon width="18px" height="18px" src="static/interactive/icon/" name="info" dark="info_dark"></elem-icon>
                        </div>
                        <p class="text">暂无订单配置</p>
                    </div>
                </div>
            </div>
            <div class="item-box">
                <div class="title">未读消息</div>
                <div class="message-box">
                    <div class="message-item" v-for="(item, idx) in messages" :key="idx" @click="onJumpMessagePage(item.uuid)">
                        <div class="type-box">
                            <elem-icon width="25px" height="25px" src="static/interactive/icon/" :name="getMessageIcon(item.type)" :dark="getMessageIcon(item.type, true)"></elem-icon>
                        </div>
                        <div class="info-box">
                            <div class="name">{{ item.source.title }}</div>
                            <div class="info">{{ item.message }}</div>
                        </div>
                        <div class="more" @click.stop="onDeleteMessage(item.uuid)">
                            <elem-icon name="close" dark="close_white"></elem-icon>
                        </div>
                    </div>

                    <div class="empty" v-show="messages && messages.length <= 0">
                        <div class="icon">
                            <elem-icon width="18px" height="18px" src="static/interactive/icon/" name="success" dark="success_dark"></elem-icon>
                        </div>
                        <p class="text">暂无未读消息</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Request from "@/module/request/request"
import Utils from "@/module/utils/utils"
import Highcharts from "highcharts"
import Message from "@/module/interactive/message"
import Component, { ComponentMethods } from "../module/component/component"

import elemIcon from "@/components/elem-icon.vue"
// import Cache from '@/module/cache/cache'

class HomeView extends ComponentMethods implements ComponentEntity {
    public title: string = "首页"

    public icon: string = "home"

    private messages: obj[] = []

    private visitsChart: Highcharts.Chart

    private info = null

    components = {
        elemIcon,
    }

    created() {
        this.setDarkTheme(this.isDark())

        Request.get("ADMIN://Info/GetStatistics").then(res => {
            this.info = res
        })

        this.initMessageSocket()
    }

    activated() {
        this.getOrderChartData()
        this.getAccessChartData()

        this.getUnreadMessage()
    }

    public initMessageSocket() {
        // 判断当前浏览器是否支持 WebSocket
        if (!("WebSocket" in window)) {
            return
        }

        const socket = new WebSocket(`${window.location.protocol.indexOf("https") > -1 ? "wss" : "ws"}://${window.location.hostname}/WebSocket/Chat`)

        const audio = new Audio("static/audio/message.mp3")

        //连接发生错误的回调方法
        socket.onerror = function (evt) {
            console.error(evt)
        }

        //接收到消息的回调方法
        socket.onmessage = event => {
            this.messages.push(JSON.parse(event.data))

            // if (Cache.get<obj>("system", {}).audio) {
            audio.play()
            // }
        }

        // 监听窗口关闭事件
        window.onbeforeunload = function () {
            socket.close()
        }
    }

    public getAccessChartData() {
        Request.get("ADMIN://Access/GetAllChartData").then(res => {
            this.accessChartData = res

            if (this.visitsChart) {
                // 销毁访问数据图表
                this.visitsChart.destroy()
            }

            // 绘制
            this.setVisitsChart()
        })
    }

    /**
     * 获取未读消息
     */
    getUnreadMessage() {
        Request.get<obj[]>("ADMIN://Message/FindAllUnread").then(res => {
            this.messages = this.messages.concat(res)
        })
    }

    /**
     * 获取消息图标
     */
    getMessageIcon(type: string, dark: boolean = false): string {
        var name: string

        switch (type) {
            case "ERROR":
                name = "error"
                break
            case "SUCCESS":
                name = "success"
                break
            default:
                name = "info"
        }

        if (dark) {
            name += "_dark"
        }

        return name
    }

    /**
     * 获取订单图表数据
     */
    getOrderChartData() {
        Request.get<obj[]>("ADMIN://OrderChart/GetAllChartData").then(res => {
            if (res.length <= 0) return

            this.ordersChartData = res

            if (this.ordersChart) {
                // 销毁订单数据图表
                this.ordersChart.destroy()
            }

            // 绘制
            this.setOrdersChart()
        })
    }

    /**
     * 监听主题变化事件
     */
    onChangeTheme(theme) {
        this.setDarkTheme(theme === "dark")
    }

    getCompare(num: number): string {
        return num >= 0 ? "⬆" + num : "⬇" + Math.abs(num)
    }

    setDarkTheme(dark: boolean) {
        Highcharts.theme = {
            colors: ["#058DC7", "#50B432", "#ED561B", "#DDDF00", "#24CBE5", "#64E572", "#FF9655", "#FFF263", "#6AF9C4"],
            chart: {
                backgroundColor: "transparent",
            },
            xAxis: {
                lineColor: dark ? "#555" : "#333",
                labels: {
                    style: {
                        color: dark ? "#fff" : "#333",
                    },
                },
            },
            yAxis: {
                gridLineColor: dark ? "#555" : "#e3e3e3",
                title: {
                    style: { color: dark ? "#fff" : "#333" },
                },
            },
            legend: {
                itemStyle: {
                    color: dark ? "#fff" : "#333",
                },
                itemHoverStyle: {
                    color: dark ? "#fff" : "#333",
                },
            },
        }

        // 使主题配置生效
        Highcharts.setOptions(Highcharts.theme)

        if (this.visitsChart) {
            // 销毁访问数据图表
            this.visitsChart.destroy()
            // 重新绘制
            this.setVisitsChart()
        }

        if (this.ordersChart) {
            // 销毁订单数据图表
            this.ordersChart.destroy()
            // 重新绘制
            this.setOrdersChart()
        }
    }

    setOrdersChart() {
        this.ordersChart = Highcharts.chart({
            chart: {
                renderTo: "OrdersChart",
                type: "spline",
            },
            title: {
                text: null,
            },
            credits: {
                enabled: false,
            },
            xAxis: {
                categories: (function () {
                    const date = new Date()
                    const dates = []

                    date.setDate(date.getDate() - 30)

                    for (let i = 0; i < 30; i++) {
                        date.setDate(date.getDate() + 1)

                        let day = date.getDate()

                        dates.push(`${date.getMonth() + 1}.${day < 10 ? "0" + day : day}`)
                    }

                    return dates
                })(),
            },
            yAxis: {
                min: 0,
                gridLineDashStyle: "Dash",
                title: {
                    text: "订单金额（元）",
                },
            },
            tooltip: {
                shared: true,
            },
            plotOptions: {
                spline: {
                    marker: {
                        radius: 0,
                        lineWidth: 0,
                    },
                },
            },
            series: Utils.each(this.ordersChartData, v => {
                v.type = "spline"
            }),
        })
    }

    /**
     * 设置访问量图表
     * @param data 访问量数据
     */
    setVisitsChart() {
        this.visitsChart = Highcharts.chart({
            chart: {
                renderTo: "VisitsChart",
                type: "area",
            },
            title: {
                text: null,
            },
            credits: {
                enabled: false,
            },
            xAxis: {
                categories: (function () {
                    const date = new Date()
                    const dates = []

                    date.setDate(date.getDate() - 14)

                    for (let i = 0; i < 14; i++) {
                        date.setDate(date.getDate() + 1)

                        dates.push(`${Utils.paddingZero(date.getMonth() + 1)}/${Utils.paddingZero(date.getDate())}`)
                    }

                    return dates
                })(),
                crosshair: true,
            },
            yAxis: {
                min: 0,
                gridLineDashStyle: "Dash",
                title: {
                    text: "访问量 (次)",
                },
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px;color:#333">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' + '<td style="padding:0"><b style="color:#333">{point.y} 次</b></td></tr>',
                footerFormat: "</table>",
                shared: true,
                useHTML: true,
            },
            plotOptions: {
                areaspline: {
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1,
                        },
                        stops: [
                            [0, "rgba(20,116,223,0.42)"],
                            [1, "rgba(20,116,223,0.00)"],
                        ],
                    },
                    marker: {
                        radius: 0,
                        lineWidth: 0,
                    },
                },
                column: {
                    borderWidth: 0,
                },
            },
            series: Utils.each(this.accessChartData, v => {
                v.type = "areaspline"
            }),
        })
    }

    /**
     * 跳转到消息页面
     */
    onJumpMessagePage(i: string): void {
        this.jump("/message", { i })
    }

    /**
     * 监听删除消息事件
     */
    onDeleteMessage(i: string): void {
        Message.info("确认删除该消息？", true)
            .onConfirm(() => {
                Request.delete("ADMIN://Message/Delete", { i }).then(() => {
                    Message.success("删除成功")
                    // 更新数据
                    this.getUnreadMessage()
                })
            })
            .build()
    }
}

export default Component.build(new HomeView())
</script>

<style lang="less">
@import (reference) "@/style/utils.less";
@import (reference) "@/style/color.less";

// Color
.color-android {
    background: #00a2ff;
}

.color-ios {
    background: #2be4cf;
}

.color-other {
    background: #c3e5e1;
}

.home-page {
    padding: 30px;

    .data-preview {
        width: 100%;

        .flex;
        .flex-wrap;

        .preview-item {
            position: relative;
            width: ~"calc(100% / 4 - 20px * 3 / 4)";
            height: 160px;
            padding: 15px 20px;
            margin: 5px 20px 5px 0;
            background-image: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
            overflow: hidden;

            .border-box;
            .radius(10px);
            .shadow(0 0 10px rgba(0, 0, 0, 0.2));
            .flex;
            .flex-column;
            .flex-content(space-evenly);

            &:nth-child(2) {
                background-image: linear-gradient(to top, #48c6ef 0%, #6f86d6 100%);
            }

            &:last-child {
                margin-right: 0;
            }

            .icon-box {
                width: 40px;
                height: 40px;
            }

            .name {
                font-size: 12px;
                letter-spacing: 2px;
                color: #f1f1f1;
            }

            .value-box {
                .flex;
                .flex-items(flex-end);

                .value {
                    color: #fff;
                    font-size: 30px;
                    line-height: 30px;
                    font-weight: 500;
                }

                .compare {
                    margin-left: 10px;
                    color: #fff;
                    font-size: 13px;
                    opacity: 0.6;
                }
            }

            @media (max-width: 1000px) {
                & {
                    width: ~"calc(100% / 2 - 20px / 2)";

                    &:nth-child(2n) {
                        margin-right: 0;
                    }
                }
            }
        }

        .preview-red {
            background-image: linear-gradient(-225deg, #a445b2 0%, #d41872 52%, #ff0066 100%);
        }

        .preview-yellow {
            background-image: linear-gradient(120deg, #f6d365 0%, #fda085 100%);
        }
    }

    .visits-box {
        position: relative;
        width: 100%;
        margin: 40px 0 30px 0;

        .border-box;
        .flex;
        .flex-wrap;
        .flex-content(space-between);
        .transition;

        .compare {
            font-size: 12px;
        }

        .compare-upgrade {
            color: #00a2ff;
        }

        .compare-decline {
            color: #da3a21;
        }

        .visits-chart {
            width: 100%;
            height: 250px;
        }

        .title {
            font-size: 13px;
            letter-spacing: 2px;
            margin-bottom: 15px;

            .flex-shrink;
        }
    }

    .module-half {
        width: 100%;
        margin: 30px 0;

        .border-box;
        .radius(10px);
        .flex;
        .flex-wrap;
        .flex-content(space-between);

        .title {
            font-size: 13px;
            letter-spacing: 2px;
            margin: 20px 20px 15px 20px;

            .flex-shrink;
        }

        .item-box {
            width: 48%;
            height: 300px;
            background: #fff;
            overflow: hidden;

            .shadow(0 0 10px rgba(0,0,0,0.05));
            .radius(10px);
            .flex;
            .flex-column;
            .border-box;
            .transition;

            &:hover {
                z-index: 10;
                transform: scale(1.01);

                .shadow(0 20px 50px rgba(0,0,0,0.2));
            }

            @media (max-width: 1000px) {
                & {
                    width: 100%;
                    margin-bottom: 20px;

                    &:last-child {
                        margin-bottom: 0;
                    }
                }
            }

            .chart-box {
                .flex-grow;
                .flex;

                .scale-keys {
                    height: 100%;
                    padding-right: 20px;

                    .flex;
                    .flex-shrink;
                    .flex-column;

                    .scale-box {
                        margin: 30px 0;

                        .scale {
                            margin-bottom: 5px;

                            .flex-shrink;
                            .flex;
                            .flex-items(flex-start);

                            .value {
                                font-size: 40px;
                                line-height: 33px;
                                font-weight: 300;
                            }

                            .percentage {
                                font-size: 15px;
                            }
                        }
                    }

                    .keys {
                        overflow-x: auto;

                        .flex-grow;

                        p {
                            position: relative;
                            height: 20px;
                            line-height: 20px;
                            padding-left: 18px;
                            font-size: 12px;
                            color: #666;

                            .mark {
                                width: 10px;
                                height: 10px;

                                .radius(50%);
                                .absolute(5px,initial,initial,0);
                            }
                        }
                    }
                }

                .chart {
                    height: 100%;

                    .flex-grow;
                }
            }

            .orders-chart {
                margin: 0 20px;

                .flex-grow;
            }

            .message-box {
                height: 100%;

                .flex-grow;
                .scroll-y(4px);

                > .message-item {
                    width: 100%;
                    height: 45px;
                    margin-bottom: 15px;
                    cursor: pointer;

                    .flex;
                    .flex-center-items;

                    .type-box {
                        position: relative;
                        padding: 0 30px;
                        height: 100%;

                        &::after {
                            content: "";
                            width: 3px;
                            background: #2faaf7;

                            .radius(3px);
                            .absolute(0, initial, 0, 0);
                        }
                    }

                    .info-box {
                        overflow: hidden;

                        .flex-grow;

                        .name {
                            font-size: 14px;
                        }

                        .info {
                            margin-top: 2px;
                            font-size: 12px;
                            color: #cfcfcf;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }
                    }

                    .more {
                        padding: 0 20px;
                        width: 12px;
                        height: 12px;

                        .flex-shrink;
                    }
                }
            }

            .bar-ratio-box {
                width: 100%;
                height: 50px;

                .flex-shrink;
                .flex;
                .flex-center-items;

                .bar-ratio {
                    width: 100%;
                    height: 20px;

                    .flex;

                    .item {
                        position: relative;
                        height: 100%;

                        .radius(10px);

                        &:not(:last-child):first-child {
                            .radius(10px 0 0 10px);
                        }

                        &:not(:first-child):last-child {
                            .radius(0 10px 10px 0);
                        }

                        .prompt-box {
                            visibility: hidden;

                            .flex;
                            .flex-center-content;
                            .absolute(initial, initial, 100%, 50%);

                            .prompt {
                                margin-bottom: 10px;
                                padding: 0 20px;
                                height: 25px;
                                background: #fff;
                                border-radius: 10px;

                                .shadow;
                                .flex;
                                .flex-center-all;
                                .absolute(initial, initial, 0, initial);

                                &::after {
                                    content: "";
                                    width: 8px;
                                    height: 8px;
                                    margin-left: -4px;
                                    margin-top: -4px;
                                    background: #fff;
                                    transform: rotate(-45deg);

                                    .shadow(-2.5px 5px 5px rgba(0,0,0,0.1));
                                    .absolute(100%, initial, initial, 50%);
                                }

                                p {
                                    color: #888;
                                }

                                .percentage {
                                    color: #333;
                                    margin-right: 3px;
                                }
                            }
                        }

                        &:hover .prompt-box {
                            visibility: initial;
                        }
                    }
                }
            }
        }

        .module-full {
            width: 100%;
        }
    }

    @media (max-width: 900px) {
        padding: 0 20px;
    }

    @media (max-width: 700px) {
        padding: 0 10px;

        .title-search {
            .title {
                visibility: hidden;
            }

            .search-box {
                width: 100%;
            }
        }
    }

    @media (max-width: 600px) {
        padding: 0;
    }
}

.empty {
    width: 100%;
    height: 100%;
    font-size: 12px;

    .flex;
    .flex-center-all;

    .text {
        margin-left: 10px;
    }
}

.home-page-dark {
    .module {
        background: @dark_box;
    }

    .module-half .item-box {
        background: @dark_box;
    }
}
</style>
