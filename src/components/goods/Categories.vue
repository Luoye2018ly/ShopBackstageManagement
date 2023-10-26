<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCatDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table
          :columns="columns"
          :data="catelist"
          :expand-type="false"
          :selection-type="false"
          border
          class="tree-table"
          index-text="#"
          show-index
      >
        <!-- 是否有效 -->
        <!-- v-slot:slotName="scope"不能拆开写 -->
        <template #isok="{row}">
          <i v-if="row.cat_deleted === false" class="el-icon-success" style="color: lightgreen"></i>
          <i v-else class="el-icon-error" style="color: red"></i>
        </template>
        <!-- 排序 -->
        <template #order="{row}">
          <el-tag v-if="row.cat_level === 0" size="mini" type="primary">一级</el-tag>
          <el-tag v-else-if="row.cat_level === 1" size="mini" type="success">二级</el-tag>
          <el-tag v-else size="mini" type="warning">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template #opt="{row}">
          <el-button icon="el-icon-edit" size="mini" type="primary">编辑</el-button>
          <el-button icon="el-icon-delete" size="mini" type="danger">删除</el-button>
        </template>
      </tree-table>
      <el-pagination
          :current-page="queryInfo.pagenum"
          :page-size="queryInfo.pagesize"
          :page-sizes="[3, 5, 10]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange">
      </el-pagination>
      <!-- 分页区域 -->
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
        :visible.sync="addCatDialogVisible"
        title="添加分类"
        width="30%"
        @close="addCateDialogClosed"
    >
      <!-- 添加分类的表单 -->
      <el-form ref="addCatFormRef" :model="addCatForm" :rules="addCateFormRules" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCatForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options 用于指定数据源 -->
          <el-cascader
              v-model="selectedKeys"
              :options="parentCateList"
              :props="cascaderProps"
              clearable
              @change="parentCateChange">
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCatDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCat">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      catelist: [],
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          type: "template",
          template: 'isok'
        },
        {
          label: "排序",
          type: "template",
          template: "order"
        },
        {
          label: "操作",
          type: "template",
          template: "opt"
        }
      ],
      // 控制添加分类对话框显示与隐藏
      addCatDialogVisible: false,
      // 添加分类的数据表单对象
      addCatForm: {
        // 将要添加的分类的名称
        cat_name: "",
        // 父级分类的ID
        cat_pid: 0,
        // 分类等级，默认添加一级分类
        cat_level: 0
      },
      // 添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          {required: true, message: "Please enter classification name", trigger: "blur"}
        ]
      },
      // 父级分类列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      // 选中的父级分类的id数组
      selectedKeys: []
    }
  },
  created() {
    this.getCategories()
  },
  methods: {
    async getCategories() {
      const {data: result} = await this.$http.get("categories", {params: this.queryInfo})
      if (result.meta.status !== 200) {
        return this.$message.error("Failed to get categories")
      }
      this.catelist = result.data.result
      this.total = result.data.total
    },
    // 监听 pagesize 改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCategories()
    },
    // 监听 pagenum 改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCategories()
    },
    showAddCatDialog() {
      // 先获取父级分类数据列表，再展示数据
      this.getParentCateList()
      this.addCatDialogVisible = true
    },
    // 获取父级分类数据列表
    async getParentCateList() {
      const {data: result} = await this.$http.get("categories", {params: {type: 2}})
      if (result.meta.status !== 200) {
        return this.$message.error("Failed to get parent cateList")
      }
      this.parentCateList = result.data
    },
    // 选择项发生变化触发函数
    parentCateChange() {
      // 长度 selectedKeys 长度大于 0 说明选中了父级分类
      // 反之说明没有选中父级分类
      if (this.selectedKeys.length > 0) {
        // 为当前父级分类的id赋值
        this.addCatForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCatForm.cat_level = this.selectedKeys.length
      } else {
        this.addCatForm.cat_pid = 0
        this.addCatForm.cat_level = 0
      }
    },
    // 点击按钮添加新分类
    addCat(){
      this.$refs.addCatFormRef.validate(async (valid)=>{
        if (!valid) return
        const {data: result} = await this.$http.post('categories',this.addCatForm)
        if (result.meta.status !== 201){
          return this.$message.error("Failed to add categories")
        }
        this.$message.success("Add categories successfully")
        await this.getCategories()
        this.addCatDialogVisible = false
      })
    },
    addCateDialogClosed(){
      this.$refs.addCatFormRef.resetFields()
      this.selectedKeys = []
      this.addCatForm.cat_level = 0
      this.addCatForm.cat_pid = 0
    }
  },
}
</script>

<style scoped>
.tree-table {
  margin-top: 15px;
  font-size: 12px;
}

.el-cascader {
  width: 100%;
}
</style>