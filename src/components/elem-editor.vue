<template>
    <div class="elem-editor-box" dark-class="elem-editor-box-dark">
        <textarea class="editor" :id="id" :required="required" :name="name" :title="title" :placeholder="placeholder" v-model="val" @submit="onSubmit"></textarea>
    </div>
</template>

<script lang="ts">
import Component, { ComponentMethods } from "@/module/component/component"
import Utils from "@/module/utils/utils"
import FileUtil from '@/module/file/file_util'

class ElemEditorComponent extends ComponentMethods implements ComponentEntity {
    data() {
        return {
            id: Utils.getUuid(),
            place_holder: "",
            val: ""
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
    
    async mounted() {
        console.log(this.name)

        this.place_holder = this.placeholder || `输入${this.title || this.name}${this.required ? '' : '（可选）'}`

        this.val = this.value

        await FileUtil.script("static/codemirror/codemirror.js")
        await FileUtil.script("static/codemirror/javascript.js")
        await FileUtil.script("static/codemirror/format.js")

		// 初始化代码编辑器
        var editor = window['CodeMirror'].fromTextArea(document.getElementById(this.id), {
            lineNumbers: true,
            mode: 'application/json',
            theme:"idea",
            lint: true
        })

        // 设置尺寸
        editor.setSize("100%", 500)

        // 格式化代码
        editor.autoFormatRange({ line: 0, ch: 0 }, { line: editor.lineCount() })
        
        // 取消选择
        editor.setSelection({ line: 0, ch: 0 })

        editor.on("blur", () => {
            this.val = editor.getValue()
        })
    }

	methods = {
		onSubmit() {
            console.log("onSubmit")
        }
	}
}

export default Component.build(new ElemEditorComponent)
</script>

<style lang="less">
@import (reference) "@/style/utils.less";

@import "@/module/codemirror/codemirror.less";
@import "@/module/codemirror/idea.less";

.elem-editor-box {
    cursor: text;
	width: 100%;
	font-size: 14px;
	z-index: 10;
	box-sizing: border-box;
	border-radius: 6px;
	transition: all 0.3s ease;
	display: flex;
    align-items: center;
    overflow: hidden;

    .border;

    &:hover {
        border-color: #b3b3b3;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }

    .editor {
        width: 100%;
        min-height: 500px;
    }
}

.elem-editor-box-dark {
    &:hover {
        border-color: transparent;
        box-shadow: 0 0 20px rgba(0,0,0,0.2);
    }

    .CodeMirror {
        background: #2f3042;

        .CodeMirror-gutters {
            background: #2f3042;
            border-right: 1px solid #37384a;
        }

        .CodeMirror-cursor {
            border-left: 1px solid #fff;
        }

        .CodeMirror-line span {
            color: #fff;
        }
    }
}
</style>