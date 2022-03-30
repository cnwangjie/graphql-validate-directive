import { makeExecutableSchema } from '@graphql-tools/schema'
import { graphql } from 'graphql'
import {
  GraphQLValidateDirective,
  GraphQLValidateDirectiveTypeDefs,
} from '../src'

export const wrap = (typeDefs: string, resolvers?: any) => {
  const rootSchema = `#graphql
    ${
      typeDefs.includes('type Query')
        ? ''
        : `#graphql
      type Query {
        hello: String
      }
      `
    }

    schema {
      query: Query
      mutation: Mutation
    }
    `
  const schema = makeExecutableSchema({
    typeDefs: [rootSchema, typeDefs, GraphQLValidateDirectiveTypeDefs],
    resolvers,
  })

  const wrapper = new GraphQLValidateDirective(schema)
  wrapper.transformSchema()
  return wrapper
}

export const executeOn = (
  schema: any,
  source: string,
  variableValues?: any,
  rootValue: any = {
    Query: {},
    Mutation: {},
  },
) => {
  return graphql({
    schema,
    source,
    rootValue,
    variableValues,
  })
}

export const testSchema = (typeDefs: string, resolvers?: any) => {
  const wrapper = wrap(typeDefs, resolvers)
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
