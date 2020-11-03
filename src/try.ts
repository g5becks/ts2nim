import { Project } from 'ts-morph'

const proj = new Project({ tsConfigFilePath: 'tsconfig.scratch.json' })

const file = proj.getSourceFiles()[0]

const func = file.getFunctions()[0]

console.log(func.getParameters())

//file.forEachChildAsArray().forEach((child) => console.log(child.getKindName()))
