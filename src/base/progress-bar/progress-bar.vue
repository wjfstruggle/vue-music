<!--播放歌曲的进度条组件-->
<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper" ref="progressBtnWrapper"
           @touchstart.prevent="onProgressTouchStart"
           @touchmove.prevent="onProgressTouchMove"
           @touchend="onProgressTouchEnd">
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import {prefixStyle} from 'common/js/dom'

  const transform = prefixStyle('transform')
  const progressBtnWidth = 16 // 小球的宽度
  export default {
    props: {
      percent: { // 显示进度条进度
        type: Number,
        default: 0
      }
    },
    created() {
      this.touch = {} // 空对象来存位置索引
    },
    methods: {
      // 当手指接触屏幕时触发
      onProgressTouchStart(e) {
        this.touch.initiated = true // 初始化标志位
        this.touch.startX = e.touches[0].pageX // 每个触摸事件对象中都包括了touches这个属性，用于描述前位于屏幕上的所有手指的一个列表,记录鼠标的初始位置。
        this.touch.left = this.$refs.progress.clientWidth // 进度条左边距离
      },
      // 当已经接触屏幕的手指开始移动后触发
      onProgressTouchMove(e) {
        if (!this.touch.initiated) { // 如果没有初始化标志位
          return
        }
        const deltaX = e.touches[0].pageX - this.touch.startX // 手势横滑的距离
        const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + deltaX))
        this._offset(offsetWidth)
      },
      // 当手指离开屏幕时触发
      onProgressTouchEnd() {
        this.touch.initiated = false
        this._triggerPercent()
      },
      _offset(offsetWidth) {
        this.$refs.progress.style.width = `${offsetWidth}px`
        this.$refs.progressBtnWrapper.style[transform] = `translate3d(${offsetWidth}px, 0, 0)` // 小球前进
      },
      // 规定被选元素要触发的事件。
      _triggerPercent() {
        const progressBarWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
        const percent = this.$refs.progress.clientWidth / progressBarWidth
        this.$emit('percentChange', percent) // 触发player组件percentChange点击事件
      },
      // 点击小球，到指定时间
      progressClick(e) {
        const rect = this.$refs.progressBar.getBoundingClientRect()
        const offsetWidth = e.pageX - rect.left
        this._offset(offsetWidth) // 记录小球进度的偏移量
        this._triggerPercent()
      }
    },
    watch: {
      percent(newPercent) {
        if (newPercent >= 0 && !this.touch.initiated) {
          const progressBarWidth = this.$refs.progressBar.clientWidth - progressBtnWidth // 进度 - 小球宽度
          const offsetWidth = newPercent * progressBarWidth
          this.$refs.progress.style.width = `${offsetWidth}px`
          this.$refs.progressBtnWrapper.style[transform] = `translate3d(${offsetWidth}px, 0, 0)` // 小球前进
        }
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 3px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>
