<template>
    <div class="initial-page" v-cloak dark-class="initial-dark-page">
        <div class="close-box" @click="onCloseStep">
            <elem-icon name="close_white"></elem-icon>
        </div>

        <div class="steer-box">
            <p class="title t-c">设置向导</p>
            <p class="prompt t-c">跟着设置向导完善基础设置吧！</p>
            <div class="number-box">
                <div class="item-box" v-for="(item, idx) in initials" :key="idx" :class="{ activity: step === idx, success: step > idx }">
                    <div class="index">{{ idx + 1 }}</div>
                    <div class="info-box">
                        <div class="name">{{ item.title }}</div>
                    </div>
                </div>
            </div>
            <div class="form-box">
                <comp-form-small v-show="step === idx" v-for="(item, idx) in initials" :key="idx" :ref="item.name" :structure="item.value"></comp-form-small>
            </div>
            <div class="button-box">
                <button class="button back" :class="{ disabled: step === 0 }" @click="onBackStep">
                    <elem-icon name="back" width="20px" height="20px"></elem-icon>
                </button>
                <button class="button next" @click="onNextStep">{{ step === initials?.length - 1 ? "提交" : "下一步" }}</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Component, { ComponentMethods } from "@/module/component/component"

import Package from "@/../package.json"
import Request from "@/module/request/request"

import elemIcon from "@/components/elem-icon.vue"
import compMenu from "@/components/comp-menu.vue"
import compFormSmall from "@/components/comp-form-small.vue"
import Message from "@/module/interactive/message"

class InitialPage extends ComponentMethods implements ComponentEntity {
    components = {
        elemIcon,
        compMenu,
        compFormSmall,
    }

    public step: number = 0

    data() {
        return {
            display: false,
            show: false,
            version: Package.version,
            structure: null,
            initials: null,
        }
    }

    watch = {}

    mounted() {
        this.getInitialConfig()
    }

    public getInitialConfig() {
        Request.get<obj>("ADMIN://Setting/Config/GetInitialConfigs").then(res => {
            this.initials = res
        })
    }

    /**
     * 关闭
     */
    onCloseStep() {
        Message.info("是否确认关闭设置向导？（可稍后自行设置）", true)
            .onConfirm(() => {
                Request.post("ADMIN://Setting/Config/SetInitialStatus").then(() => {
                    this.$emit("on-success", {
                        tag: "Initial",
                    })
                })
            })
            .build()
    }

    /**
     * 下一步
     */
    public async onNextStep() {
        const item = this.initials[this.step]
        // 获取当前表单
        const form = this.$refs[item.name][0]
        // 获取表单数据
        const data = await form.getFormData()
        // 缓存表单数据
        item.formData = data
        // 最后一步提交
        if (this.step === this.initials.length - 1) {
            // 提交
            Request.post("ADMIN://Setting/Config/Initial", {
                data: this.initials.map((item: obj) => {
                    return {
                        name: item.name,
                        value: item.formData,
                    }
                })
            }, {
                json: true
            }).then(() => {
                this.$emit("on-success", {
                    tag: "Initial",
                })
            })
        } else {
            this.step++
        }
    }

    /**
     * 上一步
     */
    public onBackStep() {
        if (this.step > 0) this.step--
    }
}

export default Component.build(new InitialPage())
</script>

<style lang="less">
@import (reference) "@/style/utils.less";
@import (reference) "@/style/color.less";

.initial-page {
    width: 100%;
    z-index: 100;
    background: linear-gradient(to bottom right, #117bbd, #00293e 90%);

    .transition;
    .fixed(0, 0, 0, 0);
    .flex;
    .flex-center-all;

    .close-box {
        cursor: pointer;
        width: 40px;
        height: 40px;
        padding: 10px;

        .absolute(30px, 30px, initial, initial);
    }

    .steer-box {
        position: relative;
        width: 90%;
        max-width: 1000px;
        margin: 0 auto;
        max-width: 80%;
        z-index: 20;

        .flex;
        .flex-column;
        .flex-items(flex-start);

        .logo {
            width: 100%;
            height: 120px;
            text-align: center;
            margin-bottom: 20px;

            img {
                width: initial;
            }
        }

        > .title {
            width: 100%;
            font-size: 32px;
            text-align: center;
        }

        > .prompt {
            margin-top: 10px;
            width: 100%;
            font-size: 14px;
            text-align: center;
            letter-spacing: 2px;
            opacity: 0.8;
        }

        .number-box {
            margin: 20px auto;
            height: 50px;
            background: #fff;
            border-radius: 8px;
            border-color: #f3f3f3;

            .border;
            .flex;
            .flex-center-items;
            .flex-shrink;

            > .item-box {
                padding: 0 10px;
                position: relative;

                .flex;
                .flex-center-items;

                &:not(:last-child)::after {
                    content: "";
                    width: 1px;
                    background: #e3e3e3;

                    .absolute(30%, 0, 30%, initial);
                }

                .index {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    background: #e8e8e8;
                    color: #999;
                    font-weight: bold;
                    line-height: 1;

                    .flex;
                    .flex-center-all;
                }

                .info-box {
                    display: none;
                    margin-left: 10px;

                    .step {
                        font-size: 10px;
                        color: #2faaf7;
                    }

                    .name {
                        font-size: 13px;
                        color: #000;
                    }
                }

                &.activity {
                    .flex-grow;

                    .index {
                        background: #2faaf7;
                        color: #fff;
                        box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
                    }

                    .info-box {
                        display: block;
                    }
                }

                &.success {
                    .index {
                        background: #2faaf7;
                        color: #fff;
                        box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
                    }
                }
            }
        }

        > .form-box {
            position: relative;
            width: 100%;
            overflow: hidden;
            height: calc(100vh * 0.6);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 10px;
            background-color: #fff;
        }

        .button-box {
            width: 90%;
            max-width: 350px;
            margin: 0 auto;

            .flex;
            .flex-center-items;
            .flex-content(space-between);

            .button {
                width: 300px;
                height: 45px;
                margin: 25px auto 0 auto;
                border: initial;
                font-size: 16px;
                letter-spacing: 2px;

                .flex-grow(1);
                .flex;
                .flex-center-all;
                .radius(4px);

                &.back {
                    background: #fff;
                    width: 80px;
                    margin-right: 10px;

                    .flex-shrink;
                }

                &.next {
                    background: #1cb8d6;
                    color: #fff;
                }

                &.disabled {
                    opacity: 0.1;
                    cursor: not-allowed;
                }
            }
        }

        @media (max-width: 500px) {
            & {
                > .title {
                    margin: 10px 0;
                    font-size: 25px;
                }

                > .prompt {
                    margin: 10px 0;
                    font-size: 13px;
                }
            }
        }
    }

    &.initial-dark-page .steer-box > .form-box {
        background: @dark_background;

        .title-box {
            .serial-number {
                color: initial;
            }

            .name {
                color: initial;
            }
        }
    }
}

.t-c {
    color: #fff;
}

.t-b-i {
    background: #0f4354;
}

.t-b-b {
    background: #1cb8d6;
}
</style>
