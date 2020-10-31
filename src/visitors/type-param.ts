import { Node, Type, TypeParameterDeclaration } from 'ts-morph'
import { isReservedWord } from '../utils'
import { visit } from './root'

/** Checks to see if the type param has a constraint */
const hasConstraint = (param: TypeParameterDeclaration): boolean =>
    typeof param.getType().getConstraint() !== 'undefined'

const handleConstraint = (type: Type): string => {
    if (type.isAny()) {
        return 'any'
    }
    if (typ)
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
    return `: ${visit(node.getType().getConstraintOrThrow())}`
}
export const typeParamVisitor = (node: Node | Node[]): string => {
    const singleNode = node as TypeParameterDeclaration
    let nodes: TypeParameterDeclaration[] = []
    if (Array.isArray(node)) {
        for (const n of node) {
            nodes = nodes.concat(n as TypeParameterDeclaration)
        }
    }

    return '[]'
}
