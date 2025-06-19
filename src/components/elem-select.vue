<template>
    <div class="elem-select-box">
        <elem-input-object :name="name" :value="val" :title="title" :required="required"></elem-input-object>
        <div class="select-base" dark-class="select-base-dark">
            <div class="select-box" :class="{ unfold: unfold }" @click="onFocus">
                <div class="first-box">
                    <div class="label-box" v-if="multiple">
                        <div class="label-item-box" v-for="(item, idx) in label" :key="idx">
                            <p>{{ item }}</p>
                            <div class="delete-btn" @click.stop="onDeleteLabel(idx)">
                                <elem-icon src="static/icon/components/elem-select/" name="close"></elem-icon>
                            </div>
                        </div>
                    </div>
                    <input ref="input" v-model="val_text" class="input" type="text" :placeholder="ph" @focus="onInputFocus" @blur="onInputBlur" @input="onSearchSelect" />
                </div>
                <div class="drop-icon">
                    <elem-icon v-show="val == null && !val_text" src="static/icon/components/elem-select/" name="arrow_bottom" width="50%" height="50%"></elem-icon>
                    <elem-icon v-show="val != null" src="static/icon/components/elem-select/" name="correct" width="60%" height="60%"></elem-icon>
                    <elem-icon v-show="val == null && val_text" src="static/icon/components/elem-select/" name="error" width="60%" height="60%"></elem-icon>
                </div>
                <div class="item-base" ref="item_base" :class="{ unfold: unfold }">
                    <div
                        class="item-box"
                        v-for="(item, idx) in data_list"
                        :key="idx"
                        :value="item.id"
                        :selected="item.id == value"
                        @click.stop="onSelect(item.id, item.value)"
                        v-show="!search || item.value.indexOf(search) > -1"
                    >
                        {{ item.value }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Utils from "../module/utils/utils"
import elemIcon from "./elem-icon.vue"
import elemInputObject from "./elem-input-object.vue"
import Theme from "../module/theme/theme"
import Request from "@/module/request/request"

export default {
    name: "elem-select",

    data() {
        return {
            data_list: null,
            unfold: false,
            val: null,
            val_text: null,
            search: null,
            ph: "",
            label: [],
            unfold_width: 0
        }
    },

    props: {
        datas: {
            type: Array,
            required: false,
        },
        // 远程搜索接口配置
        remotely: {
            type: Object,
            required: false,
        },
        required: {
            type: Boolean,
            default: true,
        },
        title: String,
        placeholder: {
            type: String,
            default: "",
        },
        name: {
            type: String,
            default: "switch",
        },
        multiple: {
            type: Boolean,
            default: false,
        },
        config: {
            type: Object,
            default: new Object(),
        },
        value: null,
    },

    watch: {
        val: function (value, oldValue) {
            this.onChangeData(value, oldValue)
        },
    },

    components: {
        elemIcon,
        elemInputObject,
    },

    created() {
        if (this.datas) {
            const data_list = Utils.copy(this.datas)

            Utils.each(
                data_list,
                (v, i) => {
                    return { id: i, value: v }
                },
                c => "string" === typeof c
            )

            this.data_list = data_list
        } else if (this.config?.type) {
            let sp = this.config.type.split("."),
                entity = sp[sp.length - 1]
            Request.get(`ADMIN://${entity}/GetSelectValue`).then(res => {
                this.data_list = res
            })
        }
    },

    mounted() {
        Theme.processPage(this.$el)

        this.ph = this.placeholder ? this.placeholder : `选择${this.title || this.name}${this.required ? "" : "（可选）"}`

        const value = this.value

        if (Utils.isExist(value)) {
            if (this.multiple) {
                Utils.each(value, v => {
                    // Can't choose repeatedly
                    if (this.val && this.val.indexOf(v) > -1) {
                        return
                    }

                    this.val ? this.val.push(v) : (this.val = [v])

                    Utils.each<obj>(
                        this.datas,
                        v => {
                            this.label.push(v.value)
                        },
                        c => c.id == v
                    )
                })
            } else {
                this.val = value

                Utils.each<obj>(
                    this.datas,
                    v => {
                        this.val_text = v.value
                    },
                    c => c.id == value
                )
            }
        }

        this.unfold_width = this.$el.clientWidth
    },

    methods: {
        onFocus() {
            this.$refs.input.focus()
        },

        onChangeData(value, oldValue) {
            this.$emit("change", {
                value: value,
                type: "elem-select",
                name: this.name,
                restore: () => {
                    this.val = oldValue
                },
            })
        },

        onInputFocus() {
            // this.unfold_width = this.$el.clientWidth
            // 获取元素相对于视口的坐标
            const rect = this.$el.getBoundingClientRect();
            
            this.$refs.item_base.style.width = this.$el.clientWidth + "px"
            this.$refs.item_base.style.left = rect.left + "px"
            
            if (rect.top + this.$el.clientHeight + 300 > window.innerHeight) {
                this.$refs.item_base.style.top = "initial"
                this.$refs.item_base.style.bottom = window.innerHeight - rect.top + 2 + "px"
            } else {
                this.$refs.item_base.style.top = rect.top + this.$el.clientHeight + 2 + "px"
                this.$refs.item_base.style.bottom = "initial"
            }

            this.unfold = true
        },

        onInputBlur() {
            setTimeout(() => {
                this.unfold = false
            }, 100)
        },

        onSelect(id, val) {
            if (this.multiple) {
                // Can't choose repeatedly
                if (this.val && this.val.indexOf(id) > -1) {
                    return
                }

                this.val ? this.val.push(id) : (this.val = [id])
                this.label.push(val)
                this.val_text = ""
            } else {
                this.val = id
                this.val_text = val
            }

            setTimeout(() => {
                this.search = null
            }, 500)
        },

        onSearchSelect(evt) {
            const val = (evt.target || evt.srcElement).value

            if (this.config.remotely) {
                this.onSearch(val)
            } else {
                this.val = null
                this.search = val
            }
        },

        onDeleteLabel(idx) {
            if (this.val.length > 1) {
                this.val.splice(idx, 1)
            } else {
                this.val = null
            }

            this.label.splice(idx, 1)
        },

        onSearch(val) {
            if (!val) return (this.data_list = null)

            clearTimeout(this.sst)

            this.sst = setTimeout(() => {
                this.showLoadingSign = true

                Request.get<obj[]>(this.config.remotely.api, {
                    [this.remotely.search]: val,
                })
                    .then(res => {
                        const arr = []

                        for (let i = 0, d = res; i < d.length; i++) {
                            const e = d[i]

                            arr.push({
                                id: e[this.remotely.id],
                                value: e[this.remotely.value],
                            })
                        }

                        this.data_list = arr
                    })
                    .finally(() => {
                        this.showLoadingSign = false
                    })
            }, 300)
        },
    },
}
</script>

<style lang="less">
@import (reference) "/src/style/utils.less";
@import (reference) "/src/style/color.less";

.elem-select-box {
    position: relative;
    width: 100%;
    min-height: 45px;

    .select-base {
        position: relative;
        width: 100%;
        height: 100%;

        .select-box {
            background: #fff;
            border-radius: 6px;
            transition: all 0.3s ease;
            overflow: hidden;
            cursor: pointer;

            .border;

            &:hover {
                border-color: #b3b3b3;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }

            .first-box {
                position: relative;
                padding: 4px 12px;
                min-height: 45px;
                display: flex;
                flex-wrap: wrap;
                align-items: center;

                .scroll-x(2px);

                .label-box {
                    max-width: 90%;
                    flex-shrink: 0;
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;

                    .label-item-box {
                        margin: 5px 10px 5px 0;
                        padding: 3px 5px 3px 10px;
                        display: flex;
                        align-items: center;
                        background: #2faaf7;
                        border-radius: 4px;
                        box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        transition: all 0.3s ease;

                        &:hover {
                            box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
                        }

                        p {
                            font-size: 14px;
                            color: #fff;
                        }

                        .delete-btn {
                            cursor: pointer;
                            padding: 3px 8px;
                            width: 10px;
                            height: 10px;
                            display: flex;
                            box-sizing: initial;
                        }
                    }
                }

                .input {
                    cursor: pointer;
                    position: relative;
                    width: auto;
                    padding: 5px 40px 5px 0;
                    box-sizing: border-box;
                    z-index: 10;
                    font-size: 14px;

                    .flex-grow;
                }
            }

            .drop-icon {
                position: absolute;
                top: 0;
                right: 0;
                height: 45px;
                width: 50px;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 8;

                .flex-shrink;

                img {
                    width: 25px;
                    height: 25px;
                }
            }

            .item-base {
                position: fixed;
                width: inherit;
                margin-top: 3px;
                max-height: 0;
                overflow-y: hidden;
                transition: all 0.2s ease;
                z-index: 90;
                background: #fff;
                border-radius: 6px;
                
                .shadow(10px 10px 20px rgba(0,0,0,0.3));

                .item-box {
                    padding: 10px 12px;
                    min-height: 40px;
                    line-height: 20px;
                    font-size: 14px;
                    display: flex;
                    align-items: center;

                    .border-position(top);

                    &:hover {
                        cursor: pointer;
                        background: #f3f3f3;
                    }
                }
            }

            .unfold {
                max-height: 300px;
                z-index: 90;

                .scroll-y;
            }
        }

        > .unfold {
            border-color: #b3b3b3;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            z-index: 90;
        }
    }

    .select-base-dark {
        .select-box {
            background: #252a31;
            border-color: @dark_border;

            .item-base .item-box {
                border-color: #333;
                background: #252a31;

                &:hover {
                    background: #3e3f46;
                }
            }

            &:hover {
                border-color: #666666;
            }
        }
    }
}
</style>
