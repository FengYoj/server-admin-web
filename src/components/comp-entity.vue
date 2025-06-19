<template>
    <div class="entity-page" :class="{ 'entity-page-show': show }" @click="show = false">
        <div class="entity-base" dark-class="entity-base-dark" @click.stop>
            <div class="page-head">
                <div class="back-btn" @click="show = false">
                    <elem-icon name="arrow_right_white"></elem-icon>
                </div>
                <p class="title">{{ entity_title }}</p>
            </div>
            <div class="entity-box" v-if="entity">
                <div class="item-box" v-for="(item, idx) in fields" :key="idx" :class="'item-' + item.type">
                    <p class="key">{{ item.title }}</p>
                    <p class="value">{{ entity[item.name] ?? '-' }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Request from "@/module/request/request"
import Component, { ComponentMethods } from "../module/component/component"

import elemIcon from "./elem-icon.vue"

class EntityComponent extends ComponentMethods implements ComponentEntity {
    private fields: obj[] = null

    private entity: obj = null

    private show: boolean = false

    public entity_title: string = "实体"

    public entity_name: string

    props = {
        config: Object,
        name: String,
        title: {
            type: String,
            default: "实体",
        },
    }

    language = {}

    components = {
        elemIcon,
    }

    created() {
        if (this.name) {
            this.getConfig(this.name)
        }

        if (this.title) {
            this.entity_title = this.title
        }
    }

    setConfig(config: { name: string; title: string }) {
        if (config.name) {
            this.getConfig(config.name)
        }

        if (config.title) {
            this.entity_title = config.title
        }
    }

    getConfig(name: string) {
        this.entity_name = name

        Request.get<obj[]>(`ADMIN://${name}/GetEntityInfo`).then(res => {
            this.fields = res.sort(v1 => (v1.type === "Textarea" ? 1 : -1))
        })
    }

    open(uuid: string): void {
        Request.get<obj>(`ADMIN://${this.entity_name}/FindProcessEntity`, { uuid }).then(res => {
            this.entity = res
            this.show = true
        })
    }
}

export default Component.build(new EntityComponent())
</script>

<style lang="less">
@import (reference) "/src/style/utils.less";
@import (reference) "/src/style/color.less";

.entity-page {
    background: rgba(0, 0, 0, 0.3);
    visibility: hidden;
    z-index: 20;
    overflow: hidden;

    .absolute(0, 0, 0, 0);

    .entity-base {
        width: 300px;
        transform: translateX(100%);
        background: #fff;

        .border;
        .transition;
        .absolute(0, 0, 0, initial);
        .border-box;
        .flex;
        .flex-column;

        .page-head {
            padding: 20px;
            height: 50px;

            .flex-shrink;
            .flex;
            .flex-center-items;

            .back-btn {
                cursor: pointer;
                width: 40px;
                height: 40px;
                background: #2faaf7;

                .transition;
                .radius(5px);
                .flex;
                .flex-center-all;

                &:hover {
                    .shadow;
                }

                .icon {
                    width: 60%;
                    height: 60%;
                }
            }

            .title {
                margin-left: 20px;
                font-size: 20px;
                font-weight: 600;
            }
        }

        .entity-box {
            padding: 0 20px;
            align-content: flex-start;

            .scroll-y(5px);
            .flex-grow;
            .flex;
            .flex-wrap;
            .flex-items(flex-start);

            > .item-box {
                padding: 10px 5px;
                width: 50%;

                .border-box;

                .key {
                    font-size: 14px;
                    color: #999;
                }

                .value {
                    margin-top: 5px;
                    font-size: 12px;
                    line-height: 20px;
                    font-weight: 600;
                    word-break: break-word;
                }
            }

            > .item-Textarea {
                width: 100%;
            }
        }
    }

    .entity-base-dark {
        background: #282d33;
    }
}

.entity-page-show {
    visibility: initial;

    .entity-base {
        transform: translateX(0);
    }
}
</style>
