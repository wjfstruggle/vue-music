<template>
  <div>
    <scroll class="suggest"
            :data="result"
            :pullup="pullup"
            @scrollToEnd="searchMore"
            ref="suggest"
            :beforeScroll="beforeScroll"
            @beforeScroll="listScroll"
    >
      <ul class="suggest-list">
        <li @click="selectItem(item)" class="suggest-item" v-for="item in result" :key="item.id">
          <div class="icon">
            <i :class="getIconCls(item)"></i>
          </div>
          <div class="name">
            <p class="text" v-html="getDisPlayName(item)"></p>
          </div>
        </li>
        <loading v-show="hasMore" title="">
        </loading>
      </ul>
      <div class="no-result-wrapper" v-show="!hasMore && !result.length" >
        <no-result title="抱歉,暂无搜索结果">
        </no-result>
      </div>
    </scroll>
  </div>
</template>

<script type="text/ecmascript-6">
  import {search} from 'api/search'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import Singer from 'common/js/singer'
  import {mapMutations, mapActions} from 'vuex'
  import NoResult from 'base/no-result/no-result'

  const TYPE_SINGER = 'singer'
  const perpage = 20
  export default {
    data() {
      return {
        page: 1, // 页数
        result: [],
        pullup: true, // 上拉刷新
        hasMore: true, // 是否有更多
        beforeScroll: true
      }
    },
    props: {
      query: {
        type: String,
        default: ''
      },
      showSinger: {
        type: Boolean,
        default: true
      }
    },
    methods: {
      Search() {
        this.page = 1
        this.hasMore = true
        this.$refs.suggest.scrollTo(0, 0)
        search(this.query, this.page, this.showSinger, perpage).then((res) => {
          if (res.code === ERR_OK) {
            this.result = this._genResult(res.data)
            this._checkMore(res.data)
          }
        })
      },
      // 处理zhida数据，添加到song对象中
      _genResult(data) {
        let ret = []
        if (data.zhida && data.zhida.singerid) {
          ret.push({...data.zhida, ...{type: TYPE_SINGER}})
        }
        if (data.song) {
          ret = ret.concat(this._normalizeSongs(data.song.list))
        }
        return ret
      },
      _normalizeSongs(list) {
        let ret = []
        list.forEach((musicData) => {
          if (musicData.songid && musicData.albummid) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      },
      // 切换不同的icon
      getIconCls(item) {
        if (item.type === TYPE_SINGER) {
          return 'icon-mine'
        } else {
          return 'icon-music'
        }
      },
      // 判断zhida和singer来显示歌名
      getDisPlayName(item) {
        if (item.type === TYPE_SINGER) {
          // zhida下的歌名
          return item.singername
        } else {
          // singer下的歌名
          return `${item.name}-${item.singer}`
        }
      },
      _checkMore(data) {
        const song = data.song
        if (!song.list.length || (song.curnum + song.curpage * perpage) >= song.totalnum) {
          this.hasMore = false
        }
      },
      searchMore() {
        if (!this.hasMore) {
          return
        }
        this.page++
        search(this.query, this.page, this.showSinger, perpage).then((res) => {
          if (res.code === ERR_OK) {
            this.result = this.result.concat(this._genResult(res.data))
            this._checkMore(res.data)
          }
        })
      },
      // 路由跳转
      selectItem(item) {
        if (item === TYPE_SINGER) {
          const singer = new Singer({
            id: item.singermid,
            name: item.singername
          })
          this.$router.push({
            path: `/search/${singer.id}`
          })
          this.setSinger(singer)
        }
        this.$emit('select', item) // 派发给search组件的事件，每次搜索完点击播放后才触发，用于保存搜索历史数据
      },
      ...mapMutations({
        setSinger: 'SET_SINGER'
      }),
      ...mapActions([
        'insertSong'
      ]),
      listScroll() {
        this.$emit('listScroll')
      },
      refresh() {
        this.$refs.suggest.refresh()
      }
    },
    watch: {
      // 监听_Search，调用api
      query() {
        this.Search()
      }
    },
    components: {
      Scroll,
      Loading,
      NoResult
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/mixin.styl"
  @import "~common/stylus/variable.styl"
  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        align-items: center
        padding-bottom: 20px
        display: flex
        .icon
          flex: 0 0 30px
          width: 30px
          height: 30px
          [class^="icon-"]
            font-size: 14px
            color: $color-text-d
        .name
          flex: 1
          font-size: $font-size-medium
          color: $color-text-d
          overflow: hidden
          .text
            no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
