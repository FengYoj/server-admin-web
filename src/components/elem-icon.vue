<template>
    <div class="elem-icon-page" @mouseenter="onEnter" @mouseleave="onLeave">
        <div class="elem-icon" :style="{ width: width, height: height }" v-html="html"></div>
    </div>
</template>

<script lang="ts">
import FileUtil from "@/module/file/file_util"
import Theme from "@/module/theme/theme"
import Utils from "@/module/utils/utils"
import Component, { ComponentMethods } from "../module/component/component"

class ElemIconComponent extends ComponentMethods implements ComponentEntity {
    public theme = Theme.getTheme()

    public html: string = null

    props = {
        name: String,
        src: {
            type: String,
            default: "static/icon/",
        },
        width: {
            type: String,
            default: "100%",
        },
        height: {
            type: String,
            default: "100%",
        },
        hover: {
            type: String,
            default: "",
        },
    }

    created() {
        this.getResource()
    }

    getResource() {
        FileUtil.getContent(this.src + this.name + ".svg").then(res => {
            if (res.isNormal()) {
                this.html = res.getData()

                setTimeout(() => {
                    this.onProcessSize()

                    if (this.theme === "dark") {
                        this.onProcessTheme()
                    }
                })
            }
        })
    }

    onChangeTheme(theme) {
        this.theme = theme

        // 处理主题事件
        this.onProcessTheme()
    }

    onProcessSize() {
        Utils.getElement(
            "svg",
            e => {
                // 移除默认宽高
                e.removeAttribute("width")
                e.removeAttribute("height")
            },
            this.$el
        )
    }

    onProcessTheme() {
        const dark = this.theme === "dark"

        Utils.getElementAll(
            "path",
            e => {
                if (dark) {
                    let c = e.getAttribute("dark")

                    if (c) {
                        if (!e.getAttribute("default-fill")) {
                            e.setAttribute("default-fill", e.getAttribute("fill"))
                        }

                        e.setAttribute("fill", c)
                    }
                } else if (e.getAttribute("default-fill")) {
                    e.setAttribute("fill", e.getAttribute("default-fill"))
                }
            },
            this.$el
        )
    }

    onEnter() {
        if (!this.hover) return

        Utils.getElementAll(
            "path",
            e => {
                var fill: string = e.getAttribute("fill")

                if (fill) {
                    e.setAttribute("initial-fill", fill)
                }

                e.setAttribute("fill", this.hover)
            },
            this.$el
        )
    }

    onLeave() {
        if (!this.hover) return

        Utils.getElementAll(
            "path",
            e => {
                var fill: string = e.getAttribute("initial-fill")

                if (fill) {
                    e.setAttribute("fill", fill)
                } else {
                    e.removeAttribute("fill")
                }
            },
            this.$el
        )
    }
}

export default Component.build(new ElemIconComponent())
</script>

<style lang="less">
@import "/src/style/utils.less";

.elem-icon-page {
    width: 100%;
    height: 100%;

    .flex;
    .flex-center-all;

    > .elem-icon {
        .flex;
        .flex-center-all;

        svg {
            width: 100%;
            height: 100%;
        }
    }
}
</style>
