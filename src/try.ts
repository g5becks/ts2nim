import { Project } from 'ts-morph'
import { visit } from './visitors'
import * as fs from 'fs'
const proj = new Project({ tsConfigFilePath: 'tsconfig.scratch.json' })

const file = proj.getSourceFiles()[0]

const kids = file.forEachChildAsArray()

kids.forEach((kid) => console.log(kid.getKindName()))
const data = kids.map((f) => visit(f)).join('\n')

console.log(data)
fs.writeFileSync('data.nim', Buffer.from(data, 'utf-8'))
