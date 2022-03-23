<template>
    <div class="elem-options-box" :class="{ 'elem-options-activity' : focus,  'elem-options-box-bottom': direction === 'bottom', 'elem-options-box-top': direction !== 'bottom'}">
        <div class="options-base">
            <p v-if="all" class="item" @click="onSelect()">所有</p>
            <p class="item" v-for="(item,idx) in data" :key="idx" @click="onSelect(item, idx)">{{item.title || item}}</p>
        </div>
        <div class="arrow-box" :style="{ left: arrow_left }"></div>
    </div>
</template>

<script lang="ts">
import Utils from "../module/utils/utils"

export default {
    data() {
		return {
            focus: false,
            arrow_left: "15px"
		}
    },
    
    props: {
        el: null,
        data: Array,
        all: {
            type: Boolean,
            default: true
        },
        direction: {
            type: String,
            default: "bottom"
        }
    },

    mounted() {
        var child

        if ("string" === typeof this.el) {
            child = Utils.getElement(this.el)
        } else {
            child = this.el
        }

        // 箭头左侧定位
        this.arrow_left = (child.offsetWidth / 2) + "px"

        child.tabIndex = 0
        child.style.cursor = "pointer"

        if (!child.style.position) {
            child.style.position = "relative"
        }

        child.onfocus = () => {
            this.focus = true
        }

        child.onblur = () => {
            this.focus = false
        }

        this.child = child
    },
    methods: {
        onSelect(data, idx) {

            // 默认为 “所有” 选项
            if (Utils.isBlank(data)) {
                data = {
                    title: "所有",
                    value: null
                }
            }

            if (!(data instanceof Object)) {
                data = {
                    value: data
                }
            }

            data.index = idx

            this.$emit('select', {
                value: data,
                type: "elem-options",
                name: this.name
            })

            // 触发失焦事件
            this.child.blur()
        }
    }
}
</script>

<style lang="less">

.elem-options-box-bottom {
    top: calc(100% + 15px);
    bottom: initial;
}

.elem-options-box-bottom .arrow-box {
    top: -10px;
    bottom: initial;
    transform: rotate(180deg);
}

.elem-options-box-top {
    top: initial;
    bottom: calc(100% + 15px);
}

.elem-options-box {
    visibility: hidden;
    z-index: 40;
    opacity: 0;
    -webkit-transition: all 0.1s;
    transition: all 0.1s;
    -webkit-transition-timing-function: ease;
    transition-timing-function: ease;
    position: absolute;
    left: -10px;

    .options-base {
        background: #2d3539;
        max-height: 200px;
        overflow-y: auto;
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
        border-radius: 5px;
        -webkit-box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);

        &::-webkit-scrollbar {
            width: 5px;
        }

        .item {
            cursor: pointer;
            padding: 0 30px;
            height: 50px;
            text-align: center;
            line-height: 50px;
            color: #c3c3c3;
            white-space: nowrap;
            font-size: 14px;
            box-sizing: border-box;

            &:hover {
                background: #4e5457;
                color: #fff;
            }
        }
    }

    .arrow-box {
        content: "";
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-top: 10px solid #2d3539;
        position: absolute;
        right: initial;
        left: 15px;
    }
}

.elem-options-activity {
    visibility: initial;
    opacity: 1;
}
</style>