<template>
  <div class="musicList">
    <span class="icon" @click="back">
      <i class="icon-back"></i>
    </span>
    <h1 class="title" v-html="title">{{title}}</h1>
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="filter" ref="bgFilter"></div>
      <div class="play-wrapper" ref="play">
        <div class="play" @click="randomPlayList" ref="playBtn" v-show="songs.length > 0">
          <i class="icon-play"></i>
          <span class="text">随机播放歌曲</span>
        </div>
      </div>
    </div>
    <div class="bg-layer" ref="layer"></div>
    <scroll :data="songs" @scroll="scroll" class="list" ref="list" :listenScroll="listenScroll" :probeType="probeType">
      <div class="song-wrapper">
        <song-list :rank="rank" @select="selectSong" :songs="songs" class="song-list">
        </song-list>
      </div>
    </scroll>
    <div class="load-container" v-show="!songs.length">
      <load-ing>
      </load-ing>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'
  import SongList from 'base/song-list/song-list'
  import LoadIng from 'base/loading/loading'
  import {mapActions} from 'vuex'
  import {playlistMixin} from 'common/js/mixin'

  const RESULT_HEIGHT = 80
  export default {
    mixins: [playlistMixin],
    data() {
      return {
        scrollY: 0
      }
    },
    props: {
      bgImage: {
        type: String,
        default: ''
      },
      songs: {
        type: Array
      },
      title: {
        type: String,
        default: ''
      },
      rank: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      back() {
        this.$router.back()
      },
      scroll(pos) {
        this.scrollY = pos.y
      },
      // 点击进入播放页面
      selectSong(item, index) {
        this.selectPlay({
          list: this.songs,
          index
        })
      },
      ...mapActions([
        'selectPlay',
        'randomPlay'
      ]),
      // 点击随机播放
      randomPlayList() {
        this.randomPlay({
          list: this.songs
        })
      },
      // min模式下的滚动到底部出现的bug
      handlePlaylist(playlist) {
        const Bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.list.$el.style.bottom = Bottom
        this.$refs.list.refresh()
      }
    },
    computed: {
      bgStyle() {
        return `background-image:url(${this.bgImage})`
      }
    },
    mounted() {
      // 拖动背景图
      this.imageHeight = this.$refs.bgImage.clientHeight
      // 限制无限滚动,只能滚动到顶部 RESULT_HEIGHT是往下的偏移
      this.minTranslateY = -this.imageHeight + RESULT_HEIGHT
      this.$refs.list.$el.style.top = `${this.imageHeight}px`
    },
    created() {
      this.listenScroll = true
      this.probeType = 3
    },
    watch: {
      scrollY(newY) {
        // 限制无限滚动
        let translateY = Math.max(this.minTranslateY, newY)
        let zIndex = 0
        let scale = 1 // 放大缩小
        let blur = 0 // 模糊
        this.$refs.layer.style['transform'] = `translate3d(0,${translateY}px,0)`
        this.$refs.layer.style['webkitTransform'] = `translate3d(0, ${translateY}px, 0)`
        const percent = Math.abs(newY / this.imageHeight)
        if (newY > 0) { // newY > 0 向下拉
          scale = 1 + percent // 图片放大
          zIndex = 10
        } else {
          blur = Math.min(20 * percent, 20)
        }
        this.$refs.bgFilter.style['backdrop-filter'] = `blur(${blur})`
        this.$refs.bgFilter.style['webkitBackdrop-filter'] = `blur(${blur})`
        // 控制z-index的大小，显示overflow的状态
        if (newY < this.minTranslateY) {
          zIndex = 10
          this.$refs.bgImage.style.paddingTop = 0
          this.$refs.bgImage.style.height = `${RESULT_HEIGHT}px`
          this.$refs.play.style.display = 'none'
        } else {
          this.$refs.bgImage.style.paddingTop = '70%'
          this.$refs.bgImage.style.height = 0
          this.$refs.play.style.display = ''
        }
        this.$refs.bgImage.style.zIndex = zIndex
        this.$refs.bgImage.style['transform'] = `scale(${scale})`
        this.$refs.bgImage.style['webkitTransform'] = `scale(${scale})`
      }
    },
    components: {
      Scroll,
      SongList,
      LoadIng
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"
  .musicList
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .icon
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
        opacity: 1
    .title
      position: absolute
      top: 0
      left: 10%
      width: 80%
      z-index: 20
      text-overflow: ellipsis
      overflow: hidden
      white-space: nowrap
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      background-size: cover
      transform-origin: top
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: #fff
          background: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: 16px
          .text
            display: inline-block
            vertical-align: middle
            font-size: 12px
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-wrapper
        padding: 20px 30px
    .load-container
      position: absolute
      top: 50%
      width: 100%
      transform: translateY(-50%)
</style>
