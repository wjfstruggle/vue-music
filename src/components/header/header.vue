<template>
  <div class="header">
    <div class="header-image">
      <img src="" alt="" width="110" height="32">
    </div>
    <h1 class="music">Music</h1>
    <router-link to="/user" tag="div">
      <div class="icon">
        <i class="icon-mine"></i>
      </div>
    </router-link>
  </div>
</template>

<script type="text/ecmascript-6">
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/mixin.styl"
  @import "~common/stylus/variable.styl"
  .header
    position: relative
    text-align: center
    height: 44px
    line-height: 44px
    color: $color-theme
    font-size: 0
    background: #31c27c
    .header-image
      position: absolute
      left: 10px
      display: inline-block
      vertical-align: top
      margin: 6px 9px 0 0
      bg-image('logo')
      width: 110px
      height: 32px
      -webkit-background-size: 110px 32px
      background-size: 110px 32px
      background-repeat: no-repeat
    .music
      display: inline-block
      vertical-align: top
      font-size: $font-size-large
      line-height: 44px
      color: #fff
    .icon
      position: absolute
      right: 0
      top: 0
      .icon-mine
        display: block
        padding: 12px
        font-size: 20px
        color: $color-theme
</style>
