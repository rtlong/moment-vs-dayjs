import fs from 'fs'
import { map, forEachObjIndexed } from 'ramda'
import moment from 'moment-timezone'
import dayjs from './dayjs.js'

const timezones = ['America/Los_Angeles', 'UTC']
const timeStrings = {
  date: '2022-12-13',
  withoutZone: '2022-12-13T11:10:09',
  withoutZone_ms: '2022-12-13T11:10:09.000',
  iso8601_Z: '2022-12-13T11:10:09Z',
  iso8601_ms_Z: '2022-12-13T11:10:09.000Z',
  iso8601_ms_offset: '2022-12-13T11:10:09.000-04:00',
  iso8601_offset: '2022-12-13T11:10:09-07:00'
}

const format = d => d?.toISOString()
const mapFormat = map(format)

const truthTable = []

  describe.each([...timezones])('_.tz.setDefault(%p)', defaultTz => {
    moment.tz.setDefault(defaultTz)
    dayjs.tz.setDefault(defaultTz)

    const momentValues = map(s => {
      try {
        return moment(s)
      } catch (e) {
        return e
      }
    }, timeStrings)
    const dayjsValues = map(dayjs, timeStrings)
    const dayjsTzValues = map(s => dayjs.tz(s), timeStrings)
    const dayjsValuesConverted = map(s => dayjs(s).tz(), timeStrings)

    forEachObjIndexed((v, idx) => {
      truthTable.push({
        defaultTz,
        v,
        'moment(v)': format(momentValues[idx]),
        'dayjs(v)': format(dayjsValues[idx]),
        'dayjs.tz(v)': format(dayjsTzValues[idx]),
        'dayjs(v).tz()': format(dayjsValuesConverted[idx])
      })
    }, timeStrings)

    test('moment(v) vs dayjs(v)', () => {
      expect(mapFormat(dayjsValues)).toEqual(mapFormat(momentValues))
    })
    test('moment(v) vs dayjs.tz(v)', () => {
      expect(mapFormat(dayjsTzValues)).toEqual(mapFormat(momentValues))
    })
    test('moment(v) vs dayjs(v).tz()', () => {
      expect(mapFormat(dayjsValuesConverted)).toEqual(mapFormat(momentValues))
    })
  })

afterAll(() => {
  fs.writeFileSync('truth_table.json', JSON.stringify(truthTable))
})
