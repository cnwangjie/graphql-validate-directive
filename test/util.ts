import { makeExecutableSchema } from '@graphql-tools/schema'
import { graphql } from 'graphql'
import {
  GraphQLValidateDirective,
  GraphQLValidateDirectiveTypeDefs,
} from '../src'

export const wrap = (typeDefs: string) => {
  const rootSchema = `#graphql
    type Query {
      hello: String
    }

    schema {
      query: Query
      mutation: Mutation
    }
    `
  const schema = makeExecutableSchema({
    typeDefs: [rootSchema, typeDefs, GraphQLValidateDirectiveTypeDefs],
  })

  const wrapper = new GraphQLValidateDirective(schema)
  wrapper.transformSchema()
  return wrapper
}

export const executeOn = (
  schema: any,
  source: string,
  variableValues?: any,
) => {
  return graphql({
    schema,
    source,
    rootValue: {
      Query: {},
      Mutation: {},
    },
    variableValues,
  })
}

export const testSchema = (typeDefs: string) => {
  const wrapper = wrap(typeDefs)
  const pass = async (source: string, variableValues?: any) => {
    const res = await executeOn(wrapper.schema, source, variableValues)
    expect(res.errors).toBeFalsy()
  }
  const fail = async (source: string, variableValues?: any) => {
    const res = await executeOn(wrapper.schema, source, variableValues)
    expect(res.errors).toBeTruthy()
    expect(res.errors).toHaveLength(1)
    expect(res.errors![0]!.message).toContain('validation failed')
  }
  return {
    wrapper,
    pass,
    fail,
  }
}
