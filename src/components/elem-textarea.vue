<template>
    <div class="elem-textarea-box" dark-class="elem-textarea-box-dark">
		<textarea class="textarea" :name="name" :title="title" :placeholder="place_holder" :required="required" @change="onChange" @input="onInput" v-html="val"></textarea>
    </div>
</template>

<script lang="ts">
import Component, { ComponentMethods } from "@/module/component/component";

class ElemTextareaComponent extends ComponentMethods implements ComponentEntity {
    data() {
        return {
            place_holder: null,
            original: null,
            check: null,
            val: null
        }
    }
    
	props = {
        type: String,
        name: String,
        title: String,
        required: {
            type: Boolean,
            default: true
        },
        placeholder: {
            type: String,
            default: ""
        },
        value: {
            type: String,
            default: ""
        }
    }
    
    created() {
        this.val = this.value
    }
    
    mounted() {
        if (!this.placeholder) {
            this.place_holder = `输入${this.title || this.name}${this.required ? '' : '（可选）'}`
        }
    }

	methods = {
		onChange(evt) {
            this.$emit('change', {
                value: evt.target.value,
                type: "elem-textarea",
                name: this.name,
                set: (value: string) => {
                    this.val = value
                }
            })
        },

        onInput(evt) {
            this.$emit('input-event', {
                value: evt.target.value,
                type: "elem-textarea",
                name: this.name,
                set: (value: string) => {
                    this.val = value
                }
            })
        }
	}
}

export default Component.build(new ElemTextareaComponent)
</script>

<style lang="less">
@import (reference) "/src/style/utils.less";
@import (reference) "/src/style/color.less";

.elem-textarea-box .textarea {
    position: relative;
    padding: 12px;
    width: 100%;
    max-width: 100%;
    min-width: 100%;
    height: 150px;
    font-size: 14px;
    z-index: 10;
    outline:none;

    .border-box;
    .radius(6px);
    .transition;
    .border;

    &:hover,
    &:focus {
        border-color: #b3b3b3;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
}

.elem-textarea-box-dark {
    .textarea {
        background: #252a31;
        border-color: @dark_border;

        &:hover,
        &:focus {
            border-color: #5a5a5a;
        }
    }
}
</style>