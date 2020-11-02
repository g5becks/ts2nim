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
    const params = visit(func.getParameters())
}
