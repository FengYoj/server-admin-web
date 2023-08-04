<template>
    <div class="elem-upload-box" dark-class="elem-upload-box-dark">
        <elem-input-object :name="name" :title="title" :required="required" :getValue="this.getFiles"></elem-input-object>
        <input ref="upload_input" class="upload-input" type="file" :accept="accept || types[type].accept" :multiple="multi" @change="onSelectFile" />
        <div ref="upload_drag" class="upload-drag-box" v-show="multi || files.length <= 0" @click="onClickUpload">
            <div class="icon-box">
                <elem-icon src="static/icon/components/elem-upload/" :name="type"></elem-icon>
            </div>
            <p class="name">点击上传，或将{{ types[type].name }}拖拽到此处</p>
        </div>
        <div class="upload-preview-box" v-if="files.length > 0" :style="{ 'margin-top': files.length > 0 ? '10px' : '0' }">
            <p class="preview-title">预览：</p>
            <div class="upload-preview-list">
                <div class="upload-file-box" v-for="(item, idx) in files" :key="idx">
                    <div class="upload-file-name">
                        <div>{{ item.name }}</div>
                    </div>

                    <div v-if="type === 'image'" class="upload-image-base">
                        <img :src="item.preview || item.url || item.src" class="upload-image" />
                    </div>

                    <div v-else-if="type === 'video'" class="upload-video-base">
                        <video v-if="type === 'video'" :src="item.preview || item.url || item.src" class="upload-video" controls></video>
                    </div>

                    <div v-else-if="type === 'audio'" class="upload-audio-base">
                        <audio v-if="type === 'audio'" :src="item.preview || item.url || item.src" class="upload-audio" controls></audio>
                    </div>

                    <div class="upload-file-operating">
                        <div v-if="type === 'image'" class="upload-file-operating-button" @click="editImageById(item.id)">
                            <elem-icon src="static/icon/components/elem-upload/" name="edit" dark="edit_white"></elem-icon>
                        </div>
                        <div v-else class="upload-file-operating-button operating-button-disable" @click="editUploadDisable">
                            <elem-icon src="static/icon/components/elem-upload/" name="edit" dark="edit_white"></elem-icon>
                        </div>
                        <div class="upload-file-operating-move">
                            <div class="upload-file-operating-button upload-file-operating-move-before" @click="moveUpload(item.id, 'move-before')">
                                <elem-icon src="static/icon/components/elem-upload/" name="move_left" dark="move_left_white"></elem-icon>
                            </div>
                            <div class="upload-file-operating-button upload-file-operating-move-after" @click="moveUpload(item.id, 'move-after')">
                                <elem-icon src="static/icon/components/elem-upload/" name="move_right" dark="move_right_white"></elem-icon>
                            </div>
                        </div>
                        <div class="upload-file-operating-button" @click="deleteUpload(item.id)">
                            <elem-icon src="static/icon/components/elem-upload/" name="delete" dark="delete_white"></elem-icon>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Utils from "@/module/utils/utils"
import Message from "@/module/interactive/message"
import FileUtil from "@/module/file/file_util"
import Loading from "@/module/loading/loading"
import Request from "@/module/request/request"
import Crop from "@/module/crop/crop"
import Theme from "@/module/theme/theme"
import Language from "@/module/language/language"

import elemInputObject from "./elem-input-object.vue"
import elemIcon from "./elem-icon.vue"

