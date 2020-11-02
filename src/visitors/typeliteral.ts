import { Node, TypeLiteralNode } from 'ts-morph'

export const typeLiteralVisitor = (node: Node | Node[]): string => {
    const n = node as TypeLiteralNode
    return n.getMethods()[0].getKindName()
}