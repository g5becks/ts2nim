import { Project } from 'ts-morph'
import * as fs from 'fs'
import { generate } from './index'

const proj = new Project({ tsConfigFilePath: 'tsconfig.scratch.json' })

const files = proj.getSourceFiles()

const data = generate(files)

fs.writeFileSync('data.nim', Buffer.from(data[0].source, 'utf-8'))
