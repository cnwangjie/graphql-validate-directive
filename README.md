# graphql-validate-directive

[![npm](https://img.shields.io/npm/v/graphql-validate-directive?style=flat-square)](https://www.npmjs.com/package/graphql-validate-directive)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/cnwangjie/graphql-validate-directive/Test?label=test&logo=github&style=flat-square)
![Codecov](https://img.shields.io/codecov/c/github/cnwangjie/graphql-validate-directive?style=flat-square&token=QhjBkB6PwD)
![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/graphql-validate-directive?style=flat-square)

### Summary

This is a directive validation library for GraphQL. Inspired by [validate-directive](https://github.com/cjihrig/validate-directive).

Different with [graphql-constraint-directive](https://github.com/confuser/graphql-constraint-directive). It do validate on resolve field instead of creating new scaler.

### Installation

```sh
yarn add graphql-validate-directive
```

or

```sh
npm i -S graphql-validate-directive
```

### Usage

Use in the project.

```ts
import {
  validateDirective,
  GraphQLValidateDirectiveTypeDefs,
} from 'graphql-validate-directive'
import { makeExecutableSchema } from '@graphql-tools/schema'

const schema = makeExecutableSchema({
  typeDefs: [
    // ... your type definitions
    GraphQLValidateDirectiveTypeDefs,
  ],
  resolvers: {
    // ...
  },
})

validateDirective()(schema)
```

Use in schema.

```graphql
# used on input field
input PostInput {
  title: String! @validate(minLength: 1, maxLength: 1000)
  content: String! @validate(minLength: 1, maxLength: 1000)

  # used on array
  tags: [String!]
    @validate(minItems: 1, maxItems: 10, minLength: 1, maxLength: 100)
}

type Mutation {
  createPost(input: PostInput!): Post

  # used on argument
  createMessage(
    content: String! @validate(minLength: 1, maxLength: 200)
  ): Message
}
```

### License

MIT Licensed.
