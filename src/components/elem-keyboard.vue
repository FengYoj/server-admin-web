<template>
    <div class="elem-keyboard-box">
        <elem-input-object :name="name" :title="title" :required="required" :getValue="getValue"></elem-input-object>
        <ul class="numbers">
            <li><a class="key c192"><b>~</b><span>`</span></a></li>
            <li><a class="key c49"><b>!</b><span>1</span></a></li>
            <li><a class="key c50"><b>@</b><span>2</span></a></li>
            <li><a class="key c51"><b>#</b><span>3</span></a></li>
            <li><a class="key c52"><b>$</b><span>4</span></a></li>
            <li><a class="key c53"><b>%</b><span>5</span></a></li>
            <li><a class="key c54"><b>^</b><span>6</span></a></li>
            <li><a class="key c55"><b>&amp;</b><span>7</span></a></li>
            <li><a class="key c56"><b>*</b><span>8</span></a></li>
            <li><a class="key c57"><b>(</b><span>9</span></a></li>
            <li><a class="key c48"><b>)</b><span>0</span></a></li>
            <li><a class="key c189 alt"><b>_</b><span>-</span></a></li>
            <li><a class="key c187"><b>+</b><span>=</span></a></li>
            <li><a class="key c46 delete"><span>Delete</span></a></li>
        </ul>
        <ul class="qwerty">
            <li><a class="key c9 tab"><span>tab</span></a></li>
            <li v-for="(item, idx) in layout.qwe" :key="idx"><a class="key center" :class="item.isAlt ? 'alt' : ''" :data-code="item.code" @click.stop="onClickChangeKey($event, 'qwe', idx)" v-html="item.key"></a></li>
        </ul>
        <ul class="asdfg">
            <li><a class="key c20 alt caps"><b></b><span>caps lock</span></a></li>
            <li v-for="(item, idx) in layout.asd" :key="idx"><a class="key center" :class="item.isAlt ? 'alt' : ''" :data-code="item.code" @click.stop="onClickChangeKey($event, 'asd', idx)" v-html="item.key"></a></li>
            <li><a class="key c13 alt enter"><span>Enter</span></a></li>
        </ul>
        <ul class="zxcvb">
            <li><a class="key c16 shiftleft"><span>Shift</span></a></li>
            <li v-for="(item, idx) in layout.zxc" :key="idx"><a class="key center" :class="item.isAlt ? 'alt' : ''" :data-code="item.code" @click.stop="onClickChangeKey($event, 'zxc', idx)" v-html="item.key"></a></li>
            <li><a class="key c16 shiftright"><span>Shift</span></a></li>
        </ul>
        <ul class="bottomrow">
            <li><a class="key fn"><span>fn</span></a></li>
            <li><a class="key c17 control"><span>control</span></a></li>
            <li><a class="key option optionleft"><span>option</span></a></li>
            <li><a class="key command commandleft"><span>command</span></a></li>
            <li><a class="key c32 spacebar"></a></li>
            <li><a class="key command commandright"><span>command</span></a></li>
            <li><a class="key option optionright"><span>option</span></a></li>
            <ol>
                <li><a class="key c37 left"><span>◀</span></a></li>
                <li>
                    <a class="key c38 up"><span>▲</span></a>
                    <a class="key c40 down"><span>▼</span></a>
                </li>
                <li><a class="key c39 right"><span>▶</span></a></li>
            </ol>
        </ul>

        <div class="change-box" v-if="changeKeyData" :style="{ top: changeKeyData.y - 120 + 'px', left: changeKeyData.x - 95 + 'px' }">
            <div class="close-box" @click="changeKeyData = null">
                <img class="icon" src="static/icon/close.svg" alt="">
            </div>
            <div class="change-item">
                <p>键码:</p>
                <div class="input">
                    <input autofocus :value="changeKeyData.keyboard.code" type="number" placeholder="输入键码" @change="onChangeCode($event, changeKeyData)" onkeydown="if (event.keyCode === 13) { return false }" />
                </div>
            </div>
            <div class="change-item">
                <p>键值:</p>
                <div class="input">
                    <input :value="changeKeyData.keyboard.key" placeholder="输入键值" @change="onChangeKey($event, changeKeyData)" onkeydown="if (event.keyCode === 13) { this.value+= '<br>'; return false }" />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Component, { ComponentMethods } from "../module/component/component"

import elemInputObject from './elem-input-object.vue'

class ElemKeyboardComponent extends ComponentMethods implements ComponentEntity {
    data() {
        return {
            layout: {},
            changeKeyData: null
        }
    }

    components = {
		elemInputObject
	}

    props = {
        name: String,
        required: {
            type: Boolean,
            default: true
        },
        title: String,
        value: Object
    }

    created() {
        if (this.value) {
            this.layout = this.value
        } else {
            this.layout = {
                qwe: this.getInitArray("qwertyuiop[]\\"),
                asd: this.getInitArray("asdfghjkl;'"),
                zxc: this.getInitArray("zxcvbnm,./")
            }
        }
    }

    getInitArray(str: string): string[] {
        var str_arr = str.split("")
        var arr = []

        for (var i = 0; i < str_arr.length; i++) {
            arr.push({ hand: str_arr[i] })
        }

        return arr
    }

    getValue() {
        return this.layout
    }

    judgmentEmpty(arr) {
        for (var i = 0; i < arr.length; i ++) {
            if (!arr[i].key || !arr[i].code) {
                return false;
            }
        }
        return true
    }

    onClickChangeKey(evt, name, idx) {
        this.changeKeyData = {
            name: name,
            idx: idx,
            x: evt.layerX,
            y: evt.layerY,
            keyboard: this.layout[name][idx]
        }
    }

    onChangeCode(evt, data) {
        var e = evt.target || evt.srcElement
        var item = this.layout[data.name][data.idx]
        item.code = Math.round(e.value)
    }

    onChangeKey(evt, data) {
        var e = evt.target || evt.srcElement
        var item = this.layout[data.name][data.idx]
        item.key = e.value
    }
}

export default Component.build(new ElemKeyboardComponent)
</script>

<style lang="less">
@import "/src/style/utils.less";

.elem-keyboard-box {

    position: relative;
    z-index: 20;
    margin: 20px 0;
    width: 800px;
    height: 285px;
    background: #d9dadb;
    -moz-border-radius-topleft: 21px 21px;
    -moz-border-radius-topright: 21px 21px;
    -moz-border-radius-bottomright: 10px;
    -moz-border-radius-bottomleft: 10px;
    border-top-left-radius: 21px 21px;
    border-top-right-radius: 21px 21px;
    border-bottom-right-radius: 10px;
    border-bottom-left-radius: 10px;
    padding: 20px 0 0;
    -webkit-box-shadow: inset 0 0 8px #bbb, 0 1px 0 #aaa, 0 4px 0 #bbb, 0 10px 30px #ddd;
    -moz-box-shadow: inset 0 0 8px #bbb, 0 1px 0 #aaa, 0 4px 0 #bbb, 0 10px 30px #ddd;
    box-shadow: inset 0 0 8px #bbb, 0 1px 0 #aaa, 0 4px 0 #bbb, 0 10px 30px #ddd;

    ul {
        list-style-type: none;
        width: 784px;
        margin: 0 auto
    }

    li {
        float: left
    }

    .key {
        display: block;
        color: #aaa;
        font: 700 9pt arial;
        text-decoration: none;
        text-align: center;
        width: 44px;
        height: 41px;
        margin: 5px;
        background: #fff;
        -moz-border-radius: 4px;
        border-radius: 4px;
        border-top: 1px solid transparent;
        -webkit-box-shadow: 0 1px 0 #c3c3c3, 0 2px 0 #c9c9c9, 0 2px 3px #333;
        -moz-box-shadow: 0 1px 0 #c3c3c3, 0 2px 0 #c9c9c9, 0 2px 3px #333;
        box-shadow: 0 1px 0 #c3c3c3, 0 2px 0 #c9c9c9, 0 2px 3px #333;
        text-shadow: 0 1px 0 #f5f5f5;
        filter: dropshadow(color=#f5f5f5, offx=0, offy=1)
    }

    .center {
        display: flex;
        justify-content: center;
        align-items: center;
        white-space: pre-wrap;
        text-transform: uppercase;
    }

    .keydown {
        color: #888;
        background: #ebeced;
        margin: 7px 5px 3px;
        -webkit-box-shadow: inset 0 0 25px #ddd, 0 0 3px #333;
        -moz-box-shadow: inset 0 0 25px #ddd, 0 0 3px #333;
        box-shadow: inset 0 0 25px #ddd, 0 0 3px #333;
        border-top: 1px solid #eee
    }

    .key-prompt {
        background: #2faaf7;
        color: #fff;
    }

    .fn span {
        display: block;
        margin: 14px 5px 0 0;
        font: 700 6pt arial;
        text-transform: uppercase
    }

    .numbers li a span {
        display: block
    }

    .numbers li a b {
        margin: 3px 0;
        display: block
    }

    .numbers li .alt b {
        display: block;
        margin: 0 0 3px
    }

    .numbers li .delete span {
        text-align: right;
        margin: 23px 10px 0 0;
        font-size: 7.5pt;
        text-transform: lowercase
    }

    .qwerty li a span {
        display: block;
        margin: 13px 0 0;
        text-transform: uppercase
    }

    .qwerty li .tab span {
        text-align: left;
        margin: 23px 0 0 10px;
        font-size: 7.5pt;
        text-transform: lowercase
    }

    .qwerty li .alt b {
        display: block;
        margin: 3px 0 0
    }

    .qwerty li .alt span {
        margin: 2px 0 0
    }

    .asdfg li a span {
        display: block;
        margin: 13px 0 0;
        text-transform: uppercase
    }

    .asdfg li .alt span {
        margin: 0;
        text-transform: lowercase
    }

    .asdfg li .alt b {
        display: block;
        margin: 3px 0 0
    }

    .asdfg li .caps b {
        display: block;
        background: #999;
        width: 4px;
        height: 4px;
        border-radius: 10px;
        margin: 9px 0 0 10px;
        -webkit-box-shadow: inset 0 1px 0 #666;
        -moz-box-shadow: inset 0 1px 0 #666;
        box-shadow: inset 0 1px 0 #666
    }

    .asdfg li .caps span {
        text-align: left;
        margin: 10px 0 0 10px;
        font-size: 7.5pt
    }

    .asdfg li .enter span {
        text-align: right;
        margin: 23px 10px 0 0;
        font-size: 7.5pt
    }

    .zxcvb li a span {
        display: block;
        margin: 13px 0 0;
        text-transform: uppercase
    }

    .zxcvb li .shiftleft span {
        text-align: left;
        margin: 23px 0 0 10px;
        font-size: 7.5pt;
        text-transform: lowercase
    }

    .zxcvb li .shiftright span {
        text-align: right;
        margin: 23px 10px 0 0;
        font-size: 7.5pt;
        text-transform: lowercase
    }

    .zxcvb li .alt b {
        display: block;
        margin: 4px 0 0
    }

    .zxcvb li .alt span {
        margin: 0
    }

    .bottomrow li .fn span,
    .bottomrow li .control span,
    .bottomrow li .optionleft span,
    .bottomrow li .commandleft span {
        display: block;
        margin: 31px 0 0 0;
        font-size: 7.5pt;
        text-transform: lowercase
    }

    .bottomrow li .optionright span,
    .bottomrow li .commandright span {
        display: block;
        margin: 31px 0 0 0;
        font-size: 7.5pt;
        text-transform: lowercase
    }

    .bottomrow ol li .left span,
    .bottomrow ol li .right span,
    .bottomrow ol li .up span,
    .bottomrow ol li .down span {
        display: block;
        margin: 5px 0 0
    }

    .fn {
        height: 26px;
        width: 46px
    }

    .delete {
        width: 72px
    }

    .tab {
        width: 72px
    }

    .caps {
        width: 85px
    }

    .enter {
        width: 85px
    }

    .shiftleft,
    .shiftright {
        width: 112px
    }

    .fn,
    .control,
    .option,
    .command,
    .spacebar {
        height: 49px
    }

    .control {
        width: 56px
    }

    .option {
        width: 46px
    }

    .command {
        width: 67px
    }

    .spacebar {
        width: 226px
    }

    .left img,
    .up img,
    .down img,
    .right img {
        border: none
    }

    ul ol {
        list-style-type: none
    }

    .down {
        height: 23px;
        font-size: 8px
    }

    .up,
    .left,
    .right {
        height: 24px;
        font-size: 8px
    }

    .left,
    .right {
        margin: 30px 4px 5px
    }

    .up {
        margin: 5px 5px 1px;
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 0
    }

    .down {
        margin: 0 5px 5px;
        border-top-left-radius: 0;
        border-top-right-radius: 0
    }

    .change-box {
        position: absolute;
        width: 150px;
        height: 80px;
        padding: 10px 20px;
        border-radius: 10px;
        background: #fff;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);

        .close-box {
            cursor: pointer;
            position: absolute;
            top: -10px;
            right: -10px;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            background: #fff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
            
            .flex;
            .flex-center-all;

            .icon {
                width: 50%;
                height: 50%;
            }
        }
    }

    .change-box .change-item {
        height: 40px;
        display: flex;
        align-items: center;
    }

    .change-box .change-item p {
        margin-right: 10px;
        flex-shrink: 0;
    }

    .change-box .change-item .input {
        padding: 0 5px;
        flex-grow: 1;
        border-bottom: 1px solid #e3e3e3;
    }

    .change-box .change-item .input input {
        width: 100%;
        height: 100%;
    }
}
</style>