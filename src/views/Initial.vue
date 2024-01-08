<template>
    <div class="steer-page page-theme-dark" v-cloak>
        <div class="back-box" v-if="input_step !== 'username'" @click="onBackStep">
            <elem-icon name="back"></elem-icon>
        </div>

        <div class="steer-box">
            <p class="title t-c">设置向导</p>
            <p class="prompt t-c">跟着设置向导完善基础设置吧！</p>
            <div class="number-box">
                <div class="item-box" :class="{ activity: step === 0 }">
                    <div class="index">
                        1
                    </div>
                    <div class="info-box">
                        <div class="name">选择所在城市</div>
                    </div>
                </div>
                <div class="item-box" :class="{ activity: step === 1 }">
                    <div class="index">
                        2
                    </div>
                    <div class="info-box">
                        <div class="step">步骤 2/2</div>
                        <div class="name">填写车辆信息</div>
                    </div>
                </div>
                <div class="item-box" :class="{ activity: step === 1 }">
                    <div class="index">
                        3
                    </div>
                    <div class="info-box">
                        <div class="step">步骤 2/2</div>
                        <div class="name">填写车辆信息</div>
                    </div>
                </div>
            </div>
            <div class="form-box">
                <!-- 开通服务 -->
                <div class="opened-box">
                    <div class="title">开通服务</div>
                    <div class="qrcode-box">
                        <div class="qrcode" ref="qrcode">
                            <elem-icon name="loading"></elem-icon>
                        </div>
                    </div>
                    <div class="prompt">使用微信扫码支付￥0.01</div>
                </div>

                <div class="item-box" :class="{ display: input_step === 'username 1' }">
                    <div class="item-base">
                        <div class="form-item">
                            <elem-input ref="username" name="account" title="手机号码"></elem-input>
                        </div>
                        <div class="form-item" v-if="login_type === 'password'">
                            <elem-input ref="password" type="password" name="password" title="密码"></elem-input>
                        </div>
                        <div class="form-item" v-else>
                            <!-- <elem-verification ref="login_code" nature="EMPLOYEE_LOGIN" name="code" title="验证码"></elem-verification> -->
                        </div>
                    </div>
                </div>

                <!-- 登录 - 校验手机验证码 -->
                <div class="item-box userinfo-item" :class="{ display: input_step === 'verify_phone' }">
                    <div class="userinfo-box">
                        <p class="username">{{ login_verify.formdata.phone || "NULL" }}</p>
                        <div class="change-btn" @click="input_step = 'username'">更改</div>
                    </div>
                    <div class="item-base">
                        <div class="form-item">
                            <elem-verification
                                ref="login_phone_code"
                                :token="login_verify.token"
                                :validate="login_verify.validate"
                                :phone="login_verify.formdata.phone"
                                type="phone"
                                entity="Employee"
                                name="code"
                                title="手机验证码"
                                @on-change="login_verify.code = $event.value"
                            ></elem-verification>
                        </div>
                    </div>
                </div>

                <div class="item-box" :class="{ display: input_step === 'username 1' }">
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

                <!-- 注册 -->
                <div class="item-box" :class="{ display: input_step === 'enroll' }">
                    <div class="item-base">
                        <div class="form-item">
                            <elem-input ref="enroll_company_name" name="company_name" title="公司（企业）名称"></elem-input>
                        </div>
                        <div class="form-item">
                            <elem-input ref="enroll_phone" name="phone" title="手机号码"></elem-input>
                        </div>
                        <div class="form-item">
                            <elem-verification ref="enroll_code" nature="EMPLOYEE_REGISTER" name="code" title="验证码"></elem-verification>
                        </div>
                    </div>
                </div>

                <!-- 注册 - 校验手机验证码 -->
                <div class="item-box userinfo-item" :class="{ display: input_step === 'enroll_verify_phone' }">
                    <div class="userinfo-box">
                        <p class="username">{{ enroll_verify.formdata.phone || "NULL" }}</p>
                        <div class="change-btn" @click="input_step = 'enroll'">更改</div>
                    </div>
                    <div class="item-base">
                        <div class="form-item">
                            <elem-verification
                                ref="enroll_phone_code"
                                :token="enroll_verify.token"
                                :validate="enroll_verify.validate"
                                :phone="enroll_verify.formdata.phone"
                                type="phone"
                                entity="Employee"
                                name="code"
                                title="手机验证码"
                                @on-change="enroll_verify.code = $event.value"
                            ></elem-verification>
                        </div>
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
            <button class="submit t-c t-b-b" @click="onNextStep" v-if="false">{{ getStepTitle() }}</button>
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
import Message from "@/module/interactive/message"

