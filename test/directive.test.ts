import { testSchema } from './util'

describe('validate', () => {
  describe('argument', () => {
    it('should validate field on argument', async () => {
      const t = testSchema(`#graphql
      type Mutation {
        test(a: Int @validate(maximum: 1)): String
      }
      `)
      await t.fail(`#graphql
        mutation T {
          test(a: 2)
        }
      `)
      await t.pass(`#graphql
        mutation T {
          test(a: 1)
        }
      `)
    })
  })

  describe('input object', () => {
    it('should validate field on input object', async () => {
      const t = testSchema(`#graphql
      input Test {
        a: Int @validate(maximum: 1)
      }
      type Mutation {
        test(input: Test): String
      }
      `)

      const source = `#graphql
        mutation T($input: Test) {
          test(input: $input)
        }
      `

      await t.fail(source, {
        input: {
          a: 2,
        },
      })

      await t.pass(source, {
        input: {
          a: 1,
        },
      })
    })
  })

  describe('nested field', () => {
    it('should validate field on nested', async () => {
      const t = testSchema(`#graphql
      input A {
        a: Int @validate(maximum: 1)
      }
      input Test {
        t: B
      }
      input B {
        b: A
      }
      type Mutation {
        test(input: Test): String
      }
      `)
      await t.fail(`#graphql
      mutation T {
        test(input: {
          t: {
            b: {
              a: 2
            }
          }
        })
      }
      `)
      await t.pass(`#graphql
      mutation T {
        test(input: {
          t: {
            b: {
              a: 1
            }
          }
        })
      }
      `)
    })
  })

  describe('array field', () => {
    it('should validate array field', async () => {
      const t = testSchema(`#graphql
      input Test {
        a: [Int] @validate(maximum: 1, maxItems: 1)
      }
      type Mutation {
        test(input: Test): String
      }
      `)
      await t.pass(`#graphql
      mutation T {
        test(input: {
          a: [1]
        })
      }`)
      await t.fail(`#graphql
      mutation T {
        test(input: {
          a: [2]
        })
      }
      `)
      await t.fail(`#graphql
      mutation T {
        test(input: {
          a: [1, 1]
        })
      }
      `)
    })
  })
})
