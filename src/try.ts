import { Project } from 'ts-morph'
const proj = new Project({ tsConfigFilePath: 'tsconfig.scratch.json' })

const file = proj.getSourceFiles()[0]

const myType = file.getTypeAliasOrThrow('SomeType')

const tParam = myType.getTypeParameters()[0]

const t = tParam.getConstraintOrThrow()

// You Can Always Get The Type Of the TypeNode
if (t.getType().isAnonymous()) {
    const sig = t.getType().getCallSignatures()[0]
    const params = sig.getParameters()
    for (const param of params) {
        console.log(param.getValueDeclaration()?.getType().getText())
    }
}
/*
file.forEachChildAsArray().forEach((child) => console.log(child.getKindName()))
*/
