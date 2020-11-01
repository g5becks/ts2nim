import { Project } from 'ts-morph'

const proj = new Project({ tsConfigFilePath: './tsconfig.json' })

const file = proj.getSourceFiles()[0]
