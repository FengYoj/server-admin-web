<template>
    <div class="progress-base" :style="{ 'width': size + 'px' , 'height': size + 'px' }">
        <div class="progress-bar-box" :class="{ 'progress-activity' : schedule > 0 }">
            <div class="point" :style="getStartPointStyle()"></div>
            <div class="right-bar" :style="{ transform: 'rotate('+ ((schedule > 50 ? 50 : schedule) / 100 * 360) +'deg)' }">
                <div class="point" :style="getPointStyle()"></div>
            </div>
            <div class="right-cover" v-show="schedule < 50"></div>
            <div class="left-bar" :style="{ transform: 'rotate('+ (schedule / 100 * 360) +'deg)' }">
                <div class="point" :style="getPointStyle()"></div>
            </div>
        </div>

        <div class="inside-box" :style="getInsideStyle()" dark-class="inside-box-dark">
            <p class="title" :style="getTitleStyle()">{{title}}</p>
            <p class="prompt" :style="getPromptStyle()">{{prompt}}</p>
            <button class="btn" :style="getBtnStyle()" @click="onClickBtn" dark-class="btn-dark">{{button}}</button>
        </div>
    </div>
</template>

<script>
import Theme from "../module/theme/theme"

export default {
    props: {
        schedule: Number,
        title: String,
        prompt: String,
        button: String,
        size: {
            type: Number,
            default: 200
        }
    },

    mounted() {
        Theme.processPage(this.$el)
    },

    methods: {
        getTitleStyle() {
            let size = this.size
            let multiple = size / 10

            return {
                'font-size': multiple + 'px',
                'line-height': multiple + 'px'
            }
        },

        getPromptStyle() {
            let size = this.size
            let multiple = size / 12

            return {
                'font-size': multiple + 'px',
                'line-height': multiple + 'px',
                'margin-top': multiple / 2 + 'px'
            }
        },

        getBtnStyle() {
            let size = this.size
            let multiple = size / 12

            return {
                'font-size': multiple + 'px',
                'height': multiple * 2 + 'px',
                'margin-top': multiple / 2 + 'px'
            }
        },

        getPointStyle() {
            let size = this.size
            let multiple = size / 10

            return {
                'width': multiple + 'px',
                'height': multiple + 'px',
                'right': `-${multiple / 2}px`
            }
        },

        getStartPointStyle() {
            let size = this.size
            let multiple = size / 10

            return {
                'width': multiple + 'px',
                'height': multiple + 'px',
                'margin-left': `-${multiple / 2}px`
            }
        },

        getInsideStyle() {
            let size = this.size
            let w_h = `calc(100% - ${size / 10 * 2}px)`

            return {
                'margin': size / 10 + 'px',
                'width': w_h,
                'height': w_h
            }
        },

        onClickBtn() {
            this.$emit('click-btn')
        }
    }
}
</script>

<style lang="less">
@import (reference) "/src/style/utils.less";
@import (reference) "/src/style/color.less";

@c: #2faaf7;

.progress-base {
    position: relative;
    width: 200px;
    height: 200px;
    background: #b5ddf7;

    .shadow(0 0 20px rgba(0, 0, 0, 0.1));
    .radius(50%);

    .progress-bar-box {
        z-index: 10;
        overflow: hidden;

        .radius(50%);
        .absolute(0, 0, 0, 0);

        .right-bar, .left-bar {
            background: @c;
            transform: rotate(100deg);
            transform-origin: right;
            z-index: 13;

            .absolute(0, 50%, 0, 0);
        }

        .right-cover {
            z-index: 14;
            background: #b5ddf7;

            .absolute(0, 50%, 0, 0);
        }
    }

    .progress-activity {
        >.point {
            background: @c;
            width: 20px;
            height: 20px;
            margin-left: -10px;
            z-index: 15;

            .radius(50%);
            .absolute(0, initial, initial, 50%);
        }

        .right-bar, .left-bar {
            .point {
                background: @c;
                width: 20px;
                height: 20px;

                .radius(50%);
                .absolute(0, -10px, initial, initial);
            }
        }
    }

    .inside-box {
        position: relative;
        width: ~"calc(100% - 40px)";
        height: ~"calc(100% - 40px)";
        margin: 20px;
        background: #fff;
        z-index: 15;

        .shadow(0 0 20px rgba(0, 0, 0, 0.1));
        .radius(50%);
        .flex;
        .flex-column;
        .flex-center-all;

        .title {
            font-size: 20px;
            font-weight: bold;
            line-height: 20px;
        }

        .prompt {
            margin-top: 10px;
            font-size:  18px;
            color: #b3b3b3;
        }

        .btn {
            margin-top: 10px;
            padding: 0 15px;
            height: 30px;
            font-size: 16px;
            max-width: 80%;
            white-space: nowrap;
            background: #f6f6f6;

            .ellipsis;
            .radius(15px);
        }

        .btn-dark {
            background: @dark_gray;
        }
    }

    .inside-box-dark {
        background: @dark_box;
    }
}
</style>