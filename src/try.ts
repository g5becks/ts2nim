import { Project, TypeReferenceNode } from 'ts-morph'
import { visit } from './visitors'

const proj = new Project({ tsConfigFilePath: 'tsconfig.scratch.json' })

const file = proj.getSourceFiles()[0]

const cl = file.getClasses()[0]

const data = (cl.getProperties()[1].getTypeNode()! as TypeReferenceNode).getTypeName()

console.log(data.getKind())
console.log(data.getKindName())
console.log(data.getText())
console.log(data.getChildren().map((c) => c.getKindName()))

console.log(visit(data))
/*
fs.writeFileSync('data.nim', Buffer.from(data, 'utf-8'))
*/
