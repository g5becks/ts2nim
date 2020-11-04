import { Node, UnionTypeNode } from 'ts-morph'
import { visit } from './visitors'

const buildUnion = (union: UnionTypeNode): string => {
    const types = union.getTypeNodes().map((node) => visit(node))
    return types.join(' | ')
}
export const unionTypeVisitor = (node: Node | Node[]): string => {
    if (Array.isArray(node)) {
        return node.map((n) => buildUnion(n as UnionTypeNode)).join(`\n`)
    }
    return buildUnion(node as UnionTypeNode)
}