import elemInput from "@/components/elem-input.vue"
import elemIcon from "@/components/elem-icon.vue"
import compMenu from "@/components/comp-menu.vue"

const md5 = require("js-md5")

class LoginPage extends ComponentMethods implements ComponentEntity {
    components = {
        elemInput,
        elemIcon,
        compMenu,
    }

    public step: number = 0

    public login_type: "password" | "code" = "password"

    private input_focus: obj = {}

    private input_step: string = "username"

    private internal = {
        steps: [
            {
                name: "username",
                submit: function () {
                    const account = this.$refs.username.getValue()

                    if (!account) {
                        return Message.error("请输入账号")
                    }

                    if (this.login_type === "password") {
                        const password = this.$refs.password.getValue()

                        if (!password) {
                            return Message.error("请输入密码")
                        }

                        return this.onSubmit({
                            account: account,
                            password: md5(password),
                        })
                    }

                    const code = this.$refs.login_code.getValue()

                    if (!code?.text) {
                        return Message.error("请输入验证码")
                    }

                    const formdata = {
                        phone: account,
                        code: code.text,
                        validate: code.validate,
                    }

                    Request.post<obj>("WEB://Employee/SendLoginCode", formdata)
                        .then(res => {
                            // 缓存 Token
                            this.login_verify = {
                                token: res.token,
                                validate: res.id,
                                formdata: formdata,
                            }
                            // 切换到下一步
                            this.input_step = "verify_phone"
                        })
                        .catch(() => {
                            // 刷新验证码
                            this.$refs.login_code.refresh()
                        })
                },
            },
            {
                name: "verify_phone",
                submit: function () {
                    const d: obj = this.login_verify

                    if (!d.code?.text) {
                        return Message.error("请输入验证码")
                    }

                    this.onSubmit({
                        account: d.formdata.phone,
                        code: d.code.text,
                        validate: d.code.validate,
                    })
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
            {
                name: "enroll",
                submit: function () {
                    const formdata: obj = {}

                    for (let i = 0, l = [this.$refs.enroll_company_name, this.$refs.enroll_phone, this.$refs.enroll_code]; i < l.length; i++) {
                        let e = l[i]
                        let v = e.getValue()

                        if (!v) {
                            return Message.error("请输入：" + e.title)
                        }

                        formdata[e.name] = v
                    }

                    Request.post<obj>("WEB://Employee/SendRegisterCode", {
                        phone: formdata.phone,
                        code: formdata.code.text,
                        validate: formdata.code.validate,
                    })
                        .then(res => {
                            // 缓存 Token
                            this.enroll_verify.token = res.token
                            // 缓存验证码 ID
                            this.enroll_verify.validate = res.id
                            // 缓存数据
                            this.enroll_verify.formdata = formdata
                            // 切换到下一步
                            this.input_step = "enroll_verify_phone"
                        })
                        .catch(() => {
                            // 刷新验证码
                            this.$refs.enroll_code.refresh()
                        })
                },
            },
            {
                name: "enroll_verify_phone",
                submit: function () {
                    const d: obj = this.enroll_verify

                    Request.post<obj>("WEB://Employee/Register", {
                        phone: d.formdata.phone,
                        company_name: d.formdata.company_name,
                        code: d.code.text,
                        validate: d.code.validate,
                    }).then(res => {
                        Cache.set(
                            {
                                token: res.token,
                                user_id: res.id,
                                userinfo: res.userinfo,
                            },
                            { storage: "cookie", expires: 2 * 60 * 60 * 1000 }
                        )

                        // 刷新页面
                        Utils.each<Function>(this.callback, v => {
                            v()
                            // 触发事件后移除
                            return "delete"
                        })

                        this.onChangeDisplay(false)
                    })
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

    // 注册校验数据
    public enroll_verify = {
        formdata: {},
        token: null,
    }

    // 登录校验数据
    public login_verify = {
        formdata: {},
        token: null,
    }

    // 价格
    public price: string = "0.00"

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
                        this.$refs[data.ref]?.focus()
                    }, 500)
                }
            )
        },
    }

    mounted() {
        this.getInitialConfig()
    }

    public getInitialConfig() {
        Request.get<obj>("ADMIN://Setting/Config/GetInitialConfigs").then(res => {
            console.log(res);
        })
    }

    public openService() {
        this.display = true
        this.createOrder()
    }

