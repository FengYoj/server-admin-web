<template>
    <div class="elem-table" :style="{ height: height, 'max-height': expand ? 'initial' : 'calc(100vh - 80px)' }">
        <!-- 大标题，覆盖整个宽度 -->
        <div class="title" v-if="title">{{ title }}</div>
        <div class="table-box" ref="table_box">
            <!-- 头部标题区 -->
            <div class="row head" v-if="head">
                <div class="col float-left" v-if="isSelector" style="width: 50px; flex-grow: initial">
                    <Checkbox
                        :indeterminate="selecteds.length > 0 && tableData.length !== selecteds.length"
                        :value="tableData && tableData.length > 0 && tableData.length === selecteds.length"
                        @on-change="onChangeAllSelector"
                    ></Checkbox>
                </div>
                <div class="col float-left" v-if="isIndex" style="width: 100px; flex-grow: initial">序号</div>
                <div class="col" v-for="(col, idx) in columns" :key="idx" :style="{ width: col._w, 'max-width': col.maxWidth ? col.maxWidth + 'px' : '' }" :class="'float-' + (col.float || col.fixed)">
                    <span>{{ col.title || col.key }}</span>
                    <!-- 排序图标 -->
                    <div class="sort" :class="col.sort === 'asc' ? 'asc' : 'desc'" v-if="typeof col.sort === 'string'" @click="onChangeSort(col)"></div>
                </div>
            </div>
            <!-- 内容区 -->
            <div class="row" v-for="(row, idx) in tableData" :key="idx">
                <!-- 多选框 -->
                <div class="col float-left" v-if="isSelector" style="width: 50px; flex-grow: initial">
                    <Checkbox :value="selecteds.findIndex(v => v._id === row._id) > -1" @on-change="onChangeSelector($event, row)"></Checkbox>
                </div>
                <!-- 序号 -->
                <div class="col float-left" v-if="isIndex" style="width: 100px; flex-grow: initial">{{ idx + 1 }}</div>
                <div
                    class="col"
                    v-for="(col, idx) in columns"
                    :key="idx"
                    :style="{ width: col._w, 'max-width': col.maxWidth ? col.maxWidth + 'px' : '', color: getHighlightColor(col, row), cursor: col.click ? 'pointer' : '' }"
                    :class="'float-' + (col.float || col.fixed)"
                    @click="col.click && col.click({ row, index: idx })"
                >
                    <slot v-if="col.slot" :name="col.slot" :row="row" :col="col"></slot>
                    <!-- 自定义组件类型 -->
                    <ElemRender v-else-if="col.render" :render="col.render" :row="row" :index="idx"></ElemRender>
                    <div v-else v-html="getValue(col, row)"></div>
                </div>
            </div>
            <!-- 统计区 -->
            <div class="row sum" v-if="isIndex && Object.keys(sums).length > 0">
                <div class="col" style="width: 100px; flex-grow: initial">合计</div>
                <div class="col" v-for="(col, idx) in columns" :key="idx" :style="{ width: col._w, 'max-width': col.maxWidth ? col.maxWidth + 'px' : '' }" :class="'float-' + (col.float || col.fixed)">
                    <div>{{ typeof sums[col.key] === "number" ? sums[col.key] : "" }}</div>
                </div>
            </div>
        </div>
        <!-- 分页控件 -->
        <div class="page-box" v-show="!!tableApi && !hidePage">
            <Page
                :current="currentPage"
                @on-page-size-change="onChangePageSize"
                :page-size="pageSize"
                :page-size-opts="[20, 50, 100, 500]"
                :total="total"
                size="small"
                show-total
                show-elevator
                show-sizer
                @on-change="onChangePage"
            />
        </div>
        <div class="load-box" :class="{ ac: isLoading }">
            <Spin fix></Spin>
        </div>
        <!-- 空数据提示 -->
        <div class="empty-box" v-if="!tableData || tableData.length == 0" :style="{ top: 'calc(50% - 20px + ' + (head ? 21 : 0) + 'px)' }">暂无数据</div>
    </div>
