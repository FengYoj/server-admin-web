<template>
    <div class="elem-switch-box" :class="['elem-switch-box-size-' + size, { 'elem-switch-box-dark': theme === 'dark' }]">
        <elem-input-object :name="name" :value="val" :is-required="required"></elem-input-object>
        <div class="switch-box" :class="val ? 'switch-on' : 'switch-off'" :style="{ 'border-radius': radius + 'px' }">
            <div class="switch-btn on-btn" @click="onChangeSwitch(true)">{{ on }}</div>
            <div class="switch-btn off-btn" @click="onChangeSwitch(false)">{{ off }}</div>
            <div class="block" :style="{ 'border-radius': radius + 'px' }"></div>
        </div>
    </div>
</template>

<script lang="ts">
import elemInputObject from "./elem-input-object.vue"
import Theme from "../module/theme/theme"

export default {
    data() {
        return {
            radius: null,
            val: null,
            theme: Theme.getTheme(),
        }
    },

    props: {
        on: {
            type: String,
            default: "ON",
        },
        required: {
            type: Boolean,
            default: false,
        },
        off: {
            type: String,
            default: "OFF",
        },
        name: {
            type: String,
            default: "switch",
        },
        value: {
            type: Boolean,
            default: false,
        },

        // 大小，小：small 中：medium
        size: {
            type: String,
            default: "medium",
        },
        // 形状，圆：circle 方：square
        shape: {
            type: String,
            default: "circle",
        },
    },

    components: {
        elemInputObject,
    },

    watch: {
        value: function (v) {
            this.val = v
        },
    },

    mounted() {
        Theme.processPage(this.$el)
    },

    created() {
        this.val = this.value

        if (this.shape === "circle") {
            this.radius = this.size === "medium" ? 20 : 15
        } else {
            this.radius = 6
        }

        Theme.onChange(theme => {
            this.theme = theme
        })
    },

    methods: {
        onChangeSwitch(val: boolean) {
            if (val != this.val) {
                this.val = val

                this.onChange(val)
            }
        },

        onChange(val: boolean) {
            this.$emit("change", {
                value: val,
                type: "elem-switch",
                name: this.name,
                restore: () => {
                    this.val = !val
                },
            })
        },
    },
}
</script>

<style lang="less">
@import (reference) "/src/style/utils.less";

.elem-switch-box {
    .switch-box {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        transition: all 0.3s ease;
        display: flex;
        background: #f3f3f3;
        border-radius: 6px;

        &:hover .block {
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }
    }

    .switch-btn {
        cursor: pointer;
        position: relative;
        width: 50%;
        height: 100%;
        z-index: 15;
        display: flex;
        align-items: center;
        color: #666;
        padding: 10px;
        box-sizing: border-box;
    }

    .off-btn {
        justify-content: flex-end;
    }

    .block {
        position: absolute;
        top: 5px;
        right: 50%;
        bottom: 5px;
        left: 5px;
        background: #fff;
        border-radius: 4px;
        z-index: 10;
        transition: all 0.3s ease;
    }

    .switch-on {
        background: #00b3d9;

        .off-btn {
            color: #d3d3d3;
        }
    }

    .switch-off {
        .on-btn {
            color: #d3d3d3;
        }

        .block {
            left: 50%;
            right: 5px;
        }
    }
}

.elem-switch-box-size-medium {
    width: 120px;
    height: 40px;
}

.elem-switch-box-size-small {
    width: 100px;
    height: 30px;
}

.elem-switch-box-size-small .switch-btn {
    font-size: 14px;
}

.elem-switch-box-dark {
    .switch-box {
        background: #2c2c2e;
    }

    .switch-on {
        background: #0a5495;
    }

    .block {
        background: #e3e3e3;
    }
}
</style>
