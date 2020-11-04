import { Node, VariableDeclaration, VariableDeclarationKind } from 'ts-morph'
import { makeDataType } from './datatypes'
import { capitalize, isReservedWord } from './utils'

const makeName = (v: VariableDeclaration): string => {
    const varName = v.getName().trim()
    return isReservedWord(varName) ? `js${capitalize(varName)}` : varName
}
export const variableVisitor = (node: Node): string => {
    const v = node as VariableDeclaration
    const k = v?.getVariableStatement()?.getDeclarationKind()
    const varKind = k === VariableDeclarationKind.Const ? 'let' : 'var'

    return `${varKind} ${makeName(v)}* {.importjs, nodecl.}: ${makeDataType(v.getType())}`
}
