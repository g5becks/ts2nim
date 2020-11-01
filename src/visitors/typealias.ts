import { Node, TypeAliasDeclaration } from 'ts-morph'
import { buildTypeName, hasTypeParam } from '../utils'

export const typeAliasVisitor = (node: Node | Node[]): string => {
    const alias = node as TypeAliasDeclaration
    const name = buildTypeName(alias)
    if (hasTypeParam(alias)) {
        alias.getTypeParameters()
    }
    return ''
}
