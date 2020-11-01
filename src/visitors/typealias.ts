import { Node, TypeAliasDeclaration } from 'ts-morph'
import { capitalize, hasTypeParam, isReservedWord } from '../utils'

export const typeAliasVisitor = (node: Node | Node[]): string => {
    const alias = node as TypeAliasDeclaration
    const name = alias.getNameNode().getText().trim()
    const typeName = isReservedWord(name) ? `Js${capitalize(name)}` : capitalize(name)
    if (hasTypeParam(alias)) {
        alias.getTypeParameters()
    }
    return ''
}
