import { Project } from 'ts-morph'
import { typeLiteralVisitor } from './visitors/typeliteral'

const proj = new Project({ tsConfigFilePath: 'tsconfig.scratch.json' })

const file = proj.getSourceFiles()[0]

const types = file.getTypeAliases()[1]

console.log(typeLiteralVisitor(types.getTypeNodeOrThrow()))

// You Can Always Get The Type Of the TypeNode
/*
file.forEachChildAsArray().forEach((child) => console.log(child.getKindName()))
*/
