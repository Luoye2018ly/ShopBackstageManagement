<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <!-- 登录表单区域 -->
      <el-form label-width="0px" class="login_form" :model="loginForm" :rules="loginFormRules" ref="loginFormRef">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input prefix-icon="iconfont icon-user" v-model="loginForm.username" @keyup.enter.native="login"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input prefix-icon="iconfont icon-3702mima" v-model="loginForm.password" type="password" @keyup.enter.native="login"></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // element-ui表单验证规则对象
      loginFormRules: {
        username: [
          {required: true, message: "Please enter username", trigger: "blur"},
          {min: 3, max: 10, message: "Please limit the length from 3 to 10 characters ", trigger: "blur"}
        ],
        password: [
          {required: true, message: "Please enter username", trigger: "blur"},
          {min: 6, max: 15, message: "Please limit the length from 6 to 15 characters", trigger: "blur"}
        ]
      }
    }
  },
  methods: {
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields()
    },
    login() {
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) return
        const {data: result} = await this.$http.post("login", this.loginForm)
        if (result.meta.status !== 200) return this.$message.error("Bad Request: Login Failed")
        this.$message.success("Welcome")
        // 将登录成功后的token添加至sessionStorage中
        window.sessionStorage.setItem("token", result.data.token)
        await this.$router.push('/home')
      })
    }
  }
}
</script>

<style scoped>
.login_container {
  background: url("https://s2.loli.net/2023/12/02/jX4rxBWpaDJVKcF.jpg") no-repeat center center fixed;
  background-size: cover;
  height: 100%;
}

.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.avatar_box {
  height: 130px;
  width: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
}

.avatar_box img {
  height: 100%;
  width: 100%;
  border-radius: 50%;
  background-color: #eee;

}

.btns {
  display: flex;
  justify-content: flex-end;
}

.login_form {
  position: absolute;
  width: 100%;
  bottom: 0;
  padding: 0 20px;
  box-sizing: border-box;
}
</style>
