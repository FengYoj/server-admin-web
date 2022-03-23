/** version: 1.0.1 */

<template>
    <div class="comp-menu" :class="{ 'comp-menu-dark': isDark(), 'comp-menu-display': display }">
        <div class="item-box" v-for="(item, idx) in menus" :key="idx">
            <div class="title" v-if="item.title">{{item.title}}</div>
            <div v-if="item.prompt" class="prompt">{{item.prompt}}</div>
            <div class="sub-item-box" v-for="(sub, sub_idx) in item.sub" :class="{ disable: sub.disable }" :key="sub_idx" @click.stop="onSelectMenu(sub)">
                <div class="info-box">
                    <div class="icon-box" v-if="sub.icon">
                        <elem-icon :name="sub.icon" :key="sub.id + sub.icon"></elem-icon>
                    </div>
                    <p class="name">{{sub.name}}</p>
                </div>
                <p class="value" v-if="sub.value">{{sub.value}}</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Component, { ComponentMethods } from '../module/component/component'
import Utils from '../module/utils/utils'

import elemIcon from './elem-icon.vue'

class CompMenuComponent extends ComponentMethods implements ComponentEntity {

    private parent: HTMLElement

    data() {
        return {
            display: false,
            menus: null
        }
    }

    props = {
        value: Array,
        cursor: {
            type: String,
            default: "pointer"
        },
        clickType: {
            type: String,
            default: "left"
        },
        position: {
            type: String,
            default: "fixed"
        },
        direction: {
            type: String,
            default: "bottom"
        },
        absolute: {
            type: Boolean,
            default: false
        }
    }

    components = {
        elemIcon
    }

    mounted() {
        const dom: HTMLDivElement = this.$el

        const parent = this.parent = dom.parentElement

        if (!this.absolute && this.position !== "follow") {
            parent.style.position = "relative"
        }

        parent.tabIndex = 0

        if (!parent.style.cursor) {
            parent.style.cursor = this.cursor
        }

        if (this.position === "follow") {
            dom.style.position = "fixed"
        }

        dom.style.userSelect = "none"

        const display = async (evt: obj) => {
            if (this.position === "follow") {
                evt.preventDefault()
            }

            this.evt = evt
            this.display = false
            
            const menu: obj[] = this.getMenu(evt)

            if (menu) {
                for (let i = 0; i < menu.length; i++) {
                    let m = menu[i]
                    // 触发创建事件
                    m.onCreate && m.onCreate(evt, m)
                }
                // 拷贝对象
                let menus = Utils.copy(this.value)
                // 添加组件菜单
                menus.push({
                    title: "组件菜单",
                    sub: menu
                })
                this.menus = menus
            } else {
                this.menus = this.value
            }

            Utils.wait(() => {
                const p = dom.getBoundingClientRect()

                if (this.position === "fixed") {
                    let pr = parent.getBoundingClientRect()

                    if (p.width + pr.x + 100 > window.innerWidth) {
                        dom.style.left = -p.width + pr.width + "px"
                    } else {
                        dom.style.left = "-10px"
                    }

                    if (p.height + pr.y + 100 > window.innerHeight) {
                        dom.style.top = -p.height + "px"
                    } else {
                        dom.style.top = "100%"
                    }
                } else {

                    var x, y

                    if (evt.type.indexOf("touch") > -1) {
                        x = evt.changedTouches[0].pageX
                        y = evt.changedTouches[0].pageY
                    } else {
                        x = evt.x
                        y = evt.y
                    }

                    if (p.width + x + 100 > window.innerWidth) {
                        dom.style.left = x - p.width + "px"
                    } else {
                        dom.style.left = x + "px"
                    }

                    if (p.height + y + 100 > window.innerHeight) {
                        dom.style.top = y - p.height + "px"
                    } else {
                        dom.style.top = y + "px"
                    }
                }

                this.display = true
            })
        }

        const hide = () => {
            this.display = false
        }

        if (this.clickType === "left") {
            parent.onclick = display
            parent.onblur = hide
        } else {
            parent.oncontextmenu = display
            parent.onclick = parent.onblur = hide

            var duration: Date

            parent.addEventListener("touchstart", () => {
                duration = new Date
                return false
            })

            parent.addEventListener("touchend", (evt) => {
                evt.preventDefault()
                if (new Date().getTime() - duration.getTime() > 300) {
                    display(evt)
                } else {
                    hide()
                }
                return false
            })
        }

        window.addEventListener('mousewheel', (evt) => {
            if (this.display) {
                evt.preventDefault()
            }
        }, { passive: false })
    }

