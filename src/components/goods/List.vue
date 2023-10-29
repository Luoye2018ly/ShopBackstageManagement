<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" @keyup.native="getGoodsList" clearable @clear="getGoodsList">
            <template #append>
              <el-button icon="el-icon-search" @click="getGoodsList"></el-button>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="90px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="商品创建时间" prop="add_time" width="150px">
          <template v-slot="{row:{add_time: time}}">
            {{time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template v-slot="{row:{goods_id:id}}">
            <el-button icon="el-icon-edit" size="mini" type="primary"></el-button>
            <el-button icon="el-icon-delete" size="mini" type="danger" @click="removeGoodsById(id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[10, 20, 40, 80]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          background>
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      goodsList: [],
      total: 0
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 根据分页获取参数
    async getGoodsList() {
      const {data: result} = await this.$http.get("goods", {params: this.queryInfo})
      if (result.meta.status !== 200) {
        return this.$message.error("Failed to get goods list")
      }
      this.goodsList = result.data.goods
      this.total = result.data.total
    },
    handleSizeChange(newSize){
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange(newPage){
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    removeGoodsById(id){
      this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const {data: result} = await this.$http.delete(`goods/${id}`)
        if (result.meta.status !== 200) return this.$message.error("Failed to remove goods")
        await this.getGoodsList()
        this.$message({
          type: 'success',
          message: 'Remove goods successfully'
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Removal has been canceled'
        });
      })
    },
    goAddPage(){
      this.$router.push("/goods/add")
    }
  }
}
</script>

<style scoped>

</style>