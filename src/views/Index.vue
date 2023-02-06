<template>
    <div class="index-page" dark-class="index-page-dark">
        <!-- 移动端菜单 -->
        <nav id="menu-mobile" style="display: none">
            <div id="panel-menu">
                <ul>
                    <li v-for="(menu, idx) in menus" :key="idx">
                        <a :href="menu.href">{{ menu.name }}</a>
                        <ul v-if="menu.child" v-html="getMobileMenuChild(menu.child)"></ul>
                    </li>
                </ul>
            </div>
        </nav>

        <!-- 左侧栏 PC 菜单 -->
        <div class="sidebar">
            <div class="info-box">
                <img class="icon" v-if="setting_info.icon" :src="setting_info.icon.url" />
            </div>
            <div class="main-menu-pc">
                <div class="menu-item" v-for="(menu, idx) in menus" :key="idx" :class="{ 'menu-item-activity': d_menu_root === menu.root }">
                    <a class="menu-item-box" :href="menu.href" :title="menu.name">
                        <img class="icon" :src="'static/icon/menu_icon/' + menu.icon" />
                    </a>
                    <div class="menu-child-base menu-child-box" v-if="menu.child" v-html="getMenuChild(menu.child)" @click="hideMenuChild()"></div>
                </div>
            </div>
            <div class="main-menu-pc">
                <div class="menu-item" v-for="(menu, idx) in submenus" :key="idx" :class="{ 'menu-item-activity': d_menu_root === menu.root }">
                    <a class="menu-item-box" :href="menu.href" :title="menu.name">
                        <img class="icon" :src="'static/icon/menu_icon/' + menu.icon" />
                    </a>
                    <div class="menu-child-base menu-child-box" v-if="menu.child" v-html="getMenuChild(menu.child)" @click="hideMenuChild()"></div>
                </div>
            </div>
        </div>

        <!-- <div class="secondary-page">
            <div class="smart-assistant">
                <div class="icon-box">
                    <elem-icon name="smart"></elem-icon>
                </div>
                <div class="speak-content">
                    您好，我是您的智能助理 Jimmy !
                </div>
            </div>
            <div class="quick-entry-box">
                <div class="menu-box">
                    <div class="item-box" v-for="(item, idx) in 5" :key="idx">
                        <div class="icon-box">
                            <img class="icon" src="static/icon/menu_icon/data.svg" alt="">
                        </div>
                        <p class="name">语言包</p>
                    </div>
                </div>
            </div>
        </div> -->

        <div class="column-box">
            <div class="head-box">
                <div class="page-name">
                    <div class="icon">
                        <elem-icon src="static/icon/menu_icon/" :key="page_icon" :name="page_icon"></elem-icon>
                    </div>
                    <p class="name">{{ page_title }}</p>
                </div>
                <div class="operating-box">
                    <div class="search-box" id="SearchBox">
                        <div class="search-base" :class="{ 'search-activity': display_search }">
                            <div class="search">
                                <div class="icon-box">
                                    <elem-icon name="search_white"></elem-icon>
                                </div>
                                <div class="search-input">
                                    <input placeholder="搜索功能模块" @blur="onSearchInputBlur" @focus="onSearchInputFocus" @input="onSearchInput" @keyup.enter="onSearchSubmit" />
                                </div>
                            </div>
                            <div class="search-result" v-show="display_search && search_result && search_result.length > 0">
                                <a class="result-item" v-for="(item, idx) in search_result" :key="idx" :href="item.href">
                                    <p class="name">{{ item.title }}</p>
                                    <p class="path">{{ item.href }}</p>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="btn-box" @click="jump('/message')">
                        <elem-icon class="icon" name="notice_white" hover="#2faaf7" width="20px" height="20px"></elem-icon>
                    </div>
                    <div class="btn-box">
                        <elem-icon class="icon" name="setting_white" hover="#2faaf7" width="20px" height="20px"></elem-icon>
                        <comp-menu :value="settingMenu" @select="onSelectSettingMenu"></comp-menu>
                    </div>
                    <div class="user-box" v-if="userinfo && userinfo.avatar">
                        <div class="avatar-box">
                            <img class="avatar" :src="userinfo.avatar.url" />
                            <div class="status"></div>
                        </div>
                        <div class="btn-icon">
                            <elem-icon name="arrow_bottom_white"></elem-icon>
                        </div>
                        <comp-menu :value="userMenu" @select="onSelectUserMenu"></comp-menu>
                    </div>
                </div>
            </div>

            <!-- 页面内容 -->
            <div class="content-box" dark-class="content-dark" id="Content" :class="{ 'online-activity': isDisplayOnlineServicePage }">
                <div class="content-scroll" @scroll="onScroll">
                    <router-view v-slot="{ Component }">
                        <keep-alive>
                            <component :is="Component" />
                        </keep-alive>
                    </router-view>
                </div>
            </div>
        </div>

        <page-about></page-about>
    </div>
