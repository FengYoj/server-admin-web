<template>
    <div class="login-page page-theme-dark" :class="{ 'login-page-display': display }" v-show="show" v-cloak>
        <div class="back-box" v-if="input_step !== 'username'" @click="onBackStep">
            <elem-icon name="back"></elem-icon>
        </div>

        <div class="login-box">
            <div class="logo">
                <img v-show="info.icon" class="logo-icon" :src="info.icon" />
            </div>
            <p class="title t-c">登 录</p>
            <p class="prompt t-c">{{ prompt || info.name + " - 管理后台" }}</p>
            <div class="form-box">
                <div class="item-box" :class="{ display: input_step === 'username' }">
                    <div class="input-base">
                        <div class="input-box" :class="{ focus: input_focus.username || username }">
                            <p class="title">账号</p>
                            <input
                                ref="username_input"
                                autocomplete="new-password"
                                v-model="username"
                                name="username"
                                class="input"
                                title="用户名"
                                required
                                @click="onChangeFocusInput('username', true)"
                                @focus="onChangeFocusInput('username', true)"
                                @blur="onChangeFocusInput('username', false)"
                                @input="onChangeInput('username_error')"
                                @keyup.enter="onSubmitInput"
                            />
                            <div class="line-box" :class="{ 'show-loading': loading }"></div>
                        </div>
                        <p class="prompt">{{ username_error }}</p>
                    </div>
                </div>
                <div class="item-box userinfo-item" :class="{ display: input_step === 'password' }">
                    <div class="userinfo-box">
                        <img class="avatar" :src="userinfo.avatar" />
                        <p class="username">{{ userinfo.username }}</p>
                        <div class="change-btn" @click="input_step = 'username'">更改</div>
                    </div>
                    <div class="input-base">
                        <div class="input-box" :class="{ focus: input_focus.password || password }">
                            <p class="title">密码</p>
                            <input
                                ref="password_input"
                                v-model="password"
                                name="password"
                                :type="isPasswordType ? 'password' : 'text'"
                                class="input"
                                title="密码"
                                required
                                @focus="onChangeFocusInput('password', true)"
                                @blur="onChangeFocusInput('password', false)"
                                @input="onChangeInput('password_error')"
                                @keyup.enter="onSubmitInput"
                            />
                            <div class="icon" @click="onChangePasswordType">
                                <img src="static/icon/look.svg" />
                            </div>
                            <div class="line-box" :class="{ 'show-loading': loading }"></div>
                        </div>
                        <p class="prompt">{{ password_error }}</p>
                    </div>
                </div>
                <div class="item-box userinfo-item" :class="{ display: input_step === 'code' }">
                    <div class="userinfo-box">
                        <img class="avatar" :src="userinfo.avatar" />
                        <p class="username">{{ userinfo.username }}</p>
                        <div class="change-btn" @click="input_step = 'username'">更改</div>
                    </div>
                    <div class="input-base">
                        <div class="input-box" :class="{ focus: input_focus.code || code }">
                            <p class="title">验证码</p>
                            <input
                                ref="code_input"
                                autocomplete="new-password"
                                v-model="code"
                                name="code"
                                type="text"
                                class="input"
                                title="验证码"
                                required
                                @focus="onChangeFocusInput('code', true)"
                                @blur="onChangeFocusInput('code', false)"
                                @keyup.enter="onSubmitInput"
                                @input="onChangeInput('code_error')"
                            />
                            <div class="code-box" @click="getValidateCode">
                                <img v-if="codeInfo" class="code" :src="codeInfo.image" width="70" height="30" />
                            </div>
                            <div class="line-box" :class="{ 'show-loading': loading }"></div>
                        </div>
                        <p class="prompt">{{ code_error }}</p>
                    </div>
                </div>

                <div class="item-box" :class="{ display: input_step === 'forgot_username' }">
                    <div class="input-base">
                        <div class="input-box" :class="{ focus: input_focus.forgot_username || forgot_username }">
                            <p class="title">用户名</p>
                            <input
                                ref="forgot_username_input"
                                autocomplete="new-password"
                                v-model="forgot_username"
                                name="forgot_username"
                                type="text"
                                class="input"
                                title="用户名"
                                required
                                @focus="onChangeFocusInput('forgot_username', true)"
                                @blur="onChangeFocusInput('forgot_username', false)"
                                @keyup.enter="onSubmitForgotUsername"
                                @input="onChangeInput('forgot_username_error')"
                            />
                            <div class="line-box" :class="{ 'show-loading': loading }"></div>
                        </div>
                        <p class="prompt">{{ forgot_username_error }}</p>
                    </div>
                </div>

                <div class="item-box userinfo-item" :class="{ display: input_step === 'forgot_email' }">
                    <div class="userinfo-box">
                        <img class="avatar" :src="userinfo.avatar" />
                        <p class="username">{{ userinfo.username }}</p>
                        <div class="change-btn" @click="input_step = 'forgot_username'">更改</div>
                    </div>
                    <div class="input-base">
                        <div class="input-box" :class="{ focus: input_focus.forgot_email || forgot_email }">
                            <p class="title">电子邮箱</p>
                            <input
                                ref="forgot_email_input"
                                autocomplete="new-password"
                                v-model="forgot_email"
                                name="forgot_email"
                                type="text"
                                class="input"
                                title="用户名"
                                required
                                @focus="onChangeFocusInput('forgot_email', true)"
                                @blur="onChangeFocusInput('forgot_email', false)"
                                @keyup.enter="onSubmitForgotEmail"
                                @input="onChangeInput('forgot_email_error')"
                            />
                            <div class="line-box" :class="{ 'show-loading': loading }"></div>
                        </div>
                        <p class="prompt">{{ forgot_email_error }}</p>
                    </div>
                </div>

                <div class="item-box userinfo-item" :class="{ display: input_step === 'forgot_code' }">
                    <div class="userinfo-box">
                        <img class="avatar" :src="userinfo.avatar" />
                        <p class="username">{{ userinfo.username }}</p>
                        <div class="change-btn" @click="input_step = 'forgot_username'">更改</div>
                    </div>
                    <div class="input-base">
                        <div class="input-box" :class="{ focus: input_focus.forgot_code || forgot_code }">
                            <p class="title">验证码</p>
                            <input
                                ref="forgot_code_input"
                                autocomplete="new-password"
                                v-model="forgot_code"
                                name="forgot_code"
                                type="text"
                                class="input"
                                title="用户名"
                                required
                                @focus="onChangeFocusInput('forgot_code', true)"
                                @blur="onChangeFocusInput('forgot_code', false)"
                                @keyup.enter="onSubmitForgotCode"
                                @input="onChangeInput('forgot_code_error')"
                            />
                            <div class="refresh-box" v-if="forgot_code_time === '00'" @click="onSendForgotCode">重新发送</div>
                            <div class="refresh-box refresh-invalid" v-else>00:{{ forgot_code_time }}</div>
                            <div class="line-box" :class="{ 'show-loading': loading }"></div>
                        </div>
                        <p class="prompt">{{ forgot_code_error }}</p>
                    </div>
                </div>

                <div class="item-box userinfo-item" :class="{ display: input_step === 'forgot_password' }">
                    <div class="userinfo-box">
                        <img class="avatar" :src="userinfo.avatar" />
                        <p class="username">{{ userinfo.username }}</p>
                        <div class="change-btn" @click="input_step = 'forgot_username'">更改</div>
                    </div>
                    <div class="input-base">
                        <div class="input-box" :class="{ focus: input_focus.forgot_password || forgot_password }">
                            <p class="title">新密码</p>
                            <input
                                ref="forgot_password_input"
                                autocomplete="new-password"
                                v-model="forgot_password"
                                name="forgot_password"
                                :type="isPasswordType ? 'password' : 'text'"
                                class="input"
                                title="新密码"
                                required
                                @focus="onChangeFocusInput('forgot_password', true)"
                                @blur="onChangeFocusInput('forgot_password', false)"
                                @input="onChangeInput('forgot_password_error')"
                                @keyup.enter="onSubmitInput"
                            />
                            <div class="icon" @click="onChangePasswordType">
                                <img src="static/icon/look.svg" />
                            </div>
                            <div class="line-box" :class="{ 'show-loading': loading }"></div>
                        </div>
                        <p class="prompt">{{ forgot_password_error }}</p>
                    </div>
                </div>

                <div class="item-box userinfo-item" :class="{ display: input_step === 'forgot_confirm_password' }">
                    <div class="userinfo-box">
                        <img class="avatar" :src="userinfo.avatar" />
                        <p class="username">{{ userinfo.username }}</p>
                        <div class="change-btn" @click="input_step = 'forgot_username'">更改</div>
                    </div>
                    <div class="input-base">
                        <div class="input-box" :class="{ focus: input_focus.forgot_confirm_password || forgot_confirm_password }">
                            <p class="title">确认密码</p>
                            <input
                                ref="forgot_confirm_password_input"
                                autocomplete="new-password"
                                v-model="forgot_confirm_password"
                                name="forgot_confirm_password"
                                :type="isPasswordType ? 'password' : 'text'"
                                class="input"
                                title="新密码"
                                required
                                @focus="onChangeFocusInput('forgot_confirm_password', true)"
                                @blur="onChangeFocusInput('forgot_confirm_password', false)"
                                @input="onChangeInput('forgot_confirm_password_error')"
                                @keyup.enter="onSubmitInput"
                            />
                            <div class="icon" @click="onChangePasswordType">
                                <img src="static/icon/look.svg" />
                            </div>
                            <div class="line-box" :class="{ 'show-loading': loading }"></div>
                        </div>
                        <p class="prompt">{{ forgot_confirm_password_error }}</p>
                    </div>
                </div>
            </div>
            <button class="submit t-c t-b-b" @click="onNextStep">{{ getStepTitle() }}</button>
            <div class="operating-box" v-if="isForgot()">
                <div class="btn-box" @click="input_step = 'username'">
                    <elem-icon class="icon" name="back"></elem-icon>
                    <p class="title">返回登录</p>
                </div>
            </div>
            <div class="operating-box" v-else>
                <div class="auto-login">
                    <input v-model="auto_login" name="auto" id="AutoLogin" type="checkbox" />
                    <p class="name">7天内自动登录</p>
                </div>
                <div class="btn-box" @click="input_step = 'forgot_username'">
                    <p class="title">忘记密码？</p>
                </div>
            </div>
        </div>

        <div class="setting-box">
            <elem-icon name="menu"></elem-icon>
            <comp-menu :value="setting_menu" :absolute="true" @select="onSelectSettingMenu"></comp-menu>
        </div>

        <div class="copyright-box">This program is supported by Shenghao Technology Co., Ltd.</div>
    </div>
