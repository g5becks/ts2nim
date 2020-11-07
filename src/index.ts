import { Project } from 'ts-morph'
import { getTypesToBuild, initLiteralsMap, visit } from './visitors'

export const generate = (proj: Project): { out: string; source: string }[] => {
    initLiteralsMap(proj.getSourceFiles())
    let convertedMap: { out: string; source: string }[] = []
    for (const file of proj.getSourceFiles()) {
        const out = file.getBaseNameWithoutExtension() + '.nim'
        let source = ''
        for (const type of getTypesToBuild(file).values()) {
            source = source.concat(`type ${type.name} = ${type.type}
            `)
        }
        source = source.concat(
            file
                .forEachChildAsArray()
                .map((child) => visit(child))
                .join('\n'),
        )

        convertedMap = [...convertedMap, { out, source }]
    }

    return convertedMap
}
