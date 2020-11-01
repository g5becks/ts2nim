import { ClassDeclaration, Node } from 'ts-morph'
import { capitalize, hasTypeParam, isReservedWord } from '../utils'

const classVisitor = (node: Node | Node[]): string => {
    const classs = node as ClassDeclaration
    const className = classs.getNameNodeOrThrow()?.getText().trim()
    const typeName = isReservedWord(className) ? `Js${capitalize(className)}` : capitalize(className)
    if (hasTypeParam(classs)) {
        classs.getTypeParameters()
    }
    return ''
}
