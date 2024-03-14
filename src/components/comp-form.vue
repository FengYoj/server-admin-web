<template>
    <comp-model ref="form_model" :title="title" height="auto">
        <comp-form-small ref="form" :structure="formStructure" :submitApi="formSubmitApi" @on-submit="onSubmit"></comp-form-small>
    </comp-model>
</template>

<script lang="ts">
import Component, { ComponentMethods } from "@/module/component/component"

import compModel from "@/components/comp-model.vue"
import compFormSmall from "@/components/comp-form-small.vue"

class CompFormView extends ComponentMethods implements ComponentEntity {

    public components = {
        compModel,
        compFormSmall,
    }

    data() {
        return {
            title: "表单",
            formStructure: null,
            formSubmitApi: null,
        }
    }

    methods = {
        display(param: obj) {
            this.title = param.title
            this.formStructure = param.structure
            this.formSubmitApi = param.submitApi
            this.$refs.form_model.onDisplay()
        },

        onSubmit() {
            this.$refs.form_model.onClose()
            this.$refs.form.clear()
            this.$emit("on-submit")
        }
    }
}

export default Component.build(new CompFormView())
</script>

<style lang="less">
@import (reference) "@/style/utils.less";
@import (reference) "@/style/color.less";

.comp-form {
    position: relative;
    overflow: hidden;
    height: 100%;
    z-index: 30;

    .flex;
    .flex-column;

    > .step-box {
        width: 100%;
        height: 100%;

        .flex-grow;
        .scroll-y;

        &.padding {
            padding-bottom: 80px;
        }

        > .form-box {
            width: 100%;

            > .item-box {
                padding: 20px 10px 10px;

                &:last-child {
                    border-bottom: initial;
                }

                > .item-base {
                    > .title-box {
                        margin: 0 20px;
                        width: 100%;

                        .flex;
                        .flex-center-items;

                        .serial-number {
                            width: 40px;
                            height: 40px;
                            font-size: 25px;
                            color: #36414e;

                            .border(3px);
                            .radius(50%);
                            .flex;
                            .flex-center-all;
                            .flex-shrink;
                        }

                        .name {
                            font-size: 25px;
                            margin: 0 20px;
                            color: #36414e;
                        }
                    }

                    > .step-content {
                        width: 100%;

                        > .prompt {
                            margin: 30px 20px 0 20px;
                            font-size: 14px;
                            max-width: 350px;
                            line-height: 22px;
                            letter-spacing: 1px;
                            color: #888;

                            p {
                                color: #888;
                            }

                            .title {
                                color: #333;
                            }
                        }

                        > .form-box {
                            width: 100%;
                            margin-top: 20px;

                            .flex;
                            .flex-wrap;

                            .elem-form-item-box {
                                padding: 5px 20px;
                            }

                            > .list-box {
                                position: relative;
                                width: 100%;
                                padding: 20px;
                                margin-bottom: 20px;

                                .border(1px);
                                .radius(6px);
                                .flex;
                                .flex-wrap;

                                &:last-child {
                                    margin-bottom: 0;
                                }

                                > .operating-box {
                                    width: 26px;

                                    .flex;
                                    .flex-column;
                                    .flex-center-content;
                                    .absolute(0, -13px, 0, initial);

                                    button {
                                        cursor: pointer;
                                        width: 26px;
                                        height: 26px;
                                        padding: 0;
                                        background: #fff;
                                        border: 1px solid #e3e3e3;

                                        .shadow(0 0 10px rgba(0,0,0,0.1));
                                        .radius(50%);
                                        .flex;
                                        .flex-center-all;
                                        .transition;

                                        &:hover {
                                            .shadow(0 2px 10px rgba(0,0,0,0.3));
                                        }

                                        .icon-box {
                                            width: 70%;
                                            height: 70%;
                                        }
                                    }

                                    .add-button {
                                        display: none;
                                        margin-top: 10px;
                                    }
                                }

                                &:only-child {
                                    .operating-box {
                                        .add-button {
                                            margin-top: 0;
                                        }

                                        .clear-button {
                                            display: none;
                                        }
                                    }
                                }

                                &:last-child {
                                    margin-bottom: 0;

                                    .operating-box {
                                        .add-button {
                                            .flex;
                                        }
                                    }
                                }
                            }

                            .input-error {
                                border-color: #d6626e;
                            }
                        }
                    }
                }
            }
        }
    }

    .submit-button {
        position: absolute;
        left: 20px;
        bottom: 20px;
        right: 20px;
        height: 45px;
        background: #2faaf7;
        color: #fff;
        border: none;
        border-radius: 6px;
        font-size: 16px;
        cursor: pointer;
        transition: background 0.3s;
        box-shadow: 0 0 10px rgba(0,0,0,0.3);
        z-index: 50;
    }
}

.comp-form-dark {
    .step-box > .form-box > .item-box {
        .item-base .title-box {
            .serial-number,
            .name {
                color: #fff;
            }

            .serial-number {
                border-color: #515574;
                background: #2c343e;
            }
        }
    }
}
</style>
