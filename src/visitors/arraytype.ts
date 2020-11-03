import { ArrayTypeNode, Node } from 'ts-morph'

const handleNode = (node: ArrayTypeNode): string => {
    node.getElementTypeNode()
}
export const arrayTypeVisitor = (node: Node | Node[]): string => {
    if (Array.isArray(node)) {
    }
}