    getMenu(evt: obj) {
        const path: obj[] = evt.path || (evt.composedPath && evt.composedPath())

        for (let i = 0; i < path.length; i++) {
            let e = path[i]

            if (e.menu) {
                return e.menu
            }
        }

        return null
    }

    onSelectMenu(e: obj) {
        e.onClick && e.onClick(this.evt, e.id)

        !e.display && this.$emit('select', {
            value: e.id,
            type: "comp-menu"
        })

        // 触发失焦事件
        this.parent.blur()
    }

    /**
     * 监听禁用状态变化
     */
    onChangeDisable(id: string, disable: boolean) {
        Utils.each<obj>(this.value, v => {
            Utils.each<obj>(v.sub, s => {
                s.disable = disable
            }, c => c.id === id)
        })
    }
}

export default Component.build(new CompMenuComponent)
</script>

<style lang="less">
@import (reference) "@/style/utils.less";
@import (reference) "@/style/color.less";

.comp-menu {
    position: absolute;
    min-width: 150px;
    padding: 5px 10px;
    background: #fff;
    border-radius: 6px;
    color: #000;
    cursor: initial;
    z-index: 120;
    top: 0;
    margin: 10px 0;
    visibility: hidden;
    opacity: 0;

    .border;
    .shadow(0 0 30px rgba(0, 0, 0, 0.1));

    >.item-box {
        padding: 5px 0;

        .title {
            font-size: 12px;
            color: #666;
            font-weight: bold;
            padding: 5px 10px;
        }

        .prompt {
            font-size: 10px;
            color: #888;
            padding: 0 0 5px 10px;
            line-height: 18px;
            letter-spacing: 1px;
        }

        .sub-item-box {
            padding: 10px;
            padding-bottom: 10px;
            cursor: pointer;
            border-radius: 4px;

            .flex;
            .flex-center-items;
            .flex-content(space-between);

            &:hover {
                background: #00a2ff38;

                .info-box {
                    .icon-box {
                        background: rgba(47, 170, 247, 0.3);
                    }
                }
            }

            .info-box {
                .flex;
                .flex-center-items;

                .icon-box {
                    width: 23px;
                    height: 23px;
                    padding: 5px;
                    background: rgba(47, 170, 247, 0.1);

                    .radius(6px);
                    .border-box;
                    .flex-shrink;
                }

                .name {
                    margin-left: 10px;
                    font-size: 13px;
                    color: #333;
                    white-space: nowrap;

                    .flex-shrink;
                }
            }

            .value {
                margin-left: 30px;
                font-size: 13px;
                color: #333;
                white-space: nowrap;

                .flex-shrink;
            }
        }

        .disable {
            cursor: not-allowed;

            &:hover {
                background: #f1f1f1bd;
            }
        }
    }
}

.comp-menu-display {
    @keyframes comp_menu_display {
        0% {
            visibility: hidden;
            opacity: 0;
        }

        100% {
            visibility: initial;
            opacity: 1;
        }
    }

    animation: comp_menu_display 0.2s forwards;
}

.comp-menu-dark {
    background: @dark_box;

    .shadow;

    >.item-box {
        .title {
            color: #fff;
        }

        .sub-item-box {
            .info-box .name {
                color: #fff;
            }

            .value {
                color: #fff;
            }
        }

        .disable {
            &:hover {
                background: #292929bd;
            }
        }
    }
}

</style>