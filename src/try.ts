import { Project, TypeLiteralNode } from 'ts-morph'

const proj = new Project({ tsConfigFilePath: 'tsconfig.scratch.json' })

const file = proj.getSourceFiles()[0]

const types = file.getTypeAliases()[1]

const lit = types.getTypeNodeOrThrow() as TypeLiteralNode

const method = lit.getMethods()[0]

const paramCount = method.getParameters().map((param) => '#')

// You Can Always Get The Type Of the TypeNode
/*
file.forEachChildAsArray().forEach((child) => console.log(child.getKindName()))
*/
