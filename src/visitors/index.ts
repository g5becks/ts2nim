import { SourceFile } from 'ts-morph'
import { visit } from './visitors'

export const generate = (file: SourceFile): string =>
    file
        .forEachChildAsArray()
        .map((child) => visit(child))
        .join()
