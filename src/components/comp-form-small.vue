<template>
    <div class="comp-form" id="CreatePage" dark-class="comp-form-dark">
        <div class="step-box" :class="{ padding: !!submitApi }" @scroll="onStepBoxScroll" :id="id + '-step'">
            <form class="form-box" :id="id + '-form'">
                <div class="item-box step-item" v-for="(conf, idx) in structure" :key="idx" :id="'FromItemBox-' + conf.name" :data-step-id="'StepItemBox-' + conf.name">
                    <div class="item-base step-base" :class="'step-item-' + idx" v-if="getConditionValue(conf.where)">
                        <div class="title-box">
                            <p class="serial-number">{{ getStepNumber(idx) }}</p>
                            <p class="name">{{ conf.title }}</p>
                        </div>
                        <div class="step-content" v-if="conf.type === 'PASSWORD'">
                            <div class="prompt">密码必须包含 1 个字母和 1 个数字，密码长度至少为 8 个字符，如需修改密码时输入任意字符或删除任意字符即可</div>
                            <div class="form-box">
                                <elem-form v-for="(item, idx) in conf.data" :index="idx" :key="idx" :data="item" :config="conf" :value="value" @change-data="onChangeValue"></elem-form>
                            </div>
                        </div>
                        <div class="step-content" v-else>
                            <div class="prompt" v-if="conf.prompt">{{ conf.prompt }}</div>
                            <div class="form-box" v-if="!conf.list">
                                <elem-form v-for="(item, idx) in conf.data" :index="idx" :key="idx" :data="item" :config="conf" :value="value" @change-data="onChangeValue"></elem-form>
                            </div>
                            <div class="form-box" v-else>
                                <div class="list-box" v-for="(sub, sub_idx) in getStepMap(conf.name)" :key="sub.key_id">
                                    <elem-form
                                        v-for="(item, idx) in conf.data"
                                        :entity="conf.name"
                                        :index="sub_idx"
                                        :key="sub.key_id + idx"
                                        :data="item"
                                        :config="conf"
                                        :value="value"
                                        @change-data="onChangeValue"
                                    ></elem-form>
                                    <div class="operating-box">
                                        <button type="button" class="clear-button" @click="onChangeList('clear', conf.name, sub_idx)">
                                            <elem-icon class="icon-box" name="clear_red"></elem-icon>
                                        </button>
                                        <button type="button" class="add-button" @click="onChangeList('append', conf.name)">
                                            <elem-icon class="icon-box" name="add_blue"></elem-icon>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>

        <button v-if="!!submitApi" class="submit-button" @click="submit">提交</button>
    </div>
</template>

<script lang="ts">
import Component, { ComponentMethods } from "@/module/component/component"
import Request from "@/module/request/request"
import Utils from "@/module/utils/utils"
import Message from "@/module/interactive/message"

import elemIcon from "@/components/elem-icon.vue"
import ElemForm from "@/components/elem-form.vue"

class FormView extends ComponentMethods implements ComponentEntity {
    private value: obj = null

    private type: "create" | "edit" | "config" = "create"

    public components = {
        elemIcon,
        ElemForm,
    }

    data() {
        return {
            id: Utils.getStringId(12),
        }
    }

    props = {
        // 表单结构
        structure: Array,
        // 提交数据接口
        submitApi: String,
        // 修改数据接口
        editApi: {
            type: String,
            required: false,
        },
        // 详情接口
        detailApi: {
            type: String,
            required: false,
        },
        // 提交表单的前置事件
        submitBefore: {
            type: Function,
            required: false,
        },
        // 数据 UUID
        uuid: {
            type: String,
            required: false,
        },
    }

    watch = {
        uuid(value: string) {
            if (value && this.detailApi) {
                // 修改为编辑模式
                this.type = "edit"
                // 获取详情
                this.getDetail(value)
            } else {
                // 修改为新建模式
                this.type = "create"
                // 清空数据
                this.value = {}
            }
        },
    }

    activated() {
        if (this.uuid) {
            // 修改为编辑模式
            this.type = "edit"
            // 获取详情
            this.getDetail(this.uuid)
        } else {
            // 修改为新建模式
            this.type = "create"
        }
    }

