<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 头部警告区域 -->
      <el-alert :closabe="false" show-icon title="注意：只允许为第三级分类设置相关参数！" type="warning">
      </el-alert>
      <!-- 选择商品分类区 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 级联选择框区域 -->
          <el-cascader
              v-model="selectedCateKeys"
              :options="catelist"
              :props="cateProps"
              @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>
      <!--tab页签区-->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数按钮 -->
          <el-button :disabled="isBtnDisable" size="mini" type="primary" @click="addDialogVisible = true">添加参数
          </el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand"></el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="{row}">
                <el-button icon="el-icon-edit" size="mini" type="primary">编辑</el-button>
                <el-button icon="el-icon-delete" size="mini" type="danger">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性按钮 -->
          <el-button :disabled="isBtnDisable" size="mini" type="primary" @click="addDialogVisible = true">添加属性
          </el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand"></el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="{row}">
                <el-button icon="el-icon-edit" size="mini" type="primary">编辑</el-button>
                <el-button icon="el-icon-delete" size="mini" type="danger">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog
        :title="`添加${titleText}`"
        :visible.sync="addDialogVisible"
        width="30%"
        @close="addDialogClosed"
    >
      <!-- 添加参数表单 -->
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类
      catelist: [],
      // 级联选择框配置对象
      cateProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 级联选择框双向绑定的数据
      selectedCateKeys: [],
      // 被激活页签名称
      activeName: "many",
      // 动态参数数据
      manyTableData: [],
      // 静态参数数据
      onlyTableData: [],
      // 控制添加对话框的显示与隐藏
      addDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {
        attr_name: ""
      },
      // 添加参数的表单验证对象
      addFormRules: {
        attr_name: [
          {required: true, message: "Please enter attribute name", trigger: "blur"}
        ]
      }
    }
  },
  created() {
    // 获取所有商品参数列表
    this.getCategories()
  },
  methods: {
    async getCategories() {
      const {data: result} = await this.$http.get('categories')
      if (result.meta.status !== 200) {
        return this.$message.error("Failed to get categories")
      }
      this.catelist = result.data
    },
    // 级联选择框选中项变化，触发函数
    handleChange() {
      this.getParamsData()
    },
    // tab页签单击响应函数
    handleTabClick() {
      this.getParamsData()
    },
    async getParamsData() {
      if (this.selectedCateKeys.length !== 3) {
        this.$message.warning("Please select the third level classification")
        this.selectedCateKeys = []
        return
      }
      // 根据所选分类id和当前所处面板，获取对应参数
      const {data: result} = await this.$http.get(`categories/${this.cateId}/attributes`, {params: {sel: this.activeName}})
      if (result.meta.status !== 200) {
        return this.$message.error("Failed to get parameters list")
      }
      if (this.activeName === "many") {
        this.manyTableData = result.data
      }
      this.onlyTableData = result.data
    },
    addDialogClosed(){
      this.$refs.addFormRef.resetFields()
    }
  },
  computed: {
    // 如果按钮应被禁用，返回true，否则，返回false
    isBtnDisable() {
      return this.selectedCateKeys.length !== 3
    },
    // 当前选中三级分类的id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 动态计算标题文本
    titleText() {
      if (this.activeName === "many") {
        return "动态参数"
      }
      return "静态属性"
    }
  }
}
</script>

<style scoped>
.cat_opt {
  margin: 15px 0;
}
</style>