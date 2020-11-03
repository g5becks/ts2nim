import { FunctionDeclaration, Node } from 'ts-morph'
import { makeDataType } from './datatypes'
import { capitalize, isReservedWord } from './utils'
import { visit } from './visit'

export const functionVisitor = (node: Node | Node[]): string => {
    const func = node as FunctionDeclaration
    const funcName = func.getName()
    if (!funcName) {
        return makeDataType(func.getType())
    }
    const name = isReservedWord(funcName) ? `js${capitalize(funcName)}` : funcName
    const params = func.getParameters()
    const importParams = params.map((p) => (p.isRestParameter() ? '...#' : '#'))
    const builtParams = visit(params)
    return `proc ${name}*${visit(func.getTypeParameters())}(${builtParams}): ${visit(
        func.getReturnTypeNodeOrThrow(),
    )} {.importcpp:"${funcName}(${importParams})", nodecl.}`
}
