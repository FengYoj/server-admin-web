<template>
    <div class="table-page loading-page" id="TablePage" dark-class="table-page-dark">
        <div class="head-menu-box">
            <div class="filter-box">
                <div class="item-box" v-for="(conf, idx) in tableConfig.group" :key="idx" :id="'filter_item_' + idx">
                    <p class="name">{{ conf.title }}</p>
                    <div class="value">
                        <p>{{ filter_title["filter_item_" + idx] || "所有" }}</p>
                        <elem-icon class="icon" name="select"></elem-icon>
                    </div>
                    <elem-options :el="'#filter_item_' + idx" :data="conf.data" @select="onFilter(conf.name, 'filter_item_' + idx, $event)"></elem-options>
                </div>

                <div class="item-box">
                    <p class="name">时间范围</p>
                    <div class="value">
                        <DatePicker type="daterange" split-panels placeholder="Select date" style="width: 200px"></DatePicker>
                    </div>
                </div>
            </div>
            <div class="operating-box">
                <div class="search-box">
                    <div class="icon-box">
                        <elem-icon class="icon" name="search"></elem-icon>
                    </div>
                    <input class="input" type="text" placeholder="输入搜索内容" v-model="search" @keyup.enter="getData" />
                </div>
                <a class="add-btn" v-if="tableConfig.pages.indexOf('create') > -1" @click="jumpForm({ type: 'create', name: name })">
                    <elem-icon class="icon" name="add_white"></elem-icon>
                    <p class="text">添加记录</p>
                </a>
                <div class="more-box">
                    <elem-icon class="icon" name="more"></elem-icon>
                    <comp-menu :value="moreMenu" @select="onSelectMoreMenu"></comp-menu>
                </div>
            </div>
        </div>
        <div class="table-box" id="TableID">
            <div class="base-box" id="BaseID">
                <div class="content-box">
                    <div class="head">
                        <div class="item" style="width: 100px">S/N</div>
                        <div class="item" v-for="(item, idx) in tableConfig.table" :key="idx" :style="{ width: item.width + 'px' }">{{ item.title }}</div>
                    </div>
                    <div class="body">
                        <div class="row" v-for="(item, idx) in table" :key="idx">
                            <div class="column" style="width: 100px">
                                <div class="column-box">
                                    <p class="text-box">{{ Number(idx + 1) + (page - 1) * limit }}</p>
                                </div>
                            </div>

                            <div class="column" v-for="(conf, idx) in tableConfig.table" :key="idx" :style="{ width: conf.width + 'px' }">
                                <div class="column-box" v-if="isExist(item[conf.field])">
                                    <!-- 下级实体盒子 -->
                                    <!-- <div v-if="conf.type === 'subclass'" class="subclass-box" th:with="subclass=${item.config}" th:@click="|onOpenSubclass('${item.field}', '${subclass.mappedBy}', '${item.title}', item.uuid)|">
                                        <div class="point" th::class="|[item.${item.field} > 0 ? 'normal-bg' : 'empty-bg']|"></div>
                                        <p class="text" th::class="|[item.${item.field} > 0 ? 'normal-c' : 'empty-c']|" th:text="|{{item.${item.field} > 0 ? ('查看' + item.${item.field} + '条记录') : '无记录'}}|"></p>
                                    </div> -->

                                    <!-- 资源盒子 -->
                                    <div v-if="conf.type === 'Resource'" class="resource-box">
                                        <a
                                            class="item-box"
                                            v-for="(res, idx) in item[conf.field] instanceof Array ? item[conf.field] : [item[conf.field]]"
                                            :key="idx"
                                            :href="res.domain + res.src"
                                            target="view_window"
                                        >
                                            <!-- 图片 -->
                                            <div v-if="conf.config.type === 'image'" class="image-box">
                                                <img class="image" :src="res.url" :alt="res.name" :title="res.name" />
                                            </div>

                                            <!-- 图片 -->
                                            <div v-else-if="conf.config.type === 'video'" class="video-box">
                                                <img class="image" :src="res.cover.url" :alt="res.name" :title="res.name" />
                                                <div class="play-btn">
                                                    <elem-icon class="icon" name="play"></elem-icon>
                                                </div>
                                            </div>

                                            <p v-else>{{ res.name }}</p>
                                        </a>
                                    </div>

                                    <div v-else-if="conf.type === 'Switch'" class="switch-box">
                                        <!-- <p class="text-box" th:text="|{{item.${item.field} ? '是' : '否'}}|"></p> -->
                                        <elem-switch size="small" :value="item[conf.field]" @change="onChangeDataBySwitch($event, conf.field, item.uuid)"></elem-switch>
                                    </div>

                                    <!-- 实体 -->
                                    <!-- <p th:case="'entity'" class="text-box" >Entity</p> -->

                                    <!-- 文本内容 -->
                                    <p v-else class="text-box">{{ item[conf.field] }}</p>
                                </div>

                                <!-- 字段值为空 -->
                                <div class="column-box column-box-null" v-else>-</div>
                            </div>
                        </div>
                        <p class="empty" v-if="!table || 0 >= table.length">当前数据为空</p>
                    </div>
                </div>

                <div class="operating-box" :class="{ 'operating-suspension': suspension }">
                    <div class="operating-title">操作</div>

                    <div class="operating-item" v-for="(item, idx) in table" :key="idx">
                        <div class="button-box" v-for="(conf, idx) in tableConfig.operatings" :key="idx" v-show="conf.type === 'EDIT' ? tableConfig.pages.indexOf('create') > -1 : true && getConditionValue(conf.filter, item)">
                            <!-- 修改 -->
                            <a v-if="conf.type === 'EDIT'" class="edit" @click="jumpForm({ type: 'edit', name: name, i: item.uuid })">编辑</a>

                            <!-- 删除 -->
                            <button v-else-if="conf.type === 'DELETE'" class="delete" @click="onDelete(item.uuid)">删除</button>

                            <button v-else-if="conf.type === 'POPUP'" :style="{ background: conf.background, color: conf.color }" @click="onOperatingPopup(item, conf.url, conf.msg, conf.config)">
                                {{ conf.title }}
                            </button>

                            <!-- 上传文件 -->
                            <button v-else-if="conf.type === 'FILE'" :style="{ background: conf.background, color: conf.color }" @click="onOperatingFile(item, conf.url, conf.msg, conf.config)">
                                {{ conf.title }}
                            </button>

                            <!-- 跳转页面 -->
                            <button v-else-if="conf.type === 'JUMP'" :style="{ background: conf.background, color: conf.color }" @click="onOperatingJump(item, conf.url, conf.msg)">
                                {{ conf.title }}
                            </button>

                            <!-- 发起请求 -->
                            <button
                                v-else-if="conf.type === 'REQUEST'"
                                :style="{ background: conf.background, color: conf.color }"
                                @click="onOperatingRequest(conf.method, item, conf.url, conf.msg)"
                            >
                                {{ conf.title }}
                            </button>

                            <!-- 显示实体 -->
                            <button v-else-if="conf.type === 'ENTITY'" class="entity" @click="openEntity(item)">{{ conf.title }}</button>
                        </div>
                    </div>
                </div>
            </div>
            <comp-entity ref="comp_entity"></comp-entity>
        </div>
        <div class="pagination-box">
            <div class="statistics-box">
                <p class="p">显示</p>
                <div class="select-box">
                    <div class="select-base" dark-class="select-base-dark" tabindex="0" hidefocus="true" @focus="displayLimitOptions = true" @blur="displayLimitOptions = false">
                        <p class="number">{{ limit }}</p>
                        <elem-icon class="icon" name="select" dark="select_white"></elem-icon>
                    </div>
                    <div class="options-box" :class="{ 'options-activity': displayLimitOptions }">
                        <div class="options-base">
                            <p class="item" @click="onSelectLimit" v-for="(item, idx) in 5" :key="idx">{{ item * 10 }}</p>
                        </div>
                    </div>
                </div>
                <p class="p">条记录/页，共 {{ totalElements }} 条记录</p>
            </div>
            <div class="number-box">
                <div class="info-box">当前第 {{ page }} 页，共 {{ totalPages || 1 }} 页</div>
                <div class="pages-box" dark-class="page-box-dark">
                    <div class="previous-box" :class="{ available: page > 1 }" @click="onChangePages('previous')">
                        <elem-icon class="icon" name="previous_white" />
                    </div>
                    <div class="current-box">
                        <div class="select-base" tabindex="0" hidefocus="true" @focus="displayPageOptions = true" @blur="displayPageOptions = false">
                            <p class="number">{{ page }}</p>
                            <elem-icon class="icon" name="select" dark="select_white"></elem-icon>
                        </div>
                        <div class="options-box" :class="{ 'options-activity': displayPageOptions }">
                            <div class="options-base">
                                <p class="item" @click="onSelectPages" v-for="(item, idx) in totalPages" :key="idx">{{ item }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="next-box" :class="{ available: totalPages > page }" @click="onChangePages('next')">
                        <elem-icon class="icon" name="next_white" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Component, { ComponentMethods } from "@/module/component/component"
import Message from "@/module/interactive/message"
import Request from "@/module/request/request"
import Utils from "@/module/utils/utils"
import Href from "@/module/config/href"

import elemIcon from "@/components/elem-icon.vue"
import elemOptions from "@/components/elem-options.vue"
import elemSwitch from "@/components/elem-switch.vue"
import compEntity from "@/components/comp-entity.vue"
import compMenu from "@/components/comp-menu.vue"
import { PageLoading } from "@/module/loading/loading"

class TableView extends ComponentMethods implements ComponentEntity {
    private pageName = "Table"

    /** 表格配置 */
    public tableConfig: obj = {
        pages: [],
    }

    private name: string = null

    private filter: obj = null

    // 是否开启时间检索功能
    public isOpenTimeRetrieval: boolean = false

    public moreMenu = [
        {
            title: "导出数据",
            prompt: "将以 Excel 表格格式导出数据文件",
            sub: [
                {
                    id: "ExportDataByPage",
                    icon: "page",
                    name: "当前页面",
                },
                {
                    id: "ExportAllData",
                    icon: "data",
                    name: "所有数据",
                },
            ],
        },
    ]

    private loading: PageLoading

    data = {
        table: null,
        limit: 10,
        page: 1,
        totalElements: 0,
        totalPages: 0,
        displayLimitOptions: false,
        displayPageOptions: false,
        search: "",
        filter_title: {},

        // 操作菜单悬浮
        suspension: false,
    }

    watch = {
        limit() {
            this.getData()
        },
        page() {
            this.getData()
        },
    }

    components = {
        elemIcon,
        elemOptions,
        elemSwitch,
        compEntity,
        compMenu,
    }

    mounted() {
        this.loading = new PageLoading(this.$el)
    }

    async onLoad(param: obj) {
        this.loading && this.loading.show()

        const name = (this.name = this.getParam<string>("name"))

        const config = (this.pageConfig = await Href.getPage(name))

        if (config === null) {
            return this.jump("/error", { t: "404" })
        }

        this.setTitle(config.title)

        const res = await Request.get<obj>("ADMIN://" + config.tableDataUrl)

        this.api = res.api
        this.tableConfig = res
        this.isOpenTimeRetrieval = res.time

        for (let i = 0, o = res.operatings, l = o.length; i < l; i++) {
            if (o[i].type === "ENTITY") {
                this.$refs.comp_entity.setConfig({
                    title: config.title,
                    name: config.name,
                })
            }
        }

        // 判断是否存在参数
        if (Utils.isExist(param)) {
            let obj = Utils.copy(param)
            // 删除 name 的属性
            delete obj.name
            // 在判断是否存在，存在就写入条件
            if (Utils.isExist(obj)) this.filter = obj
            else this.filter = null
        } else this.filter = null

        // 获取数据
        this.getData()

        Utils.wait(() => {
            Utils.getElements(["#TableID", "#BaseID"], (t, b) => {
                this.suspension = t.clientWidth < b.clientWidth
            })

            Utils.wait(() => {
                this.loading.hide()
            }, 500)
        })
    }

    /**
     * 监听窗口大小变化事件
     */
    onResize() {
        Utils.getElements(["#TableID", "#BaseID"], (t, b) => {
            this.suspension = t.clientWidth < b.clientWidth
        })
    }

    getData() {
        Request.post<obj>(
            this.api + "/FindAllToPage",
            { page: this.page - 1, size: this.limit, search: this.search, filter: this.getFilter() },
            {
                json: true,
            }
        ).then(res => {
            this.table = res.content
            this.totalElements = res.totalElements
            this.totalPages = res.totalPages
        })
    }

    getFilter() {
        var filters = []

        // if (filter) {
        //     filters = filters.concat(filter)
        // }

        if (this.filter && Object.keys(this.filter).length > 0) {
            const _filter = this.filter

            Utils.each(Object.keys(_filter), k => {
                filters.push({
                    key: k,
                    value: _filter[k],
                })
            })
        }

        return filters
    }

    /**
     * 监听过滤事件
     */
    onFilter(field: string, id: string, evt: ElemOptionEvent): void {
        const data = evt.value

        const _filter = this.filter || {}

        if (Utils.isExist(data.value)) {
            _filter[field] = data.value
        } else {
            delete _filter[field]
        }

        this.filter = _filter

        // 显示过滤值
        this.filter_title[id] = data.title

        // 更新数据
        this.getData()
    }

    onSelectLimit(evt: Event): void {
        const e = Utils.getTarget(evt)
        const value = Number(e.innerText)

        if (value !== this.limit) {
            this.limit = value
        }
    }

    onChangePages(type: "previous" | "next"): void {
        if (type === "previous") {
            this.page <= 1 ? Message.info("当前为第一页") : this.page--
        } else {
            this.page >= this.totalPages ? Message.info("当前为最后一页") : this.page++
        }
    }

    onSelectPages(evt: Event): void {
        const e = Utils.getTarget(evt)
        const value = Number(e.innerText)

        if (value !== this.page) {
            this.page = value
        }
    }

    onOpenSubclass(field, mappedBy, title, id) {
        const { i, data } = Utils.find<obj>(this.table, c => c.uuid === id)

        if (i > -1) {
            if (data[field] <= 0) {
                Message.info("当前字段无记录")
            } else {
                // Windows.open({
                //     type: "table",
                //     title,
                //     mappedBy,
                //     id
                // })
            }
        }
    }

    onDelete(id) {
        Message.info("确认删除该记录？", true)
            .onConfirm(() => {
                Request.delete(this.api + "/Delete?i=" + id).then(() => {
                    Message.success("删除成功", true)
                        .onTimeout(() => {
                            this.getData()
                        })
                        .build()
                })
            })
            .build()
    }

    onOpenCreate() {
        // Windows.open({ type: "create" })
    }

    onOpenEdit(id: string): void {
        this.jump("/edit", {
            url: this.api,
            i: id,
        })
    }

    /**
     * 监听跳转事件
     */
    onOperatingJump(item, url, msg) {
        this.onOperatingMsg(msg, () => {
            window.open(this.getUrl(item, url))
        })
    }

    /**
     * 监听请求事件
     */
    async onOperatingRequest(method, item, url, msg) {
        this.onOperatingMsg(msg, () => {
            Request.method(method, this.getUrl(item, url)).then(() => {
                Message.success("成功")
                // 刷新数据
                setTimeout(() => {
                    this.getData()
                }, 1000)
            })
        })
    }

    onOperatingMsg(msg, cb) {
        if (msg) {
            Message.info(msg.content, true)
                .setButton({
                    confirm: msg.confirm,
                    cancel: msg.cancel,
                })
                .onConfirm(cb)
                .build()
        } else cb()
    }

    /**
     * 文件上传操作事件
     */
    onOperatingFile(data, url, msg, config) {
        const input = document.createElement("input")

        input.type = "file"
        input.accept = config.accept

        input.onchange = (evt: any) => {
            var formData = new FormData()

            formData.append("file", evt.target.files[0])

            Request.post(this.getUrl(data, url), formData).then(() => {
                Message.success("上传成功", true)
                    .onTimeout(() => {
                        this.getData()
                    })
                    .build()
            })
        }

        input.click()
    }

    onOperatingPopup(data, url, msg) {
        this.onOperatingMsg(msg, () => {
            // Popup.open(this.getUrl(data, url))
        })
    }

    onChangeDataBySwitch(evt, field, id) {
        Request.post(
            this.api + "/ChangeFieldValue",
            { entity: id, field, value: evt.value },
            {
                json: true,
                onFail: () => {
                    evt.restore()
                },
            }
        )
    }

    /**
     * 解析 url
     */
    getUrl(data: obj, url: string): string {
        return new Function(`return \`${url.replace(/\*{(\w*)}/g, "${this.path.$1}").replace(/&{(\w*)}/g, "${this.data.$1}")}\``).call({
            path: {
                api: this.api,
                page: this.page,
            },
            data: data,
        })
    }

    openEntity(data: obj) {
        this.$refs.comp_entity.open(data.uuid)
    }

    onSelectMoreMenu(evt: obj) {
        switch (evt.value) {
            case "ExportAllData":
                Request.download(this.pageConfig.title + ".xlsx", "GET", this.api + "/ExportAllData")
                break
            case "ExportDataByPage":
                Request.download(
                    this.pageConfig.title + ".xlsx",
                    "POST",
                    this.api + "/ExportDataByPage",
                    { page: this.page - 1, size: this.limit, search: this.search, filter: this.getFilter() },
                    {
                        json: true,
                    }
                )
        }
    }

    /**
     * 跳转至表单页面
     */
    jumpForm(param: obj): void {
        if (this.pageConfig.formUrl) {
            this.jump("/link", {
                path: Utils.jsonToParams(param, this.pageConfig.formUrl),
            })
        } else {
            this.jump("/form", { ...param, ...this.getParams() })
        }
    }

    getConditionValue(where: string, value: obj) {
        if (!where) return true
        return new Function(`return ${where.replace(/&{(\w*)}/g, "this.$1")}`).call(value)
    }
}

export default Component.build(new TableView())
</script>

<style lang="less">
@import (reference) "@/style/utils.less";
@import (reference) "@/style/color.less";

.table-page {
    width: 100%;
    height: 100%;
    background: #fff;
    overflow: hidden;

    .shadow(0 0 20px rgba(0, 0, 0, 0.05));
    .radius(10px);
    .flex;
    .flex-column;

    .head-menu-box {
        padding: 20px;

        .flex;
        .flex-center-items;
        .flex-shrink;

        .filter-box {
            .flex-grow;
            .flex;

            .item-box {
                position: relative;
                margin-right: 40px;

                .name {
                    font-size: 14px;
                    color: #c4c4c4;
                    font-weight: 600;
                }

                .value {
                    font-size: 12px;
                    color: #333;
                    font-weight: bold;

                    .flex;
                    .flex-center-items;

                    .icon {
                        width: 12px;
                        height: 12px;
                        margin-left: 3px;
                    }
                }
            }
        }

        .operating-box {
            .flex-shrink;
            .flex;
            .flex-center-items;

            .add-btn {
                cursor: pointer;
                padding: 0 20px;
                height: 35px;
                margin-left: 20px;
                background: #00b3d9;

                .shadow(0 0 5px rgba(0, 0, 0, 0.1));
                .radius(35px);
                .flex;
                .flex-center-items;
                .transition;

                &:hover {
                    .shadow(0 0 10px rgba(0, 0, 0, 0.3));
                }

                &:first-child {
                    margin-left: initial;
                }

                .icon {
                    width: 18px;
                    height: 18px;
                    margin-right: 5px;
                }

                .text {
                    font-size: 14px;
                    color: #fff;
                }
            }

            .search-box {
                position: relative;

                .flex;

                .icon-box {
                    width: 40px;

                    .absolute(0, initial, 0, 0);
                    .flex;
                    .flex-center-all;

                    .icon {
                        width: 50%;
                        height: 50%;
                    }
                }

                .input {
                    padding: 0 20px 0 40px;
                    height: 35px;

                    .border;
                    .radius(35px);
                    .border-box;
                }
            }

            .search {
                background: #fff;
            }

            .more-box {
                margin-left: 20px;
                width: 30px;
                height: 30px;

                .flex;
                .flex-center-all;

                .icon {
                    width: 20px;
                    height: 20px;
                }
            }
        }
    }

    .table-box {
        position: relative;
        width: 100%;

        .scroll-all(8px);
        .flex;
        .flex-grow;

        .base-box {
            min-width: 100%;

            .flex-shrink;
            .flex;
            .flex-items(flex-start);

            .content-box {
                min-height: 100%;
                padding: 0 5px;

                .flex;
                .flex-column;
                .flex-items(flex-start);

                .head {
                    position: -webkit-sticky;
                    position: sticky;
                    top: 0;
                    min-width: 100%;
                    height: 60px;
                    background: #f3f3f3;
                    z-index: 10;

                    .radius(5px);
                    .flex;

                    .item {
                        padding: 0 40px;
                        width: 200px;
                        height: 100%;
                        font-size: 15px;
                        color: #abb4b9;
                        font-weight: bold;

                        .flex;
                        .flex-center-items;
                    }
                }

                .body {
                    min-width: 100%;
                    max-width: 100%;

                    .row {
                        position: relative;
                        height: 50px;
                        z-index: 1;
                        border: 1px solid transparent;

                        .radius(5px);
                        .flex;
                        .transition;
                        .border-box;

                        &:hover {
                            z-index: 5;
                            border-color: #e3e3e3;

                            .shadow(0 5px 20px rgba(0, 0, 0, 0.1));
                        }

                        &:nth-child(2n) {
                            background: #f9f9f9;
                        }

                        .column {
                            padding: 0 40px;
                            width: 200px;
                            height: 100%;

                            .column-box {
                                margin: 3px 0;
                                width: 100%;
                                height: ~"calc(100% - 6px)";
                                letter-spacing: 1px;
                                color: #000;

                                .flex;
                                .flex-center-items;

                                .scroll-x(3px);

                                .text-box {
                                    font-size: 13px;
                                    white-space: nowrap;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                }

                                &:hover .text-box {
                                    overflow: initial;
                                    text-overflow: initial;
                                }

                                .normal-c {
                                    color: #07cd6f;
                                }

                                .normal-bg {
                                    background: #07cd6f;
                                }

                                .empty-c {
                                    color: #ffbb3a;
                                }

                                .empty-bg {
                                    background: #ffbb3a;
                                }

                                .subclass-box {
                                    cursor: pointer;

                                    .flex;
                                    .flex-center-items;
                                    .transition;

                                    .point {
                                        width: 8px;
                                        height: 8px;
                                        border-radius: 100%;
                                    }

                                    .text {
                                        margin-left: 10px;
                                    }
                                }

                                .resource-box {
                                    max-width: 100%;
                                    height: ~"calc(100% - 10px)";
                                    padding: 2px 0;

                                    .flex;
                                    .scroll-x(3px);

                                    .item-box {
                                        width: auto;
                                        height: 100%;
                                        margin-right: 10px;

                                        .flex;
                                        .flex-center-all;

                                        .image-box {
                                            width: auto;
                                            height: 100%;

                                            .image {
                                                width: auto;
                                                height: 100%;
                                            }
                                        }

                                        .video-box {
                                            position: relative;
                                            width: auto;
                                            height: 100%;

                                            .image {
                                                width: auto;
                                                height: 100%;
                                            }

                                            .play-btn {
                                                padding: 5px;
                                                background: rgba(0, 0, 0, 0.5);

                                                .border-box;
                                                .flex;
                                                .flex-center-all;
                                                .absolute(0, 0, 0, 0);

                                                .icon {
                                                    width: 30px;
                                                    height: 30px;
                                                }
                                            }
                                        }

                                        p {
                                            font-size: 13px;
                                        }
                                    }
                                }

                                .switch-box {
                                    label {
                                        margin: 1.5em auto;
                                    }

                                    input {
                                        position: absolute;
                                        left: -9999px;
                                    }

                                    .slider-v1 {
                                        position: relative;
                                        display: block;
                                        width: 3.5em;
                                        height: 2em;
                                        cursor: pointer;
                                        border-radius: 1.5em;
                                        transition: 350ms;
                                        background: linear-gradient(rgba(0, 0, 0, 0.07), rgba(255, 255, 255, 0)), #dddddd;
                                        box-shadow: 0 0.07em 0.1em -0.1em rgba(0, 0, 0, 0.4) inset, 0 0.05em 0.08em -0.01em rgba(255, 255, 255, 0.7);
                                    }

                                    .slider-v1::before {
                                        position: absolute;
                                        content: "";
                                        width: 2em;
                                        height: 2em;
                                        top: 0.5em;
                                        left: 0.5em;
                                        border-radius: 50%;
                                        transition: 250ms ease-in-out;
                                        background: linear-gradient(#f5f5f5 10%, #eeeeee);
                                        box-shadow: 0 0.1em 0.15em -0.05em rgba(255, 255, 255, 0.9) inset, 0 0.5em 0.3em -0.1em rgba(0, 0, 0, 0.25);
                                    }

                                    .slider-v1::after {
                                        position: absolute;
                                        content: "";
                                        width: 1em;
                                        height: 1em;
                                        top: 1em;
                                        left: 6em;
                                        border-radius: 50%;
                                        transition: 250ms ease-in;
                                        background: linear-gradient(rgba(0, 0, 0, 0.07), rgba(255, 255, 255, 0.1)), #dddddd;
                                        box-shadow: 0 0.08em 0.15em -0.1em rgba(0, 0, 0, 0.5) inset, 0 0.05em 0.08em -0.01em rgba(255, 255, 255, 0.7), -7.25em 0 0 -0.25em rgba(0, 0, 0, 0.3);
                                    }

                                    input:checked + .slider-v1::after {
                                        background: linear-gradient(rgba(0, 0, 0, 0.07), rgba(255, 255, 255, 0.1)), #44cc66;
                                        box-shadow: 0 0.08em 0.15em -0.1em rgba(0, 0, 0, 0.5) inset, 0 0.05em 0.08em -0.01em rgba(255, 255, 255, 0.7), -7.25em 0 0 -0.25em rgba(0, 0, 0, 0.12);
                                    }

                                    input:checked + .slider-v1::before {
                                        left: 3em;
                                    }
                                }
                            }

                            .column-box-null {
                                color: #666;
                            }
                        }
                    }

                    .empty {
                        text-align: center;
                        font-size: 15px;
                        color: #888;
                        line-height: 50px;

                        .absolute(60px, 0, initial, 0);
                    }
                }
            }

            .operating-box {
                background: #fff;
                z-index: 10;
                min-height: 100%;
                padding-right: 5px;

                .flex-grow;
                .flex-shrink;
                .flex;
                .flex-column;
                .flex-items(flex-start);

                .operating-title {
                    position: sticky;
                    top: 0;
                    min-width: 100%;
                    padding: 0 30px;
                    height: 60px;
                    font-size: 15px;
                    color: #abb4b9;
                    font-weight: bold;
                    background: #f3f3f3;

                    .border-box;
                    .flex;
                    .flex-center-items;
                    .radius(5px);
                }

                .operating-item {
                    padding: 0 30px;
                    height: 50px;
                    letter-spacing: 1px;
                    color: #000;
                    min-width: 100%;

                    .border-box;
                    .flex;
                    .flex-center-items;

                    &:nth-child(2n-1) {
                        background: #f9f9f9;
                    }

                    .button-box {
                        margin-right: 10px;

                        &:last-child {
                            margin-right: 0;
                        }

                        a,
                        button {
                            cursor: pointer;
                            padding: 5px 12px;
                            color: #fff;
                            font-size: 14px;
                            border: 0;

                            .flex;
                            .transition;
                            .radius(5px);

                            &:hover {
                                .shadow(0 0 10px rgba(0, 0, 0, 0.2));
                            }
                        }
                    }

                    .edit {
                        background: #00b3d9;
                    }

                    .delete {
                        background: #ff5722;
                    }

                    .entity {
                        background: #2faaf7;
                    }
                }
            }

            .operating-suspension {
                position: sticky;
                right: 0;

                .shadow(-5px 0 5px rgba(0, 0, 0, 0.1));

                .operating-title {
                    .radius(0 5px 5px 0);
                }
            }
        }
    }

    .pagination-box {
        padding: 0 20px;
        height: 50px;

        .border-position(top);
        .flex;
        .flex-center-items;
        .flex-content(space-between);
        .flex-shrink;

        .statistics-box {
            .flex;
            .flex-center-items;

            .p {
                font-weight: 300;
                letter-spacing: 1px;
                color: #888;
                font-size: 14px;
            }

            .select-box {
                position: relative;
                margin: 0 10px;

                .select-base {
                    cursor: pointer;
                    padding: 5px 10px;
                    background: #fff;

                    .border;
                    .shadow(0 0 5px rgba(0, 0, 0, 0.1));
                    .radius(5px);
                    .flex;
                    .flex-center-all;

                    .icon {
                        margin-left: 10px;
                        width: 14px;
                        height: 14px;
                    }
                }

                .select-base-dark {
                    background: #1e1d2b;
                }

                .options-box {
                    visibility: hidden;
                    z-index: 40;
                    opacity: 0;

                    .transition(0.1s);
                    .absolute(initial, -10px, ~"calc(100% + 15px)", -10px);

                    &::after {
                        content: "";
                        border-left: 10px solid transparent;
                        border-right: 10px solid transparent;
                        border-top: 10px solid #2d3539;

                        .absolute(initial, initial, -10px, ~"calc(50% - 10px)");
                    }

                    .options-base {
                        width: 100%;
                        background: #2d3539;
                        max-height: 200px;

                        .scroll-y(5px);
                        .radius(5px);
                        .shadow(0 0 5px rgba(0, 0, 0, 0.1));

                        .item {
                            cursor: pointer;
                            width: 100%;
                            height: 40px;
                            text-align: center;
                            line-height: 40px;
                            color: #c3c3c3;

                            &:hover {
                                background: #4e5457;
                                color: #fff;
                            }
                        }
                    }
                }

                .options-activity {
                    visibility: initial;
                    opacity: 1;
                }
            }
        }

        .number-box {
            .flex;
            .flex-center-items;

            .info-box {
                margin-right: 30px;
                color: #888;
                font-size: 14px;
                letter-spacing: 1px;
                font-weight: 300;
            }

            .pages-box {
                height: 30px;

                .border;
                .flex;
                .shadow(0 0 5px rgba(0, 0, 0, 0.1));
                .radius(5px);

                .current-box {
                    position: relative;
                    height: 100%;

                    .select-base {
                        cursor: pointer;
                        padding: 0 10px;
                        height: 100%;
                        background: #fff;

                        .flex;
                        .flex-center-all;

                        .icon {
                            margin-left: 10px;
                            width: 14px;
                            height: 14px;
                        }
                    }

                    .options-box {
                        visibility: hidden;
                        z-index: 40;
                        opacity: 0;

                        .transition(0.1s);
                        .absolute(initial, -10px, ~"calc(100% + 15px)", -10px);

                        &::after {
                            content: "";
                            border-left: 10px solid transparent;
                            border-right: 10px solid transparent;
                            border-top: 10px solid #2d3539;

                            .absolute(initial, initial, -10px, ~"calc(50% - 10px)");
                        }

                        .options-base {
                            width: 100%;
                            background: #2d3539;
                            max-height: 200px;

                            .scroll-y(5px);
                            .radius(5px);
                            .shadow(0 0 5px rgba(0, 0, 0, 0.1));

                            .item {
                                cursor: pointer;
                                width: 100%;
                                height: 40px;
                                text-align: center;
                                line-height: 40px;
                                color: #c3c3c3;

                                &:hover {
                                    background: #4e5457;
                                    color: #fff;
                                }
                            }
                        }
                    }

                    .options-activity {
                        visibility: initial;
                        opacity: 1;
                    }
                }

                .previous-box,
                .next-box {
                    cursor: no-drop;
                    width: 30px;
                    height: 30px;
                    background: #f3f3f3;

                    .flex;
                    .flex-center-all;

                    .icon {
                        width: 15px;
                        height: 15px;
                        -webkit-filter: contrast(0.5);
                        filter: contrast(0.5);
                    }
                }

                .previous-box {
                    .radius(5px 0 0 5px);
                }

                .next-box {
                    .radius(0 5px 5px 0);
                }
            }

            .page-box-dark {
                .current-box .select-base {
                    background: #1e1d2b;
                }

                .previous-box,
                .next-box {
                    background: #535353;
                }
            }

            .pages-box .available {
                cursor: pointer;
                background: #2faaf7;

                .icon {
                    -webkit-filter: initial;
                    filter: initial;
                }
            }
        }
    }
}

.table-page-dark {
    background: @dark_box;

    .table-box .base-box {
        .content-box {
            .head {
                background: #30353b;
            }

            .body .row {
                &:nth-child(2n) {
                    background: #20252b;
                }

                &:hover {
                    border-color: #505050;
                }
            }
        }

        .operating-box {
            background: #191d23;

            .operating-title {
                background: #30353b;
            }

            .operating-item:nth-child(2n-1) {
                background: #20252b;
            }
        }
    }
}
</style>
