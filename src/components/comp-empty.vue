<template>
    <div class="empty-page" :style="{ position : type === 'page' ? 'absolute' : 'relative' }">
        <div class="empty-icon">
            <elem-icon class="icon" name="empty" dark="empty_dark" mode="widthFix"></elem-icon>
        </div>
        <p class="p" v-if="title">{{title}}</p>
        <p class="p" v-else>{{type === 'page' ? language.page : language.components}}</p>
        <p class="prompt" v-if="prompt">{{prompt}}</p>
        <p class="prompt" v-else>{{language.examine}}</p>
        <button v-if="type === 'page'" class="button" @click="onBack">{{language.back}}</button>
    </div>
</template>

<script lang="ts">
import Component, { ComponentMethods } from '../module/component/component'

import elemIcon from './elem-icon.vue'

class EmptyComponent extends ComponentMethods implements ComponentEntity {
    props = {
        // 类型传参为 page 或 component , 默认 page
        type: {
            type: String,
            default: "page"
        },
        title: String,
        prompt: String
    }

    language = {
        page: "当前页面数据为空",
        components: "当前组件数据为空",
        examine: "请检查当前状态或与我们联系",
        back: "返回上一级"
    }

    components = {
        elemIcon
    }

    onBack() {
        let onUnload = this.$parent.onUnload
        onUnload && onUnload()

        this.$router.back(-1)
    }
}

export default Component.build(new EmptyComponent)
</script>

<style lang="less">
@import (reference) "/src/style/utils.less";
@import (reference) "/src/style/color.less";

.empty-page {
    padding: 20px;

    .border-box;
    .flex;
    .flex-column;
    .flex-center-all;
    .absolute(0, 0, 0, 0);

    .empty-icon {
        width: 150px;
        height: 150px;

        .flex-shrink;

        .icon {
            width: 100%;
            height: 100%;
        }
    }

    .p {
        font-size: 17px;
        color: #333;
        font-weight: bold;

        .flex-shrink;

        @media (prefers-color-scheme: dark) {
            color: #d3d3d3;
        }
    }

    .prompt {
        font-size: 13px;
        color: #666;
        margin: 5px 0;

        .flex-shrink;

        @media (prefers-color-scheme: dark) {
            color: #999;
        }
    }

    .button {
        width: 80%;
        max-width: 220px;
        height: 45px;
        background: #2faaf7;
        margin-top: 40px;
        color: #fff;

        .flex-shrink;
        .flex;
        .flex-center-all;
        .shadow(0 0 10px rgba(0, 0, 0, 0.2));
        .radius(5px);
    }
}
</style>