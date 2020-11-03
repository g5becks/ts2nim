import { ArrayTypeNode, Node } from 'ts-morph'
import { visit } from './visit'

const handleNode = (node: ArrayTypeNode): string => visit(node.getElementTypeNode())

export const arrayTypeVisitor = (node: Node | Node[]): string => {
    if (Array.isArray(node)) {
        return node.map((n) => handleNode(n as ArrayTypeNode)).join(',')
    }
    return handleNode(node as ArrayTypeNode)
}
