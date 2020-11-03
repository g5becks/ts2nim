import { Node, TypeReferenceNode } from 'ts-morph'
import { makeDataType } from './datatypes'

const handleRef = (ref: TypeReferenceNode): string => {
    return makeDataType(ref.getType())
}
export const typeReferenceVisitor = (node: Node | Node[]): string => {
    if (Array.isArray(node)) {
        return node.map((n) => handleRef(n as TypeReferenceNode)).join(', ')
    }
    return handleRef(node as TypeReferenceNode)
}
