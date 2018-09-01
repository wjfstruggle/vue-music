<template>
  <transition name="fade">
    <div class="user-center">
      <div class="back" @click="back">
        <i class="icon-back"></i>
      </div>
      <div class="switches-wrapper">
        <switches :switches="switches" :currentIndex="currentIndex" @switch="switchItem">
        </switches>
      </div>
      <div ref="playBtn" class="play-btn" @click="randomPlaying">
        <i class="icon-play"></i>
        <span class="text">随机播放全部</span>
      </div>
      <div class="list-wrapper" ref="listWrapper">
        <scroll ref="FavoriteList" class="list-scroll" v-if="currentIndex === 0" :data="favoriteList">
          <div class="list-inner">
            <song-list :songs="favoriteList" @select="selectSong">
            </song-list>
          </div>
        </scroll>
        <scroll ref="PlayList" class="list-scroll" v-if="currentIndex === 1" :data="playHistory">
          <div class="list-inner">
            <song-list :songs="playHistory" @select="selectSong">
            </song-list>
          </div>
        </scroll>
      </div>
      <div class="no-result-wrapper" v-show="noResult">
        <no-result :title="noResultDesc">
        </no-result>
      </div>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
  import switches from 'base/switch/switch'
  import SongList from 'base/song-list/song-list'
  import SearchList from 'base/search-list/search-list'
  import {mapGetters, mapActions} from 'vuex'
  import Scroll from 'base/scroll/scroll'
  import NoResult from 'base/no-result/no-result'
  import Song from 'common/js/song'
  import {playlistMixin} from 'common/js/mixin'

  export default {
    mixins: [playlistMixin],
    data() {
      return {
        switches: [
          {name: '我喜欢的'},
          {name: '最近听的'}
        ],
        currentIndex: 0
      }
    },
    computed: {
      noResult() {
        if (this.currentIndex === 0) {
          return !this.favoriteList.length
        } else {
          return !this.playHistory.length
        }
      },
      noResultDesc() {
        if (this.currentIndex === 0) {
          return '暂无收藏歌曲'
        } else {
          return '暂无最近听的歌曲'
        }
      },
      ...mapGetters([
        'favoriteList',
        'playHistory'
      ])
    },
    methods: {
      back() {
        this.$router.back()
      },
      switchItem(index) {
        this.currentIndex = index
      },
      selectSong(song) {
        this.insertSong(new Song(song))
      },
      randomPlaying() {
        let list = this.currentIndex === 0 ? this.favoriteList : this.playHistory
        if (list.length === 0) {
          return
        }
        list = list.map((song) => {
          return new Song(song)
        })
        this.randomPlay({
          list
        })
      },
      // min模式下的滚动到底部出现的bug
      handlePlaylist(playlist) {
        const Bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.listWrapper.style.bottom = Bottom
        this.$refs.favoriteList && this.$refs.favoriteList.refresh()
        this.$refs.playList && this.$refs.playList.refresh()
      },
      ...mapActions([
        'insertSong',
        'randomPlay',
        'selectPlay'
      ])
    },
    components: {
      switches,
      SongList,
      SearchList,
      Scroll,
      NoResult
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/mixin.styl"
  @import "~common/stylus/variable.styl"
  .user-center
    position: fixed
    top: 0
    bottom: 0
    z-index: 200
    width: 100%
    background: $color-background
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .switches-wrapper
      margin: 10px 0 30px 0
    .play-btn
      box-sizing: border-box
      width: 135px
      padding: 7px 0
      margin: 0 auto
      text-align: center
      border: 1px solid  $color-theme
      color: $color-text-l
      border-radius: 100px
      font-size: 0
      .icon-play
        display: inline-block
        vertical-align: middle
        margin-right: 6px
        font-size: $font-size-medium-x
        color: $color-theme
      .text
        display: inline-block
        vertical-align: middle
        font-size: $font-size-small
        color: $color-theme
    .list-wrapper
      position: absolute
      top: 110px
      bottom: 0
      width: 100%
      .list-scroll
        height: 100%
        overflow: hidden
        .list-inner
          padding: 20px 30px
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)

  .fade-enter-active, .fade-leave-active
    transition: all 0.5s
    opacity: 1

  .fade-enter, .fade-leave-to
    transform: translate3d(100%, 0, 0)
    opacity: 0
</style>
