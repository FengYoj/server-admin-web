<template>
    <div>
        <!-- 上传文件 -->
        <button v-if="conf.type === 'FILE'" :style="{ background: conf.background, color: conf.color }" @click="onOperatingFile(item, conf.url, conf.msg, conf.config)">
            {{ conf.title }}
        </button>
    </div>
</template>

<script lang="ts">
import Request from '@/module/request/request'
import { Message } from 'view-ui-plus'
export default {
    data () {
        return {

        }
    },

    props: {

    },

    methods: {
        /**
         * 文件上传操作事件
         */
        onOperatingFile(data, url, msg, config) {
            const input = document.createElement("input")

            input.type = "file"
            input.accept = config.accept

            input.onchange = (evt: any) => {
                var formData = new FormData()

                formData.append("file", evt.target.files[0])

                Request.post(this.getUrl(data, url), formData).then(() => {
                    Message.success("上传成功", true)
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
        getUrl(data: obj, url: string): string {
            return new Function(`return \`${url.replace(/\*{(\w*)}/g, "${this.path.$1}").replace(/&{(\w*)}/g, "${this.data.$1}")}\``).call({
                path: {
                    api: this.api,
                    page: this.page,
                },
                data: data,
            })
        }
    }
}
</script>

<style>

</style>