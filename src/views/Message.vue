<template>
    <div class="message-page" dark-class="message-page-dark">
        <div class="head-box">
            <div class="title-box">
                消息
            </div>
            <!-- <div class="number-box">
                <div class="info-box">
                    当前第 {{page}} 页，共 {{totalPages}} 页
                </div>
                <div class="pages-box">
                    <div class="previous-box" :class="{ available: page > 1 }" @click="onChangePages('previous')">
                        <elem-icon class="icon" name="previous_white" />
                    </div>
                    <div class="current-box">
                        <div class="select-base" id="SelectBase" tabindex="0" hidefocus="true" @focus="displayPageOptions = true" @blur="setTimeout(() => { displayPageOptions = false }, 100)">
                            <p class="number">{{page}}</p>
                            <elem-icon class="icon" name="select"></elem-icon>
                        </div>
                        <elem-options el="SelectBase" :data="1" @select="onSelectPages" direction="bottom"></elem-options>
                    </div>
                    <div class="next-box" :class="{ available: totalPages > page }" @click="onChangePages('next')">
                        <elem-icon class="icon" name="next_white" />
                    </div>
                </div>
            </div> -->
        </div>
        <div class="content-box">
            <div class="classify-box">
                <div class="menu-box">
                    <div class="item-box" :class="{ activity: this.menuActivity === 'ALL' }" @click="onChangeMenuActivity('ALL')">
                        <p class="title">所有</p>
                        <div class="count">{{allCount}}</div>
                    </div>
                    <div class="item-box" :class="{ activity: this.menuActivity === 'UNREAD' }" @click="onChangeMenuActivity('UNREAD')">
                        <p class="title">未读消息</p>
                        <div class="count unread">{{unreadCount}}</div>
                    </div>
                    <div class="item-box" v-for="(item, idx) in menu" :key="idx" :class="{ activity: this.menuActivity === item.source.name }" @click="onChangeMenuActivity(item.source.name)">
                        <p class="title">{{item.source.title}}</p>
                        <div class="count">{{item.count}}</div>
                    </div>
                </div>
            </div>
            <div class="message-box" @scroll="onScroll" ref="message_box">
                <div class="message-item" v-for="item in messages" :key="item.uuid" :uuid="item.uuid" @click="onOpenEntity(item.uuid)" :class="{ 'message-unread' : item.readStatus === 0 }">
                    <div class="type-box">
                        <elem-icon width="25px" height="25px" src="static/interactive/icon/" :name="getMessageIcon(item.type)" :dark="getMessageIcon(item.type, true)"></elem-icon>
                    </div>
                    <div class="info-box">
                        <div class="name">{{item.source.title}}</div>
                        <div class="info">{{item.message}}</div>
                    </div>
                    <div class="date-box">{{dateToString(item.createdDate)}}</div>
                    <div class="operating-box">
                        <div class="icon" @click.stop="onDelete(item.uuid)">
                            <elem-icon name="close" dark="close_white"></elem-icon>
                        </div>
                    </div>
                </div>

                <div class="empty" v-if="messages && messages.length <= 0">
                    <div class="icon">
                        <elem-icon width="18px" height="18px" src="static/interactive/message/icon/" name="success" dark="success_dark"></elem-icon>
                    </div>
                    <p class="text">暂无未读消息</p>
                </div>
            </div>

            <comp-entity ref="comp_entity" name="Message" title="消息"></comp-entity>
        </div>
    </div>
</template>

<script lang="ts">
import Component, { ComponentMethods } from "@/module/component/component"
import Request, { RequestPage } from "@/module/request/request"
import DateUtils from '@/module/utils/date'
import Message from '@/module/interactive/message'
import Utils from "@/module/utils/utils"

import elemIcon from '@/components/elem-icon.vue'
import elemOptions from '@/components/elem-options.vue'
import compEntity from '@/components/comp-entity.vue'


class MessageView extends ComponentMethods implements ComponentEntity {

    public title: string = "消息管理"

    private messages = null

    private page: number = 1
    private totalPages: number = 1

    private allCount: number = 0
    private unreadCount: number = 0

    private menuActivity: string = "ALL"

    private menu: obj[] = null

    private entityUuid: string = null

    private requestPage: RequestPage<obj>

    components = {
        elemIcon,
        elemOptions,
        compEntity
    }

    private dateToString = DateUtils.toString.bind(DateUtils)

    onScroll(evt: Event) {
        const e = Utils.getTarget<HTMLDivElement>(evt)
        
        if (e.clientHeight + e.scrollTop === e.scrollHeight) {
            this.requestPage.load()
        }
    }

