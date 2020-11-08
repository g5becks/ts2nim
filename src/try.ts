import { Project } from 'ts-morph'

const proj = new Project({ tsConfigFilePath: 'tsconfig.scratch.json' })

const files = proj.getSourceFiles()

const classs = files[0].getClass('REPLServer')

console.log(classs?.getMethods().map((m) => m.getModifiers().map((m) => m.getKind())))
