<template>
	<div class="elem-label-box">
		<elem-input-object :name="name" :getValue="getValue"></elem-input-object>
		<div :class="[type === 'input' ? 'input-label-box' : 'textarea-label-box']">
			<div class="label-box" v-if="labels && labels.length > 0">
				<div class="label-item-box" v-for="(item, idx) in labels" :key="idx">
					<p class="value">{{item}}</p>
					<div class="delete-btn" @click.stop="onDeleteLabel(idx)">
						<elem-icon name="close_white"></elem-icon>
					</div>
				</div>
			</div>
			<div class="input-box" v-if="type === 'input'">
				<input class="input" type="text" @keyup.enter="onAppendLabel" :placeholder="place_holder" @blur="onBlur">
			</div>
			<div class="textarea-box" v-else>
				<textarea class="textarea" @keyup.enter="onAppendLabel" :placeholder="place_holder" @blur="onBlur"></textarea>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Utils from "@/module/utils/utils"

import elemInputObject from './elem-input-object.vue'
import elemIcon from './elem-icon.vue'

export default {
	data() {
		return {
			labels: [],
			place_holder: null
		}
	},
	props: {
        required: {
            type: Boolean,
            default: true
        },
        title: String,
        placeholder: {
            type: String,
            default: ""
        },
		name: String,
		value: Array,
		type: {
			type: String,
            default: "textarea"
		}
	},
	components: {
		elemInputObject,
		elemIcon
	},
	mounted() {
        if (!this.placeholder) {
            this.place_holder = `输入${this.title || this.name}，并按回车键结束${this.required ? '' : '（可选）'}`
        } else {
			this.place_holder = this.placeholder + `，并按回车键结束${this.required ? '' : '（可选）'}`
		}

		if (Utils.isExist(this.value)) {
			this.labels = this.value
		}
    },
	methods: {
		onAppendLabel(evt) {
			const input = Utils.getTarget<HTMLInputElement>(evt)
			const value = input.value

			if (value) {
				this.labels.push(value.replace(/[\r\n]/g, ""))
			}

			input.value = ""
		},

		onDeleteLabel(idx) {
			this.labels.splice(idx, 1)
		},

		onBlur(evt) {
			this.onAppendLabel(evt)
		},

		getValue() {
			return this.labels
		}
	}
}
</script>

<style lang="less">
@import (reference) "/src/style/utils.less";
@import (reference) "/src/style/color.less";

.elem-label-box {
	width: 100%;
	font-size: 14px;
	z-index: 10;
	box-sizing: border-box;
	border-radius: 6px;
	transition: all 0.3s ease;
	display: flex;
	align-items: center;
	overflow: hidden;

	.border;
}

.elem-label-box:hover {
	border-color: #b3b3b3;
	box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

.elem-label-box .label-textarea {
	display: none;
}

.input-label-box {
	width: 100%;
	height: 40px;
	padding: 0 50px 0 12px;
	box-sizing: border-box;
	display: flex;
	align-items: center;
}

.elem-label-box .label-box {
	flex-shrink: 0;
	display: flex;
	align-items: center;
}

.elem-label-box .label-box .label-item-box {
	margin-right: 10px;
	padding: 3px 5px 3px 10px;
	display: flex;
	align-items: center;
	background: #2faaf7;
	border-radius: 4px;
	box-shadow: 0 0 5px rgba(0,0,0,0.2);
	display: flex;
	align-items: center;
	justify-content: space-between;
	transition: all 0.3s ease;
	max-width: 100%;
    word-break: break-word;

	.value {
		font-size: 14px;
		color: #fff;
	}
}

.elem-label-box .label-box .label-item-box:hover {
	box-shadow: 0 0 5px rgba(0,0,0,0.5);
}

.elem-label-box .label-box .label-item-box .delete-btn {
	cursor: pointer;
	padding: 3px 8px;
	width: 10px;
	height: 10px;
	display: flex;
}

.elem-label-box .input-box {
	flex-grow: 1;
}

.textarea-label-box {
	width: 100%;

	.label-box {
		padding: 5px;

		.border-position(bottom);
		.flex-wrap;

		.label-item-box {
			margin: 5px;
		}
	}

	.textarea-box {
		padding: 5px;
	}
}

.textarea-label-box .textarea-box .textarea {
	height: 100px;
	min-width: 100%;
	max-width: 100%;
	padding: 5px;
	width: 100%;
	box-sizing: border-box;
	border: 0;
}
</style>