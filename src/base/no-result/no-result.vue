<template>
    <div class="no-result">
      <div class="no-result-icon"></div>
      <div class="no-result-title">{{title}}</div>
    </div>
</template>

<script type="text/ecmascript-6">
  export default {
    props: {
      title: {
        type: String,
        default: ''
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/mixin.styl"
  @import "~common/stylus/variable.styl"
  .no-result
    text-align: center
    .no-result-icon
      bg-image('no-result')
      width: 86px
      height: 90px
      margin: 0 auto
      -webkit-background-size: 86px 90px
      background-size: 86px 90px
    .no-result-title
      margin-top: 30px
      font-size: $font-size-medium
      color: $color-text-d
</style>
