declare interface MessageConfig {
    timeout?: number
    button?: {
        confirm: string
        cancel: string
    }
    type?: 'getPhoneNumber'
    onTimeout?: () => void
    onConfirm?: (data?: any) => void
    onCancel?: () => void
    onComplete?: (type: 'cancel' | 'confirm') => void
}

declare interface Message<T extends MessageGeneral> extends T {
    
}

declare interface MessageGeneral {
    /**
     * 提示
     * @param c 内容文本
     * @param config 配置
     */
    info(c: string, config?: MessageConfig): void

    /**
     * 错误
     * @param c 内容文本
     * @param config 配置
     */
    error(c: string, config?: MessageConfig): void

    /**
     * 成功
     * @param c 内容文本
     * @param config 配置
     */
    success(c: string, config?: MessageConfig): void
}

declare interface MessageProgress extends MessageGeneral {

    /**
     * 进度事件
     * @param sc 进度
     */
    progress(sc: number): void
}