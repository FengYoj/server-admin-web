<template>
    <div class="elem-form-item-box" ref="elem" :class="'item-' + data.type" v-if="getConditionValue()">
        <p class="title">
            {{ data.title }}{{ getTypeName(data.type) }}
            <span style="color:red">{{ data.required ? "*" : "" }}</span>
        </p>

        <div v-if="data.type === 'Input'" class="input-box">
            <component
                v-bind:is="getComponent('elem-input')"
                :title="data.title"
                :value="getValue(data.field, entity, index)"
                :field="data.field"
                type="text"
                :name="name"
                :placeholder="data.placeholder"
                :required="data.required"
                @change="onChangeData"
            ></component>
        </div>

        <div v-else-if="data.type === 'Number'" class="input-box">
            <component
                v-bind:is="getComponent('elem-input')"
                :title="data.title"
                :value="getValue(data.field, entity, index)"
                :field="data.field"
                type="number"
                :name="name"
                :placeholder="data.placeholder"
                :required="data.required"
                @change="onChangeData"
            ></component>
        </div>

        <div v-else-if="data.type === 'Phone'" class="input-box">
            <component
                v-bind:is="getComponent('elem-input')"
                :title="data.title"
                :value="getValue(data.field, entity, index)"
                :field="data.field"
                type="number"
                :name="name"
                :placeholder="data.placeholder"
                :required="data.required"
                @change="onChangeData"
                verify="phone"
            ></component>
        </div>

        <div v-else-if="data.type === 'Price'" class="input-box">
            <component
                v-bind:is="getComponent('elem-price')"
                :title="data.title"
                :value="getValue(data.field, entity, index)"
                :field="data.field"
                :name="name"
                :placeholder="data.placeholder"
                :required="data.required"
                @change="onChangeData"
            ></component>
        </div>

        <div v-else-if="data.type === 'Password'" class="input-box">
            <component
                v-bind:is="getComponent('elem-password')"
                :title="data.title"
                :value="getValue(data.field, entity, index)"
                :field="data.field"
                :config="data.passwordConfig"
                :name="name"
                :placeholder="data.placeholder"
                :required="data.required"
                @change="onChangeData"
            ></component>
        </div>

        <div v-else-if="data.type === 'Textarea'" class="textarea-box">
            <component
                v-bind:is="getComponent('elem-textarea')"
                :name="name"
                :title="data.title"
                :placeholder="data.placeholder"
                :required="data.required"
                @change="onChangeData"
                :value="getValue(data.field, entity, index)"
            ></component>
        </div>

        <div v-else-if="data.type === 'Switch'" class="switch-box">
            <component v-bind:is="getComponent('elem-switch')" :name="name" @change="onChangeData" :field="data.field" :value="getValue(data.field, entity, index)" shape="square"></component>
        </div>

        <div v-else-if="data.type === 'Select'" class="select-box">
            <component
                v-bind:is="getComponent('elem-select')"
                :name="name"
                @change="onChangeData"
                :datas="data.selectConfig.data"
                :field="data.field"
                :multiple="data.selectConfig.multiple"
                :required="data.required"
                :title="data.title"
                :placeholder="data.placeholder"
                :value="getValue(data.field, entity, index, data.selectConfig.controller ? 'uuid' : '')"
            ></component>
        </div>

        <div v-else-if="data.type === 'Upload'" class="upload-box">
            <component
                v-bind:is="getComponent('elem-upload')"
                :name="name"
                :value="getValue(data.field, entity, index)"
                :field="data.field"
                :title="data.title"
                :required="data.required"
                :type="data.uploadConfig.type"
                :accept="data.uploadConfig.accept"
                :multi="data.uploadConfig.multi"
                @change="onChangeData"
            ></component>
        </div>

        <div v-else-if="data.type === 'Editor'" class="editor-box">
            <component
                v-bind:is="getComponent('elem-editor')"
                :name="name"
                :required="data.required"
                :title="data.title"
                :field="data.field"
                :placeholder="data.placeholder"
                :value="getValue(data.field, entity, index)"
            ></component>
        </div>

        <div v-else-if="data.type === 'Map'" class="map-box">
            <component v-bind:is="getComponent('elem-map')" :name="name" :required="data.required" :value="getValue(data.field, entity, index)"></component>
        </div>

        <div v-else-if="data.type === 'Date'" class="date-box" dark-class="dark">
            <DatePicker
                class="date-picker"
                type="datetime"
                :name="name"
                :required="data.required"
                :field="data.field"
                :title="data.title"
                :placeholder="data.placeholder || ('选择' + data.title)"
                :model-value="getValue(data.field, entity, index)"
            ></DatePicker>
        </div>

        <div v-else-if="data.type === 'Label'" class="label-box">
            <component
                v-bind:is="getComponent('elem-label')"
                :name="name"
                :type="data.labelConfig ? data.labelConfig.type : 'input'"
                :required="data.required"
                :field="data.field"
                :title="data.title"
                :placeholder="data.placeholder"
                :value="getValue(data.field, entity, index)"
            ></component>
        </div>

        <div v-else-if="data.type === 'RichText'" class="richtext-box">
            <component v-bind:is="getComponent('elem-richtext')" :name="name" :required="data.required" :field="data.field" :value="getValue(data.field, entity, index)"></component>
        </div>

        <div v-else-if="data.type === 'Keyboard'" class="keyboard-box">
            <component v-bind:is="getComponent('elem-keyboard')" :name="name" :required="data.required" :field="data.field" :value="getValue(data.field, entity, index)"></component>
        </div>
    </div>
