import { Project, SourceFile } from 'ts-morph'
import { LiteralToBuild, visit } from './visitors'

const proj = new Project({ tsConfigFilePath: './tsconfig.json' })

export const file = proj.getSourceFiles()[0]
export const generate = (file: SourceFile): string => {
    const literalSet = new Set<LiteralToBuild>()
    const data = file
        .forEachChildAsArray()
        .map((child) => visit(child, '', literalSet))
        .join('\n')

    let typesToBuild = ''
    for (const t of literalSet.values()) {
        typesToBuild = typesToBuild.concat(`type ${t.name} = ${t.type}
        `)
    }
    console.log(typesToBuild)
    return typesToBuild.concat(data)
}
