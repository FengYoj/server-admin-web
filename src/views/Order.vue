<template>
    <div class="order-page" dark-class="order-page-dark">
        <!-- <div class="menu-box">
            
        </div> -->

        <div class="tool-bar-box">
            <div class="item-bar filter-box">
                <div class="item-box" id="order_entity">
                    <p class="name">所属订单</p>
                    <div class="value">
                        <p>{{ order_entity || "未配置" }}</p>
                        <elem-icon class="icon" name="select"></elem-icon>
                    </div>
                    <elem-options :all="false" el="#order_entity" :data="order_infos" @select="order_entity_title = $event.value.title"></elem-options>
                </div>
            </div>
            <div class="item-bar mode-base">
                <div class="mode-box">
                    <div class="item-box" :class="{ activity: mode === 'WAITING_ACCEPT' }" @click="onChangeMode('WAITING_ACCEPT')">待接单</div>
                    <div class="item-box" :class="{ activity: mode === 'concise' }" @click="onChangeMode('concise')">售后处理</div>
                    <div class="item-box" :class="{ activity: mode === 'ALL' }" @click="onChangeMode('ALL')">全部订单</div>
                </div>
            </div>
            <div class="item-bar operating-box">
                <div class="search-box">
                    <div class="icon-base">
                        <elem-icon class="icon-box" name="search"></elem-icon>
                    </div>
                    <input class="input" type="text" placeholder="输入搜索内容" v-model="search" @keyup.enter="onSubmitSearch" />
                </div>
                <!-- <div class="more-box">
                    <elem-icon class="icon" name="more"></elem-icon>
                    <comp-menu :value="moreMenu" @select="onSelectMoreMenu"></comp-menu>
                </div> -->
            </div>
        </div>

        <div class="order-box" dark-class="order-box-dark">
            <div class="item-box" v-for="(item, idx) in orderList" :key="idx">
                <div class="operating-btn">
                    <elem-icon name="operating"></elem-icon>
                    <comp-menu :absolute="true" position="follow" maxWidth="200px" :value="getMenu(item.status === 3)" @select="onSelectMenu(item, $event)"></comp-menu>
                </div>

                <div class="floor-box contact-box">
                    <div class="item-box">
                        <p class="name">订单类型:</p>
                        <p class="value">{{ { 1: "配送上门", 2: "快递配送", 3: "自提" }[item.pathway] || "未知" }}</p>
                    </div>
                    <div class="item-box" v-if="item.address">
                        <p class="name">地址:</p>
                        <p class="value">{{ [item.address.province, item.address.city, item.address.district, item.address.address].join("") }}</p>
                    </div>
                </div>

                <div class="floor-box goods-box">
                    <div class="item" v-for="(goods, idx) in item.goodsItems" :key="idx">
                        <div class="img" :style="{ 'background-image': 'url(' + goods.cover.url + ')' }"></div>
                    </div>
                </div>

                <div class="floor-box data-box">
                    <div class="item-box">
                        <p class="name">订单金额</p>
                        <p class="value">￥{{ centsToYuan(item.price) }}</p>
                    </div>
                    <div class="item-box">
                        <p class="name">优惠金额</p>
                        <p class="value">￥{{ centsToYuan(item.discountPrice) }}</p>
                    </div>
                    <div class="item-box">
                        <p class="name">配送费</p>
                        <p class="value">￥{{ centsToYuan(item.postagePrice) }}</p>
                    </div>
                </div>

                <div class="floor-box operate-box">
                    <button class="item" v-if="item.transportStatus === 'WAITING_ACCEPT'" @click="onAccepted(item)">接单</button>
                </div>
            </div>

            <comp-empty v-if="orderList && orderList.length == 0" :botton="false" title="当前订单为空" prompt="收到新订单时将为你第一时间显示"></comp-empty>
        </div>

        <comp-model ref="comp_model" :title="model_title" :scroll="false">
            <iframe ref="iframe" v-if="model_url" :src="model_url" frameborder="0" @load="onLoadIframe" width="100%" height="100%"></iframe>
        </comp-model>
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

