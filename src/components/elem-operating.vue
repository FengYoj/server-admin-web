<template>
    <div class="elem-operating">
        <!-- 上传文件 -->
        <button v-if="config.type === 'FILE'" :style="{ background: config.background, color: config.color }" @click="onOperatingFile">
            {{ config.title }}
        </button>
    </div>
</template>

<script lang="ts">
import Request from "@/module/request/request"
import Message from "@/module/interactive/message"

export default {
    data() {
        return {}
    },

    props: {
        config: Object,
        item: {
            type: Object,
            required: false,
        },
    },

    methods: {
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

        /**
         * 解析 url
         */
        getUrl(): string {
            return new Function(`return \`${this.config.url.replace(/&{(\w*)}/g, "${this.data.$1}")}\``).call({
                data: this.item || {},
            })
        },
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
