declare interface VueComponent {
    data?: Function | obj
    components?: obj
    created?: Function
    mounted?: Function
    methods?: any

    $router: any
    $data: any

    [key: string]: any
}

declare interface ComponentEntity {
    data?: obj | Function

    /** 自定义组件 */
    components?: obj

    /** 监听 data 变化 */
    watch?: {
        [key: string]: ((value: any, old?: any) => void) | {
            deep?: boolean
            immediate?: boolean
            handler: (value: any, old?: any) => void
        }
    }

    methods?: { [key: string]: (...param: any) => any }

    /** 默认语言包 */
    language?: obj

    dark?: {
        class: string
        value: string
    }[]

    /**
     * 页面滚动到底部的事件
     */
    onReachBottom?(): void

    /**
     * 监听页面加载，其参数为上个页面传递的数据，参数类型为Object（用于页面传参）
     * @param data 参数
     */
    onLoad?(param: obj): void

    onShow?(): void

    onHide?(): void

    /** 监听主题变化事件 */
    onChangeTheme?(theme: 'dark' | 'light'): void

    /**
     * 页面创建事件
     */
    created?(): void

    /**
     * 页面 活动/显示 事件
     */
    activated?(): void


    /**
     * 以下为自定义内置方法
     */


    /**
     * 监听打开图片事件
     * @param e 事件（获取组件内 data-urls 属性） 或 图片路径 或 图片路径数组
     */
    onOpenPhoto?(e: Event | string | string[]): void

    getCache?(key: string): any

    [key: string]: any
}