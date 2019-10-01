import fs from 'fs'
import csv from 'papaparse'
import path from 'path'

export default function saveToData(data: any[], ...paths: string[]) {
  fs.writeFileSync(
    path.join(__dirname, '..', 'data', ...paths),
    csv.unparse(data)
  )
}
