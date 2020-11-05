import { Project } from 'ts-morph'
import { visit } from './visitors'

const proj = new Project({ tsConfigFilePath: 'tsconfig.scratch.json' })

const file = proj.getSourceFiles()[0]

const funcs = file.getTypeAliases()

console.log(funcs.map((f) => visit(f)))
