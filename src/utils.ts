import {
    ClassDeclaration,
    FunctionDeclaration,
    FunctionTypeNode,
    MethodSignature,
    Node,
    SyntaxKind,
    TypeAliasDeclaration,
} from 'ts-morph'
import { visit } from './visitors'

const nimReserved = [
    'addr',
    'and',
    'as',
    'asm',
    'bind',
    'block',
    'break',
    'case',
    'cast',
    'concept',
    'const',
    'continue',
    'converter',
    'defer',
    'discard',
    'distinct',
    'div',
    'do',
    'elif',
    'else',
    'end',
    'enum',
    'except',
    'export',
    'finally',
    'for',
    'from',
    'func',
    'if',
    'import',
    'in',
    'include',
    'interface',
    'is',
    'isnot',
    'iterator',
    'let',
    'macro',
    'method',
    'mixin',
    'mod',
    'nil',
    'not',
    'notin',
    'object',
    'of',
    'or',
    'out',
    'proc',
    'ptr',
    'raise',
    'ref',
    'return',
    'shl',
    'shr',
    'static',
    'template',
    'try',
    'tuple',
    'type',
    'using',
    'var',
    'when',
    'while',
    'xor',
    'yield',
    'Object',
]

export const capitalize = (text: string): string => text.replace(/^\w/, (c) => c.toUpperCase())

export const lowerCase = (text: string): string => text.replace(/^\w/, (c) => c.toLowerCase())

export const isReservedWord = (word: string): boolean => nimReserved.includes(word)

export const hasTypeParam = (node: Node): boolean => node.getChildrenOfKind(SyntaxKind.TypeParameter).length > 0

export const buildVarName = (v: string): string => {
    const varName = v.trim()
    return isReservedWord(varName) ? `js${capitalize(varName)}` : varName
}

export const buildTypeName = (node: ClassDeclaration | TypeAliasDeclaration | string): string => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (typeof node === 'string') {
        return isReservedWord(node) ? `Js${Node}` : node
    }
    const name = node.getNameNode()!.getText().trim()
    return isReservedWord(name) ? `Js${capitalize(name)}` : capitalize(name)
}

// Builds type params for nodes that accept them.
export const buildTypeParams = (
    node: FunctionDeclaration | FunctionTypeNode | MethodSignature | TypeAliasDeclaration,
): string =>
    node.getTypeParameters().length
        ? `[${node
              .getTypeParameters()
              .map((p) => visit(p))
              .join(', ')}]`
        : ''

// Builds function parameters for functionLike nodes
export const buildParams = (node: FunctionTypeNode | FunctionDeclaration | MethodSignature): string =>
    node
        .getParameters()
        .map((param) => visit(param))
        .join(', ')

// Builds return type for functionLike nodes
export const buildReturnType = (node: FunctionTypeNode | FunctionDeclaration | MethodSignature): string =>
    node.getReturnTypeNode() ? visit(node.getReturnTypeNodeOrThrow()) : 'any'

// Builds FFI params for functionLike nodes
export const buildFFiParams = (node: FunctionDeclaration | FunctionTypeNode | MethodSignature): string =>
    node
        .getParameters()
        .map((p) => (p.isRestParameter() ? '...#' : '#'))
        .join(', ')
