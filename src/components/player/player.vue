<template>
  <div class="player" v-show="playlist.length">
    <!--全屏播放-->
    <transition name="normal" @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave">
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img :src="currentSong.image" alt="" width="100%" height="100%">
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1> <!--歌手名-->
          <h2 class="subtitle" v-html="currentSong.album"></h2><!--专辑名-->
        </div>
        <div class="middle"
             @touchstart.prevent="middleTouchStart"
             @touchmove.prevent="middleTouchMove"
             @touchend="middleTouchEnd"
             @click.stop
        >
          <!--cd专辑图片-->
          <div class="middle-l" ref="middleL" @click.stop>
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cd">
                <img :src="currentSong.image" alt="" class="image">
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <!--歌词-->
          <scroll class="middle-r" @click.stop :data="currentLyric && currentLyric.lines" ref="lyricList">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p class="text" ref="lyricLine" v-for="(line,index) in currentLyric.lines" :key="index"
                   :class="{'current': currentLineNum === index}">{{line.txt}}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <!--歌词和cd滑动页面-->
          <div class="dot-wrapper">
            <span class="dot" :class="{'active': currentShow === 'cd'}"></span>
            <span class="dot" :class="{'active': currentShow === 'lyric'}"></span>
          </div>
          <!--播放进度条-->
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange="onProgressBarChange">
              </progress-bar>
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <!--随机切换按钮-->
            <div class="icon i-left">
              <i :class="iconPlayMode" @click="changeMode"></i>
            </div>
            <!--上一首歌切换按钮-->
            <div class="icon i-left" :class="disableCls">
              <i class="icon-prev" @click="prev"></i>
            </div>
            <!--暂停播放切换按钮-->
            <div class="icon i-center">
              <i @click="togglePlaying" :class="iconPlay"></i>
            </div>
            <!--下一首歌切换按钮-->
            <div class="icon i-right" :class="disableCls">
              <i class="icon-next" @click="next"></i>
            </div>
            <!--喜欢收藏按钮-->
            <div class="icon i-right" :class="disableCls">
              <i class="icon" :class="getFavoriteIcon(currentSong)" @click="toggleFavorite(currentSong)"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <!---->
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="fullScreenPlaying">
        <div class="icon">
          <img :class="cd" width="40" height="40" alt="" :src="currentSong.image">
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.album"></p>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :percent="percent">
            <i @click.stop="togglePlaying" :class="miniIcon" class="icon-mini"></i>
          </progress-circle>
        </div>
        <div class="control" @click.stop="showPlayList">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <play-list ref="playlist">
    </play-list>
    <!--@timeupdate audio事件，该属性返回音频/视频（audio/video）的播放位置（以秒计）-->
    <audio :src="currentSong.url" ref="audio" @canplay="ready" @error="error" @timeupdate="timeUpData"
           @ended="end">
    </audio>
    <top-tip ref="topTip">
      <div class="tip-title">
        <i class="icon-ok"></i>
        <span class="text">已收藏</span>
      </div>
    </top-tip>
  </div>
</template>

