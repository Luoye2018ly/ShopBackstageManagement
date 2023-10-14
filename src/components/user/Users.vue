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
          <el-input placeholder="请输入内容">
            <!-- slot被弃用，使用具名插槽指定插槽名时可以使用v-slot:"slotName"进行指定，可以简写成#slotName -->
            <template #append>
              <el-button icon="el-icon-search"></el-button>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区 -->
      <el-table :data="this.userList" border stripe>
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
          <template v-slot="{row:{mg_state}}">
            <el-switch v-model="mg_state"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">

          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 获取用户数据列表的参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      total: 0
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const {data: result} = await this.$http.get('users', {params: this.queryInfo})
      if (result.meta.status !== 200) {
        return this.$message.error('Failed to get user list')
      }
      this.userList = result.data.users
      this.total = result.data.total
    }
  }
}
</script>

<style scoped>

</style>