</template>

<script lang="ts">
import Utils from "@/module/utils/utils"
import Component, { ComponentMethods } from "@/module/component/component"
import Cache from "@/module/cache/cache"
import Href from "@/module/config/href"
import Theme from "@/module/theme/theme"
import Message from "@/module/interactive/message"

import elemIcon from "@/components/elem-icon.vue"
import elemOptions from "@/components/elem-options.vue"
import compMenu from "@/components/comp-menu.vue"
import pageAbout from "@/components/page-about.vue"

import Version from "@/module/version/version"

class Framework {
    private static index: IndexView

    public static setTitle(title: string, icon?: string): void {
        this.index.page_title = title
        this.index.page_icon = icon || "data"
    }

    public static setIndex(index: IndexView) {
        this.index = index
    }
}

class IndexView extends ComponentMethods implements ComponentEntity {
    public page_title: string = "首页"

    public page_icon: string = "data"

    public d_menu_root: string = null

    public menus: MenuObj[] = null

    public submenus = null

    public userMenu = [
        {
            title: "账号管理",
            sub: [
                {
                    id: "edit_password",
                    icon: "password",
                    name: "修改密码",
                },
                {
                    id: "sign_out",
                    icon: "sign_out",
                    name: "退出登录",
                },
            ],
        },
    ]

    public settingMenu = [
        {
            title: "主题",
            prompt: "自动模式下，将根据系统主题自动切换浅色模式或深色模式。",
            sub: [
                {
                    id: "auto_theme",
                    icon: "auto",
                    name: "自动模式",
                },
                {
                    id: "light_theme",
                    icon: "light",
                    name: "浅色模式",
                },
                {
                    id: "dark_theme",
                    icon: "dark",
                    name: "深色模式",
                },
            ],
        },
        {
            title: "系统",
            sub: [
                {
                    id: "update",
                    icon: "update",
                    name: "检查更新",
                },
                {
                    id: "version",
                    icon: "about",
                    name: "版本",
                },
            ],
        },
    ]

    data() {
        return {
            online_service_user_id_activity: null,

            // 是否显示在线服务页面
            isDisplayOnlineServicePage: false,

            // 在线服务菜单
            online_service_menu: "new",

            chats: [
                {
                    isCurrent: false,
                    type: "user",
                    name: "晟浩科技",
                    date: "2019-08-22 10:00",
                    content: "测试内容",
                },
                {
                    isCurrent: true,
                    type: "admin",
                    name: "晟浩科技",
                    date: "2019-08-22 10:00",
                    content: "测试内容",
                },
            ],

            search_result: null,

            display_search: false,

            setting_info: Cache.get("setting_info"),

            userinfo: Cache.get("userinfo"),
        }
    }

    components = {
        elemIcon,
        compMenu,
        elemOptions,
        pageAbout,
    }

    watch = {
        $route: async function (to) {
            this.processRoute(to)
        },
    }

    created() {
        Framework.setIndex(this)

        Href.get().then(res => {
            this.menus = Utils.copy(res.menus)
            this.submenus = Utils.copy(res.submenus)

            setTimeout(() => {
                this._setMenuChildBoxStyle()
            })
        })

        Cache.onGet("userinfo", v => {
            this.userinfo = v
        })
    }

    mounted() {
        this.processRoute()
    }

    /**
     * 监听窗口大小变化事件
     */
    onResize() {
        this._setMenuChildBoxStyle()
    }

    /**
     * 监听内容组件滚动事件
     */
    onScroll(evt: obj): void {
        const e: HTMLDivElement = evt.target
        var wScrollY = e.scrollTop // 当前滚动条位置
        var wInnerH = e.clientHeight // 设备窗口的高度（不会变）
        var bScrollH = e.scrollHeight // 滚动条总高度
        if (wScrollY + wInnerH >= bScrollH) {
            const page = this.$route.matched[0].instances.default
            // 触发触底事件
            page.onReachBottom && page.onReachBottom()
        }
    }