    created() {
        this.getMessageInfo()

        this.requestPage = new RequestPage("ADMIN://Message/FindAllToPage", {
            load: false,
            onChange: (res) => {
                this.messages = res
            }
        })
    }

    mounted() {
        this.$refs.message_box.menu = [{
            id: "read",
            icon: "have_read",
            name: "标记已读",
            onCreate: (evt: obj, menu: obj) => {
                Utils.find<HTMLDivElement>(evt.path, c => c.classList.contains('message-item'), v => {
                    let e = v.data
                    let i = e.getAttribute("uuid")

                    if (Utils.isExist(i)) {
                        Utils.find<obj>(this.messages, c => c.uuid === i, v => {
                            if (v.data.readStatus === 0) {
                                menu.id = 'read'
                                menu.icon = "have_read"
                                menu.name = '标记已读'
                            } else {
                                menu.id = 'unread'
                                menu.icon = "unread"
                                menu.name = '标记未读'
                            }
                        })
                    }
                })
            },
            onClick: (evt: obj, id: string) => {
                Utils.find<HTMLDivElement>(evt.path, c => c.classList.contains('message-item'), v => {
                    let e = v.data
                    let i = e.getAttribute("uuid")

                    if (Utils.isExist(i)) {
                        this.markReadStatus(i, id === 'read')
                    }
                })
            }
        }, {
            id: "read_all",
            icon: "have_read",
            name: "标记所有已读",
            onClick: () => {
                this.markReadStatusAll(true)
            }
        }, {
            id: "unread_all",
            icon: "unread",
            name: "标记所有未读",
            onClick: () => {
                this.markReadStatusAll(false)
            }
        }]
    }

    onLoad(param: obj) {
        if (param.i) {
            this.requestPage.setUrl("ADMIN://Message/FindAllUnreadToPage")

            this.menuActivity = "UNREAD"
        } else {
            this.requestPage.setUrl("ADMIN://Message/FindAllToPage")

            this.menuActivity = "ALL"
        }
    }

    private markReadStatusAll(read: boolean): void {
        Request.post("ADMIN://Message/MarkReadStatusAll", { status: read ? 1 : 0 }).then(() => {
            
            Utils.each<obj>(this.messages, v => {
                v.readStatus = read ? 1 : 0
            })

            if (read) {
                // 未读数量清空
                this.unreadCount = 0
            } else {
                this.unreadCount = this.allCount
            }

            Message.success("标记成功")
        })
    }

    private markReadStatus(i: string, read: boolean): void {
        Request.post("ADMIN://Message/MarkReadStatus", { message: i, status: read ? 1 : 0 }).then(() => {
            
            Utils.find<obj>(this.messages, c => c.uuid === i, v => {
                v.data.readStatus = read ? 1 : 0
            })

            if (read) {
                this.unreadCount--
            } else {
                this.unreadCount++
            }

            Message.success("标记成功")
        })
    }

    private getMessageInfo() {
        Request.get<obj>("ADMIN://Message/FindInfo").then(res => {
            this.allCount = res.all
            this.unreadCount = res.unread
            this.menu = res.menu
        })
    }

