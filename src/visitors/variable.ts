import { Node, VariableDeclarationKind, VariableStatement } from 'ts-morph'

const hasMultipleDeclarations = (v: VariableStatement): boolean => v.getDeclarations().length > 1
export const variableVisitor = (node: Node | Node[]): string => {
    const v = node as VariableStatement
    const k = v.getDeclarationKind()
    const varKind = k === VariableDeclarationKind.Const ? 'let' : 'var'
}
