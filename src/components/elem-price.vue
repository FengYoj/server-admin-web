<template>
    <div class="elem-price-box" dark-class="elem-price-box-dark">
        <input
            ref="input"
            :maxlength="max"
            type="number"
            class="input"
            :title="title"
            :required="required"
            :name="name"
            :placeholder="place_holder"
            v-model="val"
            @change="onChange"
            @input="onInput"
        />
        <div class="operating-box">
            <p class="unit-box">{{ type === "yuan" ? "/元" : "/分" }}</p>
            <div class="check-box" v-show="check !== null">
                <view class="icon-box" v-show="check !== null && check.isNormal()">
                    <elem-icon src="static/icon/components/elem-input/" name="correct"></elem-icon>
                </view>
                <view class="icon-box" v-show="check !== null && check.isBlank()">
                    <elem-prompt :title="check !== null ? check.getMessage() : ''"></elem-prompt>
                    <elem-icon src="static/icon/components/elem-input/" name="error"></elem-icon>
                </view>
            </div>
            <div class="menu-box">
                <elem-icon class="icon" name="operating"></elem-icon>
                <comp-menu ref="operatings_menu" position="follow" :value="operatings" @select="onSelectOperating"></comp-menu>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Utils from "../module/utils/utils"

import elemIcon from "./elem-icon.vue"
import compMenu from "./comp-menu.vue"
import elemPrompt from "./elem-prompt.vue"
import Component, { ComponentMethods } from "@/module/component/component"
import Status from "@/module/status/status"

class ElemPasswordComponent extends ComponentMethods implements ComponentEntity {
    private check: Status<any> = null
    private val: string = null
    private place_holder: string = null
    private hidden: boolean = true
    private change: boolean = false
    private type: "yuan" | "penny" = "yuan"

    public language = {
        enter: "输入",
        optional: "可选",
    }

    private operatings = [
        {
            title: "价格单位",
            prompt: "单位为“分”时不可使用小数点",
            sub: [
                {
                    id: "UnitYuan",
                    icon: "price",
                    name: "元",
                },
                {
                    id: "UnitPenny",
                    icon: "price",
                    name: "分",
                },
            ],
        },
        {
            title: "关于",
            sub: [
                {
                    icon: "version",
                    name: "组件版本",
                    value: "1.0.0",
                },
            ],
        },
    ]

    props = {
        config: {
            type: Object,
            default: {
                encryption: true,
            },
        },
        max: {
            type: Number,
            default: 255,
        },
        name: String,
        title: String,
        required: {
            type: Boolean,
            default: true,
        },
        placeholder: {
            type: String,
            default: "",
        },
        value: null,
    }

    components = {
        elemIcon,
        compMenu,
        elemPrompt,
    }

    watch = {
        val(value: string) {
            this.onCheck(value)
        },
        type() {
            this.onCheck(this.val)
        },
    }

    mounted() {
        if (Utils.isExist(this.value)) {
            this.val = String(this.value / 100)
        }

        this.place_holder = this.placeholder || `${this.language.enter}${this.title || this.name}${this.required ? "" : "(" + this.language.optional + ")"}`

        this.$refs.input.getValue = this.getValue.bind(this)
    }

    onChange(evt: obj) {
        this.$emit("change", {
            value: evt.target.value,
            type: "elem-input",
            name: this.name,
            set: (value: string) => {
                this.val = value
            },
        })
    }

    onInput(evt: obj) {
        this.$emit("input-event", {
            value: evt.target.value,
            type: "elem-input",
            name: this.name,
            set: (value: string) => {
                this.val = value
            },
        })
    }

    getValue(): Status<any> {
        var value = this.val
        var res: number

        let check = this.onCheck(value)

        if (check.isBlank()) {
            return check
        }

        switch (this.type) {
            case "yuan":
                res = Number(value) * 100
                break
            case "penny":
                res = Number(value)
        }

        return new Status(200).setData(res)
    }

    onCheck(value: string): Status<any> {
        var check: Status<any>

        if (typeof value === "number") {
            value = String(value)
        }

        if (Utils.isBlank(value)) {
            check = this.check = null
        } else if (this.type === "penny" && value.indexOf(".") > -1) {
            check = this.check = Status.of(400).setMessage("单位为“分”时不可使用小数点")
        } else if (this.type === "yuan" && value.indexOf(".") > -1 && value.indexOf(".") + 3 < value.length) {
            check = this.check = Status.of(400).setMessage("单位为“元”时小数不能超过2位")
        } else {
            check = this.check = Status.of(200)
        }

        return check === null ? (this.required ? Status.of(400).setMessage(`${this.title} 不能为空`) : Status.of(200)) : check
    }

    onSelectOperating(evt: obj) {
        switch (evt.value) {
            case "UnitYuan":
                this.type = "yuan"
                break
            case "UnitPenny":
                this.type = "penny"
                break
        }
    }
}

export default Component.build(new ElemPasswordComponent())
</script>

<style lang="less">
@import (reference) "/src/style/utils.less";
@import (reference) "/src/style/color.less";

.elem-price-box {
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
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
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

            > .icon-box {
                width: 25px;
                height: 25px;
            }
        }

        > .unit-box {
            margin: 0 10px;
            z-index: 15;
            font-size: 14px;
            font-weight: bold;
            color: #888;
        }

        > .menu-box {
            margin: 0 10px;
            width: 25px;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10;

            > .icon {
                width: 25px;
                height: 25px;
            }
        }
    }
}

.elem-price-box-dark {
    .input {
        background: #252a31;
        border-color: @dark_border;

        &:hover,
        &:focus {
            border-color: #5a5a5a;
        }
    }

    .operating-box > .unit-box {
        color: #eee;
    }
}
</style>
