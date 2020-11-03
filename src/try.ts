import { Project } from 'ts-morph'
import { functionVisitor } from './visitors/function'

const proj = new Project({ tsConfigFilePath: 'tsconfig.scratch.json' })

const file = proj.getSourceFiles()[0]

const func = file.getFunctions()[0]

console.log(functionVisitor(func))

//file.forEachChildAsArray().forEach((child) => console.log(child.getKindName()))
