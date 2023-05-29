<template>
    <div class="link-page">
        <iframe class="iframe" :src="src" frameborder="0"></iframe>
    </div>
</template>

<script lang="ts">
import Component, { ComponentMethods } from "@/module/component/component"

class LinkView extends ComponentMethods implements ComponentEntity {
    public title: string = "链接"

    public src: string = null

    onLoad(param: obj) {
        this.src = param.path
    }
}

export default Component.build(new LinkView())
</script>

<style lang="less">
@import (reference) "@/style/utils.less";

.link-page {
    width: 100%;
    height: 100%;

    .flex;

    .iframe {
        width: 100%;
        height: 100%;
    }
}
</style>
