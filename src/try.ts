import { ArrayTypeNode, Project } from 'ts-morph'

const proj = new Project({ tsConfigFilePath: 'tsconfig.scratch.json' })

const file = proj.getSourceFiles()[0]

const func = file.getFunctions()[0]

const arr = func.getReturnTypeNodeOrThrow() as ArrayTypeNode
console.log(arr.getElementTypeNode().getType())

//file.forEachChildAsArray().forEach((child) => console.log(child.getKindName()))