</template>

<script lang="ts">
import Component, { ComponentMethods } from "@/module/component/component"

import Package from "@/../package.json"
import Queue from "@/module/queue/queue"
import Request from "@/module/request/request"
import Cache from "@/module/cache/cache"
import Utils from "@/module/utils/utils"
import Version from "@/module/version/version"
import Message from "@/module/interactive/message"

import elemIcon from "@/components/elem-icon.vue"
import compMenu from "@/components/comp-menu.vue"

import md5 from "js-md5"
import Modal from "@/module/interactive/modal"
import Path from "@/module/config/path"

class LoginPage extends ComponentMethods implements ComponentEntity {
    private input_focus: obj = {}

    private input_step: string = "username"

    private internal = {
        steps: [
            {
                name: "username",
                ref: "username_input",
                submit: function () {
                    if (!this.username) {
                        return (this.username_error = "用户名不能为空")
                    }
                    this.getAccountInfo()
                },
            },
            {
                name: "password",
                ref: "password_input",
                submit: function () {
                    if (!this.password) {
                        return (this.password_error = "密码不能为空")
                    }
                    this.onSubmit()
                },
            },
            {
                name: "code",
                ref: "code_input",
                submit: function () {
                    if (!this.code) {
                        return (this.code_error = "验证码不能为空")
                    }
                    this.onSubmit()
                },
            },
            {
                name: "forgot_username",
                ref: "forgot_username_input",
                prompt: "请输入需要找回密码的用户名",
                submit: function () {
                    this.onSubmitForgotUsername()
                },
            },
            {
                name: "forgot_email",
                ref: "forgot_email_input",
                prompt: function () {
                    return "请输入电子邮箱：" + this.userinfo.email
                },
                submit: function () {
                    this.onSubmitForgotEmail()
                },
            },
            {
                name: "forgot_code",
                ref: "forgot_code_input",
                prompt: "请输入电子邮箱验证码",
                submit: function () {
                    this.onSubmitForgotCode()
                },
            },
            {
                name: "forgot_password",
                ref: "forgot_password_input",
                prompt: "请输入新密码",
                submit: function () {
                    this.onSubmitForgotPassword()
                },
            },
            {
                name: "forgot_confirm_password",
                ref: "forgot_confirm_password_input",
                prompt: "请再次输入新密码",
                submit: function () {
                    this.onSubmitForgotConfirmPassword()
                },
            },
        ],
    }

