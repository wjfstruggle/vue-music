<template>
  <div class="progress-circle">
    <!--viewBox="x, y, width, height" x:左上角横坐标，y:左上角纵坐标，width:宽度，height:高度-->
    <svg :width="radius" :height="radius" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <circle class="progress-background" r="50" cx="50" cy="50" fill="transparent"/>
      <circle class="progress-bar" r="50" cx="50" cy="50" fill="transparent" :stroke-dasharray="dashArray"
              :stroke-dashoffset="dashOffset"/>
    </svg>
    <slot>
    </slot>
  </div>
</template>

<script type="text/ecmascript-6">
  export default {
    data() {
      return {
        dashArray: Math.PI * 100 // 2 * pi * r得到周长
      }
    },
    props: {
      radius: {
        type: Number,
        default: 100
      },
      percent: {
        type: Number,
        default: 0
      }
    },
    computed: {
      dashOffset() {
        return (1 - this.percent) * this.dashArray
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"
  .progress-circle
    position: relative
    circle
      stroke-width: 8px // stroke- width属性定义了一条线，文本或元素轮廓厚度：
      transform-origin: center
      &.progress-background
        transform: scale(0.9)
        stroke: $color-theme-d
      &.progress-bar
        transform: scale(0.9) rotate(-90deg)
        stroke: $color-theme
</style>
