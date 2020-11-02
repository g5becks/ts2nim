import { FunctionTypeNode, Node } from 'ts-morph'
import { makeDataType } from './datatypes'
import { visit } from './visit'

export const functionTypeVisitor = (node: Node | Node[]): string => {
    const signature = node as FunctionTypeNode
    const params = visit(signature.getParameters())
    let builtParams: string[] = []
    let typeParams: string[] = []
    for (const param of params)
        const paramType =
            typeof param.getValueDeclaration() === 'undefined'
                ? 'any'
                : makeDataType(param.getValueDeclarationOrThrow().getType())
        builtParams = [...builtParams, `${paramName}: ${paramType}`]
    }
    if (signature.getTypeParameters().length) {
        for (const param of signature.getTypeParameters()) {
            typeParams = [...typeParams, makeDataType(param)]
        }
    }
    const returnType = makeDataType(signature.getReturnType(), true)
    const generic = typeParams.length ? `[${typeParams}]` : ''
    return `proc${generic}(${builtParams.join(',')}): ${returnType}`
}
