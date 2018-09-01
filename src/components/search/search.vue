<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box ref="searchBox" @query="onQueryChange">
      </search-box>
    </div>
    <!--热门搜索-->
    <div class="shortCart-wrapper" ref="shortCartWrapper" v-show="!query">
      <scroll class="shortCart" ref="shortCut" :data="shortCut">
        <div>
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <li @click="addQuery(item.k)" v-for="item in hotKey" :key="item.id" class="item">
                <span>{{item.k}}</span>
              </li>
            </ul>
          </div>
          <div class="search-history" v-show="!searchHistory.length">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span class="clear" @click="showConfirm">
              <i class="icon-clear"></i>
            </span>
            </h1>
            <search-list @select="addQuery" @delete="deleteOne" :searches="searchHistory">
            </search-list>
          </div>
        </div>
      </scroll>
    </div>
    <div class="result-query" ref="resultQuery" v-show="query" @listScroll="blurInput">
      <suggest ref="suggest" :query="query" @select="saveSearch()">
      </suggest>
    </div>
    <confirm ref="confirm" text="是否清空所有搜索历史" confirmBtnText="清空" @confirm="clearAll">
    </confirm>
    <router-view>
    </router-view>
  </div>
</template>

<script type="text/ecmascript-6">
  import SearchBox from 'base/search-box/search-box'
  import Suggest from 'components/suggest/suggest'
  import Confirm from 'base/confirm/confirm'
  import SearchList from 'base/search-list/search-list'
  import Scroll from 'base/scroll/scroll'
  import {getHotSearch} from 'api/search'
  import {ERR_OK} from 'api/config'
  import {mapActions, mapGetters} from 'vuex'
  import {playlistMixin} from 'common/js/mixin'

  export default {
    mixins: [playlistMixin],
    data() {
      return {
        hotKey: [],
        query: ''
      }
    },
    created() {
      this._getHotSearch()
    },
    computed: {
      shortCut() {
        return this.hotKey.concat(this.searchHistory)
      },
      ...mapGetters([
        'searchHistory'
      ])
    },
    methods: {
      // 获取热门搜索数据
      _getHotSearch() {
        getHotSearch().then(res => {
          if (res.code === ERR_OK) {
            this.hotKey = res.data.hotkey.slice(0, 10) // 获取前10个数据
          }
        })
      },
      // 在search上添加歌曲到搜索框
      addQuery(query) {
        this.$refs.searchBox.setQuery(query)
      },
      onQueryChange(query) {
        this.query = query
      },
      blurInput() {
        this.$refs.searchBox.blur()
      },
      // 保存历史数据
      saveSearch() {
        this.saveSearchHistory(this.query)
      },
      // 单个删除历史数据
      deleteOne(item) {
        this.deleteSearchHistory(item)
      },
      // 清空搜索历史
      clearAll() {
        this.clearSearchHistory()
      },
      // 引用confirm组件派发而来的事件
      showConfirm() {
        this.$refs.confirm.show()
      },
      // min模式下的滚动到底部出现的bug
      handlePlaylist(playlist) {
        const Bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.shortCartWrapper.style.bottom = Bottom
        this.$refs.shortCut.refresh()
        this.$refs.resultQuery.style.bottom = Bottom
        this.$refs.suggest.refresh()
      },
      ...mapActions([
        'saveSearchHistory',
        'deleteSearchHistory',
        'clearSearchHistory'
      ])
    },
    watch: {
      // 监听搜索历史的变化，实现实时滚动列表
      query(newQuery) {
        if (!newQuery) {
          setTimeout(() => {
            this.$refs.shortCut.refresh()
          }, 20)
        }
      }
    },
    components: {
      SearchBox,
      Suggest,
      SearchList,
      Confirm,
      Scroll
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/mixin.styl"
  @import "~common/stylus/variable.styl"
  .search
    .search-box-wrapper
      margin: 20px
    .shortCart-wrapper
      position: fixed
      top: 170px
      bottom: 0
      width: 100%
      .shortCart
        height: 100%
        overflow: hidden
        .hot-key
          margin: 0 20px 20px 20px
          .title
            margin-bottom: 20px
            font-size: $font-size-medium-x
            color: $color-text-l
          .item
            display: inline-block
            padding: 5px 10px
            margin: 0 20px 10px 0
            border-radius: 6px
            word-break: keep-all
            background: $color-highlight-background
            font-size: $font-size-medium
            color: $color-text-d
        .search-history
          position: relative
          margin: 0 20px
          .title
            display: flex
            align-items: center
            height: 40px
            font-size: $font-size-medium
            color: $color-text-l
            .text
              flex: 1
            .clear
              extend-click()
              .icon-clear
                font-size: $font-size-medium
                color: $color-text-d
    .search-result
      position: fixed
      width: 100%
      top: 178px
      bottom: 0
</style>
