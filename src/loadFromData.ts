import fs from 'fs'
import csv from 'papaparse'
import path from 'path'

export default function loadFromData(...paths: string[]) {
  const data = fs.readFileSync(
    path.join(__dirname, '..', 'data', ...paths),
    'utf8'
  )
  return csv.parse(data, {
    dynamicTyping: true,
    header: true,
    skipEmptyLines: true,
  }).data
}
