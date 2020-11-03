import { Node, PropertySignature } from 'ts-morph'
import { makeDataType } from './datatypes'
import { capitalize, isReservedWord } from './utils'

const handleProperty = (prop: PropertySignature): string => {
    const name = prop.getName()
    const propName = isReservedWord(name) ? `js${capitalize(name)}` : name
    return `${propName}: ${makeDataType(prop.getType())}`
}
export const propertySignatureVisitor = (node: Node | Node[]): string => {
    return `${node}`
}
