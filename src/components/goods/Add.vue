<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/goods' }">商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert
          :closable="false"
          center
          show-icon
          title="添加商品信息"
          type="info">
      </el-alert>
      <!-- 步骤条 -->
      <el-steps :active="parseInt(activeIndex)" :space="200" align-center finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏区域 -->
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-position="top" label-width="100px">
        <el-tabs v-model="activeIndex" :before-leave="beforeTabLeave" :tab-position="'left'" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_name">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                  v-model="addForm.goods_cat"
                  :options="cateList"
                  :props="cateProps"
                  @change="handleChange">
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item v-for="item in manyTableData" :key="item.attr_id" :label="item.attr_name">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox v-for="(value,index) in item.attr_vals" :key="index" :label="value" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyTableData" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 表示图片上传到的后台API地址 -->
            <!-- on-preview 用于指定图片预览事件 -->
            <!-- on-remove 用于指定图片从上传列表删除事件 -->
            <!-- list-type 用于指定图片呈现的预览方式 -->
            <!-- on-success 用于指定图片上传成功执行的钩子 -->
            <el-upload
                :action="uploadURL"
                :headers="headerObj"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :on-success="handleSuccess"
                list-type="picture">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button class="btnAdd" type="primary" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览窗口 -->
    <el-dialog
        :visible.sync="previewVisible"
        title="图片预览"
        width="50%"
    >
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
import {cloneDeep} from "lodash"

export default {
  data() {
    return {
      activeIndex: "0",
      // 添加商品的表单数据对象
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 商品详情描述
        goods_introduce: "",
        attrs: []
      },
      addFormRules: {
        goods_name: [{required: true, message: "Please enter goods name", trigger: "blur"}],
        goods_price: [{required: true, message: "Please enter goods price", trigger: "blur"}],
        goods_weight: [{required: true, message: "Please enter goods weight", trigger: "blur"}],
        goods_number: [{required: true, message: "Please enter goods number", trigger: "blur"}],
        goods_cat: [{required: true, message: "Please select goods categories", trigger: "blur"}]
      },
      cateList: [],
      cateProps: {
        expandTrigger: 'hover',
        children: 'children',
        label: "cat_name",
        value: "cat_id"
      },
      manyTableData: {},
      onlyTableData: {},
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的header请求头对象
      headerObj: {Authorization: window.sessionStorage.getItem('token')},
      previewPath: "",
      previewVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const {data: result} = await this.$http.get("categories")
      if (result.meta.status !== 200) return this.$message.error("Failed to get categories list")
      this.cateList = result.data
    },
    // 级联选择器选中项发生变化响应函数
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.$message.warning("Please select the third level classification")
        this.addForm.goods_cat = []
      }
    },
    beforeTabLeave(activeName, oldActiveName) {
      if (this.addForm.goods_cat.length !== 3 && oldActiveName === '0') {
        this.$message.error("Please select goods categories")
        return false
      }
    },
    async tabClicked() {
      // 判断访问的是否动态参数面板
      if (this.activeIndex === '1') {
        const {data: result} = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {sel: 'many'}
        })
        if (result.meta.status !== 200) return this.$message.error("Failed to get attributes")
        result.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ")
        })
        this.manyTableData = result.data
      } else if (this.activeIndex === '2') {
        const {data: result} = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {sel: 'only'}
        })
        if (result.meta.status !== 200) return this.$message.error("Failed to get attributes")
        this.onlyTableData = result.data
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // 处理移除图片操作
    handleRemove(file) {
      // TODO 1.获取将要删除图片的临时路径
      const filePath = file.response.data.tmp_path
      // TODO 2.从 pics 数组中找到图片对应索引值
      const index = this.addForm.pics.findIndex(item => item.pic === filePath)
      // TODO 3.调用生素组的 splice 方法，把图片信息对象从 pics 数组中移除
      this.addForm.pics.splice(index, 1)
      console.log(this.addForm)
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      // TODO 1.拼接得到图片信息对象
      // TODO 2.将图片信息 push到pics数组中
      const picInfo = {pic: response.data.tmp_path}
      this.addForm.pics.push(picInfo)
    },
    add() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error("Please fill in the necessary form fields")
        // TODO 执行添加的业务逻辑
        const form = cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(",")
        // TODO 处理动态参数、静态属性
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" ")
          }
          this.addForm.attrs.push(newInfo)
        })
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        // 发起请求添加商品
        const {data: result} = await this.$http.post("goods",form)
        if (result.meta.status !== 201) return this.$message.error("Failed to submit goods")
        await this.$router.push("/goods")
      })
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }

}
</script>

<style scoped>
.el-checkbox {
  margin: 0 15px 0 0 !important;
}

.previewImg {
  width: 100%;
}

.btnAdd {
  margin-top: 15px;
}
</style>