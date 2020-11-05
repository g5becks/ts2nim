import {
    ArrayTypeNode,
    BooleanLiteral,
    ClassDeclaration,
    FunctionDeclaration,
    FunctionTypeNode,
    LiteralTypeNode,
    MethodSignature,
    Node,
    NullLiteral,
    ParameterDeclaration,
    PropertySignature,
    SyntaxKind,
    TypeAliasDeclaration,
    TypeLiteralNode,
    TypeNode,
    TypeParameterDeclaration,
    TypeReferenceNode,
    UnionTypeNode,
    VariableDeclaration,
    VariableDeclarationKind,
} from 'ts-morph'

import events from 'events'

const typesMap = new Map<string, string>([
    ['Record', 'Record'],
    ['Readonly', 'JsObj'],
    ['Array', 'JsArray'],
    ['Promise', 'Future'],
])

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
    )} {.importcpp:"${name}(${buildFFiParams(func)})", nodecl.}`
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
    )} {.importcpp: """#.${name}(${buildFFiParams(method)})""", nodecl .}
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
const propertySignatureVisitor = (node: Node, parentName?: string): string => {
    const prop = node as PropertySignature
    const propType = prop.getTypeNode() ? visit(prop.getTypeNodeOrThrow()) : 'any'
    // if property belongs to a parent node (type alias), insert it on a new line
    return `${buildVarName(prop.getName())}: ${propType} ${parentName ? '\n' : ''}`
}

/** Visitor for SyntaxKind.TypeAliasDeclaration */
const typeAliasVisitor = (node: Node): string => {
    const alias = node as TypeAliasDeclaration
    const ref = alias.getTypeNode()?.getKind() === SyntaxKind.TypeLiteral ? 'ref object\n' : ''
    const typeName = buildTypeName(alias.getName())
    const props = alias.getTypeNode() ? visit(alias.getTypeNodeOrThrow(), typeName) : ''
    return `type ${buildTypeName(alias)}*${buildTypeParams(alias, typeName)} = ${ref}${props}`
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
        .map((prop) => visit(prop, parentName))
        .join(parentName ? '' : ', ') // add comma if prop has no parent node.

    return parentName ? properties + `\n` + methods : `JsObj[tuple[${properties}]]`
}

/** Visitor for SyntaxKind.TypeParameter */
const typeParamVisitor = (node: Node): string => {
    const param = node as TypeParameterDeclaration
    const paramName = buildTypeName(param.getName())
    console.log(param.getConstraint()?.getText())
    console.log(param.getConstraint()?.getKindName())
    return typeof param.getConstraint() === 'undefined'
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

/** Visitor for SyntaxKind.NumberKeyword */
const numberVisitor = (_node: Node): string => 'int'

/** Visitor for SyntaxKind.UnknownKeyword */
const unknownVisitor = (_node: Node): string => 'any'

/** Visitor for SyntaxKind.StringKeyword */
const stringVisitor = (_node: Node): string => 'cstring'

/** Visitor for SyntaxKind.BooleanKeyword */
const booleanVisitor = (_node: Node): string => 'bool'

/** Visitor for SyntaxKind.UndefinedKeyword */
const undefinedVisitor = (_node: Node): string => 'undefined'

/** Visitor for SyntaxKind.Identifier */
const identifierVisitor = (node: Node): string => {
    const name = node.getText().trim()
    return typesMap.has(name) ? typesMap.get(name)! : buildTypeName(name)
}

/** Visitor for SyntaxKind.TypeReference */
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

/** Visitor for SyntaxKind.LiteralType */
const literalTypeVisitor = (node: Node): string => {
    const lit = node as LiteralTypeNode
    const litType = lit.getLiteral()
    if (litType instanceof NullLiteral) {
        return 'null'
    }
    if (litType instanceof BooleanLiteral) {
        return litType.getLiteralValue() ? '`true`' : '`false`'
    }

    return 'any'
}

const emitter = new events.EventEmitter()
emitter.addListener('Done', () => {
    console.log('conversion complete')
    process.exit()
})

type DoneEvent = { message: 'Done' }

const isDone = (event: any): event is DoneEvent =>
    typeof event === 'object' && 'message' in event && event.message === 'Done'

type NodeVisitor = (node: Node | TypeNode, parentName?: string) => string | DoneEvent

export const visit = (node: Node | TypeNode, parentName?: string): string => {
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const pass = (_node: Node | TypeNode) => ''

const visitorMap = new Map<number, NodeVisitor>([
    [SyntaxKind.Unknown, pass],
    [SyntaxKind.EndOfFileToken, (_node: Node): DoneEvent => ({ message: 'Done' })],
    [SyntaxKind.SingleLineCommentTrivia, pass], // pass
    [SyntaxKind.MultiLineCommentTrivia, pass], // pass
    [SyntaxKind.NewLineTrivia, pass], // pass
    [SyntaxKind.WhitespaceTrivia, pass], // pass
    [SyntaxKind.ShebangTrivia, pass], // pass
    [SyntaxKind.ConflictMarkerTrivia, pass], // pass
    [SyntaxKind.NumericLiteral, pass], // TODO check if this needs conversion
    [SyntaxKind.BigIntLiteral, pass], // TODO check if this needs conversion
    [SyntaxKind.StringLiteral, pass], // TODO check if this needs conversion
    [SyntaxKind.JsxText, pass], // pass
    [SyntaxKind.JsxTextAllWhiteSpaces, pass], // pass
    [SyntaxKind.RegularExpressionLiteral, pass], // pass
    [SyntaxKind.NoSubstitutionTemplateLiteral, pass], // pass
    [SyntaxKind.TemplateHead, pass], // pass
    [SyntaxKind.TemplateMiddle, pass], // pass
    [SyntaxKind.TemplateTail, pass], // pass
    [SyntaxKind.OpenBraceToken, pass], // pass
    [SyntaxKind.CloseBraceToken, pass], // pass
    [SyntaxKind.OpenParenToken, pass], // pass
    [SyntaxKind.CloseParenToken, pass], // pass
    [SyntaxKind.OpenBracketToken, pass], // pass
    [SyntaxKind.CloseBracketToken, pass], // pass
    [SyntaxKind.DotToken, pass], // pass
    [SyntaxKind.DotDotDotToken, pass], // pass
    [SyntaxKind.SemicolonToken, pass], // pass
    [SyntaxKind.CommaToken, pass], // pass
    [SyntaxKind.QuestionDotToken, pass], // pass
    [SyntaxKind.LessThanToken, pass], // pass
    [SyntaxKind.LessThanSlashToken, pass], // pass
    [SyntaxKind.GreaterThanToken, pass], // pass
    [SyntaxKind.LessThanEqualsToken, pass], // pass
    [SyntaxKind.GreaterThanEqualsToken, pass], // pass
    [SyntaxKind.EqualsEqualsToken, pass], // pass
    [SyntaxKind.ExclamationEqualsToken, pass], // pass
    [SyntaxKind.EqualsEqualsEqualsToken, pass], // pass
    [SyntaxKind.ExclamationEqualsEqualsToken, pass], // pass
    [SyntaxKind.EqualsGreaterThanToken, pass], // pass
    [SyntaxKind.PlusToken, pass], // pass
    [SyntaxKind.MinusToken, pass], // pass
    [SyntaxKind.AsteriskToken, pass], // pass
    [SyntaxKind.AsteriskAsteriskToken, pass], // pass
    [SyntaxKind.SlashToken, pass], // pass
    [SyntaxKind.PercentToken, pass], // pass
    [SyntaxKind.PlusPlusToken, pass], // pass
    [SyntaxKind.MinusMinusToken, pass], // pass
    [SyntaxKind.LessThanLessThanToken, pass], // pass
    [SyntaxKind.GreaterThanGreaterThanToken, pass], // pass
    [SyntaxKind.GreaterThanGreaterThanGreaterThanToken, pass], // pass
    [SyntaxKind.AmpersandToken, pass], // pass
    [SyntaxKind.BarToken, pass], // pass
    [SyntaxKind.CaretToken, pass], // pass
    [SyntaxKind.ExclamationToken, pass], // pass
    [SyntaxKind.TildeToken, pass], // pass
    [SyntaxKind.AmpersandAmpersandToken, pass], // pass
    [SyntaxKind.BarBarToken, pass], // pass
    [SyntaxKind.QuestionToken, pass], // pass
    [SyntaxKind.ColonToken, pass], // pass
    [SyntaxKind.AtToken, pass], // pass
    [SyntaxKind.QuestionQuestionToken, pass], // pass
    [SyntaxKind.BacktickToken, pass], // pass
    [SyntaxKind.EqualsToken, pass], // pass
    [SyntaxKind.PlusEqualsToken, pass], // pass
    [SyntaxKind.MinusEqualsToken, pass], // pass
    [SyntaxKind.AsteriskEqualsToken, pass], // pass
    [SyntaxKind.AsteriskAsteriskEqualsToken, pass], // pass
    [SyntaxKind.SlashEqualsToken, pass], // pass
    [SyntaxKind.PercentEqualsToken, pass], // pass
    [SyntaxKind.LessThanLessThanEqualsToken, pass], // pass
    [SyntaxKind.GreaterThanGreaterThanEqualsToken, pass], // pass
    [SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken, pass], // pass
    [SyntaxKind.AmpersandEqualsToken, pass], // pass
    [SyntaxKind.BarEqualsToken, pass], // pass
    [SyntaxKind.BarBarEqualsToken, pass], // pass
    [SyntaxKind.AmpersandAmpersandEqualsToken, pass], // pass
    [SyntaxKind.QuestionQuestionEqualsToken, pass], // pass
    [SyntaxKind.CaretEqualsToken, pass], // pass
    [SyntaxKind.Identifier, identifierVisitor], // pass
    [SyntaxKind.PrivateIdentifier, pass], // pass
    [SyntaxKind.BreakKeyword, pass], // pass
    [SyntaxKind.CaseKeyword, pass], // pass
    [SyntaxKind.CatchKeyword, pass], // pass
    [SyntaxKind.ClassKeyword, pass], // pass
    [SyntaxKind.ConstKeyword, pass], // pass
    [SyntaxKind.ContinueKeyword, pass], // pass
    [SyntaxKind.DebuggerKeyword, pass], // pass
    [SyntaxKind.DefaultKeyword, pass], // pass
    [SyntaxKind.DeleteKeyword, pass], // pass
    [SyntaxKind.DoKeyword, pass], // pass
    [SyntaxKind.ElseKeyword, pass], // pass
    [SyntaxKind.EnumKeyword, pass], // pass
    [SyntaxKind.ExportKeyword, pass], // pass
    [SyntaxKind.ExtendsKeyword, pass], // pass
    [SyntaxKind.FalseKeyword, pass], // pass
    [SyntaxKind.FinallyKeyword, pass], // pass
    [SyntaxKind.ForKeyword, pass], // pass
    [SyntaxKind.FunctionKeyword, pass], // pass
    [SyntaxKind.IfKeyword, pass], // pass
    [SyntaxKind.ImportKeyword, pass], // pass
    [SyntaxKind.InKeyword, pass], // pass
    [SyntaxKind.InstanceOfKeyword, pass], // pass
    [SyntaxKind.NewKeyword, pass], // pass
    [SyntaxKind.NullKeyword, pass], // pass
    [SyntaxKind.ReturnKeyword, pass], // pass
    [SyntaxKind.SuperKeyword, pass], // pass
    [SyntaxKind.SwitchKeyword, pass], // pass
    [SyntaxKind.ThisKeyword, pass], // pass
    [SyntaxKind.ThrowKeyword, pass], // pass
    [SyntaxKind.TrueKeyword, pass], // pass
    [SyntaxKind.TryKeyword, pass], // pass
    [SyntaxKind.TypeOfKeyword, pass], // pass
    [SyntaxKind.VarKeyword, pass], // pass
    [SyntaxKind.VoidKeyword, pass], // pass
    [SyntaxKind.WhileKeyword, pass], // pass
    [SyntaxKind.WithKeyword, pass], // pass
    [SyntaxKind.ImplementsKeyword, pass], // pass
    [SyntaxKind.InterfaceKeyword, pass], // pass
    [SyntaxKind.LetKeyword, pass], // pass
    [SyntaxKind.PackageKeyword, pass], // pass
    [SyntaxKind.PrivateKeyword, pass], // pass
    [SyntaxKind.ProtectedKeyword, pass], // pass
    [SyntaxKind.PublicKeyword, pass], // pass
    [SyntaxKind.StaticKeyword, pass], // pass
    [SyntaxKind.YieldKeyword, pass], // pass
    [SyntaxKind.AbstractKeyword, pass], // pass
    [SyntaxKind.AsKeyword, pass], // pass
    [SyntaxKind.AssertsKeyword, pass], // pass
    [SyntaxKind.AnyKeyword, pass], // pass
    [SyntaxKind.AsyncKeyword, pass], // pass
    [SyntaxKind.AwaitKeyword, pass], // pass
    [SyntaxKind.BooleanKeyword, booleanVisitor], // pass
    [SyntaxKind.ConstructorKeyword, pass], // pass
    [SyntaxKind.DeclareKeyword, pass], // pass
    [SyntaxKind.GetKeyword, pass], // pass
    [SyntaxKind.InferKeyword, pass], // pass
    [SyntaxKind.IsKeyword, pass], // pass
    [SyntaxKind.KeyOfKeyword, pass], // pass
    [SyntaxKind.ModuleKeyword, pass], // pass
    [SyntaxKind.NamespaceKeyword, pass], // pass
    [SyntaxKind.NeverKeyword, pass], // pass
    [SyntaxKind.ReadonlyKeyword, pass], // pass
    [SyntaxKind.RequireKeyword, pass], // pass
    [SyntaxKind.NumberKeyword, numberVisitor],
    [SyntaxKind.ObjectKeyword, pass], // pass
    [SyntaxKind.SetKeyword, pass], // pass
    [SyntaxKind.StringKeyword, stringVisitor], // pass
    [SyntaxKind.SymbolKeyword, pass], // pass
    [SyntaxKind.TypeKeyword, pass], // pass
    [SyntaxKind.UndefinedKeyword, undefinedVisitor], // pass
    [SyntaxKind.UniqueKeyword, pass], // pass
    [SyntaxKind.UnknownKeyword, unknownVisitor], // pass
    [SyntaxKind.FromKeyword, pass], // pass
    [SyntaxKind.GlobalKeyword, pass], // pass
    [SyntaxKind.BigIntKeyword, pass], // pass
    [SyntaxKind.OfKeyword, pass], // pass
    [SyntaxKind.QualifiedName, pass], // pass
    [SyntaxKind.ComputedPropertyName, pass], // pass
    [SyntaxKind.TypeParameter, typeParamVisitor], // pass
    [SyntaxKind.Parameter, parameterVisitor], // pass
    [SyntaxKind.Decorator, pass], // pass
    [SyntaxKind.PropertySignature, propertySignatureVisitor],
    [SyntaxKind.PropertyDeclaration, pass], // TODO cerate visitor
    [SyntaxKind.MethodSignature, methodSignatureVisitor],
    [SyntaxKind.MethodDeclaration, pass], // TODO create visitor
    [SyntaxKind.Constructor, pass], // TODO create visitor
    [SyntaxKind.GetAccessor, pass], // TODO create visitor
    [SyntaxKind.SetAccessor, pass], // TODO create visitor
    [SyntaxKind.CallSignature, pass], // TODO create visitor
    [SyntaxKind.ConstructSignature, pass], // TODO create visitor
    [SyntaxKind.IndexSignature, pass], // TODO create visitor
    [SyntaxKind.TypePredicate, pass], // TODO create visitor
    [SyntaxKind.TypeReference, typeReferenceVisitor], // TODO create visitor
    [SyntaxKind.FunctionType, functionTypeVisitor],
    [SyntaxKind.ConstructorType, pass], // TODO create visitor
    [SyntaxKind.TypeQuery, pass], // TODO create visitor
    [SyntaxKind.TypeLiteral, typeLiteralVisitor],
    [SyntaxKind.ArrayType, arrayTypeVisitor],
    [SyntaxKind.TupleType, pass], // TODO create visitor
    [SyntaxKind.OptionalType, pass], // TODO create visitor
    [SyntaxKind.RestType, pass], // TODO create visitor
    [SyntaxKind.UnionType, unionTypeVisitor],
    [SyntaxKind.IntersectionType, pass], // TODO create visitor
    [SyntaxKind.ConditionalType, pass], // TODO create visitor
    [SyntaxKind.InferType, pass], // TODO create visitor
    [SyntaxKind.ParenthesizedType, pass], // TODO create visitor
    [SyntaxKind.ThisType, pass], // TODO create visitor
    [SyntaxKind.TypeOperator, pass], // TODO create visitor
    [SyntaxKind.IndexedAccessType, pass], // TODO create visitor
    [SyntaxKind.MappedType, pass], // TODO create visitor
    [SyntaxKind.LiteralType, literalTypeVisitor],
    [SyntaxKind.NamedTupleMember, pass], // TODO create visitor
    [SyntaxKind.ImportType, pass], // TODO create visitor
    [SyntaxKind.ObjectBindingPattern, pass], // TODO create visitor
    [SyntaxKind.ArrayBindingPattern, pass], // TODO create visitor
    [SyntaxKind.BindingElement, pass], // TODO create visitor
    [SyntaxKind.ArrayLiteralExpression, pass], // pass
    [SyntaxKind.ObjectLiteralExpression, pass], // pass
    [SyntaxKind.PropertyAccessExpression, pass], // pass
    [SyntaxKind.ElementAccessExpression, pass], // pass
    [SyntaxKind.CallExpression, pass], // pass
    [SyntaxKind.NewExpression, pass], // pass
    [SyntaxKind.TaggedTemplateExpression, pass], // pass
    [SyntaxKind.TypeAssertionExpression, pass], // pass
    [SyntaxKind.ParenthesizedExpression, pass], // pass
    [SyntaxKind.FunctionExpression, pass], // pass
    [SyntaxKind.ArrowFunction, pass], // pass
    [SyntaxKind.DeleteExpression, pass], // pass
    [SyntaxKind.TypeOfExpression, pass], // pass
    [SyntaxKind.VoidExpression, pass], // pass
    [SyntaxKind.AwaitExpression, pass], // pass
    [SyntaxKind.PrefixUnaryExpression, pass], // pass
    [SyntaxKind.PostfixUnaryExpression, pass], // pass
    [SyntaxKind.BinaryExpression, pass], // pass
    [SyntaxKind.ConditionalExpression, pass], // pass
    [SyntaxKind.TemplateExpression, pass], // pass
    [SyntaxKind.YieldExpression, pass], // pass
    [SyntaxKind.SpreadElement, pass], // pass
    [SyntaxKind.ClassExpression, pass], // pass
    [SyntaxKind.OmittedExpression, pass], // pass
    [SyntaxKind.ExpressionWithTypeArguments, pass], // pass
    [SyntaxKind.AsExpression, pass], // pass
    [SyntaxKind.NonNullExpression, pass], // pass
    [SyntaxKind.MetaProperty, pass], // pass
    [SyntaxKind.SyntheticExpression, pass], // pass
    [SyntaxKind.TemplateSpan, pass], // pass
    [SyntaxKind.SemicolonClassElement, pass], // pass
    [SyntaxKind.Block, pass], // pass
    [SyntaxKind.EmptyStatement, pass], // pass
    [SyntaxKind.VariableStatement, pass], // pass
    [SyntaxKind.ExpressionStatement, pass], // pass
    [SyntaxKind.IfStatement, pass], // pass
    [SyntaxKind.DoStatement, pass], // pass
    [SyntaxKind.WhileStatement, pass], // pass
    [SyntaxKind.ForStatement, pass], // pass
    [SyntaxKind.ForInStatement, pass], // pass
    [SyntaxKind.ForOfStatement, pass], // pass
    [SyntaxKind.ContinueStatement, pass], // pass
    [SyntaxKind.BreakStatement, pass], // pass
    [SyntaxKind.ReturnStatement, pass], // pass
    [SyntaxKind.WithStatement, pass], // pass
    [SyntaxKind.SwitchStatement, pass], // pass
    [SyntaxKind.LabeledStatement, pass], // pass
    [SyntaxKind.ThrowStatement, pass], // pass
    [SyntaxKind.TryStatement, pass], // pass
    [SyntaxKind.DebuggerStatement, pass], // pass
    [SyntaxKind.VariableDeclaration, variableVisitor], // pass
    [SyntaxKind.VariableDeclarationList, pass], // TODO create visitor
    [SyntaxKind.FunctionDeclaration, functionVisitor], // TODO create visitor
    [SyntaxKind.ClassDeclaration, classVisitor], // TODO create visitor
    [SyntaxKind.InterfaceDeclaration, pass], // TODO create visitor
    [SyntaxKind.TypeAliasDeclaration, typeAliasVisitor], // TODO create visitor
    [SyntaxKind.EnumDeclaration, pass], // TODO create visitor
    [SyntaxKind.ModuleDeclaration, pass], // TODO create visitor
    [SyntaxKind.ModuleBlock, pass], // TODO create visitor
    [SyntaxKind.CaseBlock, pass], // pass
    [SyntaxKind.NamespaceExportDeclaration, pass], // TODO create visitor
    [SyntaxKind.ImportEqualsDeclaration, pass], // TODO create visitor
    [SyntaxKind.ImportDeclaration, pass], // TODO create visitor
    [SyntaxKind.ImportClause, pass], // TODO create visitor
    [SyntaxKind.NamespaceImport, pass], // TODO create visitor
    [SyntaxKind.NamedImports, pass], // TODO create visitor
    [SyntaxKind.ImportSpecifier, pass], // TODO create visitor
    [SyntaxKind.ExportAssignment, pass], // TODO create visitor
    [SyntaxKind.ExportDeclaration, pass], // TODO create visitor
    [SyntaxKind.NamedExports, pass], // TODO create visitor
    [SyntaxKind.NamespaceExport, pass], // TODO create visitor
    [SyntaxKind.ExportSpecifier, pass], // pass
    [SyntaxKind.MissingDeclaration, pass], // pass
    [SyntaxKind.ExternalModuleReference, pass], // pass
    [SyntaxKind.JsxElement, pass], // pass
    [SyntaxKind.JsxSelfClosingElement, pass], // pass
    [SyntaxKind.JsxOpeningElement, pass], // pass
    [SyntaxKind.JsxClosingElement, pass], // pass
    [SyntaxKind.JsxFragment, pass], // pass
    [SyntaxKind.JsxOpeningFragment, pass], // pass
    [SyntaxKind.JsxClosingFragment, pass], // pass
    [SyntaxKind.JsxAttribute, pass], // pass
    [SyntaxKind.JsxAttributes, pass], // pass
    [SyntaxKind.JsxSpreadAttribute, pass], // pass
    [SyntaxKind.JsxExpression, pass], // pass
    [SyntaxKind.CaseClause, pass], // pass
    [SyntaxKind.DefaultClause, pass], // pass
    [SyntaxKind.HeritageClause, pass], // pass
    [SyntaxKind.CatchClause, pass], // pass
    [SyntaxKind.PropertyAssignment, pass], // pass
    [SyntaxKind.ShorthandPropertyAssignment, pass], // pass
    [SyntaxKind.SpreadAssignment, pass], // pass
    [SyntaxKind.EnumMember, pass], // pass
    [SyntaxKind.UnparsedPrologue, pass], // pass
    [SyntaxKind.UnparsedPrepend, pass], // pass
    [SyntaxKind.UnparsedText, pass], // pass
    [SyntaxKind.UnparsedInternalText, pass], // pass
    [SyntaxKind.UnparsedSyntheticReference, pass], // pass
    [SyntaxKind.SourceFile, pass], // pass
    [SyntaxKind.Bundle, pass], // pass
    [SyntaxKind.UnparsedSource, pass], // pass
    [SyntaxKind.InputFiles, pass], // pass
    [SyntaxKind.JSDocTypeExpression, pass], // TODO create visitor
    [SyntaxKind.JSDocAllType, pass], // TODO create visitor
    [SyntaxKind.JSDocUnknownType, pass], // TODO create visitor
    [SyntaxKind.JSDocNullableType, pass], // TODO create visitor
    [SyntaxKind.JSDocNonNullableType, pass], // TODO create visitor
    [SyntaxKind.JSDocOptionalType, pass], // TODO create visitor
    [SyntaxKind.JSDocFunctionType, pass], // TODO create visitor
    [SyntaxKind.JSDocVariadicType, pass], // TODO create visitor
    [SyntaxKind.JSDocNamepathType, pass], // TODO create visitor
    [SyntaxKind.JSDocComment, pass], // TODO create visitor
    [SyntaxKind.JSDocTypeLiteral, pass], // TODO create visitor
    [SyntaxKind.JSDocSignature, pass], // TODO create visitor
    [SyntaxKind.JSDocTag, pass], // TODO create visitor
    [SyntaxKind.JSDocAugmentsTag, pass], // TODO create visitor
    [SyntaxKind.JSDocImplementsTag, pass], // TODO create visitor
    [SyntaxKind.JSDocAuthorTag, pass], // TODO create visitor
    [SyntaxKind.JSDocDeprecatedTag, pass], // TODO create visitor
    [SyntaxKind.JSDocClassTag, pass], // TODO create visitor
    [SyntaxKind.JSDocPublicTag, pass], // TODO create visitor
    [SyntaxKind.JSDocPrivateTag, pass], // TODO create visitor
    [SyntaxKind.JSDocProtectedTag, pass], // TODO create visitor
    [SyntaxKind.JSDocReadonlyTag, pass], // TODO create visitor
    [SyntaxKind.JSDocCallbackTag, pass], // TODO create visitor
    [SyntaxKind.JSDocEnumTag, pass], // TODO create visitor
    [SyntaxKind.JSDocParameterTag, pass], // TODO create visitor
    [SyntaxKind.JSDocReturnTag, pass], // TODO create visitor
    [SyntaxKind.JSDocThisTag, pass], // TODO create visitor
    [SyntaxKind.JSDocTypeTag, pass], // TODO create visitor
    [SyntaxKind.JSDocTemplateTag, pass], // TODO create visitor
    [SyntaxKind.JSDocTypedefTag, pass], // TODO create visitor
    [SyntaxKind.JSDocPropertyTag, pass], // TODO create visitor
    [SyntaxKind.SyntaxList, pass], // pass
    [SyntaxKind.NotEmittedStatement, pass], // pass
    [SyntaxKind.PartiallyEmittedExpression, pass], // pass
    [SyntaxKind.CommaListExpression, pass], // pass
    [SyntaxKind.MergeDeclarationMarker, pass], // pass
    [SyntaxKind.EndOfDeclarationMarker, pass], // pass
    [SyntaxKind.SyntheticReferenceExpression, pass], // TODO create visitor
    [SyntaxKind.Count, pass], // pass
    [SyntaxKind.FirstAssignment, pass], // pass
    [SyntaxKind.LastAssignment, pass], // pass
    [SyntaxKind.FirstCompoundAssignment, pass], // pass
    [SyntaxKind.LastCompoundAssignment, pass], // pass
    [SyntaxKind.FirstReservedWord, pass], // pass
    [SyntaxKind.LastReservedWord, pass], // pass
    [SyntaxKind.FirstKeyword, pass], // pass
    [SyntaxKind.LastKeyword, pass], // pass
    [SyntaxKind.FirstFutureReservedWord, pass], // pass
    [SyntaxKind.LastFutureReservedWord, pass], // pass
    [SyntaxKind.FirstTypeNode, pass], // pass
    [SyntaxKind.LastTypeNode, pass], // pass
    [SyntaxKind.FirstPunctuation, pass], // pass
    [SyntaxKind.LastPunctuation, pass], // pass
    [SyntaxKind.FirstToken, pass], // pass
    [SyntaxKind.LastToken, pass], // pass
    [SyntaxKind.FirstTriviaToken, pass], // pass
    [SyntaxKind.LastTriviaToken, pass], // pass
    [SyntaxKind.FirstLiteralToken, pass], // pass
    [SyntaxKind.LastLiteralToken, pass], // pass
    [SyntaxKind.FirstTemplateToken, pass], // pass
    [SyntaxKind.LastTemplateToken, pass], // pass
    [SyntaxKind.FirstBinaryOperator, pass], // pass
    [SyntaxKind.LastBinaryOperator, pass], // pass
    [SyntaxKind.FirstStatement, pass], // pass
    [SyntaxKind.LastStatement, pass], // pass
    [SyntaxKind.FirstNode, pass], // pass
    [SyntaxKind.FirstJSDocNode, pass], // TODO create visitor
    [SyntaxKind.LastJSDocNode, pass], // TODO create visitor
    [SyntaxKind.FirstJSDocTagNode, pass], // TODO create visitor
    [SyntaxKind.LastJSDocTagNode, pass], // TODO create visitor
])

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

const capitalize = (text: string): string => text.replace(/^\w/, (c) => c.toUpperCase())
/*
const lowerCase = (text: string): string => text.replace(/^\w/, (c) => c.toLowerCase())
*/
const isReservedWord = (word: string): boolean => nimReserved.includes(word)

const hasTypeParam = (node: Node): boolean => node.getChildrenOfKind(SyntaxKind.TypeParameter).length > 0

const buildVarName = (v: string): string => {
    const varName = v.trim()
    return isReservedWord(varName) ? `js${capitalize(varName)}` : varName
}

const buildTypeName = (node: ClassDeclaration | TypeAliasDeclaration | string): string => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (typeof node === 'string') {
        return isReservedWord(node) ? `Js${Node}` : node
    }
    const name = node.getNameNode()!.getText().trim()
    return isReservedWord(name) ? `Js${capitalize(name)}` : capitalize(name)
}

// Builds type params for nodes that accept them.
const buildTypeParams = (
    node: FunctionDeclaration | FunctionTypeNode | MethodSignature | TypeAliasDeclaration,
    parentName?: string,
): string =>
    node.getTypeParameters().length
        ? `[${node
              .getTypeParameters()
              .map((p) => visit(p, parentName))
              .join(', ')}]`
        : ''

// Builds function parameters for functionLike nodes
const buildParams = (node: FunctionTypeNode | FunctionDeclaration | MethodSignature): string =>
    node
        .getParameters()
        .map((param) => visit(param))
        .join(', ')

// Builds return type for functionLike nodes
const buildReturnType = (node: FunctionTypeNode | FunctionDeclaration | MethodSignature): string =>
    node.getReturnTypeNode() ? visit(node.getReturnTypeNodeOrThrow()) : 'any'

// Builds FFI params for functionLike nodes
const buildFFiParams = (node: FunctionDeclaration | FunctionTypeNode | MethodSignature): string =>
    node
        .getParameters()
        .map((p) => (p.isRestParameter() ? '...#' : '#'))
        .join(', ')
