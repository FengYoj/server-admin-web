<template>
    <div class="user-page" dark-class="user-page-dark">

        <!-- <div class="menu-box">
            
        </div> -->

        <div class="tool-bar-box">
            <div class="item-bar filter-box">
                <div class="item-box" v-for="(item, idx) in filters" :key="idx" :id="'filter_item_' + idx">
                    <p class="name">{{item.title}}</p>
                    <div class="value">
                        <p>{{filter_title['filter_item_' + idx] || '所有'}}</p>
                        <elem-icon class="icon" name="select"></elem-icon>
                    </div>
                    <elem-options :el="'#filter_item_' + idx" :data="item.data" @select="onFilter(item.name, 'filter_item_' + idx, $event)"></elem-options>
                </div>
            </div>
            <div class="item-bar mode-base">
                <div class="mode-box">
                    <div class="item-box" :class="{ activity: mode === 'basis' }" @click="onChangeMode('basis')">基础模式</div>
                    <div class="item-box" :class="{ activity: mode === 'concise' }" @click="onChangeMode('concise')">简洁模式</div>
                    <!-- <div class="item-box" :class="{ activity: mode === 'statistics' }" @click="onChangeMode('statistics')">分析统计</div> -->
                </div>
            </div>
            <div class="item-bar operating-box">
                <div class="search-box">
                    <div class="icon-base">
                        <elem-icon class="icon-box" name="search"></elem-icon>
                    </div>
                    <input class="input" type="text" placeholder="输入搜索内容" v-model="search" @keyup.enter="onSubmitSearch">
                </div>
                <a class="add-btn" @click="jump('/form', { type: 'create', name: 'User' })">
                    <elem-icon class="icon" name="add_white"></elem-icon>
                    <p class="text">添加</p>
                </a>
                <!-- <div class="more-box">
                    <elem-icon class="icon" name="more"></elem-icon>
                    <comp-menu :value="moreMenu" @select="onSelectMoreMenu"></comp-menu>
                </div> -->
            </div>
        </div>

        <div class="user-box" dark-class="user-box-dark">
            <div class="item-box" v-for="(item, idx) in users" :key="idx">

                <div class="operating-btn">
                    <elem-icon name="operating"></elem-icon>
                    <comp-menu :absolute="true" :value="getMenu(item.status === 3)" @select="onSelectMenu(item, $event)"></comp-menu>
                </div>

                <div class="floor-box contact-box">
                    <div class="item-box">
                        <p class="name">手机号码</p>
                        <p class="value">{{item.phone || '-'}}</p>
                    </div>
                    <div class="item-box" v-if="mode === 'basis'">
                        <p class="name">住址</p>
                        <p class="value">{{getAddress(item)}}</p>
                    </div>
                </div>

                <div class="floor-box event-box" v-if="mode === 'basis'">
                    <div class="timeline-box">
                        <div class="line"></div>
                    </div>
                    <div class="event-item-box">
                        <div class="item-box">
                            <p class="name">加入日期</p>
                            <p class="value">{{item.createdDate}}</p>
                        </div>
                        <div class="item-box">
                            <p class="name">最后访问日期</p>
                            <p class="value">{{item.lastAccess || item.createdDate}}</p>
                        </div>
                    </div>
                </div>

                <div class="floor-box data-box">
                    <div class="item-box">
                        <p class="name">注册方式</p>
                        <p class="value">{{getProvider(item.provider)}}</p>
                    </div>
                    <div class="item-box">
                        <p class="name">访问次数</p>
                        <p class="value">{{item.accessFrequency || 0}}</p>
                    </div>
                    <div class="item-box">
                        <p class="name">消费金额</p>
                        <p class="value">￥{{item.orderTotal || '0.00'}}</p>
                    </div>
                </div>

                <div class="floor-box info-box">
                    <div class="avatar-box">
                        <img class="img" :src="item.avatar ? item.avatar.url : 'static/icon/user.svg'">
                    </div>
                    <div class="basic-box">
                        <div class="username-box">
                            <p class="username">{{item.username || 'User'}}</p>
                            <elem-icon v-if="item.gender != null && item.gender <= 1" class="icon-box" :name="['gender_male', 'gender_female'][item.gender]"></elem-icon>
                        </div>
                        <p class="uid">{{item.uid || '-'}}</p>
                    </div>
                    <div class="status-box">
                        <div class="item-box" v-if="item.status === 3">
                            <elem-icon class="icon-box" name="disable"></elem-icon>
                            <elem-prompt title="禁用状态"></elem-prompt>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Component, { ComponentMethods } from '@/module/component/component'

