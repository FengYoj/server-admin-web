<template>
    <div>
        <div class="elem-operating">

            <button v-if="config.type === 'POPUP'" :style="{ background: config.background, color: config.color }" @click="onOperatingPopup(item, config.url, config.msg)">
                {{ config.title }}
            </button>

            <!-- 跳转页面 -->
            <button v-else-if="config.type === 'JUMP'" :style="{ background: config.background, color: config.color }" @click="onOperatingJump(item, config.url, config.msg)">
                {{ config.title }}
            </button>

            <!-- 发起请求 -->
            <button v-else-if="config.type === 'REQUEST'" :style="{ background: config.background, color: config.color }" @click="onOperatingRequest(config.method, item, config.url, config.msg)">
                {{ config.title }}
            </button>

            <!-- 提交表单 -->
            <button v-else-if="config.type === 'FORM'" :style="{ background: config.background, color: config.color }" @click="onDisplayForm(config, item)">
                {{ config.title }}
            </button>

            <!-- 上传文件 -->
            <button v-if="config.type === 'FILE'" :style="{ background: config.background, color: config.color }" @click="onOperatingFile">
                {{ config.title }}
            </button>
        </div>

        <comp-form ref="comp_form" @on-submit="$emit('on-refresh')"></comp-form>
    </div>
</template>

<script lang="ts">
import Request from "@/module/request/request"
import Message from "@/module/interactive/message"

import CompForm from "@/components/comp-form.vue"

export default {
    components: {
        CompForm,
    },

    data() {
        return {}
    },

    props: {
        config: Object,
        item: {
            type: Object,
            required: false,
        },
        api: String,
        page: {
            type: [Number, String],
            required: false,
        }
    },

    methods: {

        /**
         * 监听请求事件
         */
        async onOperatingRequest(method, item, url, msg) {
            this.onOperatingMsg(msg, () => {
                Request.method(method, this.getUrl(item, url)).then(() => {
                    Message.success("成功")
                    // 刷新数据
                    setTimeout(() => {
                        this.$emit("on-refresh")
                    }, 1000)
                })
            })
        },

        /**
         * 显示表单
         */
        onDisplayForm(conf, data) {
            this.$refs.comp_form.display({
                title: conf.title,
                method: conf.method,
                submitApi: this.getUrl(data, conf.url),
                structure: conf.forms,
                data,
            })
        },

        /**
         * 监听跳转事件
         */
        onOperatingJump(item, url, msg) {
            this.onOperatingMsg(msg, () => {
                window.open(this.getUrl(item, url))
            })
        },

        /**
         * 文件上传操作事件
         */
        onOperatingFile() {
            const input = document.createElement("input")

            input.type = "file"

            if (this.config.accept) {
                input.accept = this.config.accept
            }

            input.onchange = (evt: any) => {
                var formData = new FormData()

                formData.append("file", evt.target.files[0])

                Request.post(this.getUrl(), formData).then(() => {
                    Message.success(this.config.success || "上传成功", true)
                        .onTimeout(() => {
                            this.getData()
                        })
                        .build()
                })
            }

            input.click()
        },

        onOperatingPopup(data, url, msg) {
            this.onOperatingMsg(msg, () => {
                // Popup.open(this.getUrl(data, url))
            })
        },

        onOperatingMsg(msg, cb) {
            if (msg) {
                Message.info(msg.content, true)
                    .setButton({
                        confirm: msg.confirm,
                        cancel: msg.cancel,
                    })
                    .onConfirm(cb)
                    .build()
            } else cb()
        },

        /**
         * 解析 url
         */
        // getUrl(): string {
        //     return new Function(`return \`${this.config.url.replace(/&{(\w*)}/g, "${this.data.$1}")}\``).call({
        //         data: this.item || {},
        //     })
        // },

        /**
         * 解析 url
         */
        getUrl(data: obj, url: string): string {
            return new Function(`return \`${url.replace(/\*{(\w*)}/g, "${this.path.$1}").replace(/&{(\w*)}/g, "${this.data.$1}")}\``).call({
                path: {
                    api: this.api,
                    page: this.page,
                },
                data: this.item || {},
            })
        }
    },
}
</script>

<style lang="less">
@import (reference) "/src/style/utils.less";
@import (reference) "/src/style/color.less";

.elem-operating {
    button {
        cursor: pointer;
        padding: 5px 12px;
        color: #fff;
        font-size: 13px;
        border: 0;

        .flex;
        .transition;
        .radius(4px);

        &:hover {
            .shadow(0 0 10px rgba(0, 0, 0, 0.2));
        }
    }
}
</style>
