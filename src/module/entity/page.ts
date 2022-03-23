export default class Page<T> {
    public size: number = 0

    public totalElements: number = 0

    public totalPages: number = 0

    public isLast: boolean = false

    public content: T[] = []

    public number: number = 0

    public static of<T>(content: T[], page: number, size: number): Page<T> {
        const p = new Page<T>()

        p.totalElements = content.length
        p.number = page - 1

        // 截取数组
        p.content = content.slice((page - 1) * size, (page - 1) * size + size)

        // 截取数组后的数组大小
        p.size = p.content.length

        p.totalPages = Math.ceil(content.length / size)
        p.isLast = Math.floor(content.length / (page * size)) <= 0

        return p
    }
}