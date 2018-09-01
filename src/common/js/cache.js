// 存储，缓存逻辑代码

import storage from 'good-storage'

const SEARCH_KEY = '__search__'
const SEARCH_MAX_LENGTH = 15 // 最多在页面保留15条搜索历史

const PLAY_KEY = '__PLAY__'
const PLAY_MAX_LEN = 200 // 最近播放历史保留200首歌曲

const FAVORITE_KEY = '__favorite__'
const FAVORITE_MAX_LENGTH = 100 // 收藏歌曲100首

// 保留搜索历史  =>1
export function saveSearch(query) {
  let searches = storage.get(SEARCH_KEY, [])
  insertArray(searches, query, (item) => {
    return item === query
  }, SEARCH_MAX_LENGTH)
  storage.set(SEARCH_KEY, searches) // 保存当前执行的操作
  return searches // 返回一个新的数组
}

// 删除搜索历史操作5
export function deleteSearch(query) {
  let searches = storage.get(SEARCH_KEY, [])
  deleteFromArray(searches, (item) => {
    return item === query
  })
  storage.set(SEARCH_KEY, searches) // 保存当前执行的操作
  return searches // 返回一个新的数组
}

// 清空搜索历史7
export function clearSearch() {
  storage.remove(SEARCH_KEY)
  return []
}

// 插入操作。每次搜索完歌曲，新的数据插入最前面，超过最大长度删除 =>2
function insertArray(arr, val, compare, maxLen) {
  let index = arr.findIndex(compare)
  if (index === 0) {
    return
  }
  if (index > 0) {
    arr.splice(index, 1) // 插入元素，然后再删除之前的元素
  }
  arr.unshift(val)
  if (maxLen && arr.length > maxLen) {
    arr.pop() // 长度超过15条，删除最后一个
  }
}

// 删除操作6
function deleteFromArray(arr, compare) {
  let index = arr.findIndex(compare)
  if (index > -1) {
    arr.splice(index, 1)
  }
}

// 本地缓存4
export function loadSearch() {
  return storage.get(SEARCH_KEY, [])
}

// 保留最近播放历史数据9
export function savePlay(song) {
  let songs = storage.get(PLAY_KEY, [])
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, PLAY_MAX_LEN)
  storage.set(PLAY_KEY, songs)
  return songs
}

// 最近播放歌曲本地缓存8
export function loadPlay() {
  return storage.get(PLAY_KEY, [])
}

// 收藏歌曲
export function saveFavorite(song) {
  let songs = storage.get(FAVORITE_KEY, [])
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, FAVORITE_MAX_LENGTH)
  storage.set(FAVORITE_KEY, songs)
  return songs
}

// 取消收藏歌曲
export function deleteFavorite(song) {
 let songs = storage.get(FAVORITE_KEY, [])
  deleteFromArray(songs, (item) => {
    return song.id === item.id
  })
  storage.set(FAVORITE_KEY, songs)
  return songs
}

export function loadFavorite() {
  return storage.get(FAVORITE_KEY, [])
}
