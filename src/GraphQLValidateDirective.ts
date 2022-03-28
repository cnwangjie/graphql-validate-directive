import {
  GraphQLSchema,
  GraphQLNamedType,
  isInputObjectType,
  isScalarType,
  GraphQLInputType,
  GraphQLScalarType,
  GraphQLInt,
  GraphQLFloat,
  GraphQLString,
  isListType,
  GraphQLList,
  isNonNullType,
  GraphQLObjectType,
  GraphQLField,
  GraphQLArgument,
} from 'graphql'
import Ajv from 'ajv'
import type { JSONSchemaType } from 'ajv'
import { getDirective } from '@graphql-tools/utils'
import pick from 'lodash/pick'
import type { Maybe } from 'graphql/jsutils/Maybe'
import { DefaultValidateDirectiveName } from './constants'
import type { ValidateOptions } from './type'
import {
  KeywordsForArray,
  KeywordsForNumber,
  KeywordsForString,
} from './constants'

export class GraphQLValidateDirective {
  constructor(
    public schema: GraphQLSchema,
    public directiveName: string = DefaultValidateDirectiveName,
    public ajv = new Ajv(),
  ) {}

  public getScalerTypeSchema(
    type: GraphQLScalarType,
    opt: ValidateOptions,
  ): JSONSchemaType<any> {
    if (type === GraphQLInt) {
      return {
        type: 'integer',
        ...pick(opt, KeywordsForNumber),
      }
    }

    if (type === GraphQLFloat) {
      return {
        type: 'number',
        ...pick(opt, KeywordsForNumber),
      }
    }

    if (type === GraphQLString) {
      return {
        type: 'string',
        ...pick(opt, KeywordsForString),
      }
    }

    // not validate custom scaler
    // return empty schema to match anything
    /* istanbul ignore next */
    return {} as any
  }

  public getListTypeSchema(
    type: GraphQLList<GraphQLInputType>,
    opt: ValidateOptions,
  ): JSONSchemaType<any[]> {
    return {
      type: 'array',
      ...pick(opt, KeywordsForArray),
      items: this.getInputTypeSchema(type.ofType, opt),
    }
  }

  public getInputTypeSchema(
    type: GraphQLInputType,
    opt?: ValidateOptions,
  ): JSONSchemaType<any> {
    if (isScalarType(type) && opt) {
      return this.getScalerTypeSchema(type, opt)
    }
    if (isListType(type) && opt) {
      return this.getListTypeSchema(type, opt)
    }
    if (isNonNullType(type)) {
      return this.getInputTypeSchema(type.ofType, opt)
    }
    if (isInputObjectType(type)) {
      return {
        $ref: this.getInputTypeRefName(type.name),
      } as any
    }
    return {} as any
  }

  public getInputTypeRefName(name: string) {
    return `#/definitions/customInputType${name}`
  }

  public getTypeSchema(
    type: GraphQLNamedType,
  ): JSONSchemaType<Record<string, any>> | undefined {
    if (!isInputObjectType(type)) return
    const fields = type.getFields()
    const properties: Record<string, any> = {}
    const jsonSchema: JSONSchemaType<Record<string, any>> = {
      type: 'object',
      properties,
      additionalProperties: true,
    }
    for (const [name, field] of Object.entries(fields)) {
      const directive = getDirective(this.schema, field, this.directiveName)
      properties[name] = this.getInputTypeSchema(field.type, directive?.[0])
    }
    return jsonSchema
  }

  public registerTypeSchemas(typeMap: Record<string, GraphQLNamedType>) {
    for (const [name, type] of Object.entries(typeMap)) {
      const jsonSchema = this.getTypeSchema(type)
      if (!jsonSchema) continue
      this.ajv.addSchema(jsonSchema, this.getInputTypeRefName(name))
    }
  }

  public getArgsSchema(
    args: readonly GraphQLArgument[],
  ): JSONSchemaType<Record<string, any>> {
    const properties: Record<string, any> = {}
    const jsonSchema: JSONSchemaType<Record<string, any>> = {
      $async: true,
      type: 'object',
      properties,
      additionalProperties: true,
    }

    for (const arg of args) {
      const directive = getDirective(this.schema, arg, this.directiveName)
      properties[arg.name] = this.getInputTypeSchema(arg.type, directive?.[0])
    }

    return jsonSchema
  }

  public createValidator(args: readonly GraphQLArgument[]) {
    const schema = this.getArgsSchema(args)
    return this.ajv.compile(schema)
  }

  public composeResolverForField(field: GraphQLField<any, any>) {
    if (field.args.length === 0) return
    const validate = this.createValidator(field.args)
    const originalResolve = field.resolve
    field.resolve = async function resolverWithValidator(...args) {
      await validate(args[1])
      return originalResolve?.apply(this, args)
    }
  }

  public composeResolver(type: Maybe<GraphQLObjectType>) {
    // it's useless to applied with null or undefined
    // add this check for safety and convenience to apply
    /* istanbul ignore next */
    if (!type) return
    const fields = type.getFields()
    for (const [, field] of Object.entries(fields)) {
      this.composeResolverForField(field)
    }
  }

  public transformSchema() {
    const typeMap = this.schema.getTypeMap()
    this.registerTypeSchemas(typeMap)
    this.composeResolver(this.schema.getQueryType())
    this.composeResolver(this.schema.getMutationType())
  }
}
