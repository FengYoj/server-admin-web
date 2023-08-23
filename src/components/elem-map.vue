<template>
    <div class="elem-map-box">
        <elem-input-object :name="name" :value="input_value" :title="title" :required="required" :getValue="getValue"></elem-input-object>
        <div class="map-input-box">
            <input class="input" v-model="input_value" type="text" placeholder="输入地址" @input="onInput" @focus="onFocus" @blur="onBlur" />
            <div class="result-box" v-show="display_result && result && result.length > 0">
                <div class="item-box" v-for="(item, idx) in result" :key="idx" @click="onSelectResult(item)">
                    <p class="name">{{ item.name }}</p>
                    <p class="district">{{ item.district }}</p>
                </div>
            </div>
        </div>
        <div class="map-container-box" id="map_container"></div>
    </div>
</template>

<script lang="ts">
import Utils from "@/module/utils/utils"
import elemInputObject from "./elem-input-object.vue"
import FileUtil from "@/module/file/file_util"
import Message from "@/module/interactive/message"

export default {
    data() {
        return {
            input_value: "",
            init_marker: false,
            display_result: false,
            result: null,
            old_value: null,
        }
    },

    props: {
        name: String,
        required: {
            type: Boolean,
            default: true,
        },
        title: String,
        value: Object,
    },

    components: {
        elemInputObject,
    },

    watch: {
        input_value(value, old) {
            if (old && this.old_value) {
                this.old_value = null
            }
        },
    },

    async created() {
        if (this.value) {
            this.old_value = Utils.copy(this.value)
        }
    },

    async mounted() {
        // 加载主文件
        await FileUtil.script("https://webapi.amap.com/loader.js")

        const AMap = await window["AMapLoader"].load({
            key: "fd71e18f00affc42b5711435dd44064b", //首次调用load必须填写key
            version: "2.0", //JSAPI 版本号
            plugins: ["AMap.Scale", "AMap.Geolocation", "AMap.Geocoder", "AMap.AutoComplete"], //同步加载的插件列表
        })

        const map = (this.map = new AMap.Map("map_container"))
        map.addControl(new AMap.Scale())
        map.addControl(new AMap.Geolocation())

        this.geocoder = new AMap.Geocoder()

        // 实例化输入提示模块
        this.autoComplete = new AMap.AutoComplete()

        // 实例化标记
        this.marker = new AMap.Marker({
            icon: new AMap.Icon({
                size: new AMap.Size(40, 40), // 图标大小
                image: "/admin/resources/icon/location.png",
            }),
            offset: new AMap.Pixel(-18, -38), // 偏移
            draggable: true, //点标记可拖拽
        })

        map.on("click", this.onClickMarker) //绑定click事件

        if (this.old_value) {
            this.init(this.old_value)
        }
    },
    methods: {
        init(data) {
            let { latitude, longitude } = data
            let lnglat = [longitude, latitude]

            this.setMarkerPosition(lnglat)
            this.map.setZoom(15)
            this.map.setCenter(lnglat)

            this.input_value = data.address
        },

        onClickMarker(evt) {
            var lnglat = (this.lnglat = [evt.lnglat.lng, evt.lnglat.lat])

            this.setMarkerPosition(lnglat)

            this.geocoder.getAddress(lnglat, (status, result) => {
                if (status === "complete" && result.info === "OK") {
                    this.input_value = result.regeocode.formattedAddress
                } else {
                    Message.error(result.info)
                }
            })
        },

        setMarkerPosition(lnglat) {
            if (!this.init_marker) {
                this.map.add(this.marker)
                this.init_marker = true
            }

            this.marker.setPosition(lnglat)
        },

        /**
         * 监听文本框输入事件
         */
        onInput(evt) {
            // 清除延时事件
            clearTimeout(this.inputTimeout)

            // 延时执行
            this.inputTimeout = setTimeout(() => {
                const e = Utils.getTarget<HTMLInputElement>(evt)

                if (e.value) {
                    // 根据关键字进行搜索
                    this.autoComplete.search(e.value, (status, result) => {
                        // 搜索成功时，result即是对应的匹配数据
                        if (status === "complete" && result.info === "OK") {
                            this.result = result.tips
                            this.display_result = true
                        } else if (status !== "no_data") {
                            Message.error(result.info)
                        }
                    })
                } else {
                    this.result = null
                }
            }, 1000)
        },

        /**
         * 监听选择搜索结果
         */
        onSelectResult(evt) {
            var lnglat = (this.lnglat = [evt.location.lng, evt.location.lat])

            this.setMarkerPosition(lnglat)
            this.map.setZoom(15)
            this.map.setCenter(lnglat)

            this.input_value = evt.name
        },

        getValue() {
            return new Promise((resolve, reject) => {
                const value = this.input_value

                if (!value) {
                    return resolve(null)
                }

                if (this.old_value) {
                    return resolve(this.old_value)
                }

                var data

                if (!this.lnglat) {
                    data = this.getLocation(value)
                } else {
                    data = this.getAddress(this.lnglat)
                }

                data.then(resolve).catch(reject)
            })
        },

        /**
         * 地址转为坐标
         */
        getLocation(value) {
            return new Promise((resolve, reject) => {
                this.geocoder.getLocation(value, (status, result) => {
                    if (status === "complete" && result.info === "OK" && result.geocodes.length > 0) {
                        // 返回第一条数据
                        let data = result.geocodes[0]

                        // 分隔经纬度
                        let l = data.location.split(",")

                        resolve({
                            adcode: data.adcode,
                            city: data.city,
                            country: data.country,
                            district: data.district,
                            province: data.province,
                            address: data.formatted_address,
                            lng: l[0],
                            lat: l[1],
                        })
                    } else {
                        let msg = "无法识别输入的地址，请在地图上选址！"
                        // 显示错误信息
                        Message.error(msg)
                        reject(msg)
                    }
                })
            })
        },

        /**
         * 坐标转为地址
         */
        getAddress(lnglat) {
            return new Promise((resolve, reject) => {
                this.geocoder.getAddress(lnglat, (status, result) => {
                    if (status === "complete" && result.info === "OK") {
                        let data = result.regeocode
                        let a = data.addressComponent
                        let f = data.formattedAddress

                        // 返回第一条数据
                        resolve({
                            adcode: a.adcode,
                            city: a.city,
                            country: a.country,
                            district: a.district,
                            province: a.province,
                            address: f,
                            lng: lnglat[0],
                            lat: lnglat[1],
                        })
                    } else {
                        let msg = "无法识别经纬度，请在地图上选址！"
                        // 显示错误信息
                        Message.error(msg)
                        reject(msg)
                    }
                })
            })
        },

        onFocus() {
            setTimeout(() => {
                this.display_result = true
            }, 100)
        },

        onBlur() {
            setTimeout(() => {
                this.display_result = false
            }, 100)
        },
    },
}
</script>

