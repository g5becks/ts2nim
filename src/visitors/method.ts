import { MethodSignature, Node } from 'ts-morph'
import { makeDataType } from './datatypes'
import { visit } from './visit'

export const methodSignatureVisitor = (node: Node | Node[], parentName?: string): string => {
    const method = node as MethodSignature
    const placeHolders = method.getParameters().map(() => '#')
    return `method ${method.getName()}*${visit(method.getTypeParameters())}(self: ${parentName}, ${visit(
        method.getParameters(),
    )}): ${makeDataType(method.getReturnType())} {.importjs: """#.${method.getName()}(${placeHolders.join(
        ', ',
    )})""", nodecl .}`
}
