import type { ApolloServerPlugin } from 'apollo-server-plugin-base'
import { validateDirective } from './validateDirective'

export const apolloValidateDirectivePlugin = (
  directiveName?: string,
): ApolloServerPlugin<any> => {
  return {
    async serverWillStart({ schema }) {
      validateDirective(directiveName)(schema)
    },
  }
}
