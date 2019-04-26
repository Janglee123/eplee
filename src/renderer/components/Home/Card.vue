<template>
    <sui-card class="raised link" style="width:170px ; height:250px">
      <sui-image src="src/renderer/assets/default-cover.jpg" style="width:auto ; height:200px"/>
      <sui-card-content>
        <center><sui-card-contant>{{ title }}</sui-card-contant></center>
      </sui-card-content>
    </sui-card>
</template>

<script>
export default {
  name: 'Card',
  props: {
    title: {
      default: 'Title',
      type: String,
    },
    imgSrc: {
      default: 'src/renderer/assets/default-cover.jpg',
      type: String,
    },
  },
};
</script>

<style>

</style>