export default {
    props: {
        value: {
            type: Object,
            default: new Array(),
        },
        name: String,
        title: String,
        required: {
            type: Boolean,
            default: true,
        },
        multi: {
            type: Boolean,
            default: false,
        },
        type: {
            type: String,
            default: "image",
        },
        size: String,
        filename: {
            type: String,
            default: "",
        },
        folder: {
            type: String,
            default: "",
        },
        accept: {
            type: String,
            default: "",
        },
    },
    data() {
        return {
            files: [],
            types: {
                image: {
                    name: "图片",
                    accept: "image/*",
                    url: "/WebAPI/Resource/Image/Upload",
                },
                video: {
                    name: "视频",
                    accept: "video/*",
                    url: "/WebAPI/Resource/Video/Upload",
                },
                audio: {
                    name: "音频",
                    accept: "audio/*",
                    url: "/WebAPI/Resource/Audio/Upload",
                },
                file: {
                    name: "文件",
                    accept: "",
                    url: "/WebAPI/Resource/File/Upload",
                },
            },
        }
    },

    components: {
        elemIcon,
        elemInputObject,
    },

    created() {
        var value = this.value

        if (!value) return

        if ("string" === typeof value) {
            value = [
                {
                    src: value,
                },
            ]
        } else if (!(value instanceof Array)) {
            value = [value]
        }

        var files = []

        Utils.each<obj>(value, v => {
            files.push({
                id: Utils.getUuid(),
                ...v,
            })
        })

        this.files = files
    },
    mounted() {
        var dropbox = this.$refs.upload_drag

        dropbox.addEventListener("drop", this.enentDrop, false)

        dropbox.addEventListener("dragleave", e => {
            e.stopPropagation()
            e.preventDefault()
        })

        dropbox.addEventListener("dragenter", e => {
            e.stopPropagation()
            e.preventDefault()
        })

        dropbox.addEventListener("dragover", e => {
            e.stopPropagation()
            e.preventDefault()
        })

        // 处理主题数据
        Theme.processPage(this.$el)
        // 处理语言包数据
        Language.process(this)
    },
    methods: {
        enentDrop(evt) {
            evt.stopPropagation()
            evt.preventDefault()

            this.processFiles(evt.dataTransfer.files)
        },

        onClickUpload() {
            this.$refs.upload_input.click()
        },

        onSelectFile(evt) {
            this.processFiles((evt.target || evt.srcElement).files)
        },

        async processFiles(files) {
            for (let i = 0; i < files.length; i++) {
                await this.processFile(files[i])
                // var file = files[i]
            }

            // 清空 input 值
            this.$refs.upload_input.value = null
        },

        editUploadDisable() {
            Message.error("编辑功能仅支持图片格式")
        },

        processFile(file: File): Promise<void> {
            return new Promise((resolve, reject) => {
                const config = this.types[this.type]

                if (!new RegExp(config.accept).test(file.type)) {
                    Message.error(`不支持当前文件类型，仅支持 ${config.name} 类型`)

                    return reject()
                }

                var reader = new FileReader()
                reader.readAsDataURL(file)

                reader.onerror = err => {
                    Message.error("文件加载失败")

                    reject(err)
                }

                reader.onload = async () => {
                    if (!this.multi && this.files.length > 0) {
                        Message.info("最多只能上传一个文件")

                        reject()

                        return
                    }

                    var res = reader.result
                    var blob

                    if (this.type === "image" && Utils.isExist(this.size)) {
                        let data = await this.editImageByFile(res, this.size)

                        res = data.dataURL

                        if (data.blob) {
                            blob = data.blob
                        }
                    }

                    this.files.push({
                        id: Utils.getUuid(),
                        src: res,
                        name: file.name,

                        ...(blob ? { blob } : { file }),
                    })

                    resolve()
                }
            })
        },

        moveUpload: function (id: string, type) {
            Utils.each<obj>(this.files, v => (v.id === id ? type : null))
        },

        editImageByFile(base64, size): Promise<obj> {
            return new Promise((resolve, reject) => {
                const sizes = size.replace(/\s+/g, "").split("*")

                let w = sizes[0]
                let h = sizes[1]

                const image = new Image()

                image.onload = async () => {
                    // 宽高与指定宽高相等
                    if (image.width < w || image.height < h) {
                        let msg = "图片分辨率最低为：" + this.size

                        // 显示错误提示
                        Message.error(msg)

                        reject(msg)
                    } else if (image.width === w && image.height === h) {
                        // resolve({ dataURL: base64, file })
                    } else {
                        // 判断是否初始化裁剪资源文件
                        if (!this.initializedCropResource) {
                            await this.initCropResource()
                        }

                        new Crop(base64, {
                            aspectRatio: w / h,
                            width: w,
                            height: h,
                        })
                            .onError(reject)
                            .onConfirm(data => {
                                resolve(data)
                            })
                            .build()
                    }
                }

                image.onerror = reject

                image.src = base64
            })
        },

        async editImageById(id) {
            // 判断是否初始化裁剪资源文件
            if (!this.initializedCropResource) {
                await this.initCropResource()
            }

            var config

            if (Utils.isExist(this.size)) {
                const sizes = this.size.replace(/\s+/g, "").split("*")

                let w = sizes[0]
                let h = sizes[1]

                config = {
                    aspectRatio: w / h,
                    width: w,
                    height: h,
                }
            }

            Utils.each<obj>(
                this.files,
                v => {
                    if (v.crop) v.crop.show()
                    else
                        v.crop = new Crop(v.preview || v.url || v.src, config)
                            .onError(function (err) {
                                Message.error(err)
                            })
                            .onConfirm(data => {
                                v.blob = data.blob
                                v.src = data.dataURL

                                v.url = null
                            })
                            .build()
                },
                v => v.id === id
            )
        },

        deleteUpload: function (id) {
            Message.info("确认删除该文件吗？", true)
                .onConfirm(() => {
                    Utils.each<obj>(this.files, function (d) {
                        return d.id === id ? "delete" : null
                    })
                })
                .build()
        },

        // 初始化裁剪资源文件
        initCropResource(): Promise<void> {
            return new Promise((resolve, reject) => {
                Loading.show()

                Promise.all([
                    FileUtil.style("/modules/crop/cropper.min.css"),
                    FileUtil.style("/modules/crop/crop.css"),
                    FileUtil.script("/modules/crop/cropper.min.js"),
                    FileUtil.script("/modules/crop/corp.js"),
                ])
                    .then(() => {
                        this.initializedCropResource = true

                        resolve()

                        Loading.hide()
                    })
                    .catch(reject)
            })
        },

        getFiles: function () {
            return new Promise((resolve, reject) => {
                const files = this.files

                if (!this.required && files.length <= 0) {
                    return resolve(null)
                }

                if (files.length <= 0) {
                    const msg = this.title + " 不能为空"

                    // Show Msg
                    Message.error(msg)

                    // Callback Error
                    return reject(msg)
                }

                var path = []
                var formData = new FormData()

                Utils.each<obj>(files, function (v, i) {
                    if (v.blob) {
                        formData.append("file", v.blob, v.name)
                    } else if (v.file) {
                        formData.append("file", v.file)
                    } else if (v.src) {
                        path.push({ idx: i, ...v })
                    }
                })

                if (formData.getAll("file").length <= 0) {
                    if (!this.multi) {
                        path = path[0]
                    }

                    resolve(path)

                    return
                }

                if (this.type == "image") {
                    formData.append("name", this.filename)
                    formData.append("folder", this.folder)
                }

                Request.post<obj[]>(this.types[this.type].url, formData, {
                    onFail: function (err) {
                        Message.error(err.responseJSON.message)

                        reject(err.responseJSON.message)
                    },

                    onProgress(e) {
                        console.log(e)
                    },
                }).then(res => {
                    resolve(this.multi ? res : res[0])
                })
            })
        },
    },
}
</script>

