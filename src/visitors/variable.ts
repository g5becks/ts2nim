import { Node, SyntaxKind, VariableDeclarationKind, VariableStatement } from 'ts-morph'
import { makeDataType } from './datatypes'
import { capitalize, isReservedWord } from './utils'

const hasMultipleDeclarations = (v: VariableStatement): boolean =>
    Boolean(v?.getVariableStatement()?.getDeclarations()?.length)

const makeName = (v: VariableStatement): string => {
    const varName = v.getChildrenOfKind(SyntaxKind.Identifier)[0].getText()
    return isReservedWord(varName) ? `js${capitalize(varName)}` : varName
}
export const variableVisitor = (node: Node | Node[]): string => {
    const v = node as VariableStatement
    const k = v?.getDeclarationKind()
    const varKind = k === VariableDeclarationKind.Const ? 'let' : 'var'
    if (hasMultipleDeclarations(v)) {
        let names: string[] = []
        for (const d of v.getDeclarations()) {
            names = [...names, makeName(d)]
        }
        return `${varKind} ${names.join(' ,')}: ${makeDataType(v.getType())}`
    }

    return `${varKind} ${makeName(v)}*: ${makeDataType(v.getType())}`
}
