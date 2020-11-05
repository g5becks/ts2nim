import { Project } from 'ts-morph'

const proj = new Project({ tsConfigFilePath: 'tsconfig.scratch.json' })

const file = proj.getSourceFiles()[0]

const cl = file.getClasses()[0]

console.log(cl.getProperties().map((prop) => prop.getChildren().map((child) => child.getKindName())))
/*
const data = kids.map((f) => visit(f)).join('\n')

fs.writeFileSync('data.nim', Buffer.from(data, 'utf-8'))
*/
