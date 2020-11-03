import { Node, TypeLiteralNode } from 'ts-morph'
import { visit } from './visit'

export const typeLiteralVisitor = (node: Node | Node[], parentName?: string): string => {
    const n = node as TypeLiteralNode
    let methods = ''
    if (n.getMethods().length) {
        methods = visit(n.getMethods(), parentName)
    }
    const properties = visit(n.getProperties())
    if (parentName) {
        return properties + methods
    }
    return `JsObj[tuple[${properties}]]`
}
