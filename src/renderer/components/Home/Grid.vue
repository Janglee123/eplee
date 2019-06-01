<template>
	<div>
		<div v-for="book in bookList" :key="book.id">
			<router-link :to="{ name: 'Reader', params: { id:book.id } }">
				<el-card ref="card" shadow="hover" class="box-card" :body-style="{ padding: '0px' }">
					<el-image :src="book.coverPath" :fit="'fill'" />
					<div class="title" :style="{ background: book.bgColorFromCover }">
						{{ trunc(book.title,30) }}
					</div>
				</el-card>
			</router-link>
		</div>
	</div>
</template>

<script>
/**
 *  based on https://github.com/imlinus/vue-magic-grid
 */

export default {
  name: 'Grid',

  props: {
    wrapper: {
      type: String, // Required. Class or id of the container.
      default: 'wrapper',
    },
    gap: {
      type: Number, // Optional. Space between items. Default: 32px
      default: 32,
    },
    maxCols: {
      type: Number, // Maximum number of colums. Default: Infinite
      default: Infinity,
    },
    maxColWidth: {
      type: Number,
      default: 280,
    },
    animate: {
      type: Boolean, // Animate item positioning. Default: false.
      default: true,
    },
    useMin: {
      type: Boolean, // Place items in lower column
      default: false,
    },
    bookList: {
      type: Array,
      default: () => {},
    },
  },

  data() {
    return {
      started: false,
      items: [],
    };
  },

  updated(){
      this.items = this.$el.children;
      this.init();
      this.positionItems();
  },

  mounted() {
    this.items = this.$el.children;
    this.init();
    this.positionItems();

    window.addEventListener('resize', () => {
      setTimeout(this.positionItems(), 200);
    });
  },

  methods: {
    trunc(str, n) {
      return str.length > n ? `${str.substr(0, n - 3)}...` : str;
    },

    init() {
      if(this.items.length===0) return;
      this.$el.style.position = 'relative';

      Array.prototype.forEach.call(this.items, (item) => {
        item.style.position = 'absolute';
        item.style.maxWidth = `${this.maxColWidth}px`;
        if (this.animate) item.style.transition = 'top 0.2s ease, left 0.2s ease, right 0.2s ease, buttom 0.2s ease';
      });
    },

    colWidth() {
      let width = this.items[0].getBoundingClientRect().width + this.gap;
      return width;
    },

    setup() {
      const { width } = this.$el.getBoundingClientRect();
      let numCols = Math.floor(width / this.colWidth()) || 1;
      const cols = [];

      if (this.maxCols && numCols > this.maxCols) {
        numCols = this.maxCols;
      }

      for (let i = 0; i < numCols; i += 1) {
        cols[i] = {
          height: 0,
          top: 0,
          index: i,
        };
      }

      const wSpace = width - numCols * this.colWidth() + this.gap;

      return {
        cols,
        wSpace,
      };
    },

    nextCol(cols, i) {
      if (this.useMin) return this.getMin(cols);

      return cols[i % cols.length];
    },

    positionItems() {

      if(this.items.length===0) return;

      let { cols, wSpace } = this.setup();

      wSpace = Math.floor(wSpace / 2);

      Array.prototype.forEach.call(this.items, (item, i) => {
        const min = this.nextCol(cols, i);

        const left = min.index * this.colWidth() + wSpace;

        item.style.left = `${left}px`;
        item.style.top = `${min.height + min.top}px`;

        min.height += min.top + item.getBoundingClientRect().height;
        min.top = this.gap;
      });

      this.$el.style.height = `${this.getMax(cols).height}px`;
    },

    getMax(cols) {
      let max = cols[0];

      cols.forEach(col => {
        if (col.height > max.height) max = col;
      });

      return max;
    },

    getMin(cols) {
      let min = cols[0];

      cols.forEach(col => {
        if (col.height < min.height) min = col;
      });

      return min;
    },
  },
};
</script>

<style scopped>
.box-card {
  width: 170px;
  height: 250px;
  /* background: #fff; */
  user-select: none;
}

.el-image {
  height: 200px;
  width: 100%;
}

.title {
  width: 100%;
  height: 50px;
  font-size: 14px;
  display: inline-grid;
  align-content: center;
  text-align: center;
  color: #ffffff;
}
</style>
