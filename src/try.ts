import { Project } from 'ts-morph'
import { visit } from './visitors'

const proj = new Project({ tsConfigFilePath: 'tsconfig.scratch.json' })

const file = proj.getSourceFiles()[0]

const func = file.getFunctions()[0]

console.log(func.getTypeParameters().map((p) => p.getKindName()))
console.log(visit(func))