<style lang="less">
@import (reference) "/src/style/utils.less";

.elem-upload-box {
    max-width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    .upload-input {
        display: none;
    }

    .upload-drag-box {
        position: relative;
        width: 100%;
        padding: 30px;
        background-color: #fff;
        text-align: center;
        cursor: pointer;
        color: #999;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;

        .radius(6px);
        .border;

        .icon-box {
            width: 50px;
            height: 50px;
        }

        .name {
            margin-top: 15px;
            font-size: 13px;
        }
    }

    .upload-preview-box {
        width: 100%;
        box-sizing: border-box;
        border-left-width: 5px;
        padding: 10px;
        line-height: 22px;

        .radius(6px);
        .border;

        .preview-title {
            margin: 10px 10px 0;
        }

        .upload-preview-list {
            display: flex;
            flex-wrap: wrap;

            .upload-file-box {
                margin: 10px;
                max-width: 100%;
                display: inline-block;
                box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);

                .radius(6px);
                .border;

                .upload-file-name {
                    position: relative;
                    width: 100%;
                    height: 30px;

                    .border-position(bottom);

                    div {
                        position: absolute;
                        top: 0;
                        left: 20px;
                        right: 20px;
                        bottom: 0;
                        text-align: center;
                        line-height: 30px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                }

                .upload-image-base,
                .upload-video-base {
                    width: 100%;
                    height: 150px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .upload-image-base .upload-image {
                    width: initial;
                    height: initial;
                    max-width: 100%;
                    max-height: 100%;
                }

                .upload-video-base .upload-video {
                    max-width: 300px;
                    height: 150px;
                    max-height: 100%;
                }

                .upload-audio-base {
                    width: 100%;
                    height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #eff1f3;

                    .upload-audio {
                        max-width: 300px;
                        height: 50px;
                        max-height: 100%;
                    }
                }

                .upload-file-operating {
                    padding: 0 10px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    .border-position(top);

                    .upload-file-operating-button {
                        cursor: pointer;
                        width: 30px;
                        height: 30px;
                        padding: 5px;
                        display: flex;
                        border-radius: 5px;

                        .border-box;

                        &:hover {
                            box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
                        }
                    }

                    .upload-file-operating-move {
                        display: flex;
                    }

                    .operating-button-disable {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }
                }

                &:first-child .upload-file-operating-move-before,
                &:last-child .upload-file-operating-move-after {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                &:first-child .upload-file-operating-move-before:hover,
                &:last-child .upload-file-operating-move-after:hover {
                    box-shadow: initial;
                }
            }
        }
    }
}

.elem-upload-box-dark {
    .upload-drag-box {
        background: #252a31;
        border-color: #373a4e;
    }

    .upload-preview-box {
        border-color: #373a4e;

        .upload-preview-list .upload-file-box {
            border-color: #373a4e;

            .upload-file-name,
            .upload-file-operating {
                border-color: #373a4e;
            }
        }
    }
}
</style>
