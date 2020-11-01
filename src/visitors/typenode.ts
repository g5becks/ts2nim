import { Type } from 'ts-morph'
const typesMap = new Map<string, string>([
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

const makeDataType = (type: Type): string => {
    return ''
}
