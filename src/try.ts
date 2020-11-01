import { Project } from 'ts-morph'
const proj = new Project({ tsConfigFilePath: 'tsconfig.scratch.json' })

const file = proj.getSourceFiles()[0]

const myType = file.getTypeAliasOrThrow('SomeType')

const tParam = myType.getTypeParameters()[0]

const t = tParam.getConstraintOrThrow()

if (t.getType().getConstraintOrThrow().isAnonymous()) {
    const sigs = t.getType().getConstraintOrThrow().getCallSignatures()
    sigs.forEach((sig) => console.log(sig.getDeclaration().getText()))
}
/*
file.forEachChildAsArray().forEach((child) => console.log(child.getKindName()))
*/
