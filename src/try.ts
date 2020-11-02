import { Project } from 'ts-morph'
import { variableVisitor } from './visitors/variable'

const proj = new Project({ tsConfigFilePath: 'tsconfig.scratch.json' })

const file = proj.getSourceFiles()[0]

const vars = file.getVariableDeclarations()

for (const v of vars) {
    console.log(variableVisitor(v))
}

// You Can Always Get The Type Of the TypeNode
/*
file.forEachChildAsArray().forEach((child) => console.log(child.getKindName()))
*/
