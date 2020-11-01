import { Signature, Symbol as Symb, Type } from 'ts-morph'
import { capitalize, isReservedWord } from './utils'
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

export const buildAnonymousProc = (signature: Signature): string => {
    const params: Symb[] = signature.getParameters()
    let builtParams: string[] = []
    let typeParams: string[] = []
    for (const param of params) {
        const paramName: string = !isReservedWord(param.getName())
            ? param.getName()
            : `js${capitalize(param.getName())}`
        const paramType =
            typeof param.getValueDeclaration() === 'undefined'
                ? 'any'
                : makeDataType(param.getValueDeclarationOrThrow().getType())
        builtParams = [...builtParams, `${paramName}: ${paramType}`]
    }
    if (signature.getTypeParameters().length) {
        for (const param of signature.getTypeParameters()) {
            typeParams = [...typeParams, makeDataType(param)]
        }
    }
    const returnType = makeDataType(signature.getReturnType())
    const generic = typeParams.length ? `[${typeParams}]` : ''
    return `proc${generic}(${builtParams.join(',')}): ${returnType}`
}
export const makeDataType = (type: Type, isReturnType = false): string => {
    if (type.isString() && isReturnType) {
        return 'string'
    }
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
            return buildAnonymousProc(type.getCallSignatures()[0])
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
