const { graphql, buildSchema } = require('graphql')

// Schema construction
const schema = buildSchema(`
  type Query {
    hello: String
  }
`)

// Resolver
const root = {
  hello: () => {
    return 'Hello World!'
  }
}

// wired together
graphql(schema, ' { hello }', root).then((response) => {
  console.log(response)
})