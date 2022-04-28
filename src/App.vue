<template>
    <index-view v-if="loaded"></index-view>
    <login-view ref="login"></login-view>
    <comp-menu position="follow" click-type="right" cursor="initial" :value="setting_menu"></comp-menu>
</template>

<script lang="ts">
import IndexView from "@/views/Index.vue"
import LoginView from "@/views/Login.vue"

import Cache from "@/module/cache/cache"
import Request from "@/module/request/request"
import Utils from "./module/utils/utils"

import compMenu from "@/components/comp-menu.vue"
import Modal from "./module/interactive/modal"

// 设置菜单（右键）
import SettingMenu from "./config/setting_menu"

export default {
    data() {
        return {
            loaded: false,
            setting_menu: SettingMenu,
        }
    },

    components: {
        IndexView,
        LoginView,
        compMenu,
    },

    async created() {
        // 检验是否可连接主程序
        if (!(await Request.isConnection())) {
            return Modal.info(`<p style="text-align: center">无法连接后台主程序，请确认是否正常运行</p>`)
        }

        // 获取 设置 实体数据
        const setting = await Request.get<obj>("WEB://Setting/Config/Get?name=Setting")

        // 写入缓存
        Cache.set("setting_info", setting)

        // 设置页面标题
        document.title = (setting.name ? `${setting.name} - ` : "") + "管理后台"

        // 设置页面图标
        setting.icon &&
            Utils.getElement("link[rel='icon']", e => {
                e.setAttribute("href", setting.icon.url)
            })

        if (Cache.containsKey("admin_token")) this.loaded = true
        else
            window["Login"].do(() => {
                this.loaded = true
            })
    },
}
</script>

<style lang="less">
@import "./style/main.less";
</style>
