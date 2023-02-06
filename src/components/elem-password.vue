<template>
	<div class="elem-password-box" dark-class="elem-password-box-dark">
		<input ref="input" :maxlength="max" :type="hidden ? 'password' : 'text'" class="input" verify="password" :title="title" :required="required" :name="name" :placeholder="place_holder" v-model="val" @change="onChange" @input="onInput">
        <div class="operating-box">
            <div class="check-box">
                <elem-icon class="icon" v-show="check === true" src="static/icon/components/elem-input/" name="correct"></elem-icon>
                <elem-icon class="icon" v-show="check === false" src="static/icon/components/elem-input/" name="error"></elem-icon>
            </div>
            <div class="menu-box">
                <elem-icon class="icon" name="operating"></elem-icon>
                <comp-menu ref="operatings_menu" :value="operatings" @select="onSelectOperating"></comp-menu>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Utils from "../module/utils/utils"

import elemIcon from './elem-icon.vue'
import compMenu from './comp-menu.vue'
import Component, { ComponentMethods } from '@/module/component/component'
import Status from "@/module/status/status"
import StringUtils from "@/module/utils/string_utils"

class ElemPasswordComponent extends ComponentMethods implements ComponentEntity {
    private check: boolean = null
    private val: string = null
    private place_holder: string = null
    private hidden: boolean = true
    private change: boolean = false

    public language = {
        enter: "输入",
        optional: "可选"
    }

    private operatings = [{
        title: "状态设置",
        prompt: "仅限显示输入的新密码",
        sub: [{
            id: "Display",
            icon: "display",
            name: "显示密码"
        }, {
            id: "Hide",
            icon: "hide",
            name: "隐藏密码"
        }]
    }, {
        title: "恢复",
        prompt: "恢复至变更密码前，仅限修改状态恢复",
        sub: [{
            id: "Restore",
            icon: "restore",
            disable: true,
            name: "恢复密码"
        }]
    }]

    props = {
        config: {
            type: Object,
            default: {
                encryption: true
            }
        },
        max: {
            type: Number,
            default: 255
        },
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
        value: null
    }

    components = {
        elemIcon,
        compMenu
    }

    watch = {
        val(value: string, oldValue: string) {
            if (this.isEdit && !this.initial) {
                this.check = true
                this.initial = true
                this.$refs.operatings_menu.onChangeDisable("Display", true)
            } else if (!this.change && this.original === oldValue) {
                if (oldValue.length < value.length) {
                    const d = StringUtils.different(oldValue, value)
                    this.val = d.value
                } else if (value.length !== 1) {
                    this.val = ""
                    this.check = null
                }

                this.change = true
                this.$refs.operatings_menu.onChangeDisable("Display", false)
            } else {
                if (value) {
                    this.check = Utils.verify("password", value)
                } else {
                    this.check = null
                }
            }
        }
    }

    mounted() {
        if (Utils.isExist(this.value)) {
            this.isEdit = true
            // 赋值初始值
            if (typeof this.value === 'string') {
                this.original = this.val = this.value
            } else {
                this.original = this.val = this.value.value
            }
            // 恢复密码功能设置为可用
            this.$refs.operatings_menu.onChangeDisable("Restore", false)
        }

        this.place_holder = this.placeholder || `${this.language.enter}${this.title || this.name}${this.required ? '' : ('(' + this.language.optional + ')')}`

        this.$refs.input.getValue = this.getValue.bind(this)
    }

    onChange(evt: obj) {
        this.$emit('change', {
            value: evt.target.value,
            type: "elem-input",
            name: this.name,
            set: (value: string) => {
                this.val = value
            }
        })
    }

    onInput(evt: obj) {
        this.$emit('input-event', {
            value: evt.target.value,
            type: "elem-input",
            name: this.name,
            set: (value: string) => {
                this.val = value
            }
        })
    }

    getValue(): Status<any> {
        var value = this.val

        if (Utils.isBlank(value)) {
            if (!this.required) {
                return new Status(200).setData(null)
            }

            this.check = false
            return Status.of(400).setMessage(`${this.title} 不能为空`)
        }

        if (!this.check) {
            return Status.of(400).setMessage(`${this.title} 格式不正确`)
        }

        // 是否加密
        if (this.config.encryption) {
            // 非初始值
            if (this.change) {
                let md5 = require("js-md5")
                // MD5 加密
                value = md5(value)
            }
        }

        // 返回密码实体
        if (this.config.entity) {
            return new Status(200).setData(Object.assign({}, this.value, { value }))
        }

        // 返回字符串密码
        return new Status(200).setData(value)
    }

    onSelectOperating(evt: obj) {
        switch (evt.value) {
            case 'Hide':
                this.hidden = true
                break
            case 'Display':
                if (this.original && this.original === this.val && !this.change) {
                    return
                }
                this.hidden = false
                break
            case 'Restore':
                this.change = this.initial = false
                this.hidden = true
                this.val = this.original
        }
    }
}

export default Component.build(new ElemPasswordComponent)
</script>

<style lang="less">
@import (reference) "/src/style/utils.less";
@import (reference) "/src/style/color.less";

.elem-password-box {
	position: relative;
    width: 100%;
    height: 45px;

    .input {
        position: relative;
        height: 45px;
        padding: 0 82px 0 12px;
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

    .operating-box {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;

        .flex;
        .flex-center-items;

        .check-box {
            width: 25px;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 15;

            >.icon {
                width: 25px;
                height: 25px;
            }
        }

        >.menu-box {
            margin: 0 10px;
            width: 25px;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 15;

            >.icon {
                width: 25px;
                height: 25px;
            }
        }
    }
}

.elem-password-box-dark {
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