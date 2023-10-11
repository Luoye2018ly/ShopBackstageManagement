<template>
    <div id="app">
        <el-button type="info" @click="logout">退出</el-button>
    </div>
</template>

<script>
export default {
    methods: {
        logout() {
            window.sessionStorage.removeItem("token")
            this.$router.push('/login')
            console.log();
        }
        
    }
}
</script>

<style scoped>
    
</style>