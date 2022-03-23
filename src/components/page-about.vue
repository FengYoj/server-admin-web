<template>
    <div class="about-page">
        <div class="about-box">

        </div>
    </div>
</template>

<script lang="ts">
import Component, { ComponentMethods } from "../module/component/component"

import elemIcon from './elem-icon.vue'

class AboutPage extends ComponentMethods implements ComponentEntity {

    props = {
        
    }

    components = {
        elemIcon
    }

    watch = {
        
    }

    methods = {
        
    }
}

export default Component.build(new AboutPage)
</script>

<style lang="less">
@import (reference) "@/style/utils.less";
@import (reference) "@/style/color.less";

.about-page {
    background: rgba(0, 0, 0, 0.7);
    z-index: 50;
    

    .flex;
    .flex-center-all;
    .fixed(0,0,0,0);

    display: none;

    .about-box {
        width: 500px;
        height: 400px;
        background: #fff;
    }
}
</style>