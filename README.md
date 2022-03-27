# graphql-validate-directive

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
