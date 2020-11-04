import { FunctionTypeNode, Node } from 'ts-morph'
import { makeDataType } from './datatypes'
import { visit } from './visitors'

export const functionTypeVisitor = (node: Node | Node[]): string => {
    const signature = node as FunctionTypeNode
    const returnType = makeDataType(signature.getReturnType())
    return `proc${visit(signature.getTypeParameters())}(${visit(signature.getParameters())}): ${returnType}`
}
