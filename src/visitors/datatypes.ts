import {Identifier, LiteralTypeNode, Node, Type, TypeReferenceNode} from 'ts-morph'
import { buildTypeName, isReservedWord } from './utils'
import { visit } from './visit'
const primitiveMap = new Map<string, string>([
    ['string', 'cstring'],
    ['boolean', 'bool'],
    ['any', 'any'],
    ['unknown', 'any'],
    ['number', 'int'],
    ['void', 'void'],
    ['null', '`null`'],
    ['undefined', 'undefined'],
    ['never', 'never'],
])

export const typesMap = new Map<string, string>([
    ['Record', 'Record'],
    ['Readonly', 'JsObj'],
    ['Array', 'JsArray'],
    ['Promise', 'Future'],
])

const visitPrimitive = (node: Node | Node[], type: string): string =>
    Array.isArray(node) ? node.map(() => type).join(', ') : type
export const numberVisitor = (node: Node | Node[]): string => visitPrimitive(node, 'int')

export const unknownVisitor = (node: Node | Node[]): string => visitPrimitive(node, 'any')
export const stringVisitor = (node: Node | Node[]): string => visitPrimitive(node, 'cstring')

export const booleanVisitor = (node: Node | Node[]): string => visitPrimitive(node, 'bool')

export const undefinedVisitor = (node: Node | Node[]): string => visitPrimitive(node, 'undefined')

const handleIdentifier = (node: Identifier): string => {
    const typeName = node.getText()
    if (typesMap.has(typeName)) {
        return typesMap.get(typeName)!
    }
    return isReservedWord(typeName) ? `Js${typeName}` : typeName
}
export const identifierVisitor = (node: Node | Node[]): string => {
    if (Array.isArray(node)) {
        return node.map((n) => handleIdentifier(n as Identifier)).join(', ')
    }
    return handleIdentifier(node as Identifier)
}

const handleRef = (ref: TypeReferenceNode): string => {
    const typeName = visit(ref.getTypeName())
    if (ref.getTypeArguments().length) {
        return `${buildTypeName(typeName)}[${visit(ref.getTypeArguments())}]`
    }
    return buildTypeName(typeName)
}
export const typeReferenceVisitor = (node: Node | Node[]): string => {
    if (Array.isArray(node)) {
        return node.map((n) => handleRef(n as TypeReferenceNode)).join(', ')
    }
    return handleRef(node as TypeReferenceNode)
}

const handlerLiteral = (lit: LiteralTypeNode): string => {
    lit.getLiteral()
}
export const literalTypeVisitor(node: Node| Node[]): string => {
    const n = node as LiteralTypeNode
}

export const makeDataType = (type: Type): string => {
    if (primitiveMap.has(type.getText())) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return primitiveMap.get(type.getText())!
    }

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
    // all literal types can be parsed and created before any other types
    // are generated
    if (type.isStringLiteral()) {
        return 'string'
    }

    if (type.isNumberLiteral()) {
        return 'int'
    }

    if (type.isUndefined()) {
        return 'undefined'
    }

    if (type.isBooleanLiteral()) {
        return type.getText().trim() === 'true' ? '`true`' : '`false`'
    }

    if (type.isNull()) {
        return '`null`'
    }
    // nothing to do here, if type is not a part of the same file, it has to be created manually - at least for now
    if (type.isClassOrInterface()) {
        return type.getText().trim()
    }

    // same as above
    if (type.isEnum() || type.isEnumLiteral()) {
        return 'any'
    }
    if (type.isAnonymous()) {
        if (type.getCallSignatures().length) {
            return visit(type.getCallSignatures()[0].getDeclaration())
        }
        if (type.isLiteral()) {
            return ''
        }
    }

    if (type.getText().startsWith('Record<')) {
        return `Record[${type
            .getTypeArguments()
            .map((arg) => makeDataType(arg))
            .join(', ')}]`
    }
    if (type.getText().startsWith('Promise<')) {
        return `Future[${type
            .getTypeArguments()
            .map((arg) => makeDataType(arg))
            .join(', ')}]`
    }

    if (type.isArray()) {
        // if it's an array - it probably has a type param
        if (type.getArrayElementType()) {
            return `JsArray[${makeDataType(type.getArrayElementType()!)}]`
        }
        return 'JsArray'
    }

    if (type.isTypeParameter()) {
        const typeText = type.getText()
        if (typeof type.getConstraint() === 'undefined') {
            return isReservedWord(typeText) ? `js${typeText}` : typeText
        } else {
            return isReservedWord(typeText)
                ? `js${typeText}: ${makeDataType(type.getConstraintOrThrow())}`
                : `${typeText}: ${makeDataType(type.getConstraintOrThrow())}`
        }
    }
    return 'any'
}
