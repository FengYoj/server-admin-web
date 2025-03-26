<template>
	<div class="elem-input-box" dark-class="elem-input-box-dark">
		<input ref="input" autocomplete="new-password" :maxlength="max" :type="type" class="input" :verify="verify" :title="title" :required="required" :name="name" :placeholder="place_holder" v-model="val" @change="onChange" :original="original" @input="onInput">
        <div class="icon-box">
            <elem-icon class="icon" v-show="check === true" src="static/icon/components/elem-input/" name="correct"></elem-icon>
            <elem-icon class="icon" v-show="check === false" src="static/icon/components/elem-input/" name="error"></elem-icon>
        </div>
    </div>
</template>

<script lang="ts">
import Language from "../module/language/language"
import Theme from '../module/theme/theme'
import Utils from "../module/utils/utils"

import elemIcon from './elem-icon.vue'

export default {
    data() {
        return {
            original: null,
            check: null,
            val: null,
            place_holder: null,

            language: {
                enter: "输入",
                optional: "可选"
            }
        }
    },

	props: {
        type: {
            type: String,
            default: "text"
        },
        max: {
            type: Number,
            default: 255
        },
        name: String,
        title: String,
        // 校验类型
        verify: String,
        required: {
            type: Boolean,
            default: true
        },
        placeholder: {
            type: String,
            default: ""
        },
        value: {
            type: [String, Number],
            default: ""
        }
    },

    components: {
        elemIcon
    },

    watch: {
        val(value: any) {
            if (value) {
                this.check = Utils.verify(this.verify, value)
            } else {
                this.check = null
            }
        }
    },

	created() {
        if (Utils.isExist(this.value)) {
            this.check = true

            // 赋值初始值
            this.original = this.val = this.value
        }
    },

    mounted() {
        // 处理主题数据
        Theme.processPage(this.$el)
        // 处理语言包数据
        Language.process(this)

        this.place_holder = this.placeholder || `${this.language.enter}${this.title || this.name}${this.required ? '' : ('(' + this.language.optional + ')')}`

        this.$refs.input.getValue = this.getValue.bind(this)
        // this.$refs.input.menu = [{
        //     id: "update",
        //     icon: "update",
        //     name: "检查更新"
        // }, {
        //     id: "version",
        //     icon: "about",
        //     name: "版本"
        // }]
    },

	methods: {

		onChange(evt: any) {
            this.$emit('change', {
                value: evt.target.value,
                type: "elem-input",
                name: this.name,
                set: (value: string) => {
                    this.val = value
                }
            })
        },

        onInput(evt: any) {
            this.$emit('input-event', {
                value: evt.target.value,
                type: "elem-input",
                name: this.name,
                set: (value: string) => {
                    this.val = value
                }
            })
        },

        getValue() {
            const value = this.val

            if (Utils.isBlank(value) && this.required) {
                this.check = false
            }

            return value
        }
	}
}
</script>

<style lang="less">
@import (reference) "/src/style/utils.less";
@import (reference) "/src/style/color.less";

.elem-input-box {
	position: relative;
    width: 100%;
    height: 45px;

    .input {
        position: relative;
        height: 45px;
        padding: 0 50px 0 12px;
        font-size: 14px;
        z-index: 10;
        box-sizing: border-box;
        border-radius: 6px;
        transition: all 0.3s ease;
        background: #fff;

        .border;

        &:hover,
        &:focus {
            border-color: #b3b3b3;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
    }

    .icon-box {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 15;

        .icon {
            width: 25px;
            height: 25px;
        }
    }
}

.elem-input-box-dark {
    .input {
        background: #252a31;
        border-color: @dark_border;

        &:hover,
        &:focus {
            border-color: #5a5a5a;
        }
    }
}
</style>