import { Project } from 'ts-morph'
import { visit } from './visitors'
import * as fs from 'fs'

const proj = new Project({ tsConfigFilePath: 'tsconfig.scratch.json' })

const file = proj.getSourceFiles()[0]

const cl = file.forEachChildAsArray()

const data = cl.map((c) => visit(c)).join('\n')

fs.writeFileSync('data.nim', Buffer.from(data, 'utf-8'))
