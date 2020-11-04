import { Project } from 'ts-morph'

const proj = new Project({ tsConfigFilePath: 'tsconfig.scratch.json' })

const file = proj.getSourceFiles()[0]

const func = file.getFunctions()[0]

func.getTypeParameters()[0].getConstraintOrThrow().
/*
const union = file.getTypeAliases()[1]

const node = union.getTypeNodeOrThrow() as UnionTypeNode
console.log(unionTypeVisitor(node))
 */
/*
console.log(unionTypeVisitor(union.getTypeNodeOrThrow()))
console.log(functionVisitor(func))
*/

//file.forEachChildAsArray().forEach((child) => console.log(child.getKindName()))
