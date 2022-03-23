
/**
 * 分页实体
 */
interface Page<T> {
    /** 单页元素大小 */
    size: number

    /** 元素总大小 */
    totalElements: number

    /** 总页码 */
    totalPages: number

    /** 最后一页 */
    isLast: boolean

    /** 元素集合 */
    content: T[]

    /** 当前页码 */
    number: number

    /**
     * 集合自动按页码和页数拆分
     * 
     * @param content 元素集合
     * @param page 页码
     * @param size 页数
     */
    static of<T>(content: T[], page: number, size: number): Page<T>
}