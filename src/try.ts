import { Project } from 'ts-morph'
const proj = new Project({ tsConfigFilePath: 'tsconfig.scratch.json' })

const file = proj.getSourceFiles()[0]

const alias = file.getTypeAlias('SomeType')

console.log(alias?.getTypeParameters()[0].getType().getConstraint()?.isAny())
