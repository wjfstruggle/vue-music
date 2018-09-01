<!--热门歌单推荐详情-->
<template>
  <transition name="slide">
    <music-list :rank="rank" :title="title" :bg-image="bgImage" :songs="songs">
    </music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
  import MusicList from 'components/music-list/musicList'
  import {mapGetters} from 'vuex'
  import {getRankTopList} from 'api/rank'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'

  export default {
    data() {
      return {
        songs: [],
        rank: true // 控制歌曲前面图标索引
      }
    },
    computed: {
      title() {
        return this.topList.topTitle
      },
      bgImage() {
        if (this.songs.length) {
          return this.songs[0].image
        }
        return ''
      },
      ...mapGetters([
        'topList'
      ])
    },
    created() {
      this._getRankTopList()
    },
    methods: {
      _getRankTopList() {
        if (!this.topList.id) {
          this.$router.push('/rank')
          return
        }
        getRankTopList(this.topList.id).then(res => {
          if (res.code === ERR_OK) {
            this.songs = this._normalizeTopList(res.songlist)
            console.log(this.songs)
          }
        })
      },
      _normalizeTopList(list) {
        let ret = []
        list.forEach((item) => {
          const musicData = item.data
          if (musicData.songid && musicData.albumid) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
    },
    components: {
      MusicList
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .slider-enter, .slider-leave-to
    transform: translate3d(100%, 0, 0)

  .slider-enter-active, .slider-leave-active
    transition: all 0.5
</style>
