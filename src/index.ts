import { Project, SyntaxKind } from 'ts-morph'

const proj = new Project({ tsConfigFilePath: './tsconfig.json' })

const file = proj.getSourceFiles()[0]

type DoneEvent = { message: 'Done' }
type NodeVisitor = (node: number) => string | undefined | DoneEvent

/* eslint-disable @typescript-eslint/no-unused-vars */
const vistorMap = new Map<number, NodeVisitor>([
    [SyntaxKind.Unknown, (_node: SyntaxKind.Unknown) => undefined],
    [SyntaxKind.EndOfFileToken, (_node: SyntaxKind.EndOfFileToken): DoneEvent => ({ message: 'Done' })],
])
/*  eslint-enable @typescript-eslint/no-unused-vars */
file.getClasses().forEach((classs) => console.log(classs.getText()))

const nodes = file.forEachChildAsArray()
file.forEachChildAsArray().forEach((child) => console.log(child.getKindName()))

const moduleDeclaration = file.getChildrenOfKind(SyntaxKind.ModuleDeclaration)[0]

const module = moduleDeclaration.getChildrenOfKind(SyntaxKind.ModuleBlock)[0]

const func = moduleDeclaration.getChildrenOfKind(SyntaxKind.FunctionDeclaration)[0]

const name = func.getNameNodeOrThrow().getText().trim()

console.log(name)
