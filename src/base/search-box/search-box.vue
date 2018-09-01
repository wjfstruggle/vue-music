<template>
    <div class="search-box">
      <i class="icon-search"></i>
        <input ref="input" class="box" :placeholder="placeholder" v-model="query">
      <i v-show="query" @click="clear" class="icon-dismiss"></i>
    </div>
</template>

<script type="text/ecmascript-6">
  import {debounce} from 'common/js/util'
  export default {
    props: {
      placeholder: {
        type: String,
        default: '搜索歌曲、歌手'
      }
    },
    data() {
      return {
        query: ''
      }
    },
    methods: {
      clear() {
        this.query = ''
      },
      // 在search上添加歌曲到搜索框
      setQuery(query) {
        this.query = query
      },
      blur() {
        this.$refs.input.blur()
      }
    },
    created() {
      this.$watch('query', debounce((newQuery) => {
        this.$emit('query', newQuery) // 派发query事件
      }, 200))
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/mixin.styl"
  @import "~common/stylus/variable.styl"
  .search-box
    display: flex
    -webkit-box-sizing: border-box
    -moz-box-sizing: border-box
    box-sizing: border-box
    align-items: center
    padding: 0 6px
    width: 100%
    height: 40px
    background: $color-highlight-background
    border-radius: 6px
    .icon-search
      flex: 0 0 24px
      width: 24px
      font-size: 24px
      color: $color-background
    .box
      flex: 1
      margin: 0 5px
      line-height: 18px
      background: $color-highlight-background
      color: $color-text-d
      font-size: 16px
      outline: 0 // 轮廓，无样式
      &::placeholder
        color: $color-text-d
    .icon-dismiss
      color: $color-background
      font-size: 16px
</style>
