<template>
	<el-popover :popper-class="theme" trigger="hover">
		<el-button slot="reference" size="small" icon="el-icon-s-operation" circle />
		<table>
			<tr>
				<td> Flow </td>   
				<td>   
					<el-radio-group v-model="flow" size="small">
						<el-radio-button label="paginated" border>
							Paged
						</el-radio-button>
						<el-radio-button label="scrolled-doc" border>
							Scrolled
						</el-radio-button>
					</el-radio-group>
				</td>
			</tr>

			<tr>
				<td>   Theme		</td>   
				<td>   
					<el-radio-group v-model="theme" size="small">
						<el-radio-button label="default" border>
							Light
						</el-radio-button>
						<el-radio-button label="tan" border>
							Tan
						</el-radio-button>
						<el-radio-button label="dark" border>
							Dark
						</el-radio-button>
					</el-radio-group>
				</td>   
			</tr>

			<tr>
				<td> Line Spacing </td>   
				<td>   
					<el-input-number v-model="lineSpacing" :precision="2" :step="0.1" :min="1.3" :max="2.0" size="mini"></el-input-number>
				</td>   
			</tr>
			
			<tr>
				<td> Font Size </td>   
				<td>   
					<el-input-number v-model="fontSize" :step="2" :min="10" :max="300" size="mini"></el-input-number>
				</td>   
			</tr>
			
			<tr>
				<td>Font</td>   
				<td>   
					<el-select v-model="font" class="font-select" width="50" size="mini">
						<el-option label="Default" value=""></el-option>
						<el-option label="Arial" value="Arial"></el-option>
						<el-option label="Times New Roman" value="Times New Roman"></el-option>
					</el-select>
				</td>   
			</tr>
		</table>
	</el-popover>
</template>

<script>
export default {
	name: 'ThemeMenu',

	data() {
		return {
      lineSpacing: 1.5,
			theme: 'default',
      flow: 'paginated',
			font: '',
			fontSize: 100,
		};
	},

	watch:{
		lineSpacing(){
			this.updateStyle();
		},
		font(){
			this.updateStyle();
		},
		fontSize(){
			this.updateStyle();
		},
		theme(theme){
      this.$emit('theme-change', theme);			
		},
		flow(value){
			this.$emit('flow-change',value);
		}
	},

	mounted(){
		this.updateStyle();
	},

	methods:{
		updateStyle(){
			const rules = {
        'p':{
           "font-family": this.font !== "" ? `${this.font} !important` : "!invalid-hack",
           "font-size": this.fontSize !== "" ? `${this.fontSize} !important` : "!invalid-hack",
        },
        'body': {
            "font-family": this.font !== "" ? `${this.font} !important` : "!invalid-hack",
            // "text-align": `${theme.ta} !important`,
        },
        '*':{
          "line-height": `${this.lineSpacing} !important`,
          "font-size": this.fontSize !== "" ? `${this.fontSize}% !important` : "!invalid-hack",
        }
			};
			
			this.$emit('style-change', rules)
		}
	}
}
</script>

<style lang="scss" scoped>
tr td:last-child {
	text-align: end;
}
</style>

<style>
.font-select .el-input--suffix .el-input__inner{
	padding-right: 0px;
}
</style>
