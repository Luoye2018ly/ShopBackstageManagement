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
            <el-table-column type="expand">
              <template v-slot="{row}">
                <!-- 循环渲染el-tag -->
                <el-tag v-for="(item,index) in row.attr_vals" :key="index" closable type="primary"
                        @close="handleClose(index,row)">{{ item }}
                </el-tag>
                <el-input
                    v-if="row.inputVisible"
                    ref="saveTagInput"
                    v-model="row.inputValue"
                    class="input-new-tag"
                    size="small"
                    @blur="handleInputConfirm(row)"
                    @keyup.enter.native="handleInputConfirm(row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="{row}">
                <el-button icon="el-icon-edit" size="mini" type="primary" @click="showEditDialog(row.attr_id)">编辑
                </el-button>
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
            <el-table-column type="expand">
              <template v-slot="{row}">
                <!-- 循环渲染el-tag -->
                <el-tag v-for="(item,index) in row.attr_vals" :key="index" closable type="primary"
                        @close="handleClose(index,row)">{{ item }}
                </el-tag>
                <el-input
                    v-if="row.inputVisible"
                    ref="saveTagInput"
                    v-model="row.inputValue"
                    class="input-new-tag"
                    size="small"
                    @blur="handleInputConfirm(row)"
                    @keyup.enter.native="handleInputConfirm(row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="{row}">
                <el-button icon="el-icon-edit" size="mini" type="primary" @click="showEditDialog(row.attr_id)">编辑
                </el-button>
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
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数对话框 -->
    <el-dialog
        :title="`修改${titleText}`"
        :visible.sync="editDialogVisible"
        width="30%"
        @close="editDialogClosed"
    >
      <!-- 修改参数表单 -->
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
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
      },
      // 控制修改对话框显示与隐藏
      editDialogVisible: false,
      editForm: {},
      editFormRules: {
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
    // 获取商品分类
    async getCategories() {
      const {data: result} = await this.$http.get('categories')
      if (result.meta.status !== 200) {
        return this.$message.error("Failed to get categories")
      }
      this.catelist = result.data
    },
    // 级联选择框选中项变化，触发函数
    handleChange() {
      if (this.selectedCateKeys.length !== 3) {
        this.$message.warning("Please select the third level classification")
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      this.getParamsData()
    },
    // tab页签单击响应函数
    handleTabClick() {
      this.getParamsData()
    },
    // 获取参数
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
      result.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : []
        // 控制文本框显示与隐藏
        item.inputVisible = false
        item.inputValue = ""
      })
      if (this.activeName === "many") {
        this.manyTableData = result.data
      }
      this.onlyTableData = result.data
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮添加参数
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const {data: result} = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (result.meta.status !== 201) {
          this.$message.error("Failed to add params")
        }
        this.$message.success("Add params successfully")
        this.addDialogVisible = false
        await this.getParamsData()
      })
    },
    // 点击按钮展示修改对话框
    async showEditDialog(id) {
      const {data: result} = await this.$http.get(`categories/${this.cateId}/attributes/${id}`)
      if (result.meta.status !== 200) return this.$message.error("Failed to get parameters list")
      this.editForm = result.data
      this.editDialogVisible = true
    },
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const {data: result} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if (result.meta.status !== 200) return this.$message.error("Failed to update parameters")
        this.$message.success("Update parameters successfully")
        await this.getParamsData()
        this.editDialogVisible = false
      })
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    async saveAttrVals(row) {
      const {data: result} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (result.meta.status !== 200) {
        return this.$message.error("Failed to update parameters")
      }
      this.$message.success("Update parameters successfully")
    },
    // 文本框失去焦点或按下enter键响应函数
    handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ""
        row.inputVisible = false
        return
      }
      // 如果没有return，证明输入了内容，执行处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ""
      row.inputVisible = false
      // 发起请求保存操作
      this.saveAttrVals(row)
    },
    // 点击按钮展示文本输入框
    showInput(row) {
      row.inputVisible = true
      // 让文本框自动获得焦点
      // $nextTick钩子，页面元素重新渲染之后执行会调
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 删除对应可选项
    handleClose(index, row) {
      row.attr_vals.splice(index, 1)
      this.saveAttrVals(row)
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

.el-tag {
  margin: 10px;
}

.input-new-tag {
  width: 120px;
}
</style>