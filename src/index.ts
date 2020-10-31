import { Project, SyntaxKind } from 'ts-morph'
import { NodeVisitor } from 'typescript'


const proj = new Project({tsConfigFilePath: './tsconfig.json'})

const file = proj.getSourceFiles()[0]

let visitor: NodeVisitor

file.getClasses().forEach(classs => console.log(classs.getText()))

const nodes = file.forEachChildAsArray()
file.forEachChildAsArray().forEach(child => console.log(child.getKindName()))

const moduleDeclaration = file.getChildrenOfKind(SyntaxKind.ModuleDeclaration)[0]

const module = moduleDeclaration.getChildrenOfKind(SyntaxKind.ModuleBlock)[0]

const func = moduleDeclaration.getChildrenOfKind(SyntaxKind.FunctionDeclaration)[0]

const name = func.getNameNodeOrThrow().getText().trim()

console.log(name)