import { SourceFile } from 'ts-morph'
import { getTypesToBuild, initLiteralsMap, visit } from './visitors'

export const generate = (files: SourceFile[]): { out: string; source: string }[] => {
    initLiteralsMap(files)
    let convertedMap: { out: string; source: string }[] = []
    for (const file of files) {
        const out = file.getBaseNameWithoutExtension() + '.nim'
        let source = ''
        const code = file
            .forEachChildAsArray()
            .map((child) => visit(child))
            .join('\n')

        console.log(getTypesToBuild(file).values())
        for (const type of getTypesToBuild(file).values()) {
            source = source.concat(`type ${type.name} = ${type.type}\n`)
        }
        source = source.concat(code)
        convertedMap = [...convertedMap, { out, source }]
    }

    return convertedMap
}