    private callback: (() => void)[] = []

    private codeInfo: obj = null

    private info: obj = {
        icon: "logo.png",
        name: "晟浩科技",
    }

    private loading: boolean = false

    private username: string = null
    private username_error: string = null

    private password: string = null
    private password_error: string = null
    private isPasswordType: boolean = true

    private code: string = null
    private code_error: string = null

    private forgot_username: string = null
    private forgot_username_error: string = null

    private forgot_email: string = null
    private forgot_email_error: string = null

    private forgot_code: string = null
    private forgot_code_error: string = null
    private forgot_code_time: string = "59"
    private forgot_code_id: string

    private forgot_password: string = null
    private forgot_password_error: string = null

    private forgot_confirm_password: string = null
    private forgot_confirm_password_error: string = null

    private auto_login: boolean = false

    private userinfo: obj = {
        avatar: "logo.png",
        username: "admin",
    }

    private setting_menu = null

    private prompt: string = null

    data() {
        return {
            display: false,
            show: false,
            version: Package.version,
        }
    }

    watch = {
        username() {
            if (this.username_error) {
                this.username_error = null
            }
        },

        input_step(value: string) {
            Utils.find<obj>(
                this.internal.steps,
                c => c.name == value,
                v => {
                    const data = v.data

                    this[value] = null
                    this.prompt = typeof data.prompt === "function" ? data.prompt.call(this) : data.prompt

                    // 延时 300ms，等待动画结束
                    Utils.wait(() => {
                        // 触发焦点事件
                        this.$refs[data.ref].focus()
                    }, 500)
                }
            )
        },
    }

