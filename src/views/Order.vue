<template>
    <div ref="page" class="order-page" dark-class="order-page-dark">
        <!-- <div class="menu-box">
            
        </div> -->

        <div class="tool-bar-box">
            <div class="item-bar filter-box">
                <div class="item-box" id="order_entity">
                    <p class="name">所属订单</p>
                    <div class="value">
                        <p>{{ order_info_ac ? order_info_ac.title : "请选择" }}</p>
                        <elem-icon class="icon" name="select"></elem-icon>
                    </div>
                    <elem-options :all="false" el="#order_entity" :data="order_infos" @select="order_info_ac = $event.value"></elem-options>
                </div>
                <div class="item-box" id="order_entity">
                    <p class="name">日期范围</p>
                    <DatePicker
                        :open="date_open"
                        :model-value="date_range"
                        confirm
                        clearable
                        type="daterange"
                        split-panels
                        @on-clear="date_open = false"
                        @on-clickoutside="date_open = false"
                        @on-ok="date_open = false"
                        @on-change="onChangeDate"
                    >
                        <div class="value" @click="date_open = true">
                            <p class="p" v-if="date_range">{{ date_range.join(" - ") }}</p>
                            <p class="p" v-else>所有</p>
                            <elem-icon class="icon" name="select"></elem-icon>
                        </div>
                    </DatePicker>
                </div>
            </div>
            <div class="item-bar mode-base">
                <div class="mode-box">
                    <div class="item-box" :class="{ activity: mode === 'TODOS' }" @click="onChangeMode('TODOS')">待处理 ({{ todo_q }})</div>
                    <!-- <div class="item-box" :class="{ activity: mode === 'AFTER_SALES' }" @click="onChangeMode('AFTER_SALES')">售后处理</div> -->
                    <div class="item-box" :class="{ activity: mode === 'ALL' }" @click="onChangeMode('ALL')">全部订单</div>
                </div>
            </div>
            <div class="item-bar operating-box">
                <div class="search-box">
                    <div class="icon-base">
                        <elem-icon class="icon-box" name="search"></elem-icon>
                    </div>
                    <input class="input" type="text" placeholder="输入订单编号" v-model="search" @keyup.enter="onSubmitSearch" />
                    <div class="icon-base close" v-if="search">
                        <elem-icon class="icon-box" name="close" @click="onClearSearch"></elem-icon>
                    </div>
                </div>
                <!-- <div class="more-box">
                    <elem-icon class="icon" name="more"></elem-icon>
                    <comp-menu :value="moreMenu" @select="onSelectMoreMenu"></comp-menu>
                </div> -->
            </div>
        </div>

        <div class="order-box" dark-class="order-box-dark">
            <div class="item-box" v-for="(item, idx) in orderList" :key="idx">
                <div class="head-box" :style="{ backgroundColor: getOrderStatusColor(item)}">
                    <div class="status">{{ getOrderStatus(item) }}</div>
                    <div class="operating-btn">
                        <elem-icon name="operating"></elem-icon>
                        <comp-menu :absolute="true" position="follow" maxWidth="200px" :value="getMenu(item)" @select="onSelectMenu(item, $event)"></comp-menu>
                    </div>
                </div>

                <div class="floor-box contact-box">
                    <!-- <div class="item-box">
                        <p class="name">订单类型:</p>
                        <p class="value">{{ { 1: "配送上门", 2: "快递配送", 3: "自提" }[item.pathway] || "未知" }}</p>
                    </div> -->
                    <div class="item-box">
                        <p class="name">订单编号:</p>
                        <p class="value">{{ item.orderNumber }}</p>
                    </div>
                    <div class="item-box">
                        <p class="name">下单时间:</p>
                        <p class="value">{{ item.createdDate }}</p>
                    </div>
                    <div class="item-box" v-if="item.address">
                        <p class="name">联系人:</p>
                        <p class="value">{{ [item.address.name, item.address.phone].join(" - ") }}</p>
                    </div>
                    <div class="item-box" v-if="item.address">
                        <p class="name">地址:</p>
                        <p class="value">{{ [item.address.province, item.address.city, item.address.district, item.address.address].join(" - ") }}</p>
                    </div>
                </div>

                <div class="floor-box goods-box">
                    <div class="item" v-for="(goods, idx) in item.goodsItems" :key="idx" :title="goods.title">
                        <div class="img" :style="{ 'background-image': 'url(' + goods.cover.url + '?x-oss-process=image/resize,m_fill,h_300,w_300,limit_0' + ')' }"></div>
                        <div class="info-box">
                            <div class="name">{{ goods.title }}</div>
                            <div class="spec">{{ goods.specification?.map(v => v.title).join(', ') }}</div>
                            <div class="quantity">x{{ goods.quantity }}</div>
                        </div>
                    </div>
                </div>

                <div class="floor-box data-box">
                    <div class="item-box">
                        <p class="name">订单金额</p>
                        <p class="value">￥{{ centsToYuan(item.price) }}</p>
                    </div>
                    <div class="item-box">
                        <p class="name">运费</p>
                        <p class="value">￥{{ centsToYuan(item.postagePrice) }}</p>
                    </div>
                    <div class="item-box">
                        <p class="name">分销</p>
                        <p class="value">{{ item.distribution ? item.distribution.name : "-" }}</p>
                    </div>
                </div>

                <div class="floor-box operate-box">
                    <button class="item g" v-if="item.transportStatus === 'WAITING_ACCEPT'" @click="onAccepted(item)">接单</button>
                    <button class="item b" v-else-if="item.transportStatus === 'WAITING_SHIPMENTS' && item.address" @click="onShipments(item)">发货</button>
                    <!-- <button class="item r" v-if="item.paymentStatus === 1" @click="onAccepted(item)">退款</button> -->
                </div>
            </div>

            <comp-empty v-if="orderList && orderList.length == 0" :botton="false" title="当前订单为空" prompt="收到新订单时将为你第一时间显示"></comp-empty>
        </div>

        <comp-model ref="comp_model" :title="model_title" :scroll="false">
            <iframe ref="iframe" v-if="model_url" :src="model_url" frameborder="0" @load="onLoadIframe" width="100%" height="100%"></iframe>
        </comp-model>

        <comp-form ref="comp_form" @on-submit="onSubmitForm"></comp-form>
    </div>
