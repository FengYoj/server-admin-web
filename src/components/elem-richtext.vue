<template>
    <div class="editor-wrapper">
        <elem-input-object :name="name" :title="title" :required="required" :getValue="getEditorData"></elem-input-object>
        <textarea :id="'editor-' + id"></textarea>
    </div>
</template>

<script lang="ts">
import Component, { ComponentMethods } from "@/module/component/component"

import MessageController from "@/module/interactive/message"
import Request from "@/module/request/request"
import elemInputObject from "./elem-input-object.vue"
import Utils from "@/module/utils/utils"

class ElemRichTextComponent extends ComponentMethods implements ComponentEntity {
    data() {
        return {
            id: Utils.getUuid(),
        }
    }

    props = {
        name: String,
        title: String,
        required: {
            type: Boolean,
            default: true,
        },
        value: {
            type: String,
            default: "",
        },
    }

    components = {
        elemInputObject,
    }

    async mounted() {
        this.initEditor()
    }

    methods = {

        getEditorData() {
            const editor = (window as any).tinymce.get("editor-" + this.id)
            return editor ? editor.getContent() : ""
        },

        setEditorData(html: string) {
            const editor = (window as any).tinymce.get("editor-" + this.id)
            if (editor) editor.setContent(html)
        },

        initEditor() {
            // 初始化 TinyMCE
            (window as any).tinymce.init({
                selector: "#editor-" + this.id,
                language: "zh-Hans",
                license_key: "gpl",
                height: 600,
                menubar: true,
                branding: false,
                promotion: false,
                plugins: [
                    "advlist",
                    "autolink",
                    "lists",
                    "link",
                    "image",
                    "charmap",
                    "preview",
                    "anchor",
                    "searchreplace",
                    "visualblocks",
                    "code",
                    "fullscreen",
                    "insertdatetime",
                    "media",
                    "table",
                    "help",
                    "wordcount",
                    "emoticons",
                    "autosave",
                    "quickbars",
                    "codesample",
                ], // 启用的插件列表
                toolbar: [
                    "code formatselect fontselect fontsizeselect forecolor backcolor bold italic underline strikethrough link alignment outdent indent bullist numlist blockquote subscript superscript removeformat table image media importword charmap pagebreak formatpainter cut copy undo redo restoredraft searchreplace",
                ], // 工具栏按钮列表

                image_dimensions: false,
                media_dimensions: false,
                content_style: `
                    img,video {
                        width: 100% !important;
                        max-width: 100% !important;
                        height: auto !important;
                        display: block;
                    }
                    .mce-preview-object {
                        width: 100% !important;
                    }
                `,

                // ✅ 图片上传逻辑
                images_upload_handler: async blobInfo => {
                    const formData = new FormData()
                    formData.append("file", blobInfo.blob(), blobInfo.filename())

                    const res = await Request.post<obj>("WEB://Resource/Image/Upload", formData, {
                        onFail: function (err) {
                            MessageController.error(JSON.parse(err.responseText).message)
                            return false
                        },
                    })

                    return res.url
                },

                // 视频上传
                file_picker_types: "media",
                file_picker_callback: (callback: any, value: any, meta: any) => {
                    if (meta.filetype === "media") {
                        const input = document.createElement("input")
                        input.type = "file"
                        input.accept = "video/*"

                        input.onchange = async () => {
                            const file = input.files?.[0]
                            if (!file) return

                            const formData = new FormData()
                            formData.append("file", file)

                            // 上传到后端接口
                            const res = await Request.post<obj>("WEB://Resource/Video/Upload", formData, {
                                onFail: function (err) {
                                    MessageController.error(JSON.parse(err.responseText).message)
                                    return false
                                },
                            })

                            // 回调插入视频
                            callback(res.url, { source2: res.url, poster: "" })
                        }

                        input.click()
                    }
                },
                setup: (editor: any) => {
                    editor.on('init', () => {
                        // 初始化完成后写入内容
                        if (this.value) {
                            editor.setContent(this.value)
                        }
                    })
                },
            })
        },
    }
}

export default Component.build(new ElemRichTextComponent())
</script>

<style>
.editor-wrapper {
    width: 100%;
    max-width: none;
}
#editor {
    width: 100%;
    max-width: none;
}
</style>
