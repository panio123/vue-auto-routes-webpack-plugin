<template>
  <div class="list-page">
    <h1>订单页面</h1>
    <button @click="$router.push({name:'listPage'})">列表</button>
  </div>
</template>

<script>
export default {
  $$route: {
    lazy: true,
    path: "order/:id"
  }
};
</script>

<style>
</style>
