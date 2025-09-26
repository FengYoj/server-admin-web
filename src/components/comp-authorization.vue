<template>
    <comp-model ref="comp_model" :title="'权限管理'" height="auto" width="800px">
        <div class="authorization-box">
            <Transfer :data="sourceKeys" :target-keys="targetKeys" :list-style="listStyle" :operations="['移除', '添加']" filterable @on-change="handleChange"></Transfer>
        </div>
        <template #operate>
            <div class="operate-box">
                <Button type="primary" @click="onSave">确定</Button>
            </div>
        </template>
    </comp-model>
</template>

<script>
import Request from "@/module/request/request"
import compModel from "./comp-model.vue"
import MessageController from "@/module/interactive/message"

export default {
    name: "ElemAuthorization",
    components: {
        compModel,
    },
    data() {
        return {
            sourceKeys: [],
            targetKeys: [],
            listStyle: {
                width: "300px",
                height: "600px",
            },
        }
    },
    computed: {
        menuList() {
            return this.menus.map(menu => ({
                key: menu.id,
                label: menu.name,
                description: menu.description || "",
            }))
        },
    },
    methods: {
        display(adminAccountUuid) {
            this.sourceKeys = []
            this.targetKeys = []
            this.adminAccountUuid = adminAccountUuid
            this.getAllAuthorization()
            this.getAllAuthorized()
            this.$refs.comp_model.display()
        },

        getAllAuthorization() {
            Request.get("ADMIN://AdminAuthorization/GetAllAuthorization").then(res => {
                let keys = []

                for (let i = 0, d = res; i < d.length; i++) {
                    const e = d[i],
                        operations = e.operations || []

                    for (let j = 0; j < operations.length; j++) {
                        const op = operations[j]
                        keys.push({
                            key: e.entity + "-" + op,
                            label: e.title + " - " + op,
                            title: e.title,
                            entity: e.entity,
                            operation: op,
                        })
                    }
                }

                this.sourceKeys = keys
            })
        },

        getAllAuthorized() {
            Request.get("ADMIN://AdminAccountAuthorization/GetAllByAccountUuid", { adminAccountUuid: this.adminAccountUuid }).then(res => {
                let keys = []

                for (let i = 0, d = res; i < d.length; i++) {
                    const e = d[i],
                        operations = e.operations || []

                    for (let j = 0; j < operations.length; j++) {
                        const op = operations[j]

                        keys.push(e.entity + "-" + op)
                    }
                }

                this.targetKeys = keys
            })
        },

        onSave() {
            let authorizationsObj = {}

            for (let i = 0, d = this.sourceKeys; i < d.length; i++) {
                const e = d[i]

                if (this.targetKeys.indexOf(e.key) === -1) {
                    continue
                }

                if (authorizationsObj[e.entity]) {
                    authorizationsObj[e.entity].operations.push(e.operation)
                } else {
                    authorizationsObj[e.entity] = {
                        entity: e.entity,
                        title: e.title,
                        operations: [e.operation],
                    }
                }
            }

            let authorizations = []

            for (let key in authorizationsObj) {
                authorizations.push(authorizationsObj[key])
            }

            Request.post(
                "ADMIN://AdminAccountAuthorization/Save",
                {
                    adminAccountUuid: this.adminAccountUuid,
                    authorizations: authorizations,
                },
                { json: true }
            ).then(() => {
                MessageController.success("保存成功")
                this.$refs.comp_model.close()
            })
        },

        handleChange(newTargetKeys) {
            console.log(newTargetKeys)
            this.targetKeys = newTargetKeys
        },
        reloadMockData() {
            this.getAllAuthorization()
            this.targetKeys = this.getTargetKeys()
        },
    },
}
</script>
<style lang="less" scoped>
.authorization-box {
    padding: 20px;
    display: flex;
    justify-content: center;
}

.operate-box {
    padding: 10px 20px;
    display: flex;
    justify-content: flex-end;
}
</style>
