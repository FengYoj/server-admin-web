<template>
    <div class="tool-page">
        <div class="tool-box" dark-class="tool-box-dark">
            <div class="item-box" v-for="(item, idx) in tools" :key="idx" :class="{ disable: !item.href }" @click="jump(item.href)">
                <div class="head-color" :style="{ 'background-color' : item.color }"></div>
                <div class="icon-box" :style="{ 'background-color' : item.color }">
                    <elem-icon src="static/icon/tool/" :name="item.icon"></elem-icon>
                </div>
                <div class="title">{{item.title}}</div>
                <p class="explain">{{item.explain}}</p>
                <div class="child-box" v-if="item.child">
                    <div class="item-box" v-for="(c, c_idx) in item.child" :key="c_idx" @click.stop="jump(c.href)">
                        <elem-icon src="static/icon/tool/" :name="c.icon"></elem-icon>
                        <elem-prompt :title="c.title"></elem-prompt>
                    </div>
                </div>
                <div class="arrow-right" v-else>
                    <elem-icon class="icon" name="arrow_right"></elem-icon>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Component, { ComponentMethods } from '@/module/component/component'

import elemIcon from '@/components/elem-icon.vue'
import elemPrompt from '@/components/elem-prompt.vue'
 
class ToolView extends ComponentMethods implements ComponentEntity {

    public title: string = "工具箱"

    private tools = [
        {
            icon: "blocklist",
            href: "/table?name=AdminAccount",
            title: "管理员用户",
            explain: "可对管理员用户进行添加、管理的操作。",
            color: "#117bbd"
        },
        {
            icon: "blocklist",
            href: "/table?name=BlockList",
            title: "限制名单",
            explain: "通过限制 IP 进行限制访问，包括 API 请求 和 资源文件 的任何访问。",
            color: "#000"
        },
        {
            icon: "allowlist",
            href: "/table?name=Allowlist",
            title: "准许名单",
            explain: "通过添加准许 IP 进行无限制的访问，即使超过访问频率限制的次数也不会进行拦截。",
            color: "#87dbb1"
        },
        {
            icon: "exception",
            href: "/table?name=Exception",
            title: "程序异常",
            explain: "通过查阅程序异常信息，快速定位异常程序所在以及查看异常详情信息。",
            color: "#da5231"
        },
        {
            icon: "access",
            href: "/table?name=Access",
            title: "访问日志",
            explain: "访问日志包括详细的访问数据、请求参数、IP地址等。",
            color: "#2faaf7"
        },
        {
            icon: "order",
            href: "/table?name=OrdersException",
            title: "异常订单",
            explain: "可查阅所有关于订单的异常信息。",
            color: "#FF2C61"
        },
        {
            icon: "language",
            title: "语言包",
            explain: "管理各终端程序与管理端的语言包。",
            color: "#6451ff",
            child: [{
                icon: "language_sign",
                href: "/table?name=LanguageSign",
                title: "语言标识符"
            }, {
                icon: "language_package",
                href: "/table?name=Language",
                title: "语言包"
            }]
        },
        {
            icon: "collect",
            href: "/table?name=Collect",
            title: "数据收集",
            explain: "临时数据收集用于分析数据结构和异常信息。",
            color: "#4889A7"
        }
    ]

    components = {
        elemIcon,
        elemPrompt
    }
}

export default Component.build(new ToolView)
</script>

<style lang="less">
@import (reference) "@/style/utils.less";
@import (reference) "@/style/color.less";

.tool-page {
    padding: 10px;

    .tool-box {
        width: 100%;

        .flex;
        .flex-wrap;
        .flex-grow;

        >.item-box {
            cursor: pointer;
            position: relative;
            width: ~"calc(100% / 6 - 20px)";
            margin: 10px;
            padding: 25px;
            background: #fff;

            .border;
            .radius(5px);
            .border-box;
            .transition;

            &:hover {
                .shadow(0 0 20px rgba(0,0,0,0.05));
            }

            @media (max-width: 2300px) {
                width: ~"calc(100% / 5 - 20px)";
            }

            @media (max-width: 1600px) {
                width: ~"calc(25% - 20px)";
            }

            @media (max-width: 1200px) {
                width: ~"calc(33.33% - 20px)";
            }

            @media (max-width: 1000px) {
                width: ~"calc(50% - 20px)";
            }

            @media (max-width: 500px) {
                width: ~"calc(100% - 20px)";
            }

            .head-color {
                width: 50px;
                height: 2px;
                background: #2faaf7;

                .absolute(0, initial, initial, 25px);
            }

            .icon-box {
                width: 50px;
                height: 50px;
                background: #87dbb1;

                .radius(3px);
                .flex;
                .flex-center-all;

                .icon {
                    width: 60%;
                    height: 60%;
                }
            }

            .title {
                margin: 15px 0 10px 0;
                font-size: 16px;
                letter-spacing: 1px;
                font-weight: 600;
            }

            .explain {
                font-size: 12px;
                letter-spacing: 2px;
                height: 60px;
                line-height: 20px;
                color: #888;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 3;
                overflow: hidden;
            }

            .arrow-right {
                margin-top: 20px;
                height: 30px;
                width: 100%;

                .icon {
                    width: 30px;
                    height: 30px;
                    float: right;
                }
            }

            .child-box {
                margin-top: 20px;
                height: 30px;
                width: 100%;

                .flex;
                .flex-content(flex-end);
                .flex-center-items;

                >.item-box {
                    cursor: pointer;
                    margin-right: 10px;
                    width: 30px;
                    height: 30px;
                    background: #eee;

                    .radius(3px);
                    .flex;
                    .flex-center-all;

                    &:last-child {
                        margin-right: 0;
                    }

                    .icon {
                        width: 60%;
                        height: 60%;
                    }
                }
            }
        }

        .disable {
            cursor: initial;
        }
    }

    .tool-box-dark >.item-box {
        background: @dark_box;

        .child-box >.item-box {
            background: #2f3042;
        }
    }
}
</style>