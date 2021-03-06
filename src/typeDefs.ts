export const GraphQLValidateDirectiveTypeDefs = `#graphql
directive @validate(
  maximum: Float
  minimum: Float
  exclusiveMaximum: Float
  exclusiveMinimum: Float
  multipleOf: Float
  maxLength: Int
  minLength: Int
  pattern: String
  format: String
  maxItems: Int
  minItems: Int
  uniqueItems: Boolean
) on INPUT_FIELD_DEFINITION | ARGUMENT_DEFINITION
`
