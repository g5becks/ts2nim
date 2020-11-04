import { Project, SyntaxKind, TypeReferenceNode, UnionTypeNode } from 'ts-morph'

const proj = new Project({ tsConfigFilePath: 'tsconfig.scratch.json' })

const file = proj.getSourceFiles()[0]

//const func = file.getFunctions()[0]

const union = file.getTypeAliases()[1]

const node = union.getTypeNodeOrThrow() as UnionTypeNode
console.log(node.getTypeNodes().map((n) => n.getKindName()))
console.log(
    node
        .getTypeNodes()
        .filter((n) => n.getKind() === SyntaxKind.TypeReference)
        .map((n) => {
            const v = n as TypeReferenceNode
            console.log(v.getTypeName().getKindName())
            return v.getTypeArguments().map((c) => c.getKindName())
        }),
)
/*
console.log(unionTypeVisitor(union.getTypeNodeOrThrow()))
console.log(functionVisitor(func))
*/

//file.forEachChildAsArray().forEach((child) => console.log(child.getKindName()))
