<template>
	<div class="elem-editor-box" dark-class="elem-editor-box-dark">
        <elem-input-object :name="name" :title="title" :required="required" :getValue="getTextData"></elem-input-object>
        <!-- 工具栏容器 -->
        <div class="toolbar-container" :id="'toolbar-container-' + id"></div>
        <!-- 编辑器容器 -->
        <div class="editor" :id="'editor-' + id"></div>
    </div>
</template>

<script lang="ts">
import Component, { ComponentMethods } from "@/module/component/component"
import CKEditor from '@ckeditor/ckeditor5-build-decoupled-document'

import elemInputObject from './elem-input-object.vue'
import Utils from "@/module/utils/utils"

class ElemRichTextComponent extends ComponentMethods implements ComponentEntity {
    data() {
        return {
            id: Utils.getUuid()
        }
    }

	props = {
        name: String,
        title: String,
        required: {
            type: Boolean,
            default: true
        },
        placeholder: {
            type: String,
            default: ""
        },
        value: {
            type: String,
            default: ""
        }
	}

    components = {
        elemInputObject
    }

	async mounted() {
        this.initCKEditor()
    }

    methods = {
        getTextData() {
            return this.editor.getData()
        },

        initCKEditor() {
            CKEditor.create(document.querySelector('#editor-' + this.id), {
                language: 'zh-cn',
                ckfinder: {
                    uploadUrl: "/WebAPI/Resource/Image/Ckeditor"
                }
            }).then(editor => {
                const toolbarContainer = document.querySelector('#toolbar-container-' + this.id)
                toolbarContainer.appendChild(editor.ui.view.toolbar.element)
                this.editor = editor
                this.value && editor.setData(this.value)
            }).catch(error => {
                console.error(error)
                // Message.error("富文本编辑器加载失败！")
            })
        }
    }
}

export default Component.build(new ElemRichTextComponent)
</script>

<style lang="less">
@import (reference) "/src/style/utils.less";
@import (reference) "/src/style/color.less";

.elem-editor-box {
	width: 100%;
	font-size: 14px;
	z-index: 10;
	box-sizing: border-box;
	border-radius: 6px;
	transition: all 0.3s ease;
    overflow: hidden;
    display: block;

    .border;

    &:hover {
        border-color: #b3b3b3;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }

    .toolbar-container {
        position: relative;
        z-index: 5;

        .ck-toolbar {
            border: initial;
            border-color: #f3f3f3;

            .border-position(bottom)
        }
    }

    .editor {
        min-height: 300px;
        border: initial;
    }
}

.elem-editor-box-dark {
    background: @dark_box;
    border-color: @dark_border;

    &:hover {
        border-color: #666666;
    }

    .toolbar-container {
        filter: brightness(0.5);
    }
}
</style>