// 把歌手相同信息封装成对象
export default class Singer {
  constructor({id, name}) {
    this.id = id
    this.name = name
    this.avatar = `https://y.gtimg.cn/music/photo_new/T001R150x150M000${id}.jpg?max_age=2592000` // 歌手头像， 拼接而成
  }
}
