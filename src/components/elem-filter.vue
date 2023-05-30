<template>
    <div class="filter-box">
        <div class="item-box" v-for="(conf, idx) in filters" :key="idx" :id="'filter_item_' + idx">
            <p class="name">{{ conf.title }}</p>
            <div class="value">
                <p class="p" v-if="titles[conf.name]">{{ titles[conf.name] }}</p>
                <p class="p" v-else>所有</p>
                <elem-icon class="icon" name="select"></elem-icon>
            </div>
            <elem-options :el="'#filter_item_' + idx" :data="conf.data" @select="onFilter(conf.name, $event.value)"></elem-options>
        </div>
        <!-- 日期范围过滤器，最低支持版本为 1.4.1 -->
        <div class="item-box" v-if="check('1.4.1')">
            <p class="name">日期范围</p>
            <DatePicker
                :open="date_open"
                :model-value="dates"
                confirm
                clearable
                type="daterange"
                split-panels
                @on-clear="date_open = false"
                @on-clickoutside="date_open = false"
                @on-ok="date_open = false"
                @on-change="onChangeDate"
            >
                <div class="value" @click="date_open = true">
                    <p class="p" v-if="dates">{{ dates.join(" - ") }}</p>
                    <p class="p" v-else>所有</p>
                    <elem-icon class="icon" name="select"></elem-icon>
                </div>
            </DatePicker>
        </div>
    </div>
</template>

<script lang="ts">
import elemOptions from "./elem-options.vue"
import elemIcon from "./elem-icon.vue"

import Utils from "@/module/utils/utils"
import Version from "@/module/version/version"

export default {
    components: {
        elemOptions,
        elemIcon,
    },

    data() {
        return {
            values: [],
            titles: {},
            date_open: false,
            dates: null,
        }
    },

    props: {
        filters: Object,
    },

    methods: {
        check: Version.checkFrameworkVersion.bind(Version),

        /**
         * 监听过滤事件
         */
        onFilter(field: string, value: obj, operator = "equal"): void {
            const _filter: obj[] = this.values

            if (Utils.isExist(value.value)) {
                let f = Utils.find<obj>(_filter, c => c.key === field)
                let item = {
                    key: field,
                    value: value.value,
                    operator: operator,
                }

                if (f.i > -1) {
                    _filter[f.i] = item
                } else {
                    _filter.push(item)
                }

                this.titles[field] = value.title
            } else {
                // 删除过滤条件
                Utils.each(
                    _filter,
                    () => "delete",
                    c => c.key === field
                )
                // 移除标题
                delete this.titles[field]
            }

            this.$emit("on-change", {
                tag: "elem-filter",
                value: _filter,
            })
        },

        onChangeDate(evt: string[]) {
            // 删除过滤条件
            Utils.each<obj>(
                this.values,
                () => "delete",
                c => c.key === "createdDate"
            )

            if (evt?.[0] && evt?.[1]) {
                if (evt[0] === evt[1])
                    this.values.push({
                        key: "createdDate",
                        value: evt[0],
                        type: "date",
                        operator: "equal",
                    })
                else
                    this.values.push(
                        {
                            key: "createdDate",
                            value: evt[0],
                            type: "date",
                            operator: "greater_equal",
                        },
                        {
                            key: "createdDate",
                            value: evt[1],
                            type: "date",
                            operator: "less_equal",
                        }
                    )

                this.dates = evt
            } else {
                this.dates = null
            }

            // 设置为关闭状态
            this.date_open = false

            this.$emit("on-change", {
                tag: "elem-filter",
                value: this.values,
            })
        },
    },
}
</script>

<style lang="less" scope>
@import (reference) "@/style/utils.less";
@import (reference) "@/style/color.less";

.filter-box {
    .flex-grow;
    .flex;
    .flex-wrap;

    .item-box {
        position: relative;
        margin: 5px 40px 5px 0;

        .name {
            font-size: 14px;
            color: #c4c4c4;
            font-weight: 600;
        }

        .ivu-date-picker {
            display: flex;
        }

        .value {
            cursor: pointer;

            .flex;
            .flex-center-items;

            .p {
                font-size: 12px;
            }

            .icon {
                width: 12px;
                height: 12px;
                margin-left: 3px;
                flex-shrink: 0;
            }
        }
    }
}
</style>