import Message from "@/module/interactive/message"
import Request, { RequestPage } from "@/module/request/request"
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
    }

    public title: string = "用户管理"

    private users: obj[] = null

    private requestPage: RequestPage<obj>

    private filter_title = {}

    private search: string = null

    private menu_config: obj[] = null

    private model_title: string = "数据"
    // 模块链接
    private model_url: string = null

    private filters = [
        {
            name: "status",
            title: "状态值",
            data: [
                {
                    title: "未知",
                    value: "0",
                },
                {
                    title: "正常",
                    value: "1",
                },
                {
                    title: "禁用",
                    value: "3",
                },
                {
                    title: "已删除",
                    value: "4",
                },
            ],
        },
    ]

    mode: string = "WAITING_ACCEPT"
    // 订单实体标题
    order_entity_title: string = null
    // 订单消息
    order_infos: obj[] = null
    // 当前选择
    order_info_ac: obj = null

    // 订单列表
    orderList: obj[] = null

    watch = {
        order_info_ac(val: obj) {
            this.requestPage.setData({
                entity: val.id,
                type: "WAITING_ACCEPT",
            })
        },
    }

    async created() {
        // 分页实体
        this.requestPage = new RequestPage("ADMIN://SubstanceOrder/FindAllByType", {
            load: false,
            method: "GET",
            size: 20,
            onChange: res => {
                this.orderList = res
            },
        })

        await this.getAllInfo()
    }

    async getAllInfo() {
        return Request.get<obj[]>("ADMIN://SubstanceOrder/FindAllInfo").then(res => {
            this.order_infos = res

            if (res?.length > 0) {
                this.order_info_ac = res[0]
            }
        })
    }

    onReachBottom() {
        this.requestPage?.load()
    }

    onSubmitSearch() {
        this.requestPage.setData({
            search: this.search,
        })
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

    getMenu(disable: boolean): obj[] {
        let arr: obj[] = [
            {
                title: "操作",
                prompt: "删除用户成功后将无法恢复，请谨慎操作！",
                sub: [
                    {
                        id: disable ? "CancelDisable" : "Disable",
                        icon: "disable",
                        name: disable ? "取消禁用" : "禁用",
                    },
                    {
                        id: "Delete",
                        icon: "delete",
                        name: "删除用户",
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

    onSelectMenu(user: obj, evt: ElemEvent<string>) {
        switch (evt.value) {
            case "Disable":
                this.onDisableUser(user)
                break
            case "CancelDisable":
                this.onChangeDisableUser(user, false)
                break
            case "Delete":
                this.onDeleteUser(user)
                break
            case "Href":
                evt.data.href && this.jump(this.getUrl(user, evt.data.href))
                break
            case "Model":
                this.onOpenModel(evt.data, user)
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

    onDisableUser(user: obj) {
        Message.info("确认禁用当前用户？", true)
            .onConfirm(() => {
                this.onChangeDisableUser(user, true)
            })
            .build()
    }

    onChangeDisableUser(user: obj, disable: boolean) {
        Request.post("ADMIN://User/ChangeDisable", { user: user.uuid, disable }).then(() => {
            Message.success(disable ? "禁用成功" : "取消禁用成功")
            user.status = disable ? 3 : 1
        })
    }

    onDeleteUser(user: obj) {
        Message.info("确认删除当前用户？", true)
            .onConfirm(() => {
                Request.delete("ADMIN://User/Delete", { user: user.uuid }).then(() => {
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

        switch (mode) {
            case "WAITING_ACCEPT":
                this.requestPage.setData({
                    entity: this.order_info_ac.id,
                    type: "WAITING_ACCEPT",
                })
                break
            case "ALL":
                this.requestPage.setData({
                    entity: this.order_info_ac.id,
                })
                break
            default:
                break
        }
    }

    onLoadIframe() {
        this.isLoadedIframe = true
    }

    /**
     * 接单
     */
    onAccepted(item: obj) {
        Request.post("ADMIN://SubstanceOrder/Accepted", {
            uuid: item.uuid,
            entity: this.order_info_ac.id,
        }).then(res => {
            console.log(res)
        })
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
        .flex-shrink;

        .item-bar {
            width: 33.33%;
        }

        .filter-box {
            .flex-grow;
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
                }

                .input {
                    padding: 0 20px 0 40px;
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
            width: ~"calc(100% / 5 - 30px)";
            margin: 15px;
            background: #fff;

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

            .operating-btn {
                position: absolute;
                top: 15px;
                right: 10px;
                width: 30px;
                height: 30px;
            }

            .floor-box {
                padding: 15px 20px;

                .border-position(bottom);
                .flex;
                .flex-center-items;

                &:last-child {
                    border: initial;
                }
            }

            .contact-box {
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
                > .item {
                    position: relative;
                    width: calc(100% / 4 - (30px / 4));
                    padding-bottom: calc(100% / 4 - (30px / 4));
                    margin-right: 10px;

                    &:last-child {
                        margin-right: 0;
                    }

                    .img {
                        background-position: center;
                        background-size: cover;
                        overflow: hidden;

                        .absolute(0, 0, 0, 0);
                        .radius(6px);
                    }
                }
            }

            .data-box {
                .flex-content(space-between);

                > .item-box {
                    height: 40px;

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
                justify-content: center;

                > .item {
                    padding: 8px 20px;
                    width: 100%;
                    background: #00acdb;
                    color: #fff;
                    max-width: 250px;

                    .radius(6px);
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
