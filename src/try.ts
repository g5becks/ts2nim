import { Project, SyntaxKind } from 'ts-morph'
const proj = new Project({ tsConfigFilePath: 'tsconfig.scratch.json' })

const file = proj.getSourceFiles()[0]

const vars = file.getChildrenOfKind(SyntaxKind.VariableStatement)

for (const v of vars) {
    console.log(v.getDeclarationKind())
}

/*
file.forEachChildAsArray().forEach((child) => console.log(child.getKindName()))
*/
