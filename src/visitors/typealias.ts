import { Node, TypeAliasDeclaration } from 'ts-morph'
import { buildTypeName, hasTypeParam } from './utils'
import { visit } from './visit'

export const typeAliasVisitor = (node: Node | Node[]): string => {
    const alias = node as TypeAliasDeclaration
    const name = buildTypeName(alias)
    const typeParams = hasTypeParam(alias) ? visit(alias.getTypeParameters()) : ''

    return `type ${name}*${typeParams} = ref object`
}
