<template>
  <div class="rank" ref="rank">
    <scroll class="topList" :data="topList" ref="topList">
      <ul>
        <li @click="selectItem(item)" class="top_item" v-for="(item, index) in topList" :key="index">
          <div class="pic">
            <img v-lazy="item.picUrl" alt="" width="100" height="100">
            <div class="icon">
              <i class="icon-music"></i><span class="listenCount">{{listenCounts}}</span>
            </div>
          </div>
          <ul class="songList">
            <li class="song" v-for="(song, index) in item.songList" :key="index">
              <span class="count">{{index + 1}}</span>
              <span class="songName">{{song.singername}}-{{song.songname}}</span>
            </li>
            <i class="icon-back"></i>
          </ul>
        </li>
      </ul>
    </scroll>
    <div class="loading-container" v-show="!topList.length">
      <loading>
      </loading>
    </div>
    <router-view>
    </router-view>
  </div>
</template>

<script type="text/ecmascript-6">
  import {getRankList} from 'api/rank'
  import {ERR_OK} from 'api/config'
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import {playlistMixin} from 'common/js/mixin'
  import {mapMutations} from 'vuex'

  export default {
    mixins: [playlistMixin],
    data() {
      return {
        topList: [],
        listenCount: 1200000
      }
    },
    created() {
      this._getRankList()
    },
    computed: {
      listenCounts() {
        return this.listenCount / 10000 + '万'
      }
    },
    methods: {
      // 排行榜
      _getRankList() {
        getRankList().then(res => {
          if (res.code === ERR_OK) {
            this.topList = res.data.topList
            // console.log(this.topList)
          }
        })
      },
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.rank.style.bottom = bottom
        this.$refs.topList.refresh()
      },
      selectItem(item) {
        this.$router.push({
          path: `/rank/${item.id}`
        })
        this.setTopList(item)
      },
      ...mapMutations({
        setTopList: 'SET_TOP_LIST'
      })
    },
    components: {
      Scroll,
      Loading
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/mixin.styl"
  @import "~common/stylus/variable.styl"
  .rank
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .topList
      height: 100%
      overflow: hidden
      .top_item
        display: flex
        height: 100px
        margin: 0 20px
        padding-top: 20px
        &:last-child
          padding-bottom: 20px
        .pic
          position: relative
          flex: 0 0 100px
          width: 100px
          height: 100px
          font-size: 0
          .icon
            position: absolute
            left: 5px
            bottom: 7px
            z-index: 10
            color: $color-text-d
            .listenCount
              display: inline-block
              vertical-align: middle
              font-size: 12px
            .icon-music
              display: inline-block
              vertical-align: middle
              margin-right: 3px
              font-size: 14px
        .songList
          flex: 1
          display: flex
          position: relative
          height: 100px
          padding: 0 20px
          font-size: $font-size-small
          color: $color-text-d
          background: $color-highlight-background
          overflow: hidden
          justify-content: center
          flex-direction: column
          .icon-back
            position: absolute
            transform: rotate(180deg)
            right: 0
            bottom: 44px
            font-size: 12px
          .song
            line-height: 26px
            no-wrap()
            .songName
              margin-left: 5px
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