    components = {
        elemIcon,
        compMenu,
    }

    created() {
        const _this = this

        window["Login"] = class {
            public static do(callback?: () => void): void {
                Cache.remove("admin_token")

                if (callback) {
                    _this.callback.push(callback)
                }

                if (!_this.display) {
                    if (Cache.containsKey("auto_login")) {
                        // 自动登录
                        _this.autoLogin()
                    } else {
                        // 显示登录页面
                        _this.onDisplay()
                    }
                }
            }
        }

        const version = {
            title: "版本管理",
            prompt: "版本展示用于判断管理端与主程序之间是否兼容。",
            sub: [
                {
                    id: "admin_version",
                    icon: "admin",
                    name: "管理端版本",
                    value: Package.version,
                },
            ],
        }

        this.setting_menu = [
            version,
            {
                title: "调试",
                prompt: "用于调试程序异常",
                sub: [
                    {
                        id: "debug_mode",
                        icon: "compare",
                        name: "调试模式",
                    },
                ],
            },
        ]

        Version.get().then(res => {
            version.sub.push(
                {
                    id: "framework_version",
                    icon: "framework",
                    name: "主程序版本",
                    value: res.framework,
                },
                {
                    id: "compare_version",
                    icon: "compare",
                    name: "兼容主程序版本",
                    value: ">=" + res.min_framework,
                }
            )

            var match = Utils.versionToNumber(res.framework) >= Utils.versionToNumber(res.min_framework)

            if (!match) {
                Modal.info(
                    `
                    <p>当前框架版本低于管理端最低要求版本，可能导致部分服务不可用，请联系技术支持进行框架版本升级。</p>
                    <p style="margin-top: 10px">最低要求版本：${res.min_framework}</p>
                    <p>当前版本：${res.framework}</p>
                `,
                    {
                        title: "版本提示",
                    }
                )
            }
        })
    }

    mounted() {
        Cache.onGet<obj>("setting_info", res => {
            // LOGO
            res.icon && (this.info.icon = res.icon.url)
            this.info.name = res.name || "晟浩科技"
        })
    }

    public onBackStep() {
        if (this.input_step === "forgot_username") {
            this.input_step = "username"
        } else {
            Utils.find<obj>(
                this.internal.steps,
                c => c.name === this.input_step,
                v => {
                    this.input_step = this.internal.steps[v.i - 1].name
                }
            )
        }
    }

