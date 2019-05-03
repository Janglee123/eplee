<template>
	<router-link :to="{ name: 'Reader', params: { id } }">
		<el-card
			shadow="hover"
			class="box-card"
			:body-style="{ padding: '0px' }"
		>
			<el-image
				:src="imgSrc"
				:fit="'fill'"
			/>
			<div class="title">
				{{ title }}
			</div>
		</el-card>
	</router-link>
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
    id:{
      default:'',
      type:String,
    }
  },
};
</script>

<style scoped>

.box-card {
  width: 170px;
  height: 250px;
  background: #fff;
  user-select: none;
}

.el-image {
  width: 100%;
  height: 200px;
}

.title {
  width: 100%;
  height: 50px;
  font-size: 14px;
  display: inline-grid;
  align-content: center;
  text-align: center;
}
</style>