</template>

<script lang="ts">
import Component, { ComponentMethods } from "@/module/component/component"

import elemIcon from "@/components/elem-icon.vue"
import elemPrompt from "@/components/elem-prompt.vue"
import elemOptions from "@/components/elem-options.vue"
import compMenu from "@/components/comp-menu.vue"
import CompModel from "@/components/comp-model.vue"
import CompEmpty from "@/components/comp-empty.vue"
import CompForm from "@/components/comp-form.vue"

import Message from "@/module/interactive/message"
import Request from "@/module/request/request"
import RequestPage from "@/module/request/page"
import Utils from "@/module/utils/utils"
import Cache from "@/module/cache/cache"
import Headway from "@/module/utils/headway"
import Loading from "@/module/loading/loading"

class ToolView extends ComponentMethods implements ComponentEntity {
    components = {
        elemIcon,
        elemPrompt,
        elemOptions,
        compMenu,
        CompModel,
        CompEmpty,
        CompForm,
    }

    public title: string = "订单管理"

    private users: obj[] = null

    private requestPage: RequestPage<obj>

    private filter_title = {}

    private search: string = null

    private menu_config: obj[] = null

    private model_title: string = "数据"
    // 模块链接
    private model_url: string = null
    // 日期范围
    private date_range = null
    // 日期组件显示状态
    private date_open = false

    private filters = {}

    mode: string = "TODOS"
    // 订单消息
    order_infos: obj[] = null
    // 当前选择
    order_info_ac: obj = null
    // 待处理总数
    todo_q: number = 0

    // 订单列表
    orderList: obj[] = null

