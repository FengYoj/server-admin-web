<template>
    <div class="video-page">
        <div class="video-base" v-if="display">
            <div class="video-box">
                <video class="video" controls="controls" :src="src" controlslist="nodownload"></video>
            </div>
            <div class="operating-box">
                <div class="close-box" @click="onClose">
                    <elem-icon class="icon" name="close_blue"></elem-icon>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Component, { ComponentMethods } from "../module/component/component"

import elemIcon from './elem-icon.vue'

class VideoPage extends ComponentMethods implements ComponentEntity {
    private display: boolean = false

    props = {
        src: String
    }

    components = {
        elemIcon
    }

    watch = {
        src: function(val: obj) {
            !!val && (this.display = true)
        }
    }

    methods = {
        onClose() {
            this.display = false

            this.$emit('close', true);
        }
    }
}

export default Component.build(new VideoPage)
</script>

<style lang="less">
@import '/src/style/utils.less';
@import "/src/style/color.less";

.video-page {
    .video-base {
        background: rgba(0, 0, 0, 0.7);
        z-index: 30;

        .flex;
        .flex-center-all;
        .fixed(0,0,0,0);

        .video-box {
            position: relative;
            width: 90%;
            max-width: 600px;
            max-height: 60%;

            .video {
                width: 100%;
                max-height: 100%;
            }
        }

        .operating-box {
            width: 75px;
            height: 50px;
            background: #fff;
            overflow: hidden;

            .radius(25px);
            .absolute(initial, initial, 75px, ~"calc(50% - 75px / 2)");
            .flex;

            .close-box {
                cursor: pointer;
                width: 75px;
                height: 50px;

                .flex;
                .flex-center-all;

                .icon {
                    width: 25px;
                    height: 25px;
                }
            }
        }
    }
}
</style>