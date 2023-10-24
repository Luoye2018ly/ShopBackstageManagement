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
              title="addUsers"
              width="30%"
          >
            <span>
              <el-form :rules="addRolesRules" label-width="85px">
                <el-form-item label="roleName" prop="name">
                  <el-input v-model="addDialog.roleName"></el-input>
                </el-form-item>
                <el-form-item label="roleDesc">
                  <el-input v-model="addDialog.roleDesc"></el-input>
                </el-form-item>
              </el-form>
            </span>
            <span slot="footer" class="dialog-footer">
              <el-button @click="addDialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="postInfo">确 定</el-button>
            </span>
          </el-dialog>
        </el-col>
      </el-row>
      <!-- 角色列表区 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="{row:{children}}">
            <el-row v-for="(item1,index1) in children" :key="item1.id"
                    :class="['bdBtm',index1 === 0 ? 'bdTop' : '' ,'vcenter']"
                    :span="5">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag>{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过 for 嵌套渲染二级权限 -->
                <el-row v-for="(item2,index2) in item1.children" :key="item2.id"
                        :class="[index2 === 0 ? '' : 'bdTop','vcenter']">
                  <el-col :span="6">
                    <el-tag type="success">{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag v-for="(item3,index3) in item2.children" :key="item3.id" type="warning">
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
        <el-table-column label="操作" width="280px">
          <template v-slot="{row:{id}}">
            <el-button icon="el-table-edit" size="mini" type="primary" @click="editRoles(id)">编辑</el-button>
            <el-button icon="el-icon-delete" size="mini" type="danger" @click="removeRoles(id)">删除</el-button>
            <el-button icon="el-icon-setting" size="mini" type="warning">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-dialog
          :visible.sync="editDialogVisible"
          title="提示"
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
          <el-button type="primary" @click="postInfoByID(editDialog.roleId)">确 定</el-button>
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
      addRolesRules: {
        name: [
          {required: true, message: "Please enter roleName", trigger: "blur"}
        ]
      }
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
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
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
    async postInfoByID(id) {
      const {data: result} = await this.$http.put(`roles/${id}`, this.editDialog)
      if (result.meta.status !== 200) {
        return this.$message('Failed to post data')
      }
      this.editDialogVisible = false
      await this.getRolesList()
      return this.$message.success('Change the roles list successfully!')
    },
    async postInfo() {
      const {data: result} = await this.$http.post(`roles`, this.addDialog)
      console.log(result)
      if (result.meta.status !== 201) {
        return this.$message.error('Failed to post data')
      }
      this.addDialogVisible = false
      await this.getRolesList()
      return this.$message.success('Add roles list successfully!')
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