    /**
     * 获取消息图标
     */
    private getMessageIcon(type: string, dark: boolean = false): string {
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
     * 监听菜单改变事件
     */
    public onChangeMenuActivity(source: string): void {
        var url: string

        switch (source) {
            case "ALL":
                url = "ADMIN://Message/FindAllToPage"
                break
            case "UNREAD":
                url = "ADMIN://Message/FindAllUnreadToPage"
                break
            default:
                url = "ADMIN://Message/FindAllBySourceToPage?source=" + source
        }

        this.requestPage.setUrl(url)

        this.menuActivity = source
    }

    /**
     * 监听删除事件
     */
    public onDelete(i: string): void {
        Message.info("确认删除该消息？", true)
            .onConfirm(() => {
                Request.delete("ADMIN://Message/Delete", { i }).then(() => {
                    Utils.each<obj>(this.messages, () => "delete", c => c.uuid === i)
                    Message.success("删除成功")
                })
            })
            .build()
    }

    public onOpenEntity(i: string): void {
        // 标记为已读
        Utils.find<obj>(this.messages, c => c.uuid === i, v => {
            let data = v.data

            if (data.readStatus === 0) {
                data.readStatus = 1
                // 未读数量自减
                this.unreadCount--
            }
        })
        this.$refs.comp_entity.open(i)
    }
}

export default Component.build(new MessageView)
</script>

<style lang="less">
@import (reference) "@/style/utils.less";
@import (reference) "@/style/color.less";

.message-page {
    background: #fff;
    height: 100%;
    overflow: hidden;

    .radius(10px);
    .border-box;
    .flex;
    .flex-column;
    .shadow(0 0 30px rgb(0 0 0 / 8%));

    >.head-box {
        width: 100%;
        padding: 0 30px;
        height: 70px;
        background: #fbfbfb;

        .border-position(bottom);
        .border-box;
        .flex;
        .flex-content(space-between);

        .title-box {
            height: 70px;
            font-size: 16px;
            font-weight: bold;
            color: #666;

            .flex;
            .flex-center-items;
        }

        .number-box {
            .flex;
            .flex-center-items;

            .info-box {
                margin-right: 30px;
                color: #888;
                font-size: 14px;
                letter-spacing: 1px;
                font-weight: 300;
            }

            .pages-box {
                height: 30px;
                background: #fff;

                .border;
                .flex;
                .shadow(0 0 5px rgba(0,0,0,0.1));
                .radius(5px);

                .current-box {
                    position: relative;
                    height: 100%;

                    .select-base {
                        cursor: pointer;
                        padding: 0 10px;
                        height: 100%;
                        background: #fff;

                        .flex;
                        .flex-center-all;

                        .icon {
                            margin-left: 10px;
                            width: 14px;
                            height: 14px;
                        }
                    }
                }

                .previous-box,.next-box {
                    cursor: no-drop;
                    width: 30px;
                    height: 30px;
                    background: #f3f3f3;

                    .flex;
                    .flex-center-all;

                    .icon {
                        width: 15px;
                        height: 15px;
                        -webkit-filter: contrast(0.5);
                                filter: contrast(0.5);
                    }
                }

                .previous-box {
                    .radius(5px 0 0 5px);
                }

                .next-box {
                    .radius(0 5px 5px 0);
                }

                .available {
                    cursor: pointer;
                    background: #2faaf7;

                    .icon {
                        -webkit-filter: initial;
                                filter: initial;
                    }
                }
            }
        }
    }

    .content-box {
        position: relative;
        width: 100%;
        overflow: hidden;

        .flex-grow;
        .flex;

        .classify-box {
            height: 100%;
            width: 250px;

            .border-position(right);
            .flex-shrink;

            .menu-box {
                padding: 15px 30px;

                >.item-box {
                    cursor: pointer;
                    width: 100%;
                    margin: 15px 0;
                    filter: grayscale(1);

                    .transition;

                    &:hover {
                        filter: grayscale(0);
                    }

                    .flex;
                    .flex-center-items;
                    .flex-content(space-between);

                    .title {
                        font-size: 14px;
                        color: #2faaf7;
                        white-space: nowrap;
                    }

                    .count {
                        padding: 0 5px;
                        height: 20px;
                        line-height: 20px;
                        min-width: 10px;
                        color: #2faaf7;
                        font-size: 12px;

                        .radius(10px);
                        .flex;
                        .flex-center-all;
                    }

                    .unread {
                        color: #fff;
                        background: #2faaf7;
                    }
                }

                >.activity {
                    filter: grayscale(0);
                }
            }
        }

        .message-box {
            height: 100%;

            .flex-grow;
            .scroll-y(4px);

            >.message-item {
                position: relative;
                width: 100%;
                height: 45px;
                padding: 15px 0;
                cursor: pointer;
                
                .border-position(bottom);
                .flex;
                .flex-center-items;

                &:last-child {
                    margin-bottom: 0;
                    border-bottom: none;
                }

                &:hover {
                    .operating-box {
                        transform: translateX(0);
                    }

                    .date-box {
                        opacity: 0;
                    }
                }

                .type-box {
                    position: relative;
                    padding: 0 30px;
                    height: 100%;
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

                .date-box {
                    padding: 0 20px;
                    font-size: 12px;

                    .flex-shrink;
                    .transition;
                }

                .operating-box {
                    padding: 0 25px;
                    transform: translateX(100%);

                    .transition;
                    .flex;
                    .flex-center-all;
                    .absolute(0, 0, 0, initial);

                    .icon {
                        width: 15px;
                        height: 15px;
                    }
                }
            }

            >.message-unread .type-box {
                &::after {
                    content: "";
                    width: 3px;
                    background: #2faaf7;
                    
                    .radius(3px);
                    .absolute(0, initial, 0, 0);
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
        }
    }
}

.message-page-dark {
    background: @dark_box;

    .head-box {
        background: @dark_box;
    }
}
</style>