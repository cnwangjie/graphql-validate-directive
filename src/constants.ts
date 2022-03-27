export const KeywordsForNumber = [
  'maximum',
  'minimum',
  'exclusiveMaximum',
  'exclusiveMinimum',
  'multipleOf',
] as const

export const KeywordsForString = [
  'maxLength',
  'minLength',
  'pattern',
  'format',
] as const

export const KeywordsForArray = ['maxItems', 'minItems', 'uniqueItems'] as const

export const DefaultValidateDirectiveName = 'validate'