</template>

<script lang="ts">
import RequestPage from "@/module/request/page"
import Utils from "@/module/utils/utils"
import ElemRender from "@/module/entity/header"

export default {
    components: {
        ElemRender,
    },

    data() {
        return {
            // 表格数据
            tableData: null,
            // 当前页码
            currentPage: 1,
            // 页面大小
            pageSize: 20,
            // 总数
            total: 0,
            // 统计
            sums: {},
            // 选择器
            selecteds: [],
            // 是否加载中
            isLoading: false,
            // 隐藏 Page 控制器
            hidePage: false,
        }
    },

    props: {
        // 大标题
        title: {
            type: String,
            required: false,
        },
        // 是否显示表头
        head: {
            type: Boolean,
            default: true,
        },
        // 列配置
        columns: Object,
        // 接口
        tableApi: {
            type: String,
            required: false,
        },
        // 高度
        height: {
            type: String,
            default: "auto",
        },
        // 数据列表
        dataList: {
            type: Array,
            required: false,
        },
        // 显示选择器
        isSelector: {
            type: Boolean,
            default: false,
        },
        // 显示序号
        isIndex: {
            type: Boolean,
            default: false,
        },
        // 主题色
        color: {
            type: String,
            default: "#2faaf7",
        },
        // 展开（无最大高度限制）
        expand: {
            type: Boolean,
            default: false,
        },
        // 请求方法
        method: {
            type: String,
            default: "get",
        },
        // 处理分页配置
        processPageConfig: {
            type: Function,
            required: false,
        },
        // 分页参数 key 值名称
        keys: {
            type: Object,
            default: new Object(null),
        },
        // 接口数据
        data: null,
        // 数据处理
        processData: {
            type: Function,
            required: false,
        },
    },

    watch: {
        tableApi(v) {
            if (!v) return
            // 写入 url
            this.req.setUrl(v)
        },

        dataList: {
            handler(v) {
                if (!v) return
                this.tableData = JSON.parse(JSON.stringify(v))
                // 处理数据
                this.onProcessData()
            },
            immediate: true,
        },

        columns: {
            handler(v) {
                if (!v) return
                // 处理数据
                this.onProcessData()
            },
            immediate: true,
        },

        selecteds(v) {
            this.$emit("on-selector", {
                tag: "ElemTable",
                value: v,
            })
        },

        tableData(v) {
            this.$emit("on-load", {
                tag: "ElemTable",
                value: v,
            })
        },
    },

    mounted() {
        this.req = new RequestPage(this.tableApi, {
            method: this.method.toUpperCase(),
            json: this.method.toUpperCase() === "POST", // post 请求时内容为 json 类型
            type: "block", // 块状，不合并
            data: this.data,
            keys: this.keys,
            load: !!this.tableApi,
            processPageConfig: this.processPageConfig,
            processData: res => {
                this.hidePage = !res.page && !res.pageSize && !res.data?.currentPage && !res.data?.pageSize

                if (this.processData) {
                    return this.processData(res)
                }
            },
            onChange: data => {
                this.selecteds = []
                this.tableData = data
                this.currentPage = this.req.getPage()
                this.total = this.req.getTotal()
                // 处理数据
                this.onProcessData()
            },
            onLoadBefore: () => {
                this.isLoading = true
            },
            onLoadAfter: () => {
                // 滚动到顶部 & 左侧
                this.$refs.table_box.scrollTo(0, 0)
                // 延迟 300ms 关闭
                setTimeout(() => {
                    this.isLoading = false
                }, 300)
            },
            onFail: err => {
                console.log(err)
            },
        })
    },

    methods: {
        /**
         * 处理单元格数据
         */
        onProcessData() {
            for (let i = 0, cs = this.columns; i < cs.length; i++) {
                const c = cs[i]

                Utils.each<obj>(this.tableData, v => {
                    if (!v._id) {
                        v._id = Utils.getUuid()
                    }
                })

                // 排序
                if (c.sort && this.tableData?.length > 0) {
                    if (typeof c.sort === "function") {
                        this.tableData.sort((a, b) => c.sort(this.getValue(c, a), this.getValue(c, b)))
                    } else
                        c.sort === "desc"
                            ? this.tableData.sort((a, b) => {
                                  a = this.getValue(c, a)
                                  b = this.getValue(c, b)

                                  if (typeof b !== "number") return -1
                                  return b - a
                              })
                            : this.tableData.sort((a, b) => {
                                  a = this.getValue(c, a)
                                  b = this.getValue(c, b)

                                  if (typeof a !== "number") return -1
                                  return a - b
                              })
                }

                if (c.sum) {
                    var sum = 0

                    if (this.tableData?.length > 0) {
                        for (let di = 0, ds = this.tableData; di < ds.length; di++) {
                            let v = ds[di]
                            var value = this.getValue(c, v)

                            if (typeof value === "number") {
                                sum += value
                            }
                        }
                    }

                    this.sums[c.key] = sum
                }

                if (c.width) {
                    c._w = typeof c.width === "number" ? c.width + "px" : c.width
                    continue
                } else if (c.minWidth) {
                    c._w = typeof c.minWidth === "number" ? c.minWidth + "px" : c.minWidth
                    continue
                } else c._w = null

                c._w = this.getMinWidth(c.title)

                if (this.tableData?.length > 0) {
                    for (let di = 0, ds = this.tableData; di < ds.length; di++) {
                        let v = ds[di]
                        var val = null

                        if (c.key && v[c.key]) {
                            val = v[c.key]
                        }

                        if (val) {
                            let w = this.getMinWidth(val)

                            if (!c._w || c._w < w) {
                                c._w = w
                            }
                        }
                    }
                }

                if (!c._w) {
                    c._w = "200px"
                } else if (typeof c._w === "number") {
                    c._w = c._w + "px"
                }
            }
        },

        /**
         * 获取最小宽度值
         */
        getMinWidth(text) {
            // 非字符串则转换为字符串格式
            if (typeof text !== "string") text = String(text)
            // HTML 标签不处理，默认 200 px
            if (/^<.*\/.*>$/.test(text)) return 200
            // 普通字符 15 px，中文加多 20 px/字
            let size = text.length * 15 + (text.match(/[\u4E00-\u9FA5]/g)?.length || 0) * 20
            // 最小宽度为 80, 最大宽度为 1000
            return size > 80 ? (size > 1000 ? 1000 : size) : 80
        },

        /**
         * 监听页面大小变化
         */
        onChangePageSize(evt) {
            this.req?.setIndex(this.currentPage, evt, this.currentPage === 1)
        },

        /**
         * 监听页码变化
         */
        onChangePage(evt) {
            this.req?.setIndex(evt)
        },

        /**
         * 获取单元格值
         */
        getValue(col, row) {
            var v = row[col.key || col.title]

            if (!v && col.render) {
                try {
                    v = col.render(null, { row })
                } catch {
                    console.error("出错")
                }
            }

            return typeof v === "number" ? v : v || "-"
        },

        /**
         * 获取单元格样式
         */
        getHighlightColor(col, row) {
            let v = this.getValue(col, row)

            if (typeof v === "number" && col.highlight && v > 0) {
                return this.color
            }

            return "#333333"
        },

        /**
         * 监听排序变化
         */
        onChangeSort(col) {
            this.$set(col, "sort", col.sort === "desc" ? "asc" : "desc")
            // 处理数据
            this.onProcessData()
        },

        /**
         * 监听选择器变化事件
         */
        onChangeSelector(value, item) {
            let s = this.selecteds
            let idx = s.findIndex(v => v._id === item._id)

            if (idx > -1) {
                s.splice(idx, 1)
            } else {
                s.push(item)
            }
        },

        /**
         * 监听全选
         */
        onChangeAllSelector() {
            if (this.tableData.length === this.selecteds.length) {
                return (this.selecteds = [])
            }

            this.selecteds = [].concat(this.tableData)
        },

        /**
         * 刷新
         */
        refresh() {
            this.req?.refresh()
        },

        search(data) {
            this.req?.setData(data)
        },

        reset() {
            this.req?.reset()
        },

        /**
         * 清空勾选
         */
        clearSelecteds() {
            this.selecteds = []
        },

        keyword(t) {
            if (!t) {
                this.tableData = this.copyTableData || this.tableData
                return
            }

            if (!this.copyTableData) {
                this.copyTableData = this.tableData
            }

            const result = []

            Utils.each<obj>(this.copyTableData, l => {
                Utils.eachObj(l, (k, v) => {
                    if (v && String(v).indexOf(t) > -1 && !result.includes(l)) {
                        result.push(l)
                    }
                })
            })

            this.tableData = result
        },
    },
}
</script>

