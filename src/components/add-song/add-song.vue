<template>
  <transition name="fade">
    <div class="add-song" v-show="showFlag" @click.stop>
      <div class="header">
        <h1 class="text">添加歌曲到列表</h1>
        <div class="iconClose" @click="hide">
          <i class="icon-close"></i>
        </div>
      </div>
      <div class="search-box-wrapper">
        <search-box ref="searchBox" placeholder="搜索歌曲" @query="onQueryChange">
        </search-box>
      </div>
      <div class="shortcut" v-show="!query">
        <switches :currentIndex="currentIndex" :switches="switches" @switch="switchItem">
        </switches>
        <div class="list-wrapper">
          <scroll ref="songList" class="list-scroll" v-if="currentIndex === 0" :data="playHistory">
            <div class="play-inner">
              <song-list :songs="playHistory" @select="selectSong">
              </song-list>
            </div>
          </scroll>
          <scroll ref="searchList" class="list-scroll" v-if="currentIndex === 1" :data="searchHistory">
            <div class="play-inner">
              <search-list :searches="searchHistory" @select="addQuery" @delete="deleteSearchHistory">
              </search-list>
            </div>
          </scroll>
        </div>
      </div>
      <div class="search-result" v-show="query">
        <suggest :query="query" :showSinger="showSinger" @select="selectSuggest" :listScroll="blurInput">
        </suggest>
      </div>
      <top-tip ref="topTip">
        <div class="tip-title">
          <i class="icon-ok"></i>
          <span class="text">1首歌曲已经添加到播放列表</span>
        </div>
      </top-tip>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
  import searchBox from 'base/search-box/search-box'
  import Suggest from 'components/suggest/suggest'
  import {mapActions, mapGetters} from 'vuex'
  import Switches from 'base/switch/switch'
  import Scroll from 'base/scroll/scroll'
  import SongList from 'base/song-list/song-list'
  import Song from 'common/js/song'
  import SearchList from 'base/search-list/search-list'
  import TopTip from 'base/top-tip/top-tip'

  export default {
    data() {
      return {
        showFlag: false,
        showSinger: false,
        query: '',
        currentIndex: 0,
        switches: [
          {
            name: '最近播放'
          },
          {
            name: '搜索历史'
          }
        ]
      }
    },
    computed: {
      ...mapGetters([
        'playHistory',
        'searchHistory'
      ])
    },
    methods: {
      show() {
        this.showFlag = true
        setTimeout(() => {
          if (this.currentIndex === 0) {
            this.$refs.songList.refresh()
          } else {
            this.$refs.searchList.refresh()
          }
        }, 20)
      },
      hide() {
        this.showFlag = false
      },
      search(query) {
        this.query = query
      },
      blurInput() {
        this.$refs.searchBox.blur()
      },
      onQueryChange(query) {
        this.query = query
      },
      // 在search上添加歌曲到搜索框
      addQuery(query) {
        this.$refs.searchBox.setQuery(query)
      },
      selectSuggest() {
        this.saveSearchHistory(this.query)
        this.$refs.topTip.show()
      },
      switchItem(index) {
        this.currentIndex = index
      },
      selectSong(song, index) {
        if (index !== 0) {
          this.insertSong(new Song(song))
          this.$refs.topTip.show()
        }
      },
      ...mapActions([
        'saveSearchHistory',
        'deleteSearchHistory',
        'clearSearchHistory',
        'insertSong'
      ])
    },
    watch: {},
    components: {
      searchBox,
      Suggest,
      Switches,
      Scroll,
      SongList,
      SearchList,
      TopTip
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/mixin.styl"
  @import "~common/stylus/variable.styl"
  .add-song
    position: fixed
    bottom: 0
    left: 0
    top: 0
    right: 0
    width: 100%
    z-index: 200
    background: $color-background
    .header
      height: 44px
      position: relative
      text-align: center
      .text
        line-height: 44px
        font-size: $font-size-large
        color: $color-text
      .iconClose
        position: absolute
        right: 8px
        top: 0
        .icon-close
          display: block
          padding: 12px
          font-size: $font-size-large-x
          color: $color-theme
    .search-box-wrapper
      margin: 20px
    .shortcut
      .list-wrapper
        position: absolute
        top: 165px
        bottom: 0
        width: 100%
        .list-scroll
          height: 100%
          overflow: hidden
          .play-inner
            padding: 20px 30px

    .search-result
      position: fixed
      top: 124px
      bottom: 0
      width: 100%
    .tip-title
      text-align: center
      padding: 18px 0
      font-size: 0
      .icon-ok
        font-size: $font-size-medium
        color: $color-theme
        margin-right: 4px
      .text
        font-size: $font-size-medium
        color: $color-text
  .fade-enter-active, .fade-leave-active
    transition: all 0.5s
    opacity: 1

  .fade-enter, .fade-leave-to
    transform: translate3d(100%, 0, 0)
    opacity: 0
</style>
