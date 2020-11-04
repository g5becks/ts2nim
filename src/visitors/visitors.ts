import events from 'events'
import {
    ArrayTypeNode,
    BooleanLiteral,
    ClassDeclaration,
    FunctionDeclaration,
    FunctionTypeNode,
    Identifier,
    LiteralTypeNode,
    MethodSignature,
    Node,
    NullLiteral,
    ParameterDeclaration,
    PropertySignature,
    SourceFile,
    TypeAliasDeclaration,
    TypeLiteralNode,
    TypeNode,
    TypeParameterDeclaration,
    TypeReferenceNode,
    UnionTypeNode,
    VariableDeclaration,
    VariableDeclarationKind,
} from 'ts-morph'

import { typeReferenceVisitor, typesMap } from './datatypes'
import {
    buildFFIParams,
    buildParams,
    buildReturnType,
    buildTypeName,
    buildTypeParams,
    buildVarName,
    hasTypeParam,
    isReservedWord,
} from './utils'
import { visitorMap } from './visitormap'

type DoneEvent = { message: 'Done' }

const isDone = (event: any): event is DoneEvent =>
    typeof event === 'object' && 'message' in event && event.message === 'Done'
type NodeVisitor = (node: Node | TypeNode, parentName?: string) => string | DoneEvent

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const pass = (_node: Node | TypeNode) => ''
/** Visitor for SyntaxKind.ArrayType */
const arrayTypeVisitor = (node: Node): string => visit((node as ArrayTypeNode).getElementTypeNode())

/** Visitor for SyntaxKind.ClassDeclaration */
const classVisitor = (node: Node): string => {
    const classs = node as ClassDeclaration
    const name = buildTypeName(classs)
    if (hasTypeParam(classs)) {
        classs.getTypeParameters()
    }
    return name
}

/** Visitor for SyntaxKind.FunctionDeclaration */
const functionVisitor = (node: Node): string => {
    const func = node as FunctionDeclaration
    if (!func.getName()) {
        return visit(node)
    }
    const name = buildVarName(func.getName()!)
    return `proc ${buildVarName(name)}*${buildTypeParams(func)}(${buildParams(func)}): ${buildReturnType(
        func,
    )} {.importcpp:"${name}(${buildFFIParams(func)})", nodecl.}`
}

/** Visitor for SyntaxKind.FunctionType */
const functionTypeVisitor = (node: Node | Node[]): string => {
    const func = node as FunctionTypeNode
    return `proc${buildTypeParams(func)}(${buildParams(func)}): ${buildReturnType(func)}`
}

/** Visitor for SyntaxKind.MethodSignature */
const methodSignatureVisitor = (node: Node | Node[], parentName?: string): string => {
    const method = node as MethodSignature
    const name = buildVarName(method.getName())
    return `method ${name}*${buildTypeParams(method)}(self: ${parentName}, ${buildParams(method)}): ${buildReturnType(
        method,
    )} {.importcpp: """#.${name}(${buildFFIParams(method)})""", nodecl .}
    `
}

/** Visitor for SyntaxKind.Parameter */
const parameterVisitor = (node: Node): string => {
    const param = node as ParameterDeclaration
    const name = buildVarName(param.getName())
    const paramType = param.getTypeNode() ? visit(param.getTypeNodeOrThrow()) : 'any'
    return param.isRestParameter() ? `${name}: varargs[${paramType}]` : `${name}: ${paramType}`
}

/** Visitor for SyntaxKind.PropertySignature */
const propertySignatureVisitor = (node: Node): string => {
    const prop = node as PropertySignature
    const propType = prop.getTypeNode() ? visit(prop.getTypeNodeOrThrow()) : 'any'
    return `${buildVarName(prop.getName())}: ${propType}`
}

/** Visitor for SyntaxKind.TypeAliasDeclaration */
const typeAliasVisitor = (node: Node): string => {
    const alias = node as TypeAliasDeclaration
    const props = alias.getTypeNode() ? visit(alias.getTypeNodeOrThrow()) : ''
    return `type ${buildTypeName(alias)}*${buildTypeParams(alias)} = ref object
                ${props}
                `
}

