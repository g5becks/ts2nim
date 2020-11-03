import { Node, PropertySignature } from 'ts-morph'
import { capitalize, isReservedWord } from './utils'

const handleProperty = (prop: PropertySignature): string => {
    const name = prop.getName()
    const propName = isReservedWord(name) ? `js${capitalize(name)}` : name
    return `${propName}`
}
export const propertySignatureVisitor = (node: Node | Node[]): string => {
    return `${node}`
}
