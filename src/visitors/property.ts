import { Node, PropertySignature } from 'ts-morph'
import { capitalize, isReservedWord } from './utils'
import { visit } from './visit'

const handleProperty = (prop: PropertySignature): string => {
    const name = prop.getName()
    const propName = isReservedWord(name) ? `js${capitalize(name)}` : name
    return `${propName}: ${visit(prop.getTypeNodeOrThrow())}`
}
export const propertySignatureVisitor = (node: Node | Node[]): string => {
    if (Array.isArray(node)) {
        node.forEach((n) => console.log(n.getText()))
        return node.map((n) => handleProperty(n as PropertySignature)).join(', ')
    }
    return `${handleProperty(node as PropertySignature)}`
}
