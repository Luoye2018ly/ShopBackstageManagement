<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按扭区 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
          <el-dialog
              :visible.sync="addDialogVisible"
              title="添加用户"
              width="30%"
          >
            <span>
              <el-form ref="ruleForm" :model="addDialog" :rules="rules" class="demo-ruleForm" label-width="100px">
                <el-form-item label="roleName" prop="roleName">
                  <el-input v-model="addDialog.roleName"></el-input>
                </el-form-item>
                <el-form-item label="roleDesc">
                  <el-input v-model="addDialog.roleDesc"></el-input>
                </el-form-item>
              </el-form>
            </span>
            <span slot="footer" class="dialog-footer">
              <el-button @click="addDialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="submitInfo">确 定</el-button>
            </span>
          </el-dialog>
        </el-col>
      </el-row>
      <!-- 角色列表区 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="{row}">
            <el-row v-for="(item1,index1) in row.children" :key="item1.id"
                    :class="['bdBtm',index1 === 0 ? 'bdTop' : '' ,'vcenter']"
                    :span="5">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightsByID(row,item1.id)">
                  {{ item1.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过 for 嵌套渲染二级权限 -->
                <el-row v-for="(item2,index2) in item1.children" :key="item2.id"
                        :class="[index2 === 0 ? '' : 'bdTop','vcenter']">
                  <el-col :span="6">
                    <el-tag closable type="success" @close="removeRightsByID(row,item2.id)">
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag v-for="(item3,index3) in item2.children" :key="item3.id" closable type="warning"
                            @close="removeRightsByID(row,item3.id)">
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="290px">
          <template v-slot="{row}">
            <el-button icon="el-icon-edit" size="mini" type="primary" @click="editRoles(row.id)">编辑</el-button>
            <el-button icon="el-icon-delete" size="mini" type="danger" @click="removeRoles(row.id)">删除</el-button>
            <el-button icon="el-icon-setting" size="mini" type="warning" @click="showSetRightDialog(row)">
              分配权限
            </el-button>
            <!-- 分配权限对话框 -->
            <el-dialog
                :visible.sync="setRightsDialogVisible"
                title="分配权限"
                width="30%"
                @close="setRightsDialogClosed"
            >
              <!-- 树形控件 -->
              <el-tree :data="rightsList" :default-checked-keys="defKeys" :props="treeProps" default-expand-all node-key="id"
                       show-checkbox ref="treeRef"></el-tree>
              <span slot="footer" class="dialog-footer">
                <el-button @click="setRightsDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
              </span>
            </el-dialog>
          </template>
        </el-table-column>
      </el-table>
      <el-dialog
          :visible.sync="editDialogVisible"
          title="编辑"
          width="30%"
      >
        <span>
          <el-form>
            <el-form-item label="roleId">
              <el-input v-model="editDialog.roleId"></el-input>
            </el-form-item>
            <el-form-item label="roleName">
              <el-input v-model="editDialog.roleName"></el-input>
            </el-form-item>
            <el-form-item label="roleId">
              <el-input v-model="editDialog.roleDesc"></el-input>
            </el-form-item>
          </el-form>
        </span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitInfoByID(editDialog.roleId)">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      roleList: [],
      editDialogVisible: false,
      editDialog: {
        roleId: "",
        roleName: "",
        roleDesc: ""
      },
      addDialogVisible: false,
      addDialog: {
        roleName: "",
        roleDesc: ""
      },
      rules: {
        roleName: [
          {required: true, message: 'Please enter roleName', trigger: 'blur'}
        ]
      },
      setRightsDialogVisible: false,
      rightsList: [],
      // 树形结构的属性绑定对象
      treeProps: {
        children: "children",
        label: "authName"
      },
      // 默认选中节点的ID值
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId:""
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const {data: result} = await this.$http.get('roles')
      if (result.meta.status !== 200) {
        return this.$message.error("Failed to get roles list")
      }
      this.roleList = result.data
    },
    async removeRoles(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== "confirm") {
        return this.$message.info("Removal has been canceled")
      }
      const {data: result} = await this.$http.delete(`roles/${id}`)
      if (result.meta.status !== 200) {
        return this.$message.error('Failed to remove roles')
      }
      await this.getRolesList()
      return this.$message.success('Remove roles successfully!')
    },
    async editRoles(id) {
      this.editDialogVisible = true
      await this.getRolesListByID(id)
    },
    async getRolesListByID(id) {
      const {data: result} = await this.$http.get(`roles/${id}`)
      if (result.meta.status !== 200) {
        return this.$message.error(`Failed to get roles list by id`)
      }
      this.editDialog.roleId = result.data.roleId
      this.editDialog.roleName = result.data.roleName
      this.editDialog.roleDesc = result.data.roleDesc
    },
    async submitInfoByID(id) {
      const {data: result} = await this.$http.put(`roles/${id}`, this.editDialog)
      if (result.meta.status !== 200) {
        return this.$message('Failed to post data')
      }
      this.editDialogVisible = false
      await this.getRolesList()
      return this.$message.success('Change the roles list successfully!')
    },
    async submitInfo() {
      const {data: result} = await this.$http.post(`roles`, this.addDialog)
      if (result.meta.status !== 201) {
        return this.$message.error('Failed to post data')
      }
      this.addDialogVisible = false
      await this.getRolesList()
      this.addDialog.roleDesc = ""
      this.addDialog.roleName = ""
      return this.$message.success('Add roles list successfully!')
    },
    // 根据 ID 删除对应权限
    async removeRightsByID(role, rightsID) {
      // 弹框提示用户是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info("Removal has been canceled")
      }
      const {data: result} = await this.$http.delete(`roles/${role.id}/rights/${rightsID}`)
      if (result.meta.status !== 200) {
        return this.$message.error("Failed to remove rights")
      }
      this.$message.success("Remove rights successfully")
      // await this.getRolesList()
      role.children = result.data
    },
    // 展示分配权限对话框
    async showSetRightDialog(node) {
      this.roleId=node.id
      // 获取树形权限列表
      const {data: result} = await this.$http.get('rights/tree')
      if (result.meta.status !== 200) {
        return this.$message.error('Failed to get rights list')
      }
      // 把获取到的数据保存到 data 中
      this.rightsList = result.data
      this.getLeafKeys(node, this.defKeys)
      this.setRightsDialogVisible = true
    },
    // 通过递归获取角色下所有三级权限的ID，并保存到 defKeys 中
    getLeafKeys(node, arr) {
      // 如果当前 node 节点不包含children属性，则是三级节点，
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr)
      })
    },
    // 监听分配权限对话框的关闭事件
    setRightsDialogClosed(){
      this.defKeys=[]
    },
    // 点击为角色分配权限
    async allotRights(){
      const key = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = key.join(",")
      const {data: result} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
      if (result.meta.status !== 200){
        return this.$message.error("Failed to assign permissions")
      }
      this.$message.success("Assign permissions successfully")
      await this.getRolesList()
      this.setRightsDialogVisible = false
    }
  }
}
</script>

<style scoped>
.el-tag {
  margin: 7px;
}

.bdTop {
  border-top: 1px solid #eee;
}

.bdBtm {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>