<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <div ref="echartsBox" style="width: 800px;height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
let echarts = require('echarts');
import {merge} from 'lodash'
export default {
  data() {
    return {
      myChart: "",
      // 需要合并的数据
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      },
      chartData:{}
    }
  },
  created() {
  },
  async mounted() {
    this.myChart = echarts.init(this.$refs.echartsBox)
    const {data: result} = await this.$http.get('reports/type/1')
    if (result.meta.status !== 200) return this.$message.error("Failed to get data")
    this.chartData = merge(result.data,this.options)
    this.myChart.setOption(this.chartData)
  },
  methods: {}
}
</script>

<style scoped>

</style>