</template>

<script lang="ts">
import Theme from "@/module/theme/theme"
import Utils from "@/module/utils/utils"

export default {
    data() {
        return {
            form_value: {},
            name: null,
            isDisplay: true
        }
    },

    props: {
        data: Object,
        config: Object,
        entity: String,
        isList: {
            type: Boolean,
            default: false,
        },
        index: Number,
        value: {
            type: Object,
            default: new Object(),
        },
    },

    watch: {
        value: function (value: any) {
            this.form_value = value
        },
    },

    created() {
        const form_value = (this.form_value = this.value || {})
        this.initial_value = Utils.copy(form_value)

        this.name = this.entity ? `${this.entity}[${this.index}].${this.data.name}` : this.data.name
    },

    mounted() {
        Theme.processPage(this.$el)
        // 监听页面大小变化
        window.addEventListener("resize", this.onResize)
        // 初始化
        this.$nextTick(() => this.onResize())
    },

    beforeUnmount() {
        // 移除监听
        window.removeEventListener("resize", this.onResize)
    },

    methods: {
        onResize() {
            if (!this.$refs.elem) return
            // 获取父级元素的宽度
            const width = this.$refs.elem.parentElement.offsetWidth

            if (width > 1200) {
                this.$refs.elem.style.width = "33.33%"
            } else if (width > 800) {
                this.$refs.elem.style.width = "50%"
            } else {
                this.$refs.elem.style.width = "100%"
            }
        },

        onChangeData(evt: ElemEvent<any>) {
            const value = this.form_value
            value[evt.name] = evt.value

            this.$emit("change-data", {
                value: value,
                type: "elem-form",
            })
        },

        getTypeName(type: string) {
            switch (type) {
                case "Select":
                    return "（选择）"
                case "Upload":
                    return "（上传文件）"
                case "Switch":
                    return "（开关）"
                default:
                    return ""
            }
        },

        getValue(field: string, name: string, idx: number, key?: string) {
            try {
                var value: any

                if (!name || name === "null") {
                    value = this.initial_value[field]
                } else if (this.initial_value[name] && !Utils.isBlank(idx)) {
                    value = this.initial_value[name][idx][field]
                } else {
                    value = this.initial_value[name][field]
                }

                if (key && Utils.isExist(value)) {
                    if (value instanceof Array) {
                        return Utils.each(value, v => v[key])
                    }

                    return value[key]
                }

                return value
            } catch (e) {
                return null
            }
        },

        getComponent(name: string): any {
            return require(`./${name}.vue`).default
        },

        getConditionValue() {
            var c: string = this.data.where

            if (!c) {
                this.isDisplay = true
                return true
            }

            var isDisplay = new Function(`return ${c.replace(/&{(\w*)}/g, "this?.$1")}`).call(this.form_value)

            if (!this.isDisplay && isDisplay) {
                this.$nextTick(() => this.onResize())
            }

            this.isDisplay = isDisplay

            return isDisplay
        },
    },
}
</script>

<style lang="less">
@import (reference) "/src/style/utils.less";
@import (reference) "/src/style/color.less";

.elem-form-item-box {
    width: 100%;
    padding: 10px 20px 10px 20px;

    .border-box;

    > .title {
        font-size: 16px;
        color: #8998ad;
        line-height: 40px;
    }
}

.item-Editor,
.item-RichText,
.item-Keyboard {
    width: 100% !important;
}

.item-Map {
    height: auto;

    .map-box {
        width: 100%;
        height: auto;
    }
}

.item-Date {
    .date-box {
        .date-picker {
            width: 100%;

            * {
                color: #333;
            }

            .ivu-date-picker-prev-btn-arrow-double i:after,
            .ivu-date-picker-next-btn-arrow-double i:after {
                display: none;
            }

            .ivu-date-picker-cells .ivu-date-picker-cells-cell-next-month em,
            .ivu-date-picker-cells .ivu-date-picker-cells-cell-prev-month em {
                color: #c5c8ce;
            }

            .ivu-input {
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

                &::placeholder {
                    color: #666666;
                }
            }
        }

        &.dark .date-picker .ivu-input {
            color: #fff;
            background: #252a31;
            border-color: @dark_border;

            &:hover,
            &:focus {
                border-color: #5a5a5a;
            }
        }
    }
}
</style>
