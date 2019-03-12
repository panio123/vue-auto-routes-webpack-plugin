<template>
  <div class="list-page">
    <h1>列表页面</h1>
    <button @click="$router.push({name:'Order',params:{id:1234323}})">订单</button>
    <button @click="$router.push({name:'Redirect'})">重定向页面</button>
  </div>
</template>

<script>
export default {
  $$route: {
    name: "listPage",
    lazy: true,
    meta: {}
  }
};
</script>

<style>
</style>