<style>
.elem-map-box {
    position: relative;
    height: 250px;
}

.elem-map-box .map-input-box {
    position: absolute;
    top: 20px;
    left: 20px;
    right: 20px;
    border: 1px solid #e3e4e9;
    background: #fff;
    border-radius: 6px;
    transition: all 0.3s ease;
    overflow: hidden;
    box-sizing: border-box;
    z-index: 10;
}

.elem-map-box .input {
    width: 100%;
    padding: 0 12px;
    height: 40px;
    box-sizing: border-box;
}

.elem-map-box .result-box {
    width: 100%;
    max-height: 200px;
    overflow: hidden;
    overflow-y: auto;
    border-top: 1px solid #e3e4e9;
}

.elem-map-box .result-box > .item-box {
    cursor: pointer;
    padding: 10px 12px;
    border-bottom: 1px solid #e3e4e9;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.elem-map-box .result-box > .item-box:last-child {
    border-bottom: initial;
}

.elem-map-box .result-box > .item-box:hover {
    background: #f3f3f3;
}

.elem-map-box .result-box > .item-box .name {
    font-size: 14px;
}

.elem-map-box .result-box > .item-box .district {
    font-size: 12px;
    color: #888;
}

.elem-map-box .map-container-box {
    width: 100%;
    height: 100%;
}

.elem-map-box .map-container-box {
    border: 1px solid #e3e4e9;
    z-index: 5;
    border-radius: 6px;
    transition: all 0.3s ease;
}

.elem-map-box .map-container-box:hover {
    border-color: #b3b3b3;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
</style>
