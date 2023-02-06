import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import Cache from "@/module/cache/cache"
import ViewUIPlus from "view-ui-plus"
import "view-ui-plus/dist/styles/viewuiplus.css"

router.beforeEach(function (to, from, next) {
    if (to.meta.needLogin)
        if (Cache.containsKey("admin_token")) next()
        // 打开登录页面
        else
            Login.do(() => {
                next()
            })
    else next()
})

createApp(App).use(router).use(ViewUIPlus).mount("#app")
