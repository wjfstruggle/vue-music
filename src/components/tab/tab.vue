<template>
    <div class="">
      <ul class="tab">
        <li class="tab-item">
          <router-link class="tab-link" to="/recommend">推荐</router-link>
        </li>
        <li class="tab-item">
          <router-link class="tab-link" to="/singer">歌手</router-link>
        </li>
        <li class="tab-item">
          <router-link class="tab-link" to="/rank">排行</router-link>
        </li>
        <li class="tab-item">
          <router-link class="tab-link" to="/search">搜索</router-link>
        </li>
      </ul>
    </div>
</template>

<script type="text/ecmascript-6">

</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/mixin.styl"
  @import "~common/stylus/variable.styl"
  .tab
    display: flex
    height: 44px
    line-height: 44px
    .tab-item
      flex: 1
      text-align: center
      font-size: $font-size-medium
      font-weight: 400
      .tab-link
        padding-bottom: 5px
        color: $color-text-l
        &.router-link-active
          color: $color-theme
          border-bottom: 2px solid $color-theme
</style>
