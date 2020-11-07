import { Project } from 'ts-morph'
import * as fs from 'fs'
import { generate } from './index'

const proj = new Project({ tsConfigFilePath: 'tsconfig.scratch.json' })

const file = proj.getSourceFiles()[0]

const data = generate(file)

fs.writeFileSync('data.nim', Buffer.from(data, 'utf-8'))
