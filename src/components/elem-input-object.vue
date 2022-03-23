<template>
    <input ref="input" :id="id" :name="name" :title="title" :value='JSON.stringify(value)' :required="required" hidden>
</template>

<script lang="ts">
export default {
    
    props: {
        id: String,
        name: String,
        // 任意类型，不校验
        value: null,
        required: Boolean,
        title: String,
        getValue: Function
    },

    mounted() {
        const input: HTMLInputElement = this.$refs.input

        input["getValue"] = this.getValue ? this.getValue : this.getValueData.bind(this)
    },

    methods: {
        getValueData() {
            return this.value
        }
    }
}
</script>

<style>

</style>