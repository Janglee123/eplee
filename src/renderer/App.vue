<template>
  <div id="app">
    <div class="content-custom">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Eplee',
  data(){
    return{
    }
  }
};
</script>

<style>
::-webkit-scrollbar {
  display: none;
}

#app{
  background: #fff;
  border-radius: 10px;
}

</style>
