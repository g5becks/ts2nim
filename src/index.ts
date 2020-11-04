import { Project, SourceFile } from 'ts-morph'
import { visit } from './visitors'

const proj = new Project({ tsConfigFilePath: './tsconfig.json' })

export const file = proj.getSourceFiles()[0]
export const generate = (file: SourceFile): string =>
    file
        .forEachChildAsArray()
        .map((child) => visit(child))
        .join()
