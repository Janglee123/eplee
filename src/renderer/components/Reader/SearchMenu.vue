<template>
	<el-popover
		:popper-class="`popper ${theme}`"
		width="350"
		trigger="hover"
		@show="startSearch"
		@hide="stopSearch"
	>
		<el-button slot="reference" size="small" icon="el-icon-search" circle />
		<div class="el-popover__title">
			<el-input v-model="searchText" size="small" width="300" placeholder="search" />
		</div>
		<el-table :key="searchResult.length" :show-header="false" :data="searchResult" @cell-click="onNodeClick">
			<el-table-column prop="label" width="350"></el-table-column>
		</el-table>
	</el-popover>
</template>

<script>
export default {
	name: 'SearchMenu',
	
	props:{
		theme:{
			default:'default',
			type:String,
		},
		searchResult:{
			default:()=>{},
			type:Array,
		},
	},

	data(){
		return {
			searchText:''
		}
	},

	watch:{
		searchText() {
			if (this.searchText.length === 0) {
				return;
      }

      clearTimeout(this._searcTimer);
      this._searcTimer = setTimeout(() => {
				this.$emit('search',this.searchText);			
	    }, 1000);
		},

		searchResult(){
			this.startSearch();
		}
	},

	methods:{
		stopSearch() {
      this.$remote.getCurrentWebContents().stopFindInPage('clearSelection');
    },
    startSearch() {
      this.$remote.getCurrentWebContents().findInPage(this.searchText);
		},
		onNodeClick(data){
			this.$emit('node-click',data)
		}
	}
}
</script>

<style lang="scss" scoped>

</style>
