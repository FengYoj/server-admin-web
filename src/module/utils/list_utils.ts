export default class {

    /**
     * 随机乱序
     * @param list 数组
     */
    public static shuffle<T>(list: T[]): T[] {
        return list.sort(() => Math.random() > .5 ? -1 : 1)
    }
}