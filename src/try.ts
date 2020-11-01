import { Project } from 'ts-morph'

const proj = new Project({ tsConfigFilePath: 'tsconfig.scratch.json' })

const file = proj.getSourceFiles()[0]

file.forEachChildAsArray().forEach((child) => console.log(child.getKindName()))

/*
// You Can Always Get The Type Of the TypeNode
if (t.getType().isAnonymous()) {
    const sig = t.getType().getCallSignatures()[0]
    console.log(buildAnonymousProc(sig))
}
/*
file.forEachChildAsArray().forEach((child) => console.log(child.getKindName()))
*/
