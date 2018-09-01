// jsonp封装
import originJSONP from 'jsonp'

export default function jsonp(url, data, option) {
  // data=>通过遍历参数对象，拼接成完成的url地址
  url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)
  return new Promise((resolve, reject) => { // 异步操作
    originJSONP(url, option, (err, data) => {
      if (!err) {
        resolve(data)
      } else {
        reject(err)
      }
    })
  })
}

function param(data) {
  let url = ''
  for (var k in data) {
    let value = data[k] !== undefined ? data[k] : ''
    url += `&${k} = ${encodeURIComponent(value)}` // 把字符串作为 URI 组件进行编码。
  }
  return url ? url.substring(1) : ''// 提取字符串中介于两个指定下标之间的字符。
}
