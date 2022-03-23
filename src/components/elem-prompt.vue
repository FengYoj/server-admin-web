<template>
    <div class="elem-prompt-page" dark-class="elem-prompt-page-dark" v-show="display">
        <div class="prompt-box">
            <p class="prompt-text">{{title}}</p>
        </div>
    </div>
</template>

<script lang="ts">
import Component, { ComponentMethods } from '@/module/component/component'

class ElemPromptComponent extends ComponentMethods implements ComponentEntity {

    public display: boolean = false

    props = {
        title: String
    }

    mounted() {
        const dom: HTMLDivElement = this.$el

        const parent = this.parent = dom.parentElement

        if (!this.absolute) {
            parent.style.position = "relative"
        }

        parent.onmouseover = () => {
            this.display = true
        }

        parent.onclick = parent.onmouseout = () => {
            this.display = false
        }
    }
}

export default Component.build(new ElemPromptComponent)
</script>

<style lang="less">
@import (reference) "/src/style/utils.less";
@import (reference) "/src/style/color.less";

.elem-prompt-page {
    position: absolute;
    bottom: ~"calc(100% + 20px)";
    left: 50%;
    right: 50%;

    .flex;
    .flex-center-all;

    .prompt-box {
        padding: 10px 20px;
        background: #fff;

        .radius(10px);
        .shadow(0 0 10px rgba(0, 0, 0, 0.1));

        &::after {
            content: "";
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-top: 10px solid #fff;
            filter: drop-shadow(0 3px 2px rgba(0, 0, 0, 0.05));
            position: absolute;
            left: ~"calc(50% - 10px)";
            bottom: -10px;
        }

        .prompt-text {
            white-space: nowrap;
            font-size: 12px;
            color: #333;
        }
    }
}

.elem-prompt-page-dark .prompt-box {
    background: #262c33;

    &::after {
        border-top-color: #262c33;
    }

    .prompt-text {
        white-space: nowrap;
        font-size: 12px;
        color: #fff;
    }
}

</style>