<style lang="less" scoped>
.elem-table {
    position: relative;
    border: 1px solid #f3f3f3;
    border-radius: 6px;
    overflow: hidden;
    min-height: 200px;
    max-height: 100vh;
    display: flex;
    flex-direction: column;

    .title {
        position: sticky;
        width: 100%;
        top: 0;
        right: 0;
        left: 0;
        padding: 15px 20px;
        box-sizing: border-box;
        background: #f3f3f3;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        flex-shrink: 0;
    }

    .table-box {
        position: relative;
        width: 100%;
        background: #fff;
        overflow: auto;
        flex-grow: 1;
        transition: all 0.1s;

        &.loading {
            filter: blur(5px);
        }

        .row {
            position: relative;
            min-width: 100%;
            display: flex;
            transition: all 0.1s;

            &:nth-child(2n + 1) {
                .col {
                    background: #f8f8f8;
                }
            }

            .col {
                padding: 15px 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-grow: 1;
                min-width: 100px;
                flex-shrink: 0;
                background: #fff;
                text-align: center;
                transition: all 0.2s;
                color: #666;
                border-bottom: 1px solid #f8f8f8;

                &.float-left {
                    position: sticky;
                    left: 0;
                    z-index: 10;
                    flex-shrink: 0;
                    z-index: 5;
                    border-right: 1px solid #ededed;
                }

                &.float-right {
                    position: sticky;
                    right: 0;
                    z-index: 10;
                    flex-shrink: 0;
                    z-index: 5;
                    border-left: 1px solid #ededed;
                }
            }

            &:not(.head):hover {
                z-index: 10;

                .col {
                    background: #f3f3f3;
                }
            }

            &.head {
                position: sticky;
                top: 0;
                z-index: 20;

                .col {
                    background: #eee;
                    padding: 18px 20px;
                    font-weight: bold;
                    transition: initial;
                    border-bottom: 0;

                    &.float-left,
                    &.float-right {
                        border-color: #e6e6e6;
                    }

                    .sort {
                        cursor: pointer;
                        width: 20px;
                        height: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;

                        &::after {
                            content: "";
                            width: 0;
                            height: 0;
                            border-left: 4px solid transparent;
                            border-right: 4px solid transparent;
                            border-top: 8px solid green;
                            transform: rotate(0);
                        }

                        &.desc::after {
                            border-top-color: red;
                            transform: rotate(180deg);
                        }
                    }
                }
            }

            &.sum {
                position: sticky;
                bottom: 0;
                z-index: 10;

                .col {
                    background: #fafafa;
                    color: #555;
                    font-weight: bold;
                }
            }
        }
    }

    .page-box {
        padding: 10px;
        display: flex;
        justify-content: flex-end;
        flex-shrink: 0;
        background: #fff;
        border-top: 1px solid #f3f3f3;
    }

    .load-box {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        visibility: hidden;
        transition: all 0.2s;
        opacity: 0;
        z-index: 50;

        &.ac {
            visibility: initial;
            opacity: 1;
        }

        .ivu-spin-fix {
            background: rgba(255, 255, 255, 0.9);
        }
    }

    .empty-box {
        position: absolute;
        top: calc(50% - 20px);
        left: calc(50% - 40px);
        width: 80px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #888;
    }
}
</style>
