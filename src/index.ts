import { Project } from 'ts-morph'
import { initLiteralsMap, visit } from './visitors'

export const generate = (proj: Project): { out: string; source: string }[] => {
    initLiteralsMap(proj.getSourceFiles())
    let convertedMap: { out: string; source: string }[] = []
    for (const file of proj.getSourceFiles()) {
        const data = file
            .forEachChildAsArray()
            .map((child) => visit(child))
            .join('\n')
        convertedMap = [...convertedMap, { out: file.getBaseNameWithoutExtension() + '.nim', source: data }]
    }

    return convertedMap
}
