import {
    LiteralExpression,
    LiteralTypeNode,
    NumericLiteral,
    Project,
    StringLiteral,
    SyntaxKind,
    UnionTypeNode,
} from 'ts-morph'

const proj = new Project({ tsConfigFilePath: 'tsconfig.scratch.json' })

const file = proj.getSourceFiles()[0]

const cl = file.getFunctions()[0]

const g = file.getTypeAlias('TypeWithLit')

const belongsToFunction = (node: StringLiteral | NumericLiteral): boolean => {
    return Boolean(
        node.getFirstAncestorByKind(SyntaxKind.FunctionDeclaration) ||
            node.getFirstAncestorByKind(SyntaxKind.FunctionType) ||
            node.getFirstAncestorByKind(SyntaxKind.FunctionExpression) ||
            node.getFirstAncestorByKind(SyntaxKind.Constructor) ||
            node.getFirstAncestorByKind(SyntaxKind.ConstructorType),
    )
}

const un = g?.getTypeNodeOrThrow() as UnionTypeNode

un.getTypeNodes().forEach((t) => {
    const b = t as LiteralTypeNode
    console.log(belongsToFunction(b.getLiteral() as StringLiteral))
})
const types = cl.getParameters().map((p) => p.getTypeNodeOrThrow())

types.forEach((t) => {
    const n = t as LiteralTypeNode

    const lit = n.getLiteral()
    console.log(lit instanceof LiteralExpression)

    console.log(belongsToFunction(lit as StringLiteral))
})
