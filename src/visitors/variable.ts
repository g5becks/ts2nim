import { Node, VariableDeclaration, VariableDeclarationKind, VariableStatement } from 'ts-morph'
import { capitalize, isReservedWord } from './utils'

const hasMultipleDeclarations = (v: VariableStatement): boolean => v.getDeclarations().length > 1

const handleDeclaration = (v: VariableDeclaration): string => {
    const varName = v.getName().trim()
    const name = isReservedWord(varName) ? `js${capitalize(varName)}` : varName
}
export const variableVisitor = (node: Node | Node[]): string => {
    const v = node as VariableStatement
    const k = v.getDeclarationKind()
    const varKind = k === VariableDeclarationKind.Const ? 'let' : 'var'
    if (hasMultipleDeclarations(v)) {
    }
}