import elemIcon from '@/components/elem-icon.vue'
import elemPrompt from '@/components/elem-prompt.vue'
import elemOptions from '@/components/elem-options.vue'
import compMenu from '@/components/comp-menu.vue'

import Message from '@/module/interactive/message'
import Request, { RequestPage } from '@/module/request/request'
import Utils from '@/module/utils/utils'
import Cache from '@/module/cache/cache'
 
class ToolView extends ComponentMethods implements ComponentEntity {

    public title: string = "用户管理"

    private users: obj[] = null

    private requestPage: RequestPage<obj>

    private filter_title = {}

    private search: string = null

    private mode: string = Cache.get("UserPageMode", "basis")

    private filters = [
        {
            name: "status",
            title: "状态值",
            data: [
                {
                    title: "未知",
                    value: "0"
                },
                {
                    title: "正常",
                    value: "1"
                },
                {
                    title: "禁用",
                    value: "3"
                },
                {
                    title: "已删除",
                    value: "4"
                }
            ]
        }
    ]

    components = {
        elemIcon,
        elemPrompt,
        elemOptions,
        compMenu
    }

    created() {
        this.requestPage = new RequestPage("ADMIN://User/FindAllToPage", {
            method: "POST",
            load: false,
            size: 20,
            onChange: (res) => {
                this.users = res
            }
        })
    }

    activated() {
        this.requestPage.reset()
    }

    onReachBottom() {
        this.requestPage.load()
    }

    onSubmitSearch() {
        this.requestPage.setData({
            search: this.search
        })
    }

    /**
     * 获取地址
     */
    getAddress(e: obj): string {
        var res = []

        Utils.each(['country', 'province', 'city'], v => {
            e[v] && res.push(e[v])
        })

        return res.length > 0 ? res.join("-") : '-'
    }

    getProvider(provider: string): string {
        return {
            weixin: "微信小程序",
            toutiao: "头条小程序"
        }[provider] || provider || '-'
    }

    /**
     * 随机生成十六进制颜色
     */
    getRandomHexColor() {
        return '#' + ('00000' + (Math.random() * 0x1000000 << 0).toString(16)).substr(-6);
    }

    getMenu(disable: boolean): obj[] {
        return [{
            title: "操作",
            prompt: "删除用户成功后将无法恢复，请谨慎操作！",
            sub: [{
                id: disable ? "CancelDisable" : "Disable",
                icon: "disable",
                name: disable ? "取消禁用" : "禁用"
            }, {
                id: "Delete",
                icon: "delete",
                name: "删除用户"
            }]
        }]
    }

    onSelectMenu(user: obj, evt: ElemEvent<string>) {
        switch(evt.value) {
            case "Disable":
                this.onDisableUser(user)
                break
            case "CancelDisable":
                this.onChangeDisableUser(user, false)
                break
            case "Delete":
                this.onDeleteUser(user)
        }
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
            Message.success(disable ? '禁用成功' : '取消禁用成功')
            user.status = disable ? 3 : 1
        })
    }

    onDeleteUser(user: obj) {
        Message.info("确认删除当前用户？", true)
            .onConfirm(() => {
                Request.delete("ADMIN://User/Delete", { user: user.uuid }).then(() => {
                    Utils.each(this.users, () => "delete", c => c.uuid === user.uuid)
                    Message.success("删除成功")
                })
            })
            .build()
    }

    onChangeMode(mode: string) {
        this.mode = mode

        if (mode === 'basis' || mode === 'concise') {
            Cache.set("UserPageMode", mode, {
                storage: "local"
            })
        }
    }
}