    public createOrder() {
        Request.get<obj>("WEB://PlatformCostOrder/CreateQrCodeOrder").then(res => {
            this.price = res.price.toFixed(2)
            this.drawQrCode(res.codeUrl)
            this.checking = true
            this.checkingOrder()
        })
    }

    public checkingOrder() {
        Request.get<obj>("WEB://Company/IsHaveOpened").then(res => {
            if (res) {
                Message.success("开通成功")
                return this.$emit("on-success", {
                    tag: "Steer",
                })
            }

            setTimeout(() => {
                if (this.checking) {
                    this.checkingOrder()
                }
            }, 2000)
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

    /** 获取验证码数据 */
    public getValidateCode() {
        Queue.single("Login-GetValidateCode", next => {
            this.codeInfo = null

            Request.get<obj>("WEB://ValidateCode/GetCode", null, {
                hideLoading: true,
                onComplete: () => {
                    next()
                },
            }).then(res => {
                this.codeInfo = res
            })
        })
    }

    public async onSubmit(data) {
        Request.post<obj>("WEB://Employee/Login", data).then(res => {
            Cache.set(
                {
                    token: res.token,
                    user_id: res.id,
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

            this.onChangeDisplay(false)
        })
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
                "WEB://Employee/GetAccountInfo",
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
                return this.login_type === "password" ? "登录" : "获取验证码"
            case "verify_phone":
                return "登录"
            case "forgot_code":
            case "code":
                return "验证"
            case "forgot_email":
                return "获取验证码"
            case "enroll":
                return "获取手机验证码"
            case "enroll_verify_phone":
                return "提交注册"
            default:
                return "提交"
        }
    }

    isForgot() {
        const step = this.input_step
        return step.indexOf("forgot") > -1
    }

    onDisplay() {
        // this.input_step = "username"
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

    onChangeInput(name: string) {
        this[name] = null
    }
}

export default Component.build(new LoginPage())
</script>

<style lang="less">
@import (reference) "@/style/utils.less";
@import (reference) "@/style/color.less";

.steer-page {
    width: 100%;
    z-index: 100;
    background: linear-gradient(to bottom right, #117bbd, #00293e 90%);

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

    .steer-box {
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
            font-size: 14px;
            text-align: center;
            letter-spacing: 2px;
            opacity: 0.8;
        }

        .number-box {
            margin: 20px auto;
            height: 50px;
            background: #fff;
            border-radius: 8px;
            border-color: #f3f3f3;

            .border;
            .flex;
            .flex-center-items;
            .flex-shrink;

            > .item-box {
                padding: 0 10px;
                position: relative;

                .flex;
                .flex-center-items;

                &:not(:last-child)::after {
                    content: "";
                    width: 1px;
                    background: #e3e3e3;

                    .absolute(30%, 0, 30%, initial);
                }

                .index {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    background: #e8e8e8;
                    color: #999;

                    .flex;
                    .flex-center-all;
                }

                .info-box {
                    display: none;
                    margin-left: 10px;

                    .step {
                        font-size: 10px;
                        color: #2faaf7;
                    }

                    .name {
                        font-size: 13px;
                        color: #000;
                    }
                }

                &.activity {
                    .flex-grow;

                    .index {
                        background: #2faaf7;
                        color: #fff;
                    }

                    .info-box {
                        display: block;
                    }
                }
            }
        }

        .form-box {
            position: relative;
            margin-top: 50px;
            width: 100%;
            overflow: hidden;

            .opened-box {
                width: 100%;
                background: rgba(155, 155, 155, 0.3);
                border-radius: 10px;

                > .title {
                    text-align: center;
                    color: #fff;
                    font-size: 18px;
                    padding: 10px 10px;
                    font-weight: bold;
                }

                .qrcode-box {
                    position: relative;
                    margin: 0 15px;
                    width: calc(100% - 30px);
                    padding-bottom: calc(100% - 30px);
                    background: #fff;
                    border-radius: 4px;

                    .qrcode {
                        position: absolute;
                        top: 10px;
                        left: 10px;
                        right: 10px;
                        bottom: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                }

                > .prompt {
                    text-align: center;
                    color: #fff;
                    font-size: 14px;
                    padding: 10px 10px;
                }
            }

            > .item-box {
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                display: none;

                .transition;
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

                .item-base {
                    margin: 10px 0;

                    .form-item {
                        margin-bottom: 10px;
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
                        margin-right: 10px;
                        width: 20px;
                        height: 20px;

                        .radius(50%);
                    }

                    .username {
                        color: #fff;

                        .flex-grow;
                        .ellipsis;
                    }

                    .change-btn {
                        margin-left: 10px;
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
                .flex;
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
</style>
