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
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区 -->
      <el-table :data="roleList" stripe border>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="{row:{children}}">
            <el-row :class="['bdBtm']" :span="5" v-for="(item1,index1) in children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col>
                <el-tag>{{item1.authName}}</el-tag>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19"></el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="280px">
          <template v-slot="scope">
            <el-button type="primary" icon="el-table-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data(){
    return {
      roleList:[]
    }
  },
  created(){
    this.getRolesList()
  },
  methods:{
    async getRolesList(){
      const {data : result} = await this.$http.get('roles')
      if (result.meta.status !== 200){
        return this.$message.error("Failed to get roles list！")
      }
      this.roleList = result.data
      console.log(this.roleList);
    }
  }
}
</script>

<style scoped>
.el-tag{
  margin: 7px;
}
.bdTop{
  border-top: 1px solid #eee;
}
.bdBtm{
  border-bottom: 1px solid #eee;
}
</style>