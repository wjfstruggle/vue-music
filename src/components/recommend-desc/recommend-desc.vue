<!--热门歌单推荐详情-->
<template>
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs">
    </music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
  import MusicList from 'components/music-list/musicList'
  import {mapGetters} from 'vuex'
  import {getSongDesc} from 'api/recommend'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'

  export default {
    data() {
      return {
        songs: []
      }
    },
    computed: {
      title() {
        return this.recommendDesc.dissname
      },
      bgImage() {
        return this.recommendDesc.imgurl
      },
      ...mapGetters([
        'recommendDesc'
      ])
    },
    created() {
      this._getSongDesc()
    },
    methods: {
      // 热门推荐歌单详情
      _getSongDesc() {
        if (!this.recommendDesc.dissid) {
          this.$router.push('/recommend')
          return
        }
        getSongDesc(this.recommendDesc.dissid).then(res => {
          if (res.code === ERR_OK) {
            this.songs = this._normalizeSongList(res.cdlist[0].songlist)
          }
        })
      },
      _normalizeSongList(list) {
        let ret = []
        list.forEach((musicData) => {
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