    deactivated() {
        // 清空数据
        this.value = {}
        // 刷新
        this.$forceUpdate()
    }

    async onLoad(): Promise<void> {
        // this.formConfig = {}
        // this.value = null
        // const name = (this.entity_name = param.name)
        // const type = (this.type = param.type)
        // const config = (this.pageConfig = await Href.getPage(name))
        // if (config.type === "config") {
        //     this.configName = name
        //     Request.get<obj>(`ADMIN://Setting/Config/GetCreateData`, { name: name }).then(async res => {
        //         // 设置标题
        //         this.setTitle(config.title, "config")
        //         this.value = await Request.get<obj>(`ADMIN://Setting/Config/GetData`, { name: name })
        //         this.formConfig = res
        //     })
        // } else {
        //     Request.get<obj>(`ADMIN://${name}/GetCreateData`).then(async res => {
        //         // 设置标题
        //         this.setTitle(config.title)
        //         // 是否为编辑模式
        //         if (type === "edit") {
        //             // 获取实体
        //             this.value = await Request.get<obj>(`ADMIN://${name}/FindEntity`, { uuid: param.i })
        //         }
        //         this.formConfig = res
        //     })
        // }
    }

    setFormData(obj: obj) {
        Object.keys(obj).forEach(key => {
            this.value[key] = obj[key]
        })
    }

    /**
     * 获取详情
     */
    getDetail(uuid: string) {
        Request.get<obj>(this.detailApi, { uuid }).then(res => {
            this.value = res
            // 更新
            this.$forceUpdate()
        })
    }

    onChangeValue(evt: ElemEvent<obj>) {
        this.value = Utils.copy(evt.value)
    }

    /** 监听滚动到指定模块 */
    onScrollToStepBox(id: string): void {
        Utils.getElements<HTMLDivElement>([`#${this.id}-step`, "#" + id], (b, i) => {
            b.scrollTo({
                top: i.offsetTop - 80,
                left: 0,
                behavior: "smooth",
            })
        })
    }

    /**
     * 获取序号
     */
    getStepNumber(idx: number) {
        const es = Utils.getElementAll(".step-base")

        for (let i = 0, leng = es.length; i < leng; i++) {
            if (es[i].classList.contains(".step-item-" + idx)) {
                return i + 1
            }
        }

        return idx + 1
    }

    async submit() {
        const data = await this.getFormData()

        if (!this.submitApi) {
            return this.$emit("on-submit", {
                tag: "comp-form",
                value: data,
            })
        }

        Request.post((this.type === "edit" ? this.editApi : null) || this.submitApi, data, {
            json: true,
        }).then(() => {
            Message.success(this.getTypeName(), true)
                .onTimeout(() => {
                    this.$emit("on-submit", {
                        tag: "comp-form",
                        value: data,
                    })
                })
                .build()
        })
    }

    getTypeName() {
        switch (this.type) {
            case "create":
                return "添加成功"
            case "edit":
                return "修改成功"
            case "config":
                return "配置成功"
        }
    }

    public onChangeList(type: "append" | "clear", name: string, idx?: number) {
        const step: obj[] = this.step_map[name]

        if (type === "append") {
            step.push({
                key_id: Utils.getUuid(),
            })
        } else {
            step.splice(idx, 1)
        }
    }

    clear() {
        this.value = {}
    }

    getConditionValue(where: string) {
        if (!where) return true
        return new Function(`return ${where.replace(/&{(\w*)}/g, "this.$1")}`).call(this.value)
    }

    async getFormData() {
        const status = await Utils.getFormData(`#${this.id}-form`)

        if (status.isBlank()) {
            Message.error(status.getMessage())
            throw new Error(status.getMessage())
        }

        var data = {
            ...this.getParams(),
            ...status.getData(),
        }

        if (this.type === "edit") {
            data.uuid = this.value?.uuid
        }

        // 判断并触发父组件提交数据的前置事件
        if (this.submitBefore) {
            var cb = this.submitBefore(data, this.type)

            if (typeof cb !== "undefined") {
                // 判断是否为异步
                if (cb instanceof Promise) {
                    cb = await cb
                }

                if (cb === false) return

                // 使用前置事件返回的数据
                data = cb
            }
        }

        return data
    }
}

export default Component.build(new FormView())
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
