import { AsyncCompleter, Completer, Interface } from 'readline'
import { Context } from 'vm'
import { REPL_MODE_SLOPPY, REPL_MODE_STRICT, REPLCommand, REPLCommandAction, REPLEval, REPLWriter } from 'repl'

declare function getName(name: 'string', age: 39): void

type TypeWithLit = 'name' | 'age'
type SomeUnion = string | number | boolean | null | undefined | Record<string, unknown> | { name: string; age: number }