    processRoute(route?: obj) {
        // 关闭所有消息框
        Message.closeAll()

        Utils.wait(() => {
            if (typeof route === "undefined") {
                route = this.$route
            }

            if (route.matched.length <= 0) {
                return
            }

            const page = route.matched[0].instances.default
            // 设置页面标题
            this.page_title = (typeof page.title === "function" ? page.title() : page.title) || "首页"
            // 设置页面图标
            this.page_icon = page.icon || "data"
            // 写入框架方法
            if (typeof page.framework === "undefined") {
                page.framework = Framework
            }
            // 触发 onLoad 事件
            page.onLoad && page.onLoad(page.getParams())
        })
    }

    onSelectSettingMenu(evt: CompEvent<any>) {
        switch (evt.value) {
            case "auto_theme":
                Theme.changeTheme("auto")
                break
            case "dark_theme":
                Theme.changeTheme("dark")
                break
            case "light_theme":
                Theme.changeTheme("light")
                break
            case "update":
                Version.check()
                break
            case "version":
                Version.get().then(res => {
                    Message.info(`管理端版本：${res.admin}，框架版本：${res.framework}`)
                })
        }
    }

    /** 设置子菜单样式 */
    private _setMenuChildBoxStyle() {
        Utils.getElementAll<HTMLDivElement>(".menu-child-base", e => {
            const p = e.getBoundingClientRect()

            if (p.height + p.y > window.innerHeight) {
                if (!e.classList.contains("menu-child-box-bottom")) {
                    e.classList.add("menu-child-box-bottom")
                }
            } else {
                if (e.classList.contains("menu-child-box-bottom")) {
                    e.classList.remove("menu-child-box-bottom")
                }
            }
        })
    }

    /**
     * 获取子菜单模板
     * @param child 子菜单
     * @param isBase 是否添加 base
     */
    public getMenuChild(child: MenuObj[], isBase?: boolean): string {
        var childs = ""

        Utils.each(child, v => {
            childs += `
                <div class="menu-child-item">
                    <a class="menu-child-item-box" ${v.href ? 'href="' + v.href + '" @click="hideMenuChild()"' : ""}>
                        <img class="menu-child-icon" src="static/icon/menu_icon/${v.icon}" />
                        <p class="menu-child-name">${v.name}</p>
                    </a>
                    ${v.child ? this.getMenuChild(v.child, true) : ""}
                </div>
            `
        })

        const box = `<div class="menu-child-box">${childs}</div>`

        return isBase ? `<div class="menu-child-base">${box}</div>` : box
    }

    /**
     * 获取移动端子菜单模板
     * @param child 子菜单
     */
    public getMobileMenuChild(child: MenuObj[], isBase?: boolean): string {
        var childs = ""

        Utils.each(child, v => {
            childs += `
                <li>
                    <a ${v.href ? 'href="' + v.href + '"' : ""}>${v.name}</a>
                    ${v.child ? this.getMobileMenuChild(v.child, true) : ""}
                </li>
            `
        })

        return isBase ? `<ul>${childs}</ul>` : childs
    }

    public hideMenuChild() {
        const dom = document.querySelectorAll<HTMLDivElement>(".menu-child-box")

        if (dom.length > 0) {
            Utils.eachNode(dom, v => {
                v.hidden = true
                // 使用延时将子菜单可显示状态
                setTimeout(() => {
                    v.hidden = false
                }, 100)
            })
        }
    }

    /**
     * 监听用户菜单
     * @param evt 值
     */
    onSelectUserMenu(evt: obj): void {
        const value = evt.value

        switch (value) {
            case "sign_out":
                Message.info("确认退出当前账号？", true)
                    .onConfirm(() => {
                        // 移除所有缓存
                        Cache.clear()
                        // 刷新页面
                        window.location.reload()
                    })
                    .build()
                break
            case "edit_password":
                this.jump("/table?name=admin_account")
        }
    }
}

interface MenuObj {
    icon: string
    href?: string
    root?: string
    component?: string
    name?: string
    child?: MenuObj[]
}

export default Component.build(new IndexView())
</script>

<style lang="less">
@import (reference) "@/style/utils.less";
@import (reference) "@/style/color.less";

