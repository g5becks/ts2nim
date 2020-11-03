import { Project, UnionTypeNode } from 'ts-morph'

const proj = new Project({ tsConfigFilePath: 'tsconfig.scratch.json' })

const file = proj.getSourceFiles()[0]

const types = file.getTypeAliases()[0]

const lit = types.getTypeNodeOrThrow() as UnionTypeNode

console.log(lit.getTypeNodes().map((node) => node.getText()))

// You Can Always Get The Type Of the TypeNode
/*
file.forEachChildAsArray().forEach((child) => console.log(child.getKindName()))
*/
