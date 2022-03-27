import { makeExecutableSchema } from '@graphql-tools/schema'
import { graphql, GraphQLSchema } from 'graphql'
import {
  GraphQLValidateDirective,
  GraphQLValidateDirectiveTypeDefs,
} from '../src'

describe('GraphQLValidateDirective', () => {
  const testTypeDefs = `#graphql
    input TestA {
      a: Int @validate(maximum: 10)
    }

    input TestB {
      b: String @validate(minLength: 10)
    }

    input TestC {
      c: [String] @validate(minItems: 10)
    }

    input TestD {
      d: [String] @validate(uniqueItems: true)
    }

    input TestE {
      e: Float @validate(maximum: 3)
    }

    input TestF {
      f: Int
    }

    input TestG {
      g: Boolean
    }

    type Mutation {
      testA(input: TestA): String
      testB(input: TestB): String
      testC(input: TestC): String
      testD(input: TestD): String
      testE(input: TestE): String
      testF(input: TestF): String
      testG(input: TestG): String
    }

    type Query {
      hello: String
    }

    schema {
      query: Query
      mutation: Mutation
    }
  `

  let schema: GraphQLSchema
  let wrapper: GraphQLValidateDirective
  let rootValue: any

  beforeAll(() => {
    schema = makeExecutableSchema({
      typeDefs: [testTypeDefs, GraphQLValidateDirectiveTypeDefs],
    })
    wrapper = new GraphQLValidateDirective(schema)
    rootValue = {
      Query: {},
      Mutation: {},
    }
  })

  const execute = (source: string) => {
    return graphql({
      schema,
      source,
      rootValue,
    })
  }

  describe('transformSchema', () => {
    it('should not throw error', () => {
      expect(() => {
        wrapper.transformSchema()
      }).not.toThrow()
    })

    it('should generate json schema for input type with directive', () => {
      const ajvSchema: any = wrapper.ajv.getSchema(
        wrapper.getInputTypeRefName('TestA'),
      )
      expect(ajvSchema).toBeTruthy()
      expect(ajvSchema.schema).toBeTruthy()
      expect(ajvSchema.schema.type).toBe('object')
    })

    it('should return errors if field is not valid', async () => {
      const res = await execute(`#graphql
        mutation Test {
          testA(input: {
            a: 11
          })
        }
      `)
      expect(res.errors).toBeTruthy()
    })
  })
})
