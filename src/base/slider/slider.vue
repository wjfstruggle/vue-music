<!--轮播图组件-->
<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot>
      </slot>
    </div>
    <div class="dots">
      <span class="dot" v-for="(item, index) in dots" :key="index" :class="{active: currentPageIndex === index}"></span>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import BScroll from 'better-scroll'
  import {addClass} from 'common/js/dom'

  export default {
    data() {
      return {
        dots: [],
        currentPageIndex: 0
      }
    },
    props: {
      loop: { // 无缝滚动
        type: Boolean,
        default: true
      },
      autoPlay: { // 自动轮播
        type: Boolean,
        default: true
      },
      interval: { // 时间
        type: Number,
        default: 4000
      }
    },
    mounted() {
      setTimeout(() => {
        this._setSliderWidth()
        this._initSlider()
        this._initDots()
        if (this.autoPlay) {
          this._pay() // 自动轮播
        }
      }, 20)
      // 视窗变化，轮播图组件自适应宽度
      window.addEventListener('resize', () => {
        if (!this.slider) {
          return
        }
        this._setSliderWidth(true)
        this.slider.refresh()
      })
    },
    methods: {
      // 图片宽度
      _setSliderWidth(isResize) {
        // 拿到图片的数量
        this.children = this.$refs.sliderGroup.children
        // console.log(this.children)
        let width = 0 // 图片宽度
        let sliderWidth = this.$refs.slider.clientWidth // 容器视口宽度
        for (let i = 0; i < this.children.length; i++) {
          let child = this.children[i]
          addClass(child, 'slider-item') // 动态提添加class属性
          child.style.width = sliderWidth + 'px'
          width += sliderWidth
        }
        if (this.loop && !isResize) {
          width += 2 * sliderWidth
        }
        this.$refs.sliderGroup.style.width = width + 'px'
      },
      _initDots() {
        this.dots = new Array(this.children.length - 2) // 长度=>遍历dots的数量,better-scroll初始化会自动添加两个
      },
      // 自动轮播
      _pay() {
        let pageIndex = this.currentPageIndex + 1
        if (this.loop) {
          pageIndex += 1
        }
        this.timer = setTimeout(() => {
          this.slider.goToPage(pageIndex, 0, 400)
        }, this.interval)
      },
      _initSlider() {
        this.slider = new BScroll(this.$refs.slider, {
          scrollX: true,
          scrollY: false,
          momentum: false,
          snap: true,
          snapLoop: this.loop,
          snapThreshold: 0.3,
          snapSpeed: 400
        })
        // 图片滚动与点的映射
        this.slider.on('scrollEnd', () => { // 派发事件,滚动结束的位置坐标
          let pageIndex = this.slider.getCurrentPage().pageX
          if (this.loop) {
            pageIndex -= 1
          }
          this.currentPageIndex = pageIndex
          // 自动轮播下一张
          if (this.autoPlay) {
            clearTimeout(this.timer)
            this._pay()
          }
        })
      }
    },
    // 用生命周期来消除有定时器的函数
    destroyed() {
      clearTimeout(this.timer)
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/mixin.styl"
  @import "~common/stylus/variable.styl"
  .slider
    min-height: 1px
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        -webkit-box-sizing: border-box
        -moz-box-sizing: border-box
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        width: 8px
        height: 8px
        margin: 0 4px
        display: inline-block
        -webkit-border-radius: 50%
        -moz-border-radius: 50%
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          -webkit-border-radius: 5px
          -moz-border-radius: 5px
          border-radius: 5px
          background: $color-text-ll
</style>