    public autoLogin() {
        const info = Cache.get<obj>("auto_login")

        Request.post<obj>(
            "WEB://AdminAccount/Login",
            {
                username: info.username,
                password: info.password,
            },
            {
                hideLoading: true,
                hideMessage: true,
                onFail: () => {
                    // 显示登录页面
                    this.onDisplay()
                },
            }
        ).then(res => {
            Cache.set(
                {
                    admin_token: res.admin_token,
                    admin_id: res.admin_id,
                    userinfo: res.userinfo,
                },
                { storage: "cookie", expires: 2 * 60 * 60 * 1000 }
            )

            // 刷新页面
            Utils.each(this.callback, v => {
                v()
                // 触发事件后移除
                return "delete"
            })
        })
    }

    /** 获取验证码数据 */
    public getValidateCode() {
        Queue.single("Login-GetValidateCode", next => {
            this.codeInfo = null

            Request.get<obj>("WEB://ValidateCode/GetCode", {
                nature: "ADMIN_LOGIN"
            }, {
                hideLoading: true,
                onComplete: () => {
                    next()
                },
            }).then(res => {
                this.codeInfo = res
            })
        })
    }

    public async onSubmit() {
        // 显示加载动画
        this.loading = true

        setTimeout(() => {
            Request.post<obj>(
                "WEB://AdminAccount/Login",
                {
                    username: this.username,
                    password: md5(this.password),

                    ...(this.codeInfo
                        ? {
                              codeId: this.codeInfo.id,
                              code: this.code,
                          }
                        : {}),
                },
                {
                    hideLoading: true,
                    onFail: err => {
                        if (err.status === 400) {
                            switch (err.code) {
                                // 要求输入验证码
                                case "ENTER_VERIFICATION_CODE":
                                    this.input_step = "code"
                                    // 获取验证码
                                    this.getValidateCode()
                                    break
                                case "CODE_ERROR":
                                    this.code_error = "验证码错误"
                                    // 清空输入框
                                    this.code = null
                                    // 重新获取验证码
                                    this.getValidateCode()
                                    // 获取焦点
                                    this.$refs.code_input.focus()
                                    break
                                case "PASSWORD_NULL":
                                    this.password_error = "当前账号未设置密码"
                                    // 清空输入框
                                    this.password = null
                                    break
                                case "PASSWORD_WRONG":
                                    this.password_error = "密码错误"
                                    // 清空输入框
                                    this.password = null
                                    // 获取焦点
                                    this.$refs.password_input.focus()
                                    break
                            }

                            return false
                        }
                    },
                    onComplete: () => {
                        // 关闭加载动画
                        this.loading = false
                    },
                }
            ).then(res => {
                Cache.set(
                    {
                        admin_token: res.admin_token,
                        admin_id: res.admin_id,
                        userinfo: res.userinfo,
                    },
                    { storage: "cookie", expires: 2 * 60 * 60 * 1000 }
                )

                if (this.auto_login) {
                    Cache.set(
                        {
                            auto_login: {
                                username: this.username,
                                password: md5(this.password),
                            },
                        },
                        { storage: "cookie", expires: 7 * 24 * 60 * 60 * 1000 }
                    )
                }

                // 刷新页面
                Utils.each(this.callback, v => {
                    v()
                    // 触发事件后移除
                    return "delete"
                })

                this.onChangeDisplay(false)
            })
        }, 2000)
    }

    onStartForgotCodeTime() {
        var start: number = 59

        clearInterval(this.forgot_code_time_interval)

        this.forgot_code_time_interval = setInterval(() => {
            this.forgot_code_time = Utils.paddingZero(--start)

            if (start <= 0) {
                clearInterval(this.forgot_code_time_interval)
            }
        }, 1000)
    }

    onChangeFocusInput(name: string, focus: boolean): void {
        this.input_focus[name] = focus
    }

    getAccountInfo(): void {
        this.loading = true

        Utils.wait(() => {
            Request.get(
                "WEB://AdminAccount/GetAccountInfo",
                { username: this.username },
                {
                    onFail: err => {
                        if (err.status === 400 && err.code === "NOT_USERNAME") {
                            this.username_error = "账号不存在"
                            return false
                        }
                    },
                    onComplete: () => {
                        this.loading = false
                    },
                }
            ).then(res => {
                this.userinfo = res
                this.input_step = "password"
            })
        }, 2000)
    }

