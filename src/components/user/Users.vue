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
        <el-table-column label="操作" width="180px">
          <template v-slot="scope">
            <!-- 修改按钮 -->
            <el-tooltip effect="dark" content="修改角色" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            </el-tooltip>
            <!-- 删除按钮 -->
            <el-tooltip effect="dark" content="删除角色" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
            </el-tooltip>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[1, 2, 5, 10]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
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
        // 当前页数
        pagenum: 1,
        // 当前每页显示数据条数
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
    },
    // 监听 pageSize 改变的事件
    handleSizeChange(newSize){
      this.queryInfo.pagesize = newSize
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage){
      console.log(newPage)
    }
  }
}
</script>

<style scoped>

</style>