// @import "mmenu.css";

.mm-page {
    position: absolute;
    min-height: 100%;
    width: 100%;
}

.index-page {
    overflow: hidden;
    background: linear-gradient(to bottom right, #117bbd, #00293e 90%);

    .flex;
    .fixed(0, 0, 0, 0);

    .sidebar {
        margin: 20px 0 20px 20px;
        width: 100px;
        z-index: 50;
        background: #143f51;

        .border-box;
        .flex-shrink;
        .shadow(0 0 30px rgba(0, 0, 0, 0.3));
        .radius(10px);
        .flex;
        .flex-column;
        .flex-center-items;

        @media (max-width: 700px) {
            display: none;
        }

        > .info-box {
            width: 100%;
            height: 80px;

            .flex;
            .flex-center-all;

            .icon {
                width: 35px;
                height: 35px;
            }
        }

        .main-menu-pc {
            margin: 40px 0;
            width: 100%;

            .flex();
            .flex-column();

            .menu-item {
                position: relative;
                width: 100%;
                height: 65px;
                margin: 5px 0;

                .menu-item-box {
                    height: 100%;
                    width: 100%;

                    .flex();
                    .flex-center-all();

                    .icon {
                        filter: grayscale(100%);
                        width: 25px;
                        height: 25px;

                        .transition;
                    }
                }

                .menu-child-base {
                    visibility: hidden;
                    opacity: 0;

                    .absolute(0, initial, initial, 100%);
                    .transition(0.2s);

                    &::after {
                        content: "";
                        width: 0;
                        height: 0;
                        border-top: 8px solid transparent;
                        border-right: 12px solid #90c4e2;
                        border-bottom: 8px solid transparent;

                        .absolute(25px, initial, initial, 8px);
                    }

                    .menu-child-box {
                        position: relative;
                        background: #fff;
                        margin-left: 20px;

                        .shadow(0 0 20px rgba(0, 0, 0, 0.1));
                        .radius(6px);

                        .menu-child-item {
                            position: relative;
                            height: 65px;

                            &:last-child {
                                > .menu-child-item-box::after {
                                    border-bottom: initial;
                                }
                            }

                            &:hover {
                                > .menu-child-base {
                                    visibility: initial;
                                    opacity: 1;
                                }

                                > .menu-child-item-box {
                                    .menu-child-icon {
                                        filter: initial;
                                    }
                                    .menu-child-name {
                                        color: #00a2ff;
                                    }
                                }
                            }

                            .menu-child-item-box {
                                position: relative;
                                height: 100%;
                                padding: 0 30px;

                                .flex();
                                .flex-center-items();

                                &::after {
                                    content: "";
                                    border-color: #f3f3f3;

                                    .border-position(bottom);
                                    .absolute(initial, 20px, 0, 20px);
                                }

                                .menu-child-icon {
                                    filter: grayscale(1);
                                    width: 22px;
                                    height: 22px;

                                    .flex-shrink();
                                }

                                .menu-child-name {
                                    margin: 0 20px;
                                    color: #666;
                                    font-size: 14px;
                                    letter-spacing: 2px;
                                    white-space: nowrap;
                                    overflow: hidden;
                                    text-overflow: ellipsis;

                                    .flex-grow();
                                }
                            }
                        }
                    }
                }

                .menu-child-box-bottom {
                    .absolute(initial, initial, 0, 100%);

                    &::after {
                        .absolute(initial, initial, 25px, 8px);
                    }
                }

                &:hover {
                    .icon {
                        filter: grayscale(0);
                    }

                    > .menu-child-base {
                        visibility: initial;
                        opacity: 1;
                    }
                }
            }

            .menu-item-activity {
                &::after {
                    content: "";
                    background: #00a2ff;
                    width: 2.25px;
                    border-radius: 2px;

                    .absolute(10px, initial, 10px, 0);
                }

                .menu-item-box .icon {
                    filter: grayscale(0);
                }
            }
        }
    }

    > .secondary-page {
        width: 600px;
        height: 100%;

        .smart-assistant {
            width: 100%;
            height: 50%;
            background: #000;
            padding: 20%;

            .border-box;

            .icon-box {
                width: 30px;
                height: 30px;
            }

            .speak-content {
                margin: 20px 0;
                color: #fff;
                font-size: 18px;
            }
        }

        .quick-entry-box {
            width: 100%;
            height: 50%;
            background: #fff;
            padding: 20%;
            overflow: auto;

            .border-box;

            .menu-box {
                .flex;
                .flex-wrap;

                > .item-box {
                    margin: 10px;
                    width: 50px;
                    height: 80px;

                    .icon-box {
                        width: 50px;
                        height: 50px;
                        padding: 10px;
                        background: #fff;

                        .border;
                        .border-box;
                        .radius(10px);
                        .shadow(0 0 10px rgba(0, 0, 0, 0.05));

                        .icon {
                            width: 100%;
                            height: 100%;
                        }
                    }

                    .name {
                        line-height: 30px;
                        font-size: 14px;
                        text-align: center;
                        color: #333;
                    }
                }
            }
        }

        .quick-view-box {
            width: 100%;
            height: 50%;
            background: #fff;
        }
    }

    > .column-box {
        overflow: hidden;

        .flex;
        .flex-column;
        .flex-grow;

        > .head-box {
            height: 100px;
            z-index: 50;
            padding: 20px 20px 0 20px;
            margin: 0 20px;

            .flex-shrink;
            .border-box;
            .flex;
            .flex-center-items;
            .flex-content(space-between);

            .page-name {
                white-space: nowrap;

                .flex;
                .flex-center-items;

                .icon {
                    width: 23px;
                    height: 23px;
                }

                .name {
                    margin-left: 20px;
                    font-size: 20px;
                    color: #f3f3f3;
                }
            }

            .operating-box {
                padding-left: 20px;

                .flex-shrink;
                .flex;
                .flex-center-items;

                .btn-box {
                    width: 35px;
                    height: 35px;
                    margin-left: 15px;
                    cursor: pointer;

                    .flex;
                    .flex-center-all;

                    &:first-child {
                        margin-left: initial;
                    }
                }

                .search-box {
                    position: relative;
                    width: 250px;
                    height: 35px;
                    margin-right: 20px;

                    @media (max-width: 700px) {
                        width: 35px;
                        height: 35px;
                        margin-right: 0;
                    }

                    .search-base {
                        overflow: hidden;
                        background: #143f51;

                        .radius(8px);
                        .absolute(0, 0, initial, 0);

                        .search {
                            width: 100%;
                            height: 35px;

                            .flex();
                            .flex-center-items();

                            .icon-box {
                                width: 20px;
                                height: 20px;
                                margin: 0 10px;
                            }

                            .search-input {
                                font-size: 14px;
                                padding-right: 20px;

                                .flex-grow();

                                @media (max-width: 700px) {
                                    display: none;
                                }

                                input {
                                    width: 100%;
                                    font-size: 14px;
                                    color: #fff;

                                    &::-webkit-input-placeholder {
                                        color: #e3e3e3;
                                    }
                                }
                            }
                        }

                        .search-result {
                            width: 100%;
                            max-height: 300px;
                            border-top: 1px solid #e3e3e3;

                            .scroll-y;

                            .result-item {
                                padding: 0 20px;
                                height: 40px;
                                border-bottom: 1px solid #e3e3e3;

                                .flex;
                                .flex-center-items;
                                .flex-content(space-between);

                                &:last-child {
                                    border-bottom: initial;
                                }

                                &:hover {
                                    color: #000;
                                    background: #f3f3f3;
                                }

                                p {
                                    color: #000;
                                    overflow: hidden;
                                    white-space: nowrap;
                                    text-overflow: ellipsis;
                                    font-size: 13px;
                                }

                                .name {
                                    margin-right: 10px;

                                    .flex-shrink;
                                }
                            }
                        }
                    }

                    .search-activity {
                        border-color: #b3b3b3;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        z-index: 20;
                    }
                }

                .user-box {
                    cursor: pointer;
                    margin-left: 20px;

                    .flex;
                    .flex-items(flex-end);

                    .avatar-box {
                        position: relative;
                        width: 30px;
                        height: 30px;

                        .avatar {
                            .radius(50%);
                            .shadow;
                        }

                        .status {
                            width: 6px;
                            height: 6px;
                            background: green;
                            border: 1px solid #fff;

                            .radius(50%);
                            .absolute(initial, 0, 0, initial);
                        }
                    }

                    .btn-icon {
                        width: 10px;
                        height: 10px;
                        margin-left: 5px;
                    }
                }
            }
        }

        > .content-box {
            margin: 10px 40px 20px 40px;
            background: #fff;
            overflow: hidden;

            .shadow(5px 5px 10px rgba(0,0,0,0.2));
            .radius(8px);
            .flex-grow;

            .content-scroll {
                width: 100%;
                height: 100%;

                .scroll-y(5px);
            }

            @media (max-width: 700px) {
                margin: 10px 20px 20px 20px;
            }

            @media (max-width: 400px) {
                margin: 10px 10px 10px 10px;
            }
        }
    }

    .online-activity {
        right: 400px;

        @media (max-width: 1300px) {
            right: 0;
        }
    }

    // 在线服务
    .online-service {
        width: 400px;
        z-index: 50;

        // .shadow();
        .fixed(0, -400px, 0, initial);
        .transition();

        // 把手
        .knob {
            cursor: pointer;
            width: 20px;
            height: 80px;
            background: #00a2ff;
            margin-top: -40px;

            .shadow();
            .radius(10px 0 0 10px);
            .absolute(50%, initial, initial, -20px);
            .flex();
            .flex-center-all();
            .transition();

            img {
                width: 15px;
                height: 15px;
            }
        }

        .box {
            position: relative;
            height: ~"calc(100% - 60px)";
            padding: 30px 40px;
            background: #f6f5fa;
            z-index: 1;

            .flex();
            .flex-column();

            .service-menu {
                width: 100%;

                .flex-shrink();
                .flex();
                .flex-center-items();

                .menu-item {
                    cursor: pointer;
                    position: relative;
                    margin-right: 20px;
                    height: 40px;

                    .flex();
                    .flex-center-all();

                    &::after {
                        content: "";
                        background: #00a2ff;
                        height: 2px;
                        width: 0;

                        .transition(0.2s);
                        .radius(2px);
                        .absolute(initial, initial, 0, 0);
                    }

                    &:hover {
                        &::after {
                            width: 30px;
                        }

                        p {
                            color: #000;
                        }
                    }

                    p {
                        color: #b6b2c4;
                        font-size: 18px;
                        letter-spacing: 2px;
                        text-indent: 2px;
                        font-weight: bold;

                        .transition(0.2s);
                    }
                }

                .menu-item-activity {
                    &::after {
                        width: 30px;
                    }

                    p {
                        color: #000;
                    }
                }

                .online-quantity {
                    width: 40px;
                    height: 35px;
                    background: #fff;

                    .radius(5px);
                    .flex();
                    .flex-center-all();

                    p {
                        font-size: 12px;
                        letter-spacing: 1px;
                        color: #00a2ff;
                        font-weight: bold;
                    }
                }
            }

            .new-message {
                width: 100%;

                .flex-grow();
                .flex();
                .flex-column();

                .user-fast {
                    margin: 20px 0;
                    width: 100%;
                    flex-wrap: wrap;

                    .flex-shrink();
                    .flex();

                    .user-item {
                        cursor: pointer;
                        position: relative;
                        margin: 9px 17.5px 9px 0;
                        width: 50px;
                        height: 50px;
                        overflow: hidden;

                        .radius(15px);
                        .flex();
                        .flex-center-all();

                        &::after {
                            content: "";

                            .radius(15px);
                            .absolute(-2px,-2px,-2px,-2px);
                        }

                        &:nth-child(5n + 0) {
                            margin-right: 0;
                        }
                    }

                    .user-item-activity::after {
                        border: 2px solid #00a2ff;
                    }
                }

                .chat-window {
                    width: 100%;
                    border-top: 1px solid #e3e3e3;

                    .flex-grow();
                    .flex();
                    .flex-column();

                    .title {
                        padding: 20px 0;
                        height: 50px;

                        .flex();
                        .flex-center-items();
                        .flex-shrink(0);

                        p {
                            font-size: 25px;
                            letter-spacing: 3px;
                            font-weight: bold;
                        }
                    }

                    .dialogue-box {
                        .flex-grow(1);
                        .scroll-y;

                        .item {
                            padding: 10px 0;

                            .flex-items(flex-start);
                            .flex-column();
                            .flex();

                            .info {
                                height: 40px;

                                .flex();

                                .avatar {
                                    width: 40px;
                                    height: 40px;
                                    background: #fff;
                                    overflow: hidden;

                                    .radius(10px);
                                    .shadow(0 0 10px rgba(0, 0, 0, 0.1));
                                }

                                .name-date {
                                    padding-left: 10px;

                                    .flex();
                                    .flex-column();
                                    .flex-center-content();

                                    .name {
                                        font-size: 16px;
                                        letter-spacing: 2px;
                                        font-weight: bold;
                                        padding-bottom: 2px;
                                        color: #232d40;
                                    }

                                    .date {
                                        font-weight: bold;
                                        letter-spacing: 1px;
                                        font-size: 8px;
                                        color: #a3a8b3;
                                    }
                                }
                            }

                            .chat-con {
                                float: left;
                                padding: 15px 20px;
                                margin: 10px 0 0 50px;
                                background: #ecf3fa;
                                color: #727e99;
                                letter-spacing: 2px;

                                .radius(10px);

                                p {
                                    word-break: break-word;
                                }
                            }
                        }

                        .current {
                            .flex-items(flex-end);

                            .info {
                                flex-direction: row-reverse;
                            }

                            .name-date {
                                padding-left: 0;
                                padding-right: 10px;
                                text-align: right;
                            }

                            .chat-con {
                                float: right;
                                margin: 10px 50px 0 0;
                                background: #00a2ff;
                                color: #fff;
                            }
                        }
                    }

                    .input-box {
                        height: 40px;
                        padding: 5px;
                        margin-top: 30px;
                        background: #edf3fb;

                        .radius(10px);
                        .flex-shrink(0);

                        .input-form {
                            height: 100%;

                            .flex();

                            .input {
                                height: 100%;
                                padding: 0 20px 0 10px;

                                .flex();
                                .flex-center-items();
                                .flex-grow(1);

                                input {
                                    width: 100%;
                                    font-size: 18px;
                                }
                            }

                            .submit {
                                cursor: pointer;
                                width: 40px;
                                height: 40px;
                                background: #00a2ff;
                                border: 0;

                                .radius(10px);
                                .flex-shrink(0);

                                img {
                                    width: 25px;
                                    height: 25px;
                                    padding: 7.5px;
                                }
                            }
                        }
                    }
                }
            }

            .user-lists {
                margin-top: 20px;
                width: 100%;

                .flex-grow();
                .scroll-y;

                .user-item {
                    cursor: pointer;
                    width: 100%;
                    height: 90px;

                    .flex();
                    .flex-center-items();

                    .avatar {
                        width: 60px;
                        height: 60px;
                        overflow: hidden;

                        .radius(10px);
                        .flex-shrink();
                    }

                    .info {
                        margin-left: 20px;
                        height: 100%;
                        border-bottom: 1px solid #e3e3e3;

                        .flex-grow();
                        .flex();
                        .flex-column();
                        .flex-center-content();

                        .username-time {
                            width: 100%;

                            .flex();
                            .flex-center-items();
                            .flex-content(space-between);

                            .username {
                                padding-right: 10px;
                                font-size: 18px;
                                letter-spacing: 1px;
                                font-weight: bold;
                                overflow: hidden;
                                text-overflow: ellipsis;

                                .flex-grow();
                            }

                            .time {
                                font-size: 12px;
                                letter-spacing: 1px;
                                color: #666;

                                .flex-shrink();
                            }

                            p {
                                white-space: nowrap;
                            }
                        }

                        .chat-content {
                            padding-top: 5px;
                            width: 100%;

                            .flex();
                            .flex-center-items();

                            p {
                                max-width: 100%;
                                white-space: nowrap;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                color: #666;
                                letter-spacing: 1px;
                                font-size: 16px;
                            }
                        }
                    }
                }
            }
        }
    }

    .online-open-feedback:hover {
        transform: translateX(-10px);
    }

    .online-service-display {
        transform: translateX(-400px);
        border-left: 1px solid #e3e3e3;

        @media (max-width: 1300px) {
            border-left: initial;

            .shadow;
        }
    }
}

.index-page-dark {
    .sidebar .main-menu-pc .menu-item .menu-child-base {
        &::after {
            border-right: 12px solid #42455e;
        }

        .menu-child-box {
            background: #1e2329;

            .menu-child-item .menu-child-item-box {
                &::after {
                    border-color: #272938;
                }

                .menu-child-name {
                    color: rgb(230, 230, 230);
                }
            }
        }
    }
}
</style>
