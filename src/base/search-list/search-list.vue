<template>
    <div class="search-list" v-show="searches.length">
      <ul>
        <li @click="selectItem(item)" class="search-item" v-for="item in searches" :key="item.id">
          <span class="text">{{item}}</span>
          <span class="icon" @click.stop="deleteOne(item)">
            <i class="icon-delete"></i>
          </span>
        </li>
      </ul>
    </div>
</template>

<script type="text/ecmascript-6">
  export default {
    props: {
      searches: {
        type: Array
      }
    },
    methods: {
      // 点击搜索历史的数据到input框
      selectItem(item) {
        this.$emit('select', item) // 派发点击事件，传给search组件完成逻辑的功能
      },
      // 删除指定的历史数据
      deleteOne(item) {
        this.$emit('delete', item) // 派发点击事件，传给search组件完成逻辑的功能
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/mixin.styl"
  @import "~common/stylus/variable.styl"
  .search-list
    .search-item
      display: flex
      align-items: center
      height: 40px
      overflow: hidden
      .text
        flex: 1
        color: $color-text-l
      .icon
        extend-click()
        .icon-delete
          font-size: $font-size-small
          color: $color-text-d
</style>
