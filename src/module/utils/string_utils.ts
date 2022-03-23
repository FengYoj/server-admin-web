export default class StringUtils {

    /**
     * 驼峰命名转下划线命名
     * @param str 字符串
     */
    public static toUnderline(str: string): string {
        if (!str || str.length <= 0) {
            return null
        }

        // 首字母小写
        str = str.substring(0, 1).toLowerCase() + str.substring(1, str.length)

        // 大写字母前加入下划线
        return str.replace(/([A-Z])/g,"_$1").toLowerCase()
    }
    
    /**
     * 匹配不同值
     * @param target 目标字符串
     * @param source 源字符串
     * @return 不同值
     */
    public static different(target: string, source: string): { index: number, value: string } {
        let t = target.length
        let s = source.length
        for (let i = 0, len = t > s ? t : s; i < len; i++) {
            if (target[i] !== source[i]) {
                return {
                    index: i,
                    value: source[i]
                }
            }
        }
        // 无匹配，返回 -1
        return { index: -1, value: null }
    }

}