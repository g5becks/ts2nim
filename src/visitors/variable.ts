import { Node, VariableDeclaration, VariableDeclarationKind } from 'ts-morph'
import { makeDataType } from './datatypes'
import { capitalize, isReservedWord } from './utils'

const hasMultipleDeclarations = (v: VariableDeclaration): boolean =>
    Boolean(v?.getVariableStatement()?.getDeclarations()?.length)

const makeName = (v: VariableDeclaration): string => {
    const varName = v.getName().trim()
    return isReservedWord(varName) ? `js${capitalize(varName)}` : varName
}
export const variableVisitor = (node: Node | Node[]): string => {
    const v = node as VariableDeclaration
    const k = v?.getVariableStatement()?.getDeclarationKind()
    const varKind = k === VariableDeclarationKind.Const ? 'let' : 'var'
    if (hasMultipleDeclarations(v)) {
        let names: string[] = []
        for (const d of v.getVariableStatementOrThrow().getDeclarations()) {
            names = [...names, makeName(d)]
        }
        return `${varKind} ${names.join(' ,')}: ${makeDataType(v.getType())}`
    }

    return `${varKind} ${makeName(v)}*: ${makeDataType(v.getType())}`
}
