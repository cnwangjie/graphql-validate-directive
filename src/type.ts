import {
  KeywordsForArray,
  KeywordsForNumber,
  KeywordsForString,
} from './constants'

export interface ValidateOptions {
  // keywords for number
  maximum?: number
  minimum?: number
  exclusiveMaximum?: number
  exclusiveMinimum?: number
  multipleOf?: number

  // keywords for string
  maxLength?: number
  minLength?: number
  pattern?: string
  format?: string

  // keywords for array
  maxItems?: number
  minItems?: number
  uniqueItems?: true
}

// following code is used to validate the type declarations
/* istanbul ignore file */
const _assertType = <T extends true>(t?: T) => {}

export type Eq<A, B> = (<T>() => T extends A ? 1 : 2) extends <
  T,
>() => T extends B ? 1 : 2
  ? true
  : false
export type KeywordsForNumber = typeof KeywordsForNumber[number]
export type KeywordsForString = typeof KeywordsForString[number]
export type KeywordsForArray = typeof KeywordsForArray[number]

_assertType<
  Eq<keyof Pick<ValidateOptions, KeywordsForNumber>, KeywordsForNumber>
>()
_assertType<
  Eq<keyof Pick<ValidateOptions, KeywordsForString>, KeywordsForString>
>()
_assertType<
  Eq<keyof Pick<ValidateOptions, KeywordsForArray>, KeywordsForArray>
>()
