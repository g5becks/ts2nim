import { Node, Project, SyntaxKind } from 'ts-morph'
const proj = new Project({ tsConfigFilePath: 'tsconfig.scratch.json' })

const file = proj.getSourceFiles()[0]

file.getChildrenOfKind(SyntaxKind.ClassDeclaration)
file.forEachChildAsArray().forEach((child) => console.log(child.getKindName()))
const alias = file.getTypeAlias('SomeType')
const hasTypeParam = (node: Node): boolean => node.getChildrenOfKind(SyntaxKind.TypeParameter).length > 0
console.log(hasTypeParam(alias!))
