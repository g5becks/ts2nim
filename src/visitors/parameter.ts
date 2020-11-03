import { Node, ParameterDeclaration } from 'ts-morph'
import { makeDataType } from './datatypes'
import { capitalize, isReservedWord } from './utils'

export const hasRestParam = (params: ParameterDeclaration[]): boolean => params.some((param) => param.isRestParameter())
const handleParam = (param: ParameterDeclaration): string => {
    const name = !isReservedWord(param.getName()) ? param.getName() : `js${capitalize(param.getName())}`
    const paramType = makeDataType(param.getType())
    if (param.isRestParameter()) {
        return `${name}: varargs[${paramType}]`
    }
    return `${name}: ${paramType}`
}
export const parameterVisitor = (node: Node | Node[]): string => {
    if (Array.isArray(node)) {
        let params: string[] = []
        for (const n of node) {
            params = [...params, handleParam(n as ParameterDeclaration)]
        }
        return params.join(' ,')
    } else {
        return handleParam(node as ParameterDeclaration)
    }
}
