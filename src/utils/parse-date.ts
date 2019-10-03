/**
 * Parse date.
 */

export function parseDate(date: any): Date {
  if (!date) return new Date()
  if (date instanceof Date) return date

  if (!/[^\d]+/g.test(date)) {
    date = date.toString().concat('000').substr(0, 13) * 1 // tslint:disable-line

    return new Date(date)
  }

  return new Date(date.toString().replace(/-/g, '/').replace(/T|(?:\.\d+)?Z/g, ' '))
}