export default Component.build(new ToolView)
</script>

<style lang="less">
@import (reference) "@/style/utils.less";
@import (reference) "@/style/color.less";

.user-page {
    padding: 20px;

    .tool-bar-box {
        width: 100%;
        padding: 0 20px;
        height: 50px;

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

                >.item-box {
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

                >.activity {
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

    .user-box {
        width: 100%;
        margin-top: 20px;

        .flex;
        .flex-wrap;
        .flex-grow;

        >.item-box {
            position: relative;
            width: ~"calc(100% / 6 - 20px)";
            margin: 10px;
            background: #fff;

            .radius(15px);
            .border-box;
            .transition;
            .shadow(0 0 20px rgba(0,0,0,0.05));

            &:hover {
                .shadow(0 0 30px rgba(0,0,0,0.1));
            }

            @media (max-width: 2300px) {
                width: ~"calc(100% / 5 - 20px)";
            }

            @media (max-width: 1600px) {
                width: ~"calc(25% - 20px)";
            }

            @media (max-width: 1200px) {
                width: ~"calc(33.33% - 20px)";
            }

            @media (max-width: 1000px) {
                width: ~"calc(50% - 20px)";
            }

            @media (max-width: 500px) {
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

                >.item-box {
                    height: 40px;
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
                        font-size: 14px;
                        line-height: 20px;
                    }
                }
            }

            .event-box {
                position: relative;
                padding-left: 60px;

                .timeline-box {
                    position: absolute;
                    left: 20px;
                    top: 18px;
                    bottom: 18px;

                    &::after {
                        content: "";
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 8px;
                        height: 8px;
                        border: 3px solid #333;

                        .radius(50%);
                    }

                    &::before {
                        content: "";
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        width: 8px;
                        height: 8px;
                        border: 3px solid #333;

                        .radius(2px);
                    }

                    .line {
                        position: absolute;
                        top: 18px;
                        left: 6px;
                        bottom: 18px;
                        
                        border: 1px dashed #888;
                    }
                }

                .event-item-box {
                    .flex-column;

                    >.item-box {
                        min-height: 40px;
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
                            font-size: 14px;
                            line-height: 20px;
                        }
                    }
                }
            }

            .data-box {
                .flex-content(space-between);

                >.item-box {
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

            .info-box {
                .avatar-box {
                    width: 45px;
                    height: 45px;
                    padding: 1px;
                    border: 2px solid #2faaf7;
                    
                    .flex-shrink;
                    .shadow(0 0 10px rgb(0 0 0 / 20%)); 
                    .border-box;
                    .radius(50%);

                    .img {
                        .radius(50%);
                    }
                }

                .basic-box {
                    height: 45px;
                    margin: 0 12px;
                    overflow: hidden;

                    .flex;
                    .flex-column;
                    .flex-content(space-evenly);
                    .flex-grow;

                    .username-box {
                        .flex;
                        .flex-center-items;

                        .username {
                            font-size: 14px;
                            line-height: 14px;

                            .ellipsis;
                        }

                        .icon-box {
                            margin-left: 5px;
                            width: 14px;
                            height: 14px;
                        }
                    }

                    .uid {
                        color: #999;
                        font-size: 12px;
                    }
                }

                .status-box {
                    .flex;
                    .flex-center-items;
                    .flex-shrink;

                    >.item-box {
                        margin-right: 5px;
                        width: 40px;
                        height: 40px;
                        background: #f3f3f3;

                        .flex;
                        .flex-center-all;
                        .radius(10px);

                        &:last-child {
                            margin-right: 0;
                        }

                        .icon-box {
                            width: 20px;
                            height: 20px;
                        }
                    }
                }
            }
        }
    }

    .user-box-dark >.item-box {
        background: @dark_box;

        .child-box >.item-box {
            background: #2f3042;
        }
    }
}

.user-page-dark {
    .tool-bar-box {
        .mode-base .mode-box >.item-box:not(.activity) {
            background: @dark_box;
        }

        .operating-box .search-box .input{
            background: @dark_box;
        }
    }
}
</style>