<script type="text/ecmascript-6">
  import {mapGetters, mapMutations, mapActions} from 'vuex'
  import animations from 'create-keyframe-animation'
  import ProgressBar from 'base/progress-bar/progress-bar'
  import ProgressCircle from 'base/progress-circle/progress-circle'
  import {playMode} from 'common/js/config'
  import {shuffle} from 'common/js/util'
  import Lyric from 'lyric-parser'
  import Scroll from 'base/scroll/scroll'
  import {prefixStyle} from 'common/js/dom'
  import PlayList from 'components/playlist/playlist'
  import TopTip from 'base/top-tip/top-tip'

  const transform = prefixStyle('transform')
  const transitionDuration = prefixStyle('transitionDuration')

  export default {
    data() {
      return {
        readySong: false, // 缓冲，防止切换歌曲过快而触发play（）错误
        currentTime: 0,
        radius: 32,
        currentLyric: null, // 是否有当前歌词
        currentLineNum: 0, // 歌词显示高亮行数
        currentShow: 'cd', // active效果默认在CD页面
        playingLyric: '' // CD 页面显示歌词=> 1行
      }
    },
    created() {
      this.touch = {} // touch用来关联三个事件
    },
    computed: {
      // 切换暂停播放状态
      iconPlay() {
        return this.playing ? 'icon-pause' : 'icon-play'
      },
      // mini播放模式
      miniIcon() {
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      // 专辑图片循环，暂停
      cd() {
        return this.playing ? 'play' : 'play pause'
      },
      // 点击:hover属性
      disableCls() {
        return this.readySong ? '' : 'disable'
      },
      // 进度条时间比例，当前时间除以总时间
      percent() {
        return this.currentTime / this.currentSong.duration
      },
      // 切换随机按钮
      iconPlayMode() {
        return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
      },
      ...mapGetters([
        'fullScreen', // mini播放模式
        'playlist', // 播放列表
        'currentSong', // 整个歌曲列表信息的映射
        'playing', // 正在播放
        'currentIndex', // 歌曲索引
        'mode', // 切换播放模式
        'sequenceList', // 顺序播放列表
        'favoriteList' // 收藏歌曲
      ])
    },
    methods: {
      back() {
        this.setFullScreen(false) // 全屏关闭
      },
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN', // 切换到mini播放模式
        setPlayingState: 'SET_PLAYING_STATE', // 播放，暂停
        setCurrentIndex: 'SET_CURRENT_INDEX', // 播放歌曲的索引
        setPlayMode: 'SET_PLAY_MODE', // 播放三种模式
        setPlayList: 'SET_PLAYLIST' // 播放列表
      }),
      ...mapActions([
        'savePlayHistory',
        'saveFavoriteHistory',
        'deleteFavoriteHistory'
      ]),
      fullScreenPlaying() {
        this.setFullScreen(true) // 全屏打开
      },
      // 播放功能
      togglePlaying() {
        if (!this.readySong) {
          return
        }
        this.setPlayingState(!this.playing)
        // 歌曲暂停，歌词跟着暂停
        if (this.currentLyric) {
          this.currentLyric.togglePlay()
        }
      },
      // 切歌，上一首
      prev() {
        if (!this.readySong) {
          return
        }
        let index = this.currentIndex - 1
        // 上一首歌暂停,切歌继续播放
        if (!this.playing) {
          this.togglePlaying()
        }
        this.readySong = false
        if (index === -1) {
          index = this.playlist.length - 1
        }
        this.setCurrentIndex(index)
      },
      // 切歌，下一首
      next() {
        if (!this.readySong) {
          return
        }
        // 如果歌词长度为零
        if (this.playlist.length === 1) {
          this.loop()
        } else {
          let index = this.currentIndex + 1
          // 上一首歌暂停,切歌继续播放
          if (!this.playing) {
            this.togglePlaying()
          }
          this.readySong = false
          // 判断最后一首歌为0是，切回第一首歌
          if (index === this.playlist.length) {
            index = 0
          }
          this.setCurrentIndex(index)
        }
      },
      // 防止快速切换导致出现错误
      ready() {
        this.readySong = true
        this.savePlayHistory(this.currentSong) // 添加歌曲到最近播放列表
      },
      error() {
        this.readySong = true // 获取媒体数据过程抛出的错误
      },
      // 播放歌曲显示时间
      timeUpData(e) {
        this.currentTime = e.target.currentTime
      },
      // 转换时间戳,显示  分:秒格式
      format(interval) {
        interval = interval | 0 // 向上向下取整
        const minute = interval / 60 | 0 // 分
        const second = this._pad(interval % 60)
        return `${minute}:${second}`
      },
      // 显示  分:秒格式
      _pad(num, n = 2) {
        let len = num.toString().length
        while (len < n) {
          num = '0' + num
          len++
        }
        return num
      },
      // 监听拖动小球进度
      onProgressBarChange(percent) {
        this.$refs.audio.currentTime = this.currentSong.duration * percent
        if (!this.playing) {
          this.togglePlaying()
        }
        // 点击进度条歌词也跟着显示到高亮位置
        if (this.currentLyric) {
          this.currentLyric.seek(this.currentSong.duration * percent * 1000)
        }
      },
      // 点击切换按钮
      changeMode() {
        const mode = (this.mode + 1) % 3 // 3种播放模式
        this.setPlayMode(mode)
        // 随机播放
        let list = null
        if (mode === playMode.random) {
          list = shuffle(this.sequenceList) // 洗牌，打乱
        } else {
          list = this.sequenceList
        }
        this.restCurrentIndex(list)
        this.setPlayList(list)
      },
      // 重置currentIndex的索引，不对currentSong做改变
      restCurrentIndex(list) {
        let index = list.findIndex((item) => {
          return item.id === this.currentSong.id
        })
        this.setCurrentIndex(index)
      },
      // 歌曲播放完毕，自动切换到下一首
      end() {
        // 是否是循环模式
        if (this.mode === playMode.loop) {
          this.loop()
        } else {
          this.next()
        }
      },
      // 单曲循环播放模式
      loop() {
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
        // 循环播放时歌词重新定位到第一行
        if (this.currentLyric) {
          this.currentLyric.seek(0)
        }
      },
      // 用插件Lyric-parser 解析歌词,获取到lines下的time对应播放时间进度和text对应歌词
      getLyric() {
        this.currentSong.getLyric().then(lyric => {
          this.currentLyric = new Lyric(lyric, this.handleLyric)
          if (this.playing) {
            this.currentLyric.play() // 插件Lyric-parser api
          }
          // 由于网络等各种原因获取不到歌词时的清理操作
        }).catch(() => {
          this.currentLyric = null
          this.playingLyric = ''
          this.currentLineNum = 0
        })
      },
      handleLyric({lineNum, txt}) {
        this.currentLineNum = lineNum // lineNum行数
        if (lineNum > 5) {
          let lineEl = this.$refs.lyricLine[lineNum - 5]
          this.$refs.lyricList.scrollToElement(lineEl, 1000)
        } else {
          this.$refs.lyricList.scrollTo(0, 0, 1000) // 当滑动的时候，1秒内回到高亮的位置
        }
        this.playingLyric = txt // cd页面显示歌词
      },
      // 实现页面CD和歌词的滑动
      // 当手指接触屏幕时触发
      middleTouchStart(e) {
        this.touch.initiated = true // 初始化标志位
        const touch = e.touches[0]
        this.touch.startX = touch.pageX // X坐标
        this.touch.startY = touch.pageY // Y坐标
      },
      // 当已经接触屏幕的手指开始移动后触发
      middleTouchMove(e) {
        if (!this.touch.initiated) {
          return
        }
        const touch = e.touches[0]
        // PageX:鼠标在页面上的位置,从页面左上角开始,即是以页面为参考点,不随滑动条移动而变化
        const delaX = touch.pageX - this.touch.startX
        const delaY = touch.pageY - this.touch.startY
        if (Math.abs(delaY) > Math.abs(delaX)) { // 只能横向滚动
          return
        }
        const left = this.currentShow === 'cd' ? 0 : -window.innerWidth // 停在CD页面（0或者-屏幕宽度）
        const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + delaX))
        this.touch.percent = Math.abs(offsetWidth / window.innerWidth) // 获取百分比宽度
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
        this.$refs.lyricList.$el.style[transitionDuration] = 0
        this.$refs.middleL.style.opacity = 1 - this.touch.percent
        this.$refs.middleL.style[transitionDuration] = 0
      },
      // 当手指离开屏幕时触发
      middleTouchEnd() {
        let offsetWidth
        let opacity
        if (this.currentShow === 'cd') {
          if (this.touch.percent > 0.1) { // 向左滑动10%，瞬速切换歌词页面
            offsetWidth = -window.innerWidth
            opacity = 0
            this.currentShow = 'lyric'
          } else {
            offsetWidth = 0
            opacity = 1
          }
        } else {
          if (this.touch.percent < 0.9) { // 向右滑动10%，瞬速切换CD页面
            offsetWidth = 0
            this.currentShow = 'cd'
            opacity = 1
          } else {
            offsetWidth = -window.innerWidth
            opacity = 0
          }
        }
        const time = 600
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
        this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms` // transition-duration 属性规定完成过渡效果需要花费的时间（以秒或毫秒计）。
        this.$refs.middleL.style.opacity = opacity
        this.$refs.middleL.style[transitionDuration] = 0
      },
      // 展开播放列表
      showPlayList() {
        this.$refs.playlist.show()
      },
      // 取消收藏切换按钮
      getFavoriteIcon(song) {
        if (this.isFavorite(song)) {
          return 'icon-favorite'
        } else {
          return 'icon-not-favorite'
        }
      },
      // 收藏歌曲到本地
      toggleFavorite(song) {
        if (this.isFavorite(song)) {
          this.deleteFavoriteHistory(song)
        } else {
          this.saveFavoriteHistory(song)
          this.$refs.topTip.show()
        }
      },
      isFavorite(song) {
        const index = this.favoriteList.findIndex((item) => {
          return item.id === song.id
        })
        return index > -1
      },
      // 动画钩子
      enter(el, done) {
        const {x, y, scale} = this._getPosAndScale()

        let animation = {
          0: {
            transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
          },
          50: {
            transform: `translate3d(0,0,0) scale(1.1)`
          },
          100: {
            transform: `translate3d(0,0,0) scale(1)`
          }
        }
        // create-keyframe-animation插件
        animations.registerAnimation({
          name: 'move',
          animation,
          presets: {
            duration: 500,
            easing: 'linear'
          }
        })
        // // then run it
        animations.runAnimation(this.$refs.cdWrapper, 'move', done)
      },
      afterEnter() {
        animations.unregisterAnimation('move')
        this.$refs.cdWrapper.style.animation = ''
      },
      leave(el, done) {
        this.$refs.cdWrapper.style.transition = 'all 0.5s'
        const {x, y, scale} = this._getPosAndScale()
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
        this.$refs.cdWrapper.addEventListener('transitionend', done)
      },
      afterLeave() {
        this.$refs.cdWrapper.style.transition = ''
        this.$refs.cdWrapper.style[transform] = ''
      },
      _getPosAndScale() {
        const targetWidth = 40
        const paddingLeft = 40
        const paddingBottom = 30
        const paddingTop = 80
        const width = window.innerWidth * 0.8
        const scale = targetWidth / width
        const x = -(window.innerWidth / 2 - paddingLeft)
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
        return {
          x,
          y,
          scale
        }
      }
    },
    watch: {
      currentSong(newSong, oldSong) {
        if (!newSong.id) {
          return
        }
        if (newSong.id === oldSong.id) { // 限制currentSong的改变
          return
        }
        // 防止切歌是的歌词不规则跳动
        if (this.currentLyric) {
          this.currentLyric.stop()
        }
        setTimeout(() => {
          this.$refs.audio.play()
          this.getLyric()
        }, 20)
      },
      playing(newPlaying) {
        const audio = this.$refs.audio
        setTimeout(() => {
          // 原生audio api方法
          newPlaying ? audio.play() : audio.pause()
        }, 20)
      }
    },
    components: {
      ProgressBar,
      ProgressCircle,
      Scroll,
      PlayList,
      TopTip
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"
  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              // cd 旋转功能
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              // css3暂停动画属性
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0 auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0
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
  // cd 360°旋转功能
  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