/** Visitor for SyntaxKind.TypeLiteral */
const typeLiteralVisitor = (node: Node, parentName?: string): string => {
    const n = node as TypeLiteralNode
    const methods = n.getMethods()
    n.getMethods()
        .map((method) => visit(method, parentName))
        .join('\n')

    const properties = n
        .getProperties()
        .map((prop) => visit(prop))
        .join(', ')

    return parentName ? properties + `\n` + methods : `JsObj[tuple[${properties}]]`
}

/** Visitor for SyntaxKind.TypeParameter */
const typeParamVisitor = (node: Node): string => {
    const param = node as TypeParameterDeclaration
    const paramName = buildTypeName(param.getText())
    return typeof param.getConstraint() !== 'undefined'
        ? `${paramName}`
        : `${paramName}: ${visit(param.getConstraintOrThrow())}`
}

/** Visitor for SyntaxKind.UnionType */
const unionTypeVisitor = (node: Node): string =>
    (node as UnionTypeNode)
        .getTypeNodes()
        .map((n) => visit(n))
        .join(' | ')

/** Visitor for SyntaxKind.VariableDeclaration */
const variableVisitor = (node: Node): string => {
    const v = node as VariableDeclaration
    const k = v?.getVariableStatement()?.getDeclarationKind()
    const varKind = k === VariableDeclarationKind.Const ? 'let' : 'var'
    return `${varKind} ${buildVarName(v.getName())}* {.importcpp, nodecl.}: ${visit(v.getTypeNodeOrThrow())}`
}

/** Visitor for SyntaxKind. */
const numberVisitor = (_node: Node): string => 'int'

/** Visitor for SyntaxKind. */
const unknownVisitor = (_node: Node): string => 'any'

/** Visitor for SyntaxKind. */
const stringVisitor = (_node: Node): string => 'cstring'

/** Visitor for SyntaxKind. */
const booleanVisitor = (_node: Node): string => 'bool'

/** Visitor for SyntaxKind. */
const undefinedVisitor = (_node: Node): string => 'undefined'

/** Visitor for SyntaxKind. */
const identifierVisitor = (node: Node): string => {
    const name = node.getText().trim()
    return typesMap.has(name) ? typesMap.get(name)! : buildTypeName(name)
}

/** Visitor for SyntaxKind. */
const typeReferenceVisitor = (node: Node): string => {
    const ref = node as TypeReferenceNode
    const typeName = visit(ref.getTypeName())
    if (ref.getTypeArguments().length) {
        return `${buildTypeName(typeName)}[${ref
            .getTypeArguments()
            .map((n) => visit(n))
            .join(', ')}]`
    }
    return buildTypeName(typeName)
}

const handlerLiteral = (lit: LiteralTypeNode): string => {
    const litType = lit.getLiteral()
    if (litType instanceof NullLiteral) {
        return 'null'
    }
    if (litType instanceof BooleanLiteral) {
        return litType.getLiteralValue() ? '`true`' : '`false`'
    }

    return 'any'
}
export const literalTypeVisitor = (node: Node): string => {
    if (Array.isArray(node)) {
        return node.map((n) => handlerLiteral(n as LiteralTypeNode)).join(', ')
    }
    return handlerLiteral(node as LiteralTypeNode)
}

const emitter = new events.EventEmitter()

emitter.addListener('Done', () => {
    console.log('conversion complete')
    process.exit()
})

const visit = (node: Node | TypeNode, parentName?: string): string => {
    if (visitorMap.has(node.getKind())) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const data = visitorMap.get(node.getKind())!(node, parentName)
        if (!isDone(data)) {
            return data
        } else {
            emitter.emit(data.message)
            return ''
        }
    }
    return ''
}

export const generate = (file: SourceFile): string =>
    file
        .forEachChildAsArray()
        .map((child) => visit(child))
        .join()

export {
    variableVisitor,
    unionTypeVisitor,
    typeReferenceVisitor,
    typeParamVisitor,
    typeLiteralVisitor,
    typeAliasVisitor,
    parameterVisitor,
    methodSignatureVisitor,
    functionTypeVisitor,
    functionVisitor,
    classVisitor,
    NodeVisitor,
    arrayTypeVisitor,
    pass,
    DoneEvent,
    visit,
    propertySignatureVisitor,
    numberVisitor,
    undefinedVisitor,
    stringVisitor,
    unknownVisitor,
    booleanVisitor,
    identifierVisitor,
}
