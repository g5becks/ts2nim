import { Node, Type, TypeParameterDeclaration } from 'ts-morph'
import { isReservedWord } from '../utils'
import { visit } from './root'

/** Checks to see if the type param has a constraint */
const hasConstraint = (param: TypeParameterDeclaration): boolean =>
    typeof param.getType().getConstraint() !== 'undefined'

const handleConstraint = (type: Type): string => {
    // TODO handle union type
    if (type.isUnion()) {
        return ''
    }

    if (type.isIntersection()) {
        return ''
    }
    // TODO implement generation of literal types
    // this can be done via a simple type and a proc that returns the val,
    // E.g. type `stringName` = string & proc newStringName(): `stringName` = stringName
    if (type.isStringLiteral() || type.isString()) {
        return 'string'
    }

    if (type.isNumber() || type.isNumberLiteral()) {
        return 'int'
    }

    if (type.isUndefined()) {
        return 'undefined'
    }

    if (type.isBoolean() || type.isBooleanLiteral()) {
        return 'bool'
    }

    if (type.isNull()) {
        return '`null`'
    }
    // TODO implement generation of classes and interfaces used for constraints
    if (type.isClassOrInterface()) {
        return 'JsObject'
    }

    if (type.isAny()) {
        return 'any'
    }
    // TODO fix this
    if (type.isEnum() || type.isEnumLiteral()) {
        return 'any'
    }
    if (type.isAnonymous()) {
        if (type.getCallSignatures().length) {
            return 'proc()'
        }
        return 'JsObject'
    }

    if (type.isArray()) {
        // if it's an array - it probably has a type param
        if (type.getArrayElementType()) {
            return `JsArray[${handleConstraint(type.getArrayElementType()!)}]`
        }
        return 'JsArray'
    }
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
