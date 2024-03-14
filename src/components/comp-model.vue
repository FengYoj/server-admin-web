<template>
    <div class="comp-model-page" :class="display ? 'show' : 'hide'" ref="page_box">
        <div class="content-page" :style="{ width: width, height: height }">
            <div class="head-box">
                <p class="title">{{ title }}</p>
                <div class="head-operate">
                    <slot name="head-operate"></slot>
                </div>
                <div class="close-btn" @click="onClose">
                    <elem-icon name="close" width="15px" height="15px"></elem-icon>
                </div>
            </div>
            <div class="scroll-content" :style="{ 'overflow-y': scroll ? 'auto' : 'hidden' }">
                <slot :close="onClose"></slot>
            </div>
            <div class="bottom-operate" ref="bottom_operate">
                <slot name="operate" :close="onClose"></slot>
            </div>
        </div>
    </div>
</template>

<script>
import Utils from "@/module/utils/utils"
import ElemIcon from "@/components/elem-icon.vue"

export default {
    components: { ElemIcon },

    data() {
        return {
            display: false,
        }
    },

    props: {
        title: String,

        width: {
            type: String,
            default: "400px",
        },
        height: {
            type: String,
            default: "90%",
        },
        // 持续显示，加载即显示
        continued: {
            type: Boolean,
            default: false,
        },
        // 是否可滚动
        scroll: {
            type: Boolean,
            default: true,
        },
    },

    created() {
        var cache = window["COMP_MODEL_WINDOWS"]

        if (!cache || !(cache instanceof Array)) {
            cache = []
        }

        this.winow_config = {
            v: this,
            id: Utils.getUuid(),
            status: false,
        }

        Object.defineProperty(this.winow_config, "status", {
            set: v => {
                this.display = v
            },
            get: () => {
                return this.display
            },
        })

        cache.push(this.winow_config)

        this.windows = window["COMP_MODEL_WINDOWS"] = cache
    },

    mounted() {
        // 移动到 body 层级，不受父组件样式影响
        document.body.appendChild(this.$el)
        // 持续显示，加载完毕即显示
        this.continued && this.onDisplay()
    },

    methods: {
        /**
         * 判断当前窗口是否显示中
         */
        isDisplay() {
            return this.winow_config.status
        },

        /** 显示 */
        onDisplay() {
            for (let i = 0, ws = this.windows; i < ws.length; i++) {
                let w = ws[i]

                if (w.status) {
                    w.status = false
                    // 记录将它关闭的窗口ID
                    w.close_id = this.winow_config.id
                }
            }

            this.winow_config.status = true
        },

        /** 关闭 */
        onClose() {
            this.display = false

            for (let i = 0, ws = this.windows; i < ws.length; i++) {
                let w = ws[i]
                // 判断当前是否为将它关闭的ID，重新打开
                if (!w.status && w.close_id && w.close_id === this.winow_config.id) {
                    w.status = true
                    delete w.close_id
                }
            }
            // 触发关闭事件
            this.$emit("on-close", {
                tag: "CompModel",
            })
        },

        /** 关闭全部 */
        onCloseAll() {
            for (let i = 0, ws = this.windows; i < ws.length; i++) {
                let w = ws[i]
                // 开启的窗口都关闭
                if (w.status) {
                    w.status = false
                    // 触发关闭事件
                    w.v.$emit("on-close", {
                        tag: "CompModel",
                    })
                }
            }
        },
    },
}
</script>

<style lang="less">
.comp-model-page {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 50;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    visibility: hidden;
    opacity: 0;
    transition: all 0.2s ease;

    &.show {
        visibility: initial;
        opacity: 1;
    }

    &.hide {
        visibility: hidden;
        opacity: 0;
    }

    .content-page {
        position: relative;
        margin: 20px;
        width: 400px;
        height: 90%;
        background: #fff;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        overflow: hidden;
        display: flex;
        flex-direction: column;

        .head-box {
            position: relative;
            height: 50px;
            display: flex;
            align-items: center;
            border-bottom: 1px solid #f3f3f3;
            background: #fff;
            flex-shrink: 0;
            display: flex;
            align-items: center;

            .title {
                font-weight: 500;
                color: #333;
                font-size: 16px;
                margin-left: 20px;
                flex-grow: 1;
                min-width: 100px;
            }

            .head-operate {
                flex-shrink: 0;
                display: flex;
                align-items: center;
            }

            .close-btn {
                margin: 10px 0;
                padding: 0 20px;
                font-size: 18px;
                color: #333;
                font-weight: bold;
                cursor: pointer;
                display: flex;
                align-items: center;
                border-left: 1px solid #f3f3f3;
                flex-shrink: 0;
            }
        }

        .scroll-content {
            position: relative;
            width: 100%;
            overflow-x: hidden;
            overflow-y: auto;
            flex-grow: 1;
        }

        .bottom-operate {
            flex-shrink: 0;
            background: linear-gradient(transparent, rgba(255, 255, 255, 0.7));
            border-top: 1px solid #f3f3f3;
        }
    }
}
</style>
