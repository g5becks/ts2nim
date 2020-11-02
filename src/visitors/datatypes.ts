import { Type } from 'ts-morph'
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
        return 'JsObject'
    }

    if (type.getText().startsWith('Promise<')) {
        return `Future[${type
            .getTypeArguments()
            .map((arg) => makeDataType(arg))
            .join(',')}]`
    }

    if (type.isArray()) {
        // if it's an array - it probably has a type param
        if (type.getArrayElementType()) {
            return `JsArray[${makeDataType(type.getArrayElementType()!)}]`
        }
        return 'JsArray'
    }
    return 'any'
}
