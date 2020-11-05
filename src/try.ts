import { Project } from 'ts-morph'

const proj = new Project({ tsConfigFilePath: 'tsconfig.scratch.json' })

const file = proj.getSourceFiles()[0]

const classs = file.getClasses()[0]

const data = classs.getProperties().map((prop) => prop.getKindName())
console.log(data)

/*
fs.writeFileSync('data.nim', Buffer.from(data, 'utf-8'))
*/
