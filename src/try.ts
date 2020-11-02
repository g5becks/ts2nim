import { Project } from 'ts-morph'

const proj = new Project({ tsConfigFilePath: 'tsconfig.scratch.json' })

const file = proj.getSourceFiles()[0]

const vars = file.getVariableDeclarations()

console.log(vars[0].getVariableStatement()?.getText())

// You Can Always Get The Type Of the TypeNode
/*
file.forEachChildAsArray().forEach((child) => console.log(child.getKindName()))
*/
