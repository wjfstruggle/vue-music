// 状态管理
import {playMode} from 'common/js/config'
import {loadSearch, loadPlay, loadFavorite} from 'common/js/cache'

const state = {
  singer: {},
  playing: false, // 播放
  fullScreen: false, // 切换mini播放模式模式
  playlist: [], // 播放列表
  sequenceList: [], // 展开播放列表
  mode: playMode.sequence, // 三种播放模式,默认播放模式=>顺序播放
  currentIndex: -1,
  recommendDesc: {}, // 歌单详情信息
  topList: {}, // 排行榜歌单详情
  searchHistory: loadSearch(), // 搜索历史
  playHistory: loadPlay(), // 播放列表的搜索历史
  favoriteList: loadFavorite() // 收藏歌曲
}
export default state
