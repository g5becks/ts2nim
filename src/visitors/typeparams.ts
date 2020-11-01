import { Node, Type, TypeParameterDeclaration } from 'ts-morph'
import { isReservedWord } from './utils'

/** Checks to see if the type param has a constraint */
const hasConstraint = (param: TypeParameterDeclaration): boolean =>
    typeof param.getType().getConstraint() !== 'undefined'

const handleConstraint = (type: Type): string => {
    return ''
}
/** Transform generic Type parameter from typescript form to nim for */
const transform = (node: TypeParameterDeclaration): string => {
    if (!hasConstraint(node)) {
        if (!isReservedWord(node.getText().trim())) {
            return node.getText().trim()
        } else {
            return `Js${node.getText().trim()}`
        }
    }
    return `: ${handleConstraint(node.getType().getConstraintOrThrow())}`
}
export const typeParamVisitor = (node: Node | Node[]): string => {
    if (Array.isArray(node)) {
        const nodes = node.map((n) => transform(n as TypeParameterDeclaration) + '')
        return `[${nodes.join(',')}]`
    }

    return `[${transform(node as TypeParameterDeclaration)}]`
}
