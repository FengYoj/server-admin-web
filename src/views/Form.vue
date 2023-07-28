<template>
    <div class="create-page" id="CreatePage" dark-class="create-page-dark">
        <div class="head-controller-box">
            <div class="back-btn" @click="onBack">
                <elem-icon class="icon" name="back"></elem-icon>
            </div>
            <div class="step-box">
                <div class="step-base">
                    <div
                        class="item-box"
                        v-for="(conf, idx) in formConfig.create"
                        :key="idx"
                        :class="{ activity: idx === 0 }"
                        :id="'StepItemBox-' + conf.name"
                        @click="onScrollToStepBox('FromItemBox-' + conf.name)"
                        v-show="conf.where || true"
                    >
                        <p class="serial-number">{{ idx + 1 }}.</p>
                        <p class="name">{{ conf.title }}</p>
                    </div>
                </div>
            </div>
            <button class="submit-button" @click="submit">
                <elem-icon class="icon" name="success_white"></elem-icon>
                <p class="submit">提交</p>
            </button>
        </div>
        <div class="step-box" @scroll="onStepBoxScroll" id="StepBox">
            <form class="form-box" id="CreateForm">
                <div class="item-box step-item" v-for="(conf, idx) in formConfig.create" :key="idx" :id="'FromItemBox-' + conf.name" :data-step-id="'StepItemBox-' + conf.name">
                    <div class="item-base step-base" :class="'step-item-' + idx" v-if="getConditionValue(conf.where)">
                        <div class="title-box">
                            <p class="serial-number">{{ getStepNumber(idx) }}</p>
                            <p class="name">{{ conf.title }}</p>
                        </div>
                        <div class="step-content" v-if="conf.type === 'PASSWORD'">
                            <div class="prompt">密码必须包含 1 个字母和 1 个数字，密码长度至少为 8 个字符，如需修改密码时输入任意字符或删除任意字符即可</div>
                            <div class="form-box">
                                <comp-form v-for="(item, idx) in conf.data" :index="idx" :key="idx" :data="item" :config="conf" :value="value" @change-data="onChangeValue"></comp-form>
                            </div>
                        </div>
                        <div class="step-content" v-else>
                            <div class="prompt" v-if="conf.prompt">{{ conf.prompt }}</div>
                            <div class="form-box" v-if="!conf.list">
                                <comp-form v-for="(item, idx) in conf.data" :index="idx" :key="idx" :data="item" :config="conf" :value="value" @change-data="onChangeValue"></comp-form>
                            </div>
                            <div class="form-box" v-else>
                                <div class="list-box" v-for="(sub, sub_idx) in getStepMap(conf.name)" :key="sub.key_id">
                                    <comp-form
                                        v-for="(item, idx) in conf.data"
                                        :entity="conf.name"
                                        :index="sub_idx"
                                        :key="sub.key_id + idx"
                                        :data="item"
                                        :config="conf"
                                        :value="value"
                                        @change-data="onChangeValue"
                                    ></comp-form>
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
    </div>
</template>

<script lang="ts">
import Component, { ComponentMethods } from "@/module/component/component"
import Request from "@/module/request/request"
import Utils from "@/module/utils/utils"
import Message from "@/module/interactive/message"

import elemIcon from "@/components/elem-icon.vue"
import compForm from "@/components/comp-form.vue"
import Href from "@/module/config/href"

class FormView extends ComponentMethods implements ComponentEntity {
    private formConfig: obj = {}

    private value: obj = null

    private type: "create" | "edit" | "config" = "create"

    private step_map: obj = {}

    public components = {
        elemIcon,
        compForm,
    }

    async onLoad(param: obj): Promise<void> {
        this.formConfig = {}
        this.value = null

        const name = (this.entity_name = param.name)
        const type = (this.type = param.type)
        const config = (this.pageConfig = await Href.getPage(name))

        if (config.type === "config") {
            this.configName = name

            Request.get<obj>(`ADMIN://Setting/Config/GetCreateData`, { name: name }).then(async res => {
                // 设置标题
                this.setTitle(config.title, "config")

                this.value = await Request.get<obj>(`ADMIN://Setting/Config/GetData`, { name: name })

                this.formConfig = res
            })
        } else {
            Request.get<obj>(`ADMIN://${name}/GetCreateData`).then(async res => {
                // 设置标题
                this.setTitle(config.title)

                // 是否为编辑模式
                if (type === "edit") {
                    // 获取实体
                    this.value = await Request.get<obj>(`ADMIN://${name}/FindEntity`, { uuid: param.i })
                }

                this.formConfig = res
            })
        }
    }

    onChangeValue(evt: ElemEvent<obj>) {
        this.value = Utils.copy(evt.value)
    }

