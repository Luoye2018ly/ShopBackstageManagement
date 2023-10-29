<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input v-model="queryInfo.query" placeholder="请输入内容">
            <template #append>
              <el-button icon="el-icon-search"></el-button>
            </template>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单数据列表 -->
      <el-table :data="orderList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price" width="80px"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status" width="80px">
          <template v-slot="{row:{pay_status: status}}">
            <el-tag v-if="status === '0'" type="danger">未付款</el-tag>
            <el-tag v-else type="primary">已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" width="80px"></el-table-column>
        <el-table-column label="下单时间" prop="create_time" width="200px">
          <template v-slot="{row:{create_time: time}}">
            {{ time| dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150px">
          <template v-slot="{row}">
            <el-button icon="el-icon-edit" size="mini" type="primary" @click="showBox"></el-button>
            <el-button icon="el-icon-location" size="mini" type="success" @click="showProgressBox"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
          :current-page="queryInfo.pagenum"
          :page-size="queryInfo.pagesize"
          :page-sizes="[5, 10, 20, 40]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      >
      </el-pagination>
    </el-card>
    <!-- 修改地址对话框 -->
    <el-dialog
        :visible.sync="addressDialogVisible"
        title="修改地址"
        width="50%"
        @close="addressDialogClosed"
    >
      <el-form
          ref="addressFormRef"
          :model="addressForm"
          :rules="addressFormRules"
          class="demo-ruleForm"
          label-width="100px"
      >
        <el-form-item label="省 市 区/县" prop="address1">
          <el-cascader
              v-model="addressForm.address1"
              :options="cityData"
              :props="{ expandTrigger: 'hover' }"
          >
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 展示物流进度对话框 -->
    <el-dialog
        :visible.sync="progressDialogVisible"
        title="物流进度"
        width="50%"
    >
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item
            v-for="(activity, index) in progressInfo"
            :key="index"
            :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from "@/components/order/citydata";

export default {
  data() {
    return {
      orderList: [],
      total: 0,
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      addressDialogVisible: false,
      addressForm: {
        address1: [],
        address2: ""
      },
      addressFormRules: {
        address1: [{required: true, message: "Please select", trigger: "blur"}],
        address2: [{required: true, message: "Please enter", trigger: "blur"}]
      },
      cityData,
      progressDialogVisible: false,
      // 接口有问题，写假数据
      progressInfo: [
        {
          time: "2018-05-10 09:39:00",
          ftime: "2018-05-10 09:39:00",
          context: "已签收,感谢使用顺丰,期待再次为您服务",
          location: ""
        },
        {
          time: "2018-05-10 08:23:00",
          ftime: "2018-05-10 08:23:00",
          context: "[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件",
          location: ""
        },
        {
          time: "2018-05-10 07:32:00",
          ftime: "2018-05-10 07:32:00",
          context: "快件到达 [北京海淀育新小区营业点]",
          location: ""
        },
        {
          time: "2018-05-10 02:03:00",
          ftime: "2018-05-10 02:03:00",
          context: "快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]",
          location: ""
        },
        {
          time: "2018-05-09 23:05:00",
          ftime: "2018-05-09 23:05:00",
          context: "快件到达 [北京顺义集散中心]",
          location: ""
        },
        {
          time: "2018-05-09 21:21:00",
          ftime: "2018-05-09 21:21:00",
          context: "快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]",
          location: ""
        },
        {
          time: "2018-05-09 13:07:00",
          ftime: "2018-05-09 13:07:00",
          context: "顺丰速运 已收取快件",
          location: ""
        },
        {
          time: "2018-05-09 12:25:03",
          ftime: "2018-05-09 12:25:03",
          context: "卖家发货",
          location: ""
        },
        {
          time: "2018-05-09 12:22:24",
          ftime: "2018-05-09 12:22:24",
          context: "您的订单将由HLA（北京海淀区清河中街店）门店安排发货。",
          location: ""
        },
        {
          time: "2018-05-08 21:36:04",
          ftime: "2018-05-08 21:36:04",
          context: "商品已经下单",
          location: ""
        }]
    }
  },
  created() {
    this.getOrdersList()
  },
  methods: {
    async getOrdersList() {
      const {data: result} = await this.$http.get("orders", {
        params: this.queryInfo
      })
      if (result.meta.status !== 200) {
        return this.$message.error("Failed to get order list")
      }
      this.total = result.data.total
      this.orderList = result.data.goods
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrdersList()
    },
    handleCurrentChange(newPageNum) {
      this.queryInfo.pagenum = newPageNum
      this.getOrdersList()
    },
    showBox() {
      this.addressDialogVisible = true
    },
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields()
    },
    async showProgressBox() {
      this.progressDialogVisible = true
    }
  }
}
</script>

<style scoped>
.el-cascader {
  width: 100%;
}
</style>