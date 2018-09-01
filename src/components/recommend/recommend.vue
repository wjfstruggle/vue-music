<template>
  <div class="recommend" ref="recommend">
    <scroll ref="scroll" class="recommend-content" :data="discList">
      <div>
        <div v-if="recommends.length" class="slider-wrapper" ref="sliderWrapper">
          <slider>
            <div v-for="item in recommends" :key="item.id">
              <a :href="item.linkUrl">
                <img class="needsclick" @load="loadImage" :src="item.picUrl">
              </a>
            </div>
          </slider>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li @click="selectItem(item)" v-for="item in discList" class="recommend-item" :key="item.id">
              <div class="avatar">
                <img width="60" height="60" v-lazy="item.imgurl">
              </div>
              <div class="content">
                <h2 class="name" v-html="item.creator.name"></h2>
                <p class="dissname" v-html="item.dissname"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="loadIng-wrapper" v-show="!discList.length">
        <loading>
        </loading>
      </div>
    </scroll>
    <!--子路由挂载-->
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
  import 'better-scroll'
  import Loading from 'base/loading/loading'
  import Scroll from 'base/scroll/scroll'
  import Slider from 'base/slider/slider.vue'
  import {getRecommend, getDiscList} from 'api/recommend'
  import {ERR_OK} from 'api/config'
  import {playlistMixin} from 'common/js/mixin'
  import {mapMutations} from 'vuex'

  export default {
    mixins: [playlistMixin],
    data() {
      return {
        recommends: [], // 推荐
        discList: [] // 热门歌单
      }
    },
    created() {
      this._getRecommend()
      this._getDiscList()
    },
    methods: {
      // min模式下的滚动到底部出现的bug
      handlePlaylist(playlist) {
        const Bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.recommend.style.bottom = Bottom
        this.$refs.scroll.refresh()
      },
      // 轮播图数据
      _getRecommend() {
        getRecommend().then(res => {
          if (res.code === ERR_OK) {
            this.recommends = res.data.slider
          }
        })
      },
      // 歌单数据
      _getDiscList() {
        getDiscList().then(res => {
          if (res.code === ERR_OK) {
            this.discList = res.data.list
          }
        })
      },
      // 歌单渲染后确保滚动到底部
      loadImage() {
        if (!this.checkloaded) {
          this.$refs.scroll.refresh()
          this.checkloaded = true
        }
      },
      // 跳转到子路由
      selectItem(item) {
        this.$router.push({
          path: `/recommend/${item.dissid}`
        })
        this.setRecommendDesc(item)
      },
      ...mapMutations({
        setRecommendDesc: 'SET_RECOMMEND_DESC'
      })
    },
    components: {
      Slider,
      Scroll,
      Loading
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/mixin.styl"
  @import "~common/stylus/variable.styl"
  .recommend
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        overflow: hidden
      .recommend-list
        .recommend-item
          display: flex
          -webkit-box-sizing: border-box
          -moz-box-sizing: border-box
          box-sizing: border-box
          align-items: center
          padding: 0 20px 20px 20px
          &:last-child
            margin-bottom: none
          .avatar
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .content
            display: flex
            flex: 1
            flex-direction: column
            justify-content: center
            overflow: hidden
            line-height: 20px
            font-size: 0
            .name
              font-size: $font-size-medium
              color: $color-text
            .dissname
              margin-top: 10px
              font-size: $font-size-medium
              color: $color-text-d
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          color: $color-theme
          font-size: $font-size-medium
      .loadIng-wrapper
        // 垂直居中
        position: absolute
        top: 50%
        width: 100%
        transform: translate3d(0 -50% 0)
</style>
