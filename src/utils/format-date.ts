/**
 * Format date
 */
import { parseDate } from './parse-date'

const indexToWeek = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

export function formatDate(_date: any, format: string): string {
  const date = parseDate(_date) // tslint:disable-line

  const map = {
    M: date.getMonth() + 1, // month
    d: date.getDate(), // day
    D: indexToWeek[date.getDay()], // week day
    h: date.getHours(), // hour
    m: date.getMinutes(), // min
    s: date.getSeconds(), // sec
    q: Math.floor((date.getMonth() + 3) / 3), // season
    S: date.getMilliseconds(), // millisecond
  }

  format = format.replace(/[yMdDhmsqS]+/g, (all, t) => { // tslint:disable-line
    let v = map[t]
    if (v !== undefined) {
      if (all.length > 1) {
        v = `0${v}`
        v = v.substr(v.length - 2)
      }

      return v
    } else if (t === 'y') {
      return date.getFullYear().toString().substr(4 - all.length)
    }

    return all
  })

  return format
}

export default formatDate
