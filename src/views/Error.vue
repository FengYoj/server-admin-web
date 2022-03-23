<template>
    <div class="error-page">
		<div class="error-page-blank-wrap">
			<div class="site-error">
				<h1 class="headline">{{code}}</h1>
				<div class="error-content">
					<h4 class="error-content-text">海面雾气太大</h4>
					<h4 class="error-content-text">受天气影响，该页无法正常显示</h4>
					<h5> 你可以 <a href="#" @click="back">返回上一页</a> 。</h5>
				</div>
				<img src="/error/images/error-bg.png" style="padding:20px 0 120px;">
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Component, { ComponentMethods } from "@/module/component/component"

class ErrorView extends ComponentMethods implements ComponentEntity {
    public code: string = "404"

    onLoad(param: obj) {
        this.code = param.t
    }
}

export default Component.build(new ErrorView)
</script>

<style lang="less">
.error-page {
    position: relative;
    width: 100%;
    height: 100%;

    .error-page-blank-wrap {
        overflow: hidden;
        max-width: 800px;
        width: 100%;
        margin: 0 auto 0;
        padding: 25px 20px 0 20px;
        box-sizing: border-box;
    }

    .site-error {
        margin-bottom: 30px;
        text-align: center;
    }

    a {
        color: #4a90e6;
        text-decoration: none;
    }

    .headline {
        font-size: 80px;
        line-height: 80px;
        font-weight: 500;
        font-family: Microsoft YaHei;
    }

    .error-content-text {
        white-space: pre-line;
        line-height: 1.6;
    }
}
</style>