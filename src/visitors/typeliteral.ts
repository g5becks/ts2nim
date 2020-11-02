import { Node, TypeLiteralNode } from 'ts-morph'
import { visit } from './visit'

export const typeLiteralVisitor = (node: Node | Node[], parentName?: string): string => {
    const n = node as TypeLiteralNode
    if (n.getMethods().length) {
        const methods = visit(n.getMethods(), parentName)
    }
    return n.getMethods()[0].getKindName()
}
