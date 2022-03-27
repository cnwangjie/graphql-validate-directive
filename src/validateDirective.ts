import type { GraphQLSchema } from 'graphql'
import { DefaultValidateDirectiveName } from './constants'
import { GraphQLValidateDirective } from './GraphQLValidateDirective'

export const validateDirective =
  (directiveName = DefaultValidateDirectiveName) =>
  (schema: GraphQLSchema) => {
    new GraphQLValidateDirective(schema, directiveName).transformSchema()
    return schema
  }