    /** 监听滚动到指定模块 */
    onScrollToStepBox(id: string): void {
        Utils.getElements<HTMLDivElement>(["#StepBox", "#" + id], (b, i) => {
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
        const status = await Utils.getFormData("#CreateForm")

        if (status.isBlank()) {
            return Message.error(status.getMessage())
        }

        const data = {
            ...this.getParams(),
            ...status.getData(),
        }

        let url: string

        if (this.pageConfig.type === "config") {
            data.configName = this.configName
            // 配置文件保存路径
            url = "ADMIN://Setting/Config/Save"
        } else {
            url = `ADMIN://${this.entity_name}/Save`
        }

        if (this.type === "edit") {
            data.uuid = this.value.uuid
        }

        Request.post(url, data, {
            json: true,
        }).then(() => {
            Message.success(this.getTypeName(), true)
                .onTimeout(() => {
                    // 返回上一步
                    if (this.type !== "config") {
                        this.onBack()
                    }
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

    private getStepMap(name: string): obj[] {
        if (!this.step_map[name]) {
            let size = this.value && this.value[name] && this.value[name].length > 0 ? this.value[name].length : 1
            var arr = []

            for (let i = 0; i < size; i++) {
                arr.push({
                    key_id: Utils.getUuid(),
                })
            }

            this.step_map[name] = arr
        }

        return this.step_map[name]
    }

    private onChangeList(type: "append" | "clear", name: string, idx?: number) {
        const step: obj[] = this.step_map[name]

        if (type === "append") {
            step.push({
                key_id: Utils.getUuid(),
            })
        } else {
            step.splice(idx, 1)
        }
    }

    getConditionValue(where: string) {
        if (!where) return true
        return new Function(`return ${where.replace(/&{(\w*)}/g, "this.$1")}`).call(this.value)
    }
}

export default Component.build(new FormView())
</script>

<style lang="less">
@import (reference) "@/style/utils.less";
@import (reference) "@/style/color.less";

.create-page {
    position: relative;
    overflow: hidden;
    background: #fff;
    height: 100%;
    z-index: 30;

    .shadow(5px 5px 10px rgba(0,0,0,0.05));
    .radius(8px);
    .flex;
    .flex-column;

    .head-controller-box {
        width: 100%;
        height: 80px;

        .border-position(bottom);
        .flex;
        .flex-center-items;
        .border-box;
        .flex-shrink;
        .flex-content(space-between);

        > .back-btn {
            position: relative;
            height: 100%;
            cursor: pointer;
            padding: 0 30px;

            .flex;
            .flex-center-all;

            &::after {
                content: "";
                width: 1px;
                background: #eee;

                .absolute(20px, 0, 20px, initial);
            }

            .icon {
                width: 30px;
                height: 30px;
            }
        }

        > .step-box {
            height: 100%;
            margin: 0 10%;

            > .step-base {
                width: 100%;
                height: 100%;

                .flex;
                .scroll-x(1px);

                > .item-box {
                    cursor: pointer;
                    position: relative;
                    margin-right: 60px;
                    height: 100%;
                    flex: none;

                    .flex-shrink;
                    .flex;
                    .flex-center-items;

                    &::after {
                        content: "";
                        background: #365d9b;
                        height: 3px;
                        opacity: 0;

                        .transition;
                        .radius(3px);
                        .absolute(initial, 30%, 0, 30%);
                    }

                    &:last-child {
                        margin-right: 0;
                    }

                    .serial-number,
                    .name {
                        font-size: 16px;
                        line-height: 25px;
                        color: #c3c3c3;

                        .transition;
                    }

                    .name {
                        margin-left: 5px;
                    }

                    &:hover {
                        .serial-number,
                        .name {
                            color: #36414e;
                        }

                        &::after {
                            opacity: 1;

                            .absolute(initial, 0, 0, 0);
                        }
                    }
                }

                > .activity {
                    .serial-number,
                    .name {
                        color: #36414e;
                    }

                    &::after {
                        opacity: 1;

                        .absolute(initial, 0, 0, 0);
                    }
                }
            }
        }

        .submit-button {
            cursor: pointer;
            margin: 0 30px;
            height: 40px;
            padding: 0 20px;
            background: #00b3d9;
            border: 1px solid #00b3d9;

            .transition;
            .flex-shrink;
            .radius(5px);
            .flex;
            .flex-center-items;

            &:hover {
                .shadow(0 0 10px rgba(0,0,0,0.2));
            }

            .icon {
                width: 18px;
                height: 18px;
            }

            .submit {
                margin-left: 10px;
                color: #fff;
                font-size: 16px;
            }
        }
    }

    > .step-box {
        width: 100%;
        height: 100%;

        .flex-grow;
        .scroll-y;

        > .form-box {
            width: 100%;

            > .item-box {
                padding: 30px;

                .border-position(bottom);

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
                            width: 50px;
                            height: 50px;
                            font-size: 25px;
                            color: #36414e;

                            .border;
                            .radius(50%);
                            .flex;
                            .flex-center-all;
                        }

                        .name {
                            font-size: 25px;
                            margin-left: 20px;
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

                            > .list-box {
                                position: relative;
                                width: 100%;
                                padding: 20px;
                                margin-bottom: 20px;

                                .border;
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
}

.create-page-dark {
    background: @dark_box;

    .head-controller-box {
        border-color: #373a4e;

        > .back-btn::after {
            background: @dark_border;
        }

        > .step-box > .step-base {
            > .item-box {
                .serial-number,
                .name {
                    color: #737373;
                }

                &:hover {
                    .serial-number,
                    .name {
                        color: #fff;
                    }
                }
            }

            > .activity {
                .serial-number,
                .name {
                    color: #fff;
                }
            }
        }
    }

    .step-box > .form-box > .item-box {
        border-color: #26282b;

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
