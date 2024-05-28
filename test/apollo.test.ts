import { makeExecutableSchema } from '@graphql-tools/schema'
import { ApolloServer } from 'apollo-server'
import type { GraphQLError } from 'graphql'
import {
  apolloValidateDirectivePlugin,
  GraphQLValidateDirectiveTypeDefs,
  isValidationError,
} from '../src'

describe('apollo plugin', () => {
  it('should work', async () => {
    const customTypeDefs = `#graphql
    type Mutation {
      test(a: Int @validate(maximum: 1)): String
    }
    type Query {
      test: String
    }
    `
    const schema = makeExecutableSchema({
      typeDefs: [customTypeDefs, GraphQLValidateDirectiveTypeDefs],
    })

    let lastError: GraphQLError | undefined
    const apolloServer = new ApolloServer({
      schema,
      plugins: [apolloValidateDirectivePlugin()],
      formatError: err => {
        lastError = err
        return err
      },
    })
    const r0 = await apolloServer.executeOperation({
      query: `#graphql
      mutation T {
        test(a: 2)
      }
      `,
    })
    expect(r0.errors).toBeDefined()
    expect(r0.errors).toHaveLength(1)
    expect(r0.errors![0].message).toBe('validation failed')
    expect(lastError).toBeDefined()
    expect(isValidationError(lastError!.originalError)).toBe(true)
  })
})
