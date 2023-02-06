// types/general.d.ts

// 请求类型
type RequestType = "GET" | "POST" | "PUT" | "DELETE" | "CONNECT" | "HEAD" | "OPTIONS" | "TRACE"

type app = obj

declare interface app {
    [key: string]: any
}

interface CompEvent<T extends any> {
    // 值
    value: T
    // 组件类型
    type: string
}

interface ElemEvent<T extends any> {
    tag: string

    value: T
    // 组件类型
    type: string
    // 名称
    name?: string

    [key: string]: any
}

interface ElemSwitchEvent extends ElemEvent<boolean> {
    // 恢复变更前状态
    restore?: () => void
}

interface ElemInputEvent extends ElemEvent<string> {
    // 验证
    verify?: (result: boolean) => void
    // 写入值
    set?: (value: string) => void
}

interface ElemOptionValue {
    index: number
    title: string
    value: number
}

interface ElemOptionEvent extends ElemEvent<ElemOptionValue> {}

declare interface obj {
    [key: string]: any
}

declare interface Obj<T> {
    [key: string]: T
}

declare module "*.html" {
    const value: string
    export default value
}

declare module "*.css" {
    const value: obj
    export default value
}

declare module "*.json" {
    const value: any
    export default value
}

declare module "*.vue" {
    const value: obj
    export default value
}

declare module "vue-property-decorator" {
    const value: obj
    export default value
}

interface ElemEvent {
    value: any
    // 组件类型
    type: string
    // 名称
    name?: string
}

declare interface StatusInf<T> {
    status: number
    message: string
    data: T | null
    code: number
    info: string | undefined
}

type Crop = any

declare interface Crop {}
