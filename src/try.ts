import { Project, UnionTypeNode } from 'ts-morph'
import { unionTypeVisitor } from './visitors/union'

const proj = new Project({ tsConfigFilePath: 'tsconfig.scratch.json' })

const file = proj.getSourceFiles()[0]

//const func = file.getFunctions()[0]

const union = file.getTypeAliases()[1]

const node = union.getTypeNodeOrThrow() as UnionTypeNode
console.log(unionTypeVisitor(node))
/*
console.log(unionTypeVisitor(union.getTypeNodeOrThrow()))
console.log(functionVisitor(func))
*/

//file.forEachChildAsArray().forEach((child) => console.log(child.getKindName()))