    watch = {
        order_info_ac(val: obj) {
            this.requestPage.setData({
                entity: val.id
            }, false)

            this.onChangeMode("TODOS")
        },

        date_range(v) {
            console.log(v);
        },

        filters: {
            handler(val: obj) {
                const arr = []

                Object.keys(val).forEach((key) => {
                    let item = val[key]

                    if (item instanceof Array) {
                        arr.push(...item)
                    } else {
                        arr.push(item)
                    }
                })

                this.requestPage.setData({
                    entity: this.order_info_ac.id,
                    filter: arr
                })
            },
            deep: true
        }
    }

    async created() {
        // 分页实体
        this.requestPage = new RequestPage("ADMIN://SubstanceOrder/FindAllByType", {
            load: false,
            method: "POST",
            size: 20,
            json: true,
            onChange: res => {
                this.orderList = res

                if (this.mode === "TODOS") {
                    this.todo_q = this.requestPage.getTotal()
                }
            },
        })

        await this.getAllInfo()
    }

    async getAllInfo() {
        return Request.get<obj[]>("ADMIN://SubstanceOrder/FindAllInfo", null, {
            onFail: () => {
                return false
            }
        }).then(res => {
            this.order_infos = res

            if (res?.length > 0) {
                this.order_info_ac = res[0]
            }
        })
    }

    // onResize(evt: obj) {
    //     console.log(evt);
    //     console.log(this.$refs.page.offsetWidth);
    // }

    onReachBottom() {
        this.requestPage?.load()
    }

    onSubmitSearch() {
        if (!this.search) {
            delete this.filters['search']
            return
        }

        this.filters['search'] = {
            key: "orderNumber",
            value: this.search,
            operator: "equal",
            fuzzy: true
        }
    }

    onClearSearch() {
        this.search = ""
        delete this.filters['search']
    }

    /**
     * 价格单位 分 转 元，保留两位小数
     * @param amount 金额，单位：分
     */
    centsToYuan(amount: number): string {
        if (!amount) {
            return "0.00"
        }

        return (amount / 100).toFixed(2)
    }

    /**
     * 获取地址
     */
    getAddress(e: obj): string {
        var res = []

        Utils.each(["country", "province", "city"], v => {
            e[v] && res.push(e[v])
        })

        return res.length > 0 ? res.join("-") : "-"
    }

    /**
     * 随机生成十六进制颜色
     */
    getRandomHexColor() {
        return "#" + ("00000" + ((Math.random() * 0x1000000) << 0).toString(16)).substr(-6)
    }

    getMenu(item: obj): obj[] {
        let arr: obj[] = [
            {
                title: "数据",
                sub: [
                    {
                        id: "CopyOrderNumber",
                        icon: "copy",
                        name: "复制订单号",
                    },
                    ...(item.address
                        ? [
                              {
                                  id: "CopyAddress",
                                  icon: "copy",
                                  name: "复制收货信息",
                              },
                          ]
                        : []),
                ],
            },
            {
                title: "操作",
                prompt: "删除数据后将无法恢复，请谨慎操作！",
                sub: [
                    {
                        id: "Delete",
                        icon: "delete",
                        name: "删除订单",
                    },
                ],
            },
        ]

        if (this.menu_config && this.menu_config.length > 0) {
            arr.push({
                title: "管理",
                sub: this.menu_config,
            })
        }

        return arr
    }

    onSelectMenu(item: obj, evt: ElemEvent<string>) {
        switch (evt.value) {
            case "CopyOrderNumber":
                Utils.copyText(item.orderNumber)
                Message.success("复制成功")
                break
            case "CopyAddress":
                Utils.copyText([item.address.name, item.address.phone, `${[item.address.province, item.address.city, item.address.district, item.address.address].join('')}`].join(" "))
                Message.success("复制成功")
                break
            case "Delete":
                this.onDeleteOrder(item)
                break
            case "Href":
                evt.data.href && this.jump(this.getUrl(item, evt.data.href))
                break
            case "Model":
                this.onOpenModel(evt.data, item)
        }
    }

