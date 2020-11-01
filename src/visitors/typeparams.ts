import { Node, TypeParameterDeclaration } from 'ts-morph'
import { makeDataType } from './datatypes'
import { isReservedWord } from './utils'

/** Checks to see if the type param has a constraint */
const hasConstraint = (param: TypeParameterDeclaration): boolean =>
    typeof param.getType().getConstraint() !== 'undefined'

/** Transform generic Type parameter from typescript form to nim for */
const transform = (node: TypeParameterDeclaration): string => {
    if (!hasConstraint(node)) {
        if (!isReservedWord(node.getText().trim())) {
            return node.getText().trim()
        } else {
            return `Js${node.getText().trim()}`
        }
    }
    return `: ${makeDataType(node.getType().getConstraintOrThrow())}`
}

/** Visitor for generic type parameters */
export const typeParamVisitor = (node: Node | Node[]): string => {
    if (Array.isArray(node)) {
        const nodes = node.map((n) => transform(n as TypeParameterDeclaration) + '')
        return `[${nodes.join(',')}]`
    }

    return `[${transform(node as TypeParameterDeclaration)}]`
}
