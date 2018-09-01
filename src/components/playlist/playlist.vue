<template>
  <transition name="list-fade">
    <div class="playlist" v-show="showFlag" @click="hide">
      <div class="list-wrapper" @click.stop>
        <div class="list-header">
          <h1 class="title">
            <i class="icon" :class="iconPlayMode" @click="changeMode"></i>
            <span class="text">{{changeText}}</span>
            <span class="clear" @click="showConfirm">
              <i class="icon-clear"></i>
            </span>
          </h1>
        </div>
        <scroll :refreshDelay="refreshDelay" ref="listContent" class="list-content" :data="sequenceList">
          <transition-group ref="list" name="list" tag="ul">
            <li ref="listItem" class="item" v-for="(item, index) in sequenceList" :key="item.id"
                @click="selectItem(item,index)">
              <i class="current" :class="playlistIcon(item)"></i>
              <span class="text" :class="playlistActive(item)">{{item.name}}</span>
              <span class="like" @click.stop="toggleFavorite(item)">
                <i :class="getFavoriteIcon(item)"></i>
              </span>
              <span class="delete" @click.stop="deleteOneSong(item)">
                <i class="icon-delete"></i>
              </span>
            </li>
          </transition-group>
        </scroll>
        <div class="list-operate">
          <div class="add" @click="addSong">
            <i class="icon-add"></i>
            <span class="text">添加歌曲到队列</span>
          </div>
        </div>
        <div class="list-close" @click="hide">
          <span>关闭</span>
        </div>
      </div>
      <confirm ref="confirm" text="是否清空歌曲播放列表" confirmBtnText="清空" @confirm="clearAll">
      </confirm>
      <add-song ref="addsong">
      </add-song>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
  import {mapGetters, mapMutations, mapActions} from 'vuex'
  import Scroll from 'base/scroll/scroll'
  import {playMode} from 'common/js/config'
  import Confirm from 'base/confirm/confirm'
  import {shuffle} from 'common/js/util'
  import addSong from 'components/add-song/add-song'
  import {playMixin} from 'common/js/mixin'

  export default {
    mixins: [playMixin],
    data() {
      return {
        showFlag: false,
        refreshDelay: 100
      }
    },
    computed: {
      ...mapGetters([
        'sequenceList', // 播放列表数据
        'currentSong', // 整个歌曲列表信息的映射
        'playlist', // 进入播放
        'playing', // 播放中
        'mode'
      ]),
      iconPlayMode() {
        return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
      },
      changeText() {
        return this.mode === playMode.sequence ? '顺序播放' : this.mode === playMode.loop ? '单曲循环' : '随机播放'
      }
    },
    methods: {
      show() {
        this.showFlag = true
        setTimeout(() => {
          this.$refs.listContent.refresh()
          this.scrollToCurrent(this.currentSong)
        }, 20)
      },
      hide() {
        this.showFlag = false
      },
      // 歌曲前面的播放icon
      playlistIcon(item) {
        if (this.currentSong.id === item.id) {
          return 'icon-play'
        } else {
          return ''
        }
      },
      playlistActive(item) {
        if (this.currentSong.id === item.id) {
          return 'active'
        } else {
          return ''
        }
      },
      // 点击列表的歌曲进入到播放页面
      selectItem(item, index) {
        if (this.mode === playMode.random) {
          index = this.playlist.findIndex(song => {
            return song.id === item.id
          })
        }
        this.setCurrentIndex(index)
        this.setPlayingState(true) // 点击播放列表歌曲，显示icon处于播放状态
      },
      // 把当前播放的歌曲置于最顶部
      scrollToCurrent(current) {
        const index = this.sequenceList.findIndex((song) => {
          return current.id === song.id
        })
        const el = this.$refs.listItem[index]
        this.$refs.listContent.scrollToElement(el, 300)
      },
      // 删除播放列表的歌曲
      deleteOneSong(item) {
        this.deleteSong(item)
        if (!this.playlist.length) { // 删完最后一首歌，隐藏播放列表
          this.hide()
        }
      },
      // 点击弹出窗口
      showConfirm() {
        this.$refs.confirm.show()
      },
      // 清除播放列表
      clearAll() {
        this.deleteSongList()
        this.hide()
      },
      // 切换播放模式
      changeMode() {
        const mode = (this.mode + 1) % 3 // 三种播放模式
        this.setPlayMode(mode)
        let list = null
        if (mode === playMode.random) {
          list = shuffle(this.sequenceList)
        } else {
          list = this.sequenceList
        }
        this.resetCurrentIndex(list)
        this.setPlayList(list)
      },
      // 重置currentIndex的索引，不对currentSong做改变
      resetCurrentIndex(list) {
        const index = list.findIndex(item => {
          return item.id === this.currentSong.id
        })
        this.setCurrentIndex(index)
      },
      addSong() {
        this.$refs.addsong.show()
      },
      ...mapMutations({
        setCurrentIndex: 'SET_CURRENT_INDEX',
        setPlayingState: 'SET_PLAYING_STATE',
        setPlayList: 'SET_PLAYLIST',
        setPlayMode: 'SET_PLAY_MODE'
      }),
      ...mapActions([
        'deleteSong',
        'deleteSongList'
      ])
    },
    watch: {
      // 监听currentSong索引
      currentSong(newSong, oldSong) {
        if (!this.showFlag || newSong.id === oldSong.id) {
          return
        }
        setTimeout(() => {
          this.scrollToCurrent(newSong)
        }, 20)
      }
    },
    components: {
      Scroll,
      Confirm,
      addSong
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/mixin.styl"
  @import "~common/stylus/variable.styl"
  .playlist
    position: fixed
    left: 0
    right: 0
    top: 0
    bottom: 0
    z-index: 200
    background-color: $color-background-d
    &.list-fade-enter-active, &.list-fade-leave-active
      transition: opacity 0.3s
      .list-wrapper
        transition: all 0.3s
    &.list-fade-enter, &.list-fade-leave-to
      opacity: 0
      .list-wrapper
        transform: translate3d(0, 100%, 0)
    &.list-fade-enter
    .list-wrapper
      position: absolute
      left: 0
      bottom: 0
      width: 100%
      background-color: $color-highlight-background
      .list-header
        position: relative
        padding: 20px 30px 10px 20px
        .title
          display: flex
          align-items: center
          .icon
            margin-right: 10px
            font-size: 30px
            color: $color-theme-d
          .text
            flex: 1
            font-size: $font-size-medium
            color: $color-text-l
          .clear
            extend-click()
            .icon-clear
              font-size: $font-size-medium
              color: $color-text-d
      .list-content
        max-height: 240px
        overflow: hidden
        .item
          display: flex
          align-items: center
          height: 40px
          padding: 0 30px 0 20px
          overflow: hidden
          &.list-enter-active, &.list-leave-active
            transition: all 0.1s
          &.list-enter, &.list-leave-to
            height: 0
          .current
            flex: 0 0 20px
            width: 20px
            font-size: $font-size-small
            color: $color-theme-d
          .text
            flex: 1
            no-wrap()
            font-size: $font-size-medium
            color: $color-text-d
            &.active
              color: $color-theme
          .like
            extend-click()
            margin-right: 15px
            font-size: $font-size-small
            color: $color-theme
            .icon-favorite
              color: $color-sub-theme
          .delete
            extend-click()
            font-size: $font-size-small
            color: $color-theme
      .list-operate
        width: 140px
        margin: 20px auto 30px auto
        .add
          display: flex
          align-items: center
          padding: 8px 16px
          border: 1px solid $color-text-l
          border-radius: 100px
          color: $color-text-l
          .icon-add
            margin-right: 5px
            font-size: $font-size-small-s
          .text
            font-size: $font-size-small
      .list-close
        text-align: center
        line-height: 50px
        background: $color-background
        font-size: $font-size-medium-x
        color: $color-text-l
</style>