    /**
     * 打开窗口
     */
    onOpenModel(data: obj, user: obj) {
        Loading.show()

        this.model_title = data.name
        this.model_url = data.url
        this.current_user = user

        this.$nextTick(() => {
            new Headway(this, "isLoadedIframe").on().then(() => {
                this.$refs.comp_model.onDisplay()

                this.$refs.iframe.contentWindow.postMessage(
                    {
                        type: "OpenMembership",
                        user_id: this.current_user.uuid,
                        authorization_token: Cache.get("admin_token", ""),
                        authorization_user: Cache.get("admin_id", ""),
                    },
                    "*"
                )

                Loading.hide()
            })
        })
    }

    /**
     * 解析 url
     */
    getUrl(data: obj, url: string): string {
        return new Function(`return \`${url.replace(/&{(\w*)}/g, "${this.data.$1}")}\``).call({
            data: data,
        })
    }

    onDeleteOrder(user: obj) {
        Message.info("确认删除当前订单？", true)
            .onConfirm(() => {
                Request.delete("ADMIN:///Delete", { user: user.uuid }).then(() => {
                    Utils.each(
                        this.users,
                        () => "delete",
                        c => c.uuid === user.uuid
                    )
                    Message.success("删除成功")
                })
            })
            .build()
    }

    onChangeMode(mode: string) {
        this.mode = mode

        var filters: obj = [{
            key: "paymentStatus",
            value: 1,
            operator: "equal",
        }]

        switch (mode) {
            case "TODOS":
                filters.push({
                    key: "transportStatus",
                    value: ["WAITING_ACCEPT", "WAITING_SHIPMENTS"],
                    operator: "equal",
                    relation: "or",
                })
                break
        }
        
        this.filters['mode'] = filters
        // this.requestPage.setData({
        //     entity: this.order_info_ac.id,
        //     type: mode
        // })
    }

    onLoadIframe() {
        this.isLoadedIframe = true
    }

    /**
     * 接单
     */
    onAccepted(item: obj) {
        Request.post("ADMIN://GoodsOrder/Receiving", {
            uuid: item.uuid,
        }).then(() => {
            Message.success("接单成功")
            item.transportStatus = "WAITING_SHIPMENTS"
        })
    }

    /**
     * 发货
     */
    onShipments(item: obj) {
        this.$refs.comp_form.display({
            title: "发货",
            method: "POST",
            submitApi: "ADMIN://GoodsOrder/Delivery?uuid=" + item.uuid,
            structure: [
                {
                    type: "ORDINARY",
                    data: [
                        {
                            field: "expressNumber",
                            name: "expressNumber",
                            title: "快递单号",
                            length: 255,
                            required: true,
                            type: "Input",
                        },
                        {
                            field: "expressCompany",
                            name: "expressCompany",
                            title: "快递公司",
                            length: 255,
                            required: true,
                            type: "Select",
                            modify: true,
                            selectConfig: {
                                field: null,
                                controller: true,
                                data: null,
                                selectField: {},
                                multiple: false,
                                type: "com.jemmy.framework.component.order.substance.delivery.DeliveryCompany"
                            }
                        },
                    ],
                    title: "通用数据",
                    exist: true,
                },
            ],
            data: item,
        })
    }

    onChangeDate(evt: string[]) {
        if (evt?.[0] && evt?.[1]) {
            if (evt[0] === evt[1])
                this.filters['date'] = {
                    key: "createdDate",
                    value: evt[0],
                    type: "date",
                    operator: "equal",
                }
            else
                this.filters['date'] = [
                    {
                        key: "createdDate",
                        value: evt[0],
                        type: "date",
                        operator: "greater_equal",
                    },
                    {
                        key: "createdDate",
                        value: evt[1],
                        type: "date",
                        operator: "less_equal",
                    }
                ]

            this.date_range = evt
        } else {
            this.date_range = null
            delete this.filters['date']
        }

        // 设置为关闭状态
        this.date_open = false
    }

    /**
     * 表单提交成功事件
     */
    onSubmitForm(evt: obj) {
        Message.success("发货成功")
        evt.value.data.transportStatus = "WAITING_RECEIPT"
    }

