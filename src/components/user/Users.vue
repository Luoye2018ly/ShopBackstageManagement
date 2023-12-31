<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input v-model="queryInfo.query" clearable placeholder="Please enter content"
                    @clear="getUserList" @keyup.native="getUserList">
            <!-- slot被弃用，使用具名插槽指定插槽名时可以使用v-slot:"slotName"进行指定，可以简写成#slotName -->
            <template #append>
              <el-button icon="el-icon-search" @click="getUserList"></el-button>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区 -->
      <el-table :data="this.userList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="ID" prop="id"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <!--
            此处能接到scope是因为在el-table创建的时候通过v-bind将this.userList绑定给了el-table的data
            <template v-slot="scope">
              <el-switch v-model="scope.row.mg_state"></el-switch>
            </template>
          -->
          <!-- 做了二次解构赋值，先从对象中将row解构出来，再从row中将mg_state解构出来 -->
          <!-- 写到后面需要el-switch绑定@change事件，该事件需要用到触发事件的开关的id，于是只能被迫只将row解构出来，不做二次解构赋值 -->
          <!--
            <template v-slot="{row:{mg_state}">
              <el-switch v-model="mg_state"></el-switch>
            </template>
          -->
          <template v-slot="{row}">
            <el-switch v-model="row.mg_state" @change="userStateChanged(row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template v-slot="{row}">
            <!-- 修改按钮 -->
            <el-tooltip :enterable="false" content="修改角色" effect="dark" placement="top">
              <el-button icon="el-icon-edit" size="mini" type="primary" @click="showEditDialog(row.id)"></el-button>
            </el-tooltip>
            <!-- 删除按钮 -->
            <el-tooltip :enterable="false" content="删除角色" effect="dark" placement="top">
              <el-button icon="el-icon-delete" size="mini" type="danger" @click="removeUserByID(row.id)"></el-button>
            </el-tooltip>
            <!-- 分配角色按钮 -->
            <el-tooltip :enterable="false" content="分配角色" effect="dark" placement="top">
              <el-button icon="el-icon-setting" size="mini" type="warning" @click="setRole(row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
          :current-page="queryInfo.pagenum"
          :page-size="queryInfo.pagesize"
          :page-sizes="[1, 2, 5, 10]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange">
      </el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog
        :visible.sync="addDialogVisible"
        title="Add Users"
        width="30%"
        @close="addDialogClosed">
      <!-- 内容主体区 -->
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog
        :visible.sync="editDialogVisible"
        title="修改用户"
        width="30%"
        @close="editDialogClosed"
        @keyup.enter.native="editUserInfo">
      <span>
        <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="70px">
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
        :visible.sync="setRoleDialogVisible"
        title="分配角色"
        width="30%"
        @close="setRoleDialogClosed"
    >
      <div>
        <p>当前用户：{{ userInfo.username }}</p>
        <p>当前角色：{{ userInfo.role_name }}</p>
        <p>
          分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
                v-for="item in rolesList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id">
            </el-option>
          </el-select>
        </p>

      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱规则
    let checkEmail = (rules, value, callback) => {
      // 验证邮箱正则
      const regEmail = /^([a-zA-z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return callback()
      }
      callback(new Error("Please enter correct email"))
    }
    // 验证手机号规则
    let checkMobile = (rules, value, callback) => {
      // 验证手机号正则
      const regMobile = /^(0|86|17951)?(13[0-9]|15[0-9]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return callback()
      }
      return callback(new Error('Please enter correct phone number'))
    }
    return {
      // 获取用户数据列表的参数对象
      queryInfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        // 当前每页显示数据条数
        pagesize: 2
      },
      userList: [],
      total: 0,
      // 控制添加用户对话框的显示或隐藏
      addDialogVisible: false,
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      // 添加表单的验证规则对象
      addFormRules: {
        username: [{required: true, message: "Please enter username", trigger: "blur"},
          {min: 3, max: 10, message: "Please limit the length from 3 to 10 characters", trigger: "blur"}],
        password: [{required: true, message: "Please enter password", trigger: "blur"},
          {min: 6, max: 15, message: "Please limit the length from 6 to 15 characters", trigger: "blur"}],
        email: [{required: true, message: "Please enter email", trigger: "blur"},
          {validator: checkEmail, trigger: "blur"}],
        mobile: [{required: true, message: "Please enter mobile phone number", trigger: "blur"},
          {validator: checkMobile, trigger: "blur"}]
      },
      // 控制修改用户对话框的展示与隐藏
      editDialogVisible: false,
      // 查询到的用户信息对象
      editForm: {},
      // 修改表单的验证规则对象
      editFormRules: {
        email: [
          {required: true, message: 'Please enter email', trigger: "blur"},
          {validator: checkEmail, trigger: "blur"}
        ],
        mobile: [
          {required: true, message: 'Please enter mobile', trigger: "blur"},
          {validator: checkMobile, trigger: "blur"}
        ]
      },
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有角色列表
      rolesList: [],
      // 已选中的角色id值
      selectedRoleId: ""
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const {data: result} = await this.$http.get('users', {params: this.queryInfo})
      if (result.meta.status !== 200) {
        return this.$message.error('Failed to get userList')
      }
      this.userList = result.data.users
      this.total = result.data.total
    },
    // 监听 pageSize 改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听 switch 开关状态的改变
    async userStateChanged(userInfo) {
      const {data: result} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (result.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('Failed to change userStatus!')
      }
      this.$message.success('Change userStatus successfully！')
    },
    // 监听添加用户对话框关闭的事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮添加新用户预校验
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        // 校验失败，直接返回
        if (!valid) return
        // 校验成功，提交数据
        const {data: result} = await this.$http.post('users', this.addForm)
        if (result.meta.status !== 201) {
          this.$message.error('Failed to add user')
        }
        this.$message.success('Add user successfully')
        // 隐藏添加用户对话框
        this.addDialogVisible = false
        // 重新获取用户列表
        await this.getUserList()
      })
    },
    // 展示编辑用户的对话框
    async showEditDialog(id) {
      const {data: result} = await this.$http.get(`users/${id}`)
      if (result.meta.status !== 200) {
        return this.$message.error(`Failed to get user list`)
      }
      this.editForm = result.data
      this.editDialogVisible = true
    },
    // 监听修改用户对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息并提交
    editUserInfo() {
      this.$refs.editFormRef.validate(
          async (valid) => {
            if (!valid) {
              return this.$message.error("Please check the info what you enter")
            }
            // 发起修改用户信息请求
            const {data: result} = await this.$http.put(`users/${this.editForm.id}`, {
              email: this.editForm.email,
              mobile: this.editForm.mobile
            })
            if (result.meta.status !== 200) {
              return this.$message.error("Failed to update user info！")
            }
            this.editDialogVisible = false
            await this.getUserList()
            this.$message.success("Update user info successfully！")
          }
      )
    },
    // 根据ID删除对应用户信息
    async removeUserByID(id) {
      // 弹框询问用户是否需要删除
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // .catch(err => err) 等同于 .catch(err => {return err}，当箭头函数只有一行且为返回值时，可以将其简化为一行
      // 如果用户确认删除，返回值为字符串 confirm
      // 如果用户取消删除，返回值为字符串 cancel
      if (confirmResult !== "confirm") {
        return this.$message.info("Removal has been canceled")
      }
      const {data: result} = await this.$http.delete(`users/${id}`)
      if (result.meta.status !== 200) {
        return this.$message.error("Failed to remove ")
      }
      await this.getUserList()
      return this.$message.success("Delete user successfully")
    },
    // 展示分配角色对话框
    async setRole(userInfo) {
      this.userInfo = userInfo
      // 展示对话框之前获取所有角色列表
      const {data: result} = await this.$http.get('roles')
      if (result.meta.status !== 200) {
        return this.$message.error("Failed to get roles list")
      }
      this.rolesList = result.data
      this.setRoleDialogVisible = true
    },
    async saveRoleInfo(){
      if (!this.selectedRoleId) {
        return this.$message.error("Please choose role in selection")
      }
      const {data : result} = await this.$http.put(`users/${this.userInfo.id}/role`,{rid: this.selectedRoleId})
      if (result.meta.status !== 200){
        return this.$message.error("Failed to update role")
      }
      this.$message.success("Update role successful")
      await this.getUserList()
      this.setRoleDialogVisible = false
    },
    setRoleDialogClosed(){
      this.selectedRoleId = ""
      this.userInfo = ""
    }
  }
}
</script>

<style scoped>

</style>