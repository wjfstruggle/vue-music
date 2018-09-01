import {mapGetters, mapActions} from 'vuex'

export const playlistMixin = {
  computed: {
    ...mapGetters([
      'playlist'
    ])
  },
  mounted() {
    this.handlePlaylist(this.playlist)
  },
  activated() {
    this.handlePlaylist(this.playlist)
  },
  watch: {
    playlist(newVal) {
      this.handlePlaylist(newVal)
    }
  },
  methods: {
    handlePlaylist() {
      throw new Error('component must implement handlePlaylist method')
    }
  }
}

export const playMixin = {
  computed: {
    ...mapGetters([
      'favoriteList'
    ])
  },
  methods: {
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
      }
    },
    isFavorite(song) {
      const index = this.favoriteList.findIndex((item) => {
        return item.id === song.id
      })
      return index > -1
    },
    ...mapActions([
      'saveFavoriteHistory',
      'deleteFavoriteHistory',
      'saveSearchHistory',
      'deleteSearchHistory',
      'clearSearchHistory',
      'insertSong'
    ])
  }
}