    onNextStep() {
        Utils.find<obj>(
            this.internal.steps,
            c => c.name == this.input_step,
            v => {
                const data = v.data
                // 触发提交事件
                data.submit.call(this)
            }
        )
    }

    onChangePasswordType() {
        this.isPasswordType = !this.isPasswordType
    }

    onSubmitInput(evt: obj) {
        const e: HTMLInputElement = evt.target
        // 触发失焦事件
        e.blur()
        // 下一步
        this.onNextStep()
    }

    getStepTitle() {
        switch (this.input_step) {
            case "forgot_username":
            case "forgot_password":
            case "username":
                return "继续"
            case "password":
                return "登录"
            case "forgot_code":
            case "code":
                return "验证"
            case "forgot_email":
                return "获取验证码"
            case "forgot_confirm_password":
                return "提交"
        }
    }

    isForgot() {
        const step = this.input_step
        return step.indexOf("forgot") > -1
    }

    onDisplay() {
        this.input_step = "username"
        this.onChangeDisplay(true)
    }

    onChangeDisplay(display: boolean) {
        if (display) {
            this.show = true

            Utils.wait(() => {
                this.display = true
            })
        } else {
            this.display = false

            Utils.wait(() => {
                this.show = false
            }, 500)
        }
    }

    /**
     * 提交找回密码用户名
     */
    onSubmitForgotUsername() {
        if (!this.forgot_username) {
            return (this.forgot_username_error = "用户名不能为空")
        }

        this.loading = true

        Utils.wait(() => {
            Request.get(
                "WEB://AdminAccount/GetForgotAccountInfo",
                { username: this.forgot_username },
                {
                    onFail: err => {
                        if (err.status === 400) {
                            switch (err.code) {
                                case "NOT_USERNAME":
                                    this.forgot_username_error = "账号不存在"
                                    return false
                                case "NO_EMAIL":
                                    this.forgot_username_error = "未绑定电子邮箱"
                                    Message.error("当前用户未绑定电子邮箱，请联系技术支持！")
                                    return false
                            }
                        }
                    },
                    onComplete: () => {
                        this.loading = false
                    },
                }
            ).then(res => {
                this.userinfo = res
                this.input_step = "forgot_email"
            })
        }, 2000)
    }

    onSubmitForgotEmail() {
        if (!this.forgot_email) {
            return (this.forgot_email_error = "电子邮箱不能为空")
        }

        Request.post<string>("WEB://AdminAccount/SendEmailCode", {
            username: this.forgot_username,
            email: this.forgot_email,
        }).then(res => {
            this.forgot_code_id = res
            this.input_step = "forgot_code"
            this.onStartForgotCodeTime()
        })
    }

    onSubmitForgotPassword() {
        if (!new RegExp("(?=.*[0-9])(?=.*[a-zA-Z]).{6,}").test(this.forgot_password)) {
            return (this.forgot_password_error = "密码中必须包含字母和数字且至少6个字符")
        }

        this.input_step = "forgot_confirm_password"
    }

    onSubmitForgotConfirmPassword() {
        if (this.forgot_password !== this.forgot_confirm_password) {
            return (this.forgot_confirm_password_error = "两次密码不相同，请检查后重试")
        }

        Request.post("WEB://AdminAccount/ResetPassword", {
            username: this.forgot_username,
            email: this.forgot_email,
            codeId: this.forgot_code_id,
            code: this.forgot_code,
            password: md5(this.forgot_password),
        }).then(() => {
            Message.success("重置密码成功")
            this.input_step = "username"
        })
    }

    onSubmitForgotCode() {
        if (!this.forgot_code) {
            return (this.forgot_code_error = "验证码不能为空")
        }

        Request.post<string>("WEB://AdminAccount/VerifyEmailCode", {
            username: this.forgot_username,
            email: this.forgot_email,
            codeId: this.forgot_code_id,
            code: this.forgot_code,
        }).then(() => {
            this.input_step = "forgot_password"
        })
    }

    onSendForgotCode() {
        Request.post<string>("WEB://AdminAccount/SendEmailCode", {
            username: this.forgot_username,
            email: this.forgot_email,
        }).then(res => {
            this.forgot_code_id = res
            this.onStartForgotCodeTime()
        })
    }

