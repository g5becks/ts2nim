import events from 'events'
import {
    ArrayTypeNode,
    ClassDeclaration,
    FunctionDeclaration,
    FunctionTypeNode,
    MethodSignature,
    Node,
    ParameterDeclaration,
    PropertySignature,
    SourceFile,
    TypeAliasDeclaration,
    TypeLiteralNode,
    TypeNode,
    TypeParameterDeclaration,
    UnionTypeNode,
    VariableDeclaration,
    VariableDeclarationKind,
} from 'ts-morph'

import { makeDataType, typeReferenceVisitor } from './datatypes'
import {
    buildFFIParams,
    buildParams,
    buildReturnType,
    buildTypeName,
    buildTypeParams,
    buildVarName,
    capitalize,
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
    const placeHolders = method.getParameters().map(() => '#')
    return `method ${method.getName()}*${visit(method.getTypeParameters())}(self: ${parentName}, ${visit(
        method.getParameters(),
    )}): ${makeDataType(method.getReturnType())} {.importcpp: """#.${method.getName()}(${placeHolders.join(
        ', ',
    )})""", nodecl .}
    `
}

/** Visitor for SyntaxKind.Parameter */
const parameterVisitor = (node: Node): string => {
    const param = node as ParameterDeclaration
    const name = !isReservedWord(param.getName()) ? param.getName() : `js${capitalize(param.getName())}`
    const paramType = makeDataType(param.getType())
    if (param.isRestParameter()) {
        return `${name}: varargs[${paramType}]`
    }
    return `${name}: ${paramType}`
}

/** Visitor for SyntaxKind.PropertySignature */
const propertySignatureVisitor = (node: Node): string => {
    const prop = node as PropertySignature
    const name = prop.getName()
    const propName = isReservedWord(name) ? `js${capitalize(name)}` : name
    return `${propName}: ${visit(prop.getTypeNodeOrThrow())}`
}

/** Visitor for SyntaxKind.TypeAliasDeclaration */
const typeAliasVisitor = (node: Node): string => {
    const alias = node as TypeAliasDeclaration
    const name = buildTypeName(alias)
    const params = alias
        .getTypeParameters()
        .map((param) => visit(param))
        .join(', ')
    const typeParams = params.length ? `[${params}]` : ''

    return `type ${name}*${typeParams} = ref object`
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
    const paramName = buildTypeName(param.getText().trim())
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
}