    getOrderStatus(item: obj) {
        let p = { 0: "未支付", 2: "已取消", 3: "支付失败" }[item.paymentStatus]
        if (p) return p
        return (
            { WAITING_ACCEPT: "待接单", WAITING_DELIVERED: "待配送", WAITING_GET: "待取货", WAITING_SHIPMENTS: "待发货", WAITING_RECEIPT: "待收货", WAITING_COMMENT: "待评价", SUCCESS: "已完成" }[item.transportStatus] || "未知"
        )
    }

    getOrderStatusColor(item: obj) {
        if (item.paymentStatus !== 1) {
            return "#333"
        }

        return {
            WAITING_ACCEPT: "#007843",
            WAITING_SHIPMENTS: "#00acdb"
        }[item.transportStatus] || "#333"
    }
}

export default Component.build(new ToolView())
</script>

<style lang="less">
@import (reference) "@/style/utils.less";
@import (reference) "@/style/color.less";

.order-page {
    padding: 20px;

    .tool-bar-box {
        position: relative;
        width: 100%;
        padding: 0 20px;
        height: 50px;
        z-index: 20;

        .radius(10px);
        .border-box;

        .flex;
        .flex-center-items;
        .flex-content(space-between);
        .flex-shrink;

        .filter-box {
            .flex;

            .item-box {
                position: relative;
                margin-right: 40px;

                .name {
                    font-size: 14px;
                    color: #c4c4c4;
                    font-weight: 600;
                }

                .value {
                    font-size: 12px;
                    color: #333;
                    font-weight: bold;

                    .flex;
                    .flex-center-items;

                    .icon {
                        width: 12px;
                        height: 12px;
                        margin-left: 3px;
                    }
                }
            }
        }

        .mode-base {
            margin: 0 20px;

            .flex;
            .flex-center-all;

            .mode-box {
                height: 40px;
                overflow: hidden;

                .flex;
                .border;
                .radius(20px);

                > .item-box {
                    cursor: pointer;
                    padding: 0 30px;
                    height: 100%;
                    font-size: 14px;
                    background: #fff;
                    white-space: nowrap;

                    .border-position(right);
                    .flex;
                    .flex-center-all;

                    &:last-child {
                        border: 0;
                    }
                }

                > .activity {
                    background: #00acdb;
                    color: #fff;
                }
            }
        }

        .operating-box {
            .flex-shrink;
            .flex;
            .flex-center-items;
            .flex-content(flex-end);

            .add-btn {
                cursor: pointer;
                padding: 0 20px;
                height: 35px;
                margin-left: 20px;
                background: #00b3d9;

                .shadow(0 0 5px rgba(0, 0, 0, 0.1));
                .radius(35px);
                .flex;
                .flex-center-items;
                .transition;

                &:hover {
                    .shadow(0 0 10px rgba(0, 0, 0, 0.3));
                }

                &:first-child {
                    margin-left: initial;
                }

                .icon {
                    width: 18px;
                    height: 18px;
                    margin-right: 5px;
                }

                .text {
                    font-size: 14px;
                    color: #fff;
                }
            }

            .search-box {
                position: relative;

                .flex;

                .icon-base {
                    width: 40px;

                    .absolute(0, initial, 0, 0);
                    .flex;
                    .flex-center-all;

                    .icon-box {
                        width: 50%;
                        height: 50%;
                    }

                    &.close {
                        cursor: pointer;

                        .absolute(0, 0, 0, initial);

                        .icon-box {
                            width: 30%;
                            height: 30%;
                        }
                    } 
                }

                .input {
                    padding: 0 40px 0 40px;
                    height: 40px;
                    background: #fff;

                    .border;
                    .radius(20px);
                    .border-box;
                }
            }

            .search {
                background: #fff;
            }

            .more-box {
                margin-left: 20px;
                width: 30px;
                height: 30px;

                .flex;
                .flex-center-all;

                .icon {
                    width: 20px;
                    height: 20px;
                }
            }
        }
    }

    .order-box {
        width: 100%;
        margin-top: 20px;

        .flex;
        .flex-wrap;
        .flex-grow;

        > .item-box {
            position: relative;
            width: ~"calc(100% / 5 - 20px)";
            margin: 10px;
            background: #fff;
            overflow: hidden;

            .flex;
            .flex-column;
            .radius(15px);
            .border-box;
            .transition;
            .shadow(2px 2px 15px rgba(0,0,0,0.08));
            .border;

            &:hover {
                .shadow(5px 5px 20px rgba(0,0,0,0.15));
            }

            @media (max-width: 2300px) {
                width: 400px;
            }

            @media (max-width: 2000px) {
                width: ~"calc(100% / 4 - 20px)";
            }

            @media (max-width: 1600px) {
                width: ~"calc(100% / 3 - 20px)";
            }

            @media (max-width: 1200px) {
                width: ~"calc(100% / 2 - 20px)";
            }

            @media (max-width: 800px) {
                width: ~"calc(100% - 20px)";
            }

            .head-box {
                width: 100%;
                padding: 0 20px;
                height: 50px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                box-sizing: border-box;
                
                .border-position(bottom);

                .status {
                    font-size: 16px;
                    font-weight: bold;
                    color: #fff;
                }

                .operating-btn {
                    width: 30px;
                    height: 30px;
                }
            }

            .floor-box {
                padding: 15px 20px;

                .border-position(top);
                .flex;
                .flex-center-items;
            }

            .contact-box {
                border: initial;

                .flex-items(flex-start);
                .flex-column;
                .flex-grow;

                > .item-box {
                    margin-bottom: 10px;

                    .flex;
                    .flex-column;
                    .flex-content(space-between);

                    &:last-child {
                        margin-bottom: 0;
                    }

                    .name {
                        font-size: 12px;
                        color: #999;
                    }

                    .value {
                        font-size: 13px;
                        line-height: 18px;
                        font-weight: bold;
                        letter-spacing: 1px;
                    }
                }
            }

            .goods-box {
                align-items: flex-start;

                .scroll-x(5px);

                &:empty {
                    display: none;
                }

                > .item {
                    position: relative;
                    margin-right: 10px;

                    .flex;
                    .flex-grow;

                    &:last-child {
                        margin-right: 0;
                    }

                    .img {
                        width: 50px;
                        height: 50px;
                        background-position: center;
                        background-size: cover;
                        overflow: hidden;

                        .radius(6px);
                        .flex-shrink;
                    }

                    .info-box {
                        position: relative;
                        margin: 5px 0 5px 15px;

                        .flex-grow;

                        .name {
                            font-size: 12px;
                            margin-right: 30px;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: normal;
                            display: -webkit-box;
                            -webkit-line-clamp: 1;
                            -webkit-box-orient: vertical;
                        }

                        .spec {
                            margin-top: 5px;
                            font-size: 11px;
                        }

                        .quantity {
                            position: absolute;
                            right: 0;
                            top: 0;
                            font-size: 12px;
                        }
                    }
                }
            }

            .data-box {
                > .item-box {
                    height: 40px;
                    width: 33.33%;

                    .flex;
                    .flex-column;
                    .flex-content(space-between);

                    .name {
                        font-size: 12px;
                        color: #999;
                    }

                    .value {
                        font-size: 14px;
                        line-height: 20px;
                    }
                }
            }

            .operate-box {
                display: flex;
                justify-content: flex-end;

                &:empty {
                    display: none;
                }

                > .item {
                    margin-left: 10px;
                    padding: 8px 20px;
                    background: #fff;
                    color: #333;
                    max-width: 250px;

                    .radius(6px);

                    &.b {
                        background: #00acdb;
                        color: #fff;
                    }

                    &.g {
                        background: #1e7c33;
                        color: #fff;
                    }

                    &.r {
                        background: #ac0505;
                        color: #fff;
                    }
                }
            }
        }
    }

    .order-box-dark > .item-box {
        background: @dark_box;

        .child-box > .item-box {
            background: #2f3042;
        }
    }
}

.order-page-dark {
    .tool-bar-box {
        .mode-base .mode-box > .item-box:not(.activity) {
            background: @dark_box;
        }

        .operating-box .search-box .input {
            background: @dark_box;
        }
    }
}
</style>
