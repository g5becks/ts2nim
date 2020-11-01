import { ClassDeclaration, Node } from 'ts-morph'
import { buildTypeName, hasTypeParam } from '../utils'

export const classVisitor = (node: Node | Node[]): string => {
    const classs = node as ClassDeclaration
    const name = buildTypeName(classs)
    if (hasTypeParam(classs)) {
        classs.getTypeParameters()
    }
    return ''
}
