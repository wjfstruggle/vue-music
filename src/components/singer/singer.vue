<template>
  <div class="singer" ref="singer" >
    <list-view :data="singers" @select="selectSinger" ref="listView">
    </list-view>
    <!--挂载子路由-->
    <router-view>
    </router-view>
  </div>
</template>

<script>
  import {GetSingerList} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import Singer from 'common/js/singer'
  import ListView from 'base/listview/listview'
  import {mapMutations} from 'vuex'
  import {playlistMixin} from 'common/js/mixin'

  const HOST_NAME = '热门'
  const HOST_SINGER_LEN = 10

  export default {
    mixins: [playlistMixin],
    data() {
      return {
        singers: []
      }
    },
    created() {
      this._getSingerList()
    },
    methods: {
      // min模式下的滚动到底部出现的bug
      handlePlaylist(playlist) {
        const Bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.singer.style.bottom = Bottom
        this.$refs.listView.refresh()
      },
      _getSingerList() {
        GetSingerList().then((res) => {
          if (res.code === ERR_OK) {
            this.singers = this._normalizeSinger(res.data.list)
          }
        })
      },
      // 路由跳转
      selectSinger(singer) {
        this.$router.push({
          path: `/singer/${singer.id}`
        })
        this.setSinger(singer) // vuex提供的语法糖监听数据变化
      },
      // 分热门， 按字母排序歌手，传入list参数是歌手数据
      _normalizeSinger(list) {
        let map = {
          hot: {
            title: HOST_NAME, // 热门歌手
            items: [] // 保存信息
          }
        }
        // 热么的歌手列表
        list.forEach((item, index) => {
          if (index < HOST_SINGER_LEN) {
            map.hot.items.push(new Singer({ // class类来传递参数
              id: item.Fsinger_mid, // 歌手id
              name: item.Fsinger_name // 歌手名
            }))
          }
          // 字母排序的歌手列表
          const key = item.Findex // 字母列表
          if (!map[key]) {
            map[key] = {
              title: key,
              items: []
            }
          }
          map[key].items.push(new Singer({
            id: item.Fsinger_mid, // 歌手Fsinger_mid: "002J4UUk29y8BY"用于拼接成歌手头像
            name: item.Fsinger_name // 歌手名
          }))
        })
        // 为了得到有序列表，需要处理map，便于分类
        let hot = [] // 热门
        let ret = [] // 字母
        for (let key in map) {
          let val = map[key]
          if (val.title.match(/[a-zA-Z]/)) {
            ret.push(val)
          } else if (val.title === HOST_NAME) {
            hot.push(val)
          }
        }
        ret.sort((a, b) => { // 字母排序A-Z
          return a.title.charCodeAt(0) - b.title.charCodeAt(0)
        })
        return hot.concat(ret)
      },
      ...mapMutations({
        setSinger: 'SET_SINGER'
      })
    },
    components: {
      ListView
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
</style>
