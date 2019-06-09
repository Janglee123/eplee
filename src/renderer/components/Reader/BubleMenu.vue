<template>
	<el-popover v-model="isVisible" popper-class="buble" trigger="manual">
		<el-button-group>
			<el-button size="medium" icon="el-icon-brush" @click="onHLBtn"></el-button>
			<el-button size="medium" icon="el-icon-copy-document" @click="copyText"></el-button>
			<el-button
				v-popover:translatePop
				size="medium"
				icon="el-icon-collection"
			></el-button>
		</el-button-group>

		<el-popover ref="translatePop" width="200" trigger="hover">
			<div class="el-popover__title">
				<el-input v-model="translateTo" placeholder="Language Code" width="30" size="mini">
					<template slot="prepend">
						Translate to
					</template>
				</el-input>
			</div>
			{{ translatedText }}
		</el-popover>

		<span
			slot="reference"
			ref="popRef"
			style="position:absolute;visibility: hidden;"
		></span>
	</el-popover>
</template>

<script>
import translate from '@vitalets/google-translate-api';

export default {
  name: 'BubleMenu',

  props: {},

	data() {
		return {
			isVisible: false,
			translateTo: 'gu',
			translatedText: '',
			text: '',
		}
	},

  methods: {
    setProps(react, text, cfiRange) {
			
			let referenc = this.$refs.popRef;
			referenc.style.left = react.left;
			referenc.style.top = react.top;
			referenc.style.width = react.width;
			referenc.style.height = react.height;

			this.text = text;
			this.cfiRange = cfiRange;
			this.translateText();
			this.isVisible = true;
		},

		hide(){
			this.isVisible = false;
			this.text = '';
			this.translatedText = 'No Data';
			this.cfiRange = '';
		},

		show(){
			this.isVisible = true;
		},

		onHLBtn(){
			if(this.cfiRange !== '')
				this.$emit('highlight-btn-click',this.cfiRange);
		},

		copyText() {
      const el = document.createElement('textarea');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      el.value = this.text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
		},
		
		translateText() {
      translate(this.text, { to: this.translateTo }).then(res => {
        this.translatedText = res.text;
      });
    },

  },
};
</script>


<style lang="scss" scoped>
</style>

<style>
.buble {
  padding: 0px;
}
</style>