    onSelectSettingMenu(evt: ElemEvent<string>) {
        if (evt.value === "debug_mode") {
            var getQueryString = function (name) {
                let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i")
                let r = window.location.search.substr(1).match(reg)
                if (r != null) {
                    return unescape(r[2])
                }
                return null
            }

            Path.DOMAIN = getQueryString("url")

            console.log(this.getParam<string>("url"))

            console.log(Path.DOMAIN)

            return
        }

        Version.get().then(res => {
            switch (evt.value) {
                case "admin_version":
                    Message.info("管理端程序版本为：" + res.admin)
                    break
                case "framework_version":
                    Message.info("主程序版本为：" + res.framework)
                    break
                case "compare_version":
                    // 两个比较版本号
                    var match = Utils.versionToNumber(res.framework) >= Utils.versionToNumber(res.min_framework)

                    if (match) {
                        Message.success("当前主程序符合最低版本要求")
                    } else {
                        Message.error("当前主程序不符合最低版本要求，请联系技术支持！")
                    }
                    break
            }
        })
    }

    onChangeInput(name: string) {
        this[name] = null
    }
}

export default Component.build(new LoginPage())
</script>

<style lang="less">
@import (reference) "@/style/utils.less";
@import (reference) "@/style/color.less";

.login-page {
    width: 100%;
    z-index: 100;
    background: linear-gradient(to bottom right, #117bbd, #00293e 90%);
    visibility: hidden;
    opacity: 0;

    .transition;
    .fixed(0, 0, 0, 0);
    .flex;
    .flex-center-all;

    .back-box {
        cursor: pointer;
        width: 30px;
        height: 30px;

        .absolute(50px, initial, initial, 50px);
    }

    .login-box {
        position: relative;
        width: 300px;
        margin: 0 auto;
        max-width: 80%;
        z-index: 20;

        .flex;
        .flex-column;
        .flex-items(flex-start);

        .logo {
            width: 100%;
            height: 120px;
            text-align: center;
            margin-bottom: 20px;

            .logo-icon {
                border-radius: 10px;
            }

            img {
                width: initial;
            }
        }

        > .title {
            width: 100%;
            font-size: 32px;
            text-align: center;
        }

        > .prompt {
            margin-top: 10px;
            width: 100%;
            font-size: 16px;
            text-align: center;
            letter-spacing: 2px;
        }

        .form-box {
            position: relative;
            margin-top: 20px;
            width: 100%;
            height: 130px;
            overflow: hidden;

            .item-box {
                position: absolute;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;

                opacity: 0;
                visibility: hidden;

                @keyframes box_hide {
                    0% {
                        opacity: 1;
                        visibility: initial;
                    }

                    100% {
                        opacity: 0;
                        visibility: hidden;
                    }
                }

                animation: box_hide 0.2s forwards;

                .transition;
                .flex;
                .flex-column;
                .flex-content(flex-end);

                .input-base {
                    width: 100%;

                    .input-box {
                        position: relative;
                        width: 100%;
                        height: 40px;

                        .flex;
                        .flex-center-items;

                        .title {
                            position: absolute;
                            font-size: 16px;
                            color: #ddd;
                            top: 5px;
                            left: 0;
                            line-height: 30px;

                            .transition(0.2s);
                        }

                        .input {
                            width: 100%;
                            height: 100%;
                            font-size: 12px;
                            color: #fff;

                            .border-box;
                            .flex-grow;
                        }

                        .icon {
                            cursor: pointer;
                            width: 20px;
                            height: 20px;
                            padding-left: 10px;

                            .flex-shrink;
                        }

                        .code-box {
                            width: 70px;
                            height: 30px;
                            background: #fff;
                            padding-left: 10px;

                            .flex-shrink;

                            .code {
                                width: 100%;
                                height: 100%;
                            }
                        }

                        .refresh-box {
                            font-size: 12px;
                            color: #fff;
                            width: 80px;
                            height: 25px;
                            background: #2faaf7;
                            border-radius: 4px;
                            cursor: pointer;

                            .flex-shrink;
                            .flex;
                            .flex-center-all;
                        }

                        .refresh-invalid {
                            color: #222;
                            background: rgba(150, 150, 150, 0.7);
                        }

                        .line-box {
                            position: absolute;
                            bottom: 0px;
                            left: 0px;
                            right: 0;
                            height: 2px;
                            background: #ddd;
                            border-radius: 2px;

                            &::after {
                                content: "";
                                position: absolute;
                                top: 0;
                                left: -20px;
                                bottom: 0;
                                width: 20px;
                                background: #2faaf7;
                            }
                        }

                        .show-loading {
                            @keyframes loading {
                                0% {
                                    left: -20px;
                                }

                                50% {
                                    width: 80px;
                                }

                                100% {
                                    left: 100%;
                                }
                            }

                            &::after {
                                animation: loading 2s infinite;
                            }
                        }
                    }

                    .focus {
                        .title {
                            font-size: 12px;
                            top: -25px;
                        }
                    }

                    .prompt {
                        height: 25px;
                        line-height: 25px;
                        font-size: 12px;
                        color: #d0494b;
                        font-weight: bold;
                    }
                }
            }

            .userinfo-item {
                .flex-content(space-between);

                .userinfo-box {
                    padding: 5px 10px;
                    background: #2f3042;

                    .flex;
                    .flex-center-items;
                    .radius(4px);

                    p {
                        font-size: 12px;
                    }

                    .avatar {
                        width: 20px;
                        height: 20px;

                        .radius(50%);
                    }

                    .username {
                        color: #fff;
                        margin: 0 10px;

                        .flex-grow;
                        .ellipsis;
                    }

                    .change-btn {
                        font-size: 12px;
                        line-height: 20px;
                        cursor: pointer;
                        color: #aaa;

                        .flex-shrink;

                        &:hover {
                            color: #fff;
                        }
                    }
                }
            }

            .display {
                @keyframes box_display {
                    0% {
                        opacity: 0;
                        visibility: hidden;
                    }

                    100% {
                        opacity: 1;
                        visibility: initial;
                    }
                }

                animation: box_display 0.2s forwards;
                animation-delay: 0.2s;
            }
        }

        .verification {
            width: 100%;
            height: 50px;
            margin: 10px 0;
            padding: 10px 20px;

            .flex;
            .border-box;
            .radius(10px);

            .input-verification {
                font-size: 16px;

                .flex-grow;
            }

            .img-box {
                width: 70px;
                height: 30px;
                background: #fff;

                .flex-shrink;

                .img-verification {
                    width: 100%;
                    height: 100%;
                }
            }
        }

        .checkbox {
            margin: 10px 0;
            width: 100%;
            height: 30px;

            .flex;
            .flex-center-items;

            input {
                width: 20px;
                height: 30px;
            }

            p {
                margin-left: 5px;
                font-size: 12px;
            }
        }

        .submit {
            width: 100%;
            height: 45px;
            border: initial;
            font-size: 16px;
            letter-spacing: 2px;

            .flex;
            .flex-center-all;
            .radius(4px);
        }

        .operating-box {
            width: 100%;
            margin-top: 30px;

            .flex;
            .flex-center-items;
            .flex-content(space-between);

            .auto-login {
                .flex;
                .flex-center-items;

                input {
                    width: 15px;
                    height: 15px;
                }

                .name {
                    margin-left: 5px;
                    font-size: 12px;
                    color: #fff;
                }
            }

            .btn-box {
                cursor: pointer;

                .flex;
                .flex-center-items;

                &:hover {
                    .title {
                        color: #fff;
                    }
                }

                .icon {
                    width: 18px;
                    height: 18px;
                    margin-right: 5px;
                }

                .title {
                    font-size: 12px;
                    color: #aaa;

                    .flex-shrink;
                }
            }
        }

        .operating-single {
            .flex-content(flex-end);
        }

        @media (max-width: 500px) {
            & {
                > .title {
                    margin: 10px 0;
                    font-size: 25px;
                }

                > .prompt {
                    margin: 10px 0;
                    font-size: 13px;
                }
            }
        }
    }

    .setting-box {
        cursor: pointer;
        width: 30px;
        height: 30px;

        .absolute(50px, 50px, initial, initial);
    }

    .copyright-box {
        font-size: 12px;
        color: #bbb;
        text-align: center;

        .absolute(initial, 15px, 20px, 15px);
    }
}

.t-c {
    color: #fff;
}

.t-b-i {
    background: #0f4354;
}

.t-b-b {
    background: #1cb8d6;
}

.login-page-display {
    visibility: initial;
    opacity: 1;
}
</style>
