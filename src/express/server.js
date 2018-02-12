const express = require('express')
const graphqlHTTP = require('express-graphql')
const { buildSchema } = require('graphql')
const fakeDatabase = {}

const schema = buildSchema(`
  
  type Mutation {
    createMessage(input: MessageInput): Message
    updateMessage(id: ID!, input: MessageInput): Message
  }

  type Query {
    ip: String
    getMessage(id: ID!): Message
    quoteOfTheDay: String
    random: Float!
    rollThreeDice: [Int]
    rollDice(numDice: Int!, numSides: Int) : [Int]
    getDie(numSides: Int): RandomDie
    user(id: String: User
  }

  type RandomDie {
    numSides: Int!
    rollOnce: Int!
    roll(numRolls: Int!): [Int]
  }

  input MessageInput {
    content: String
    author: String
  }

  type Message {
    id: ID!
    content: String
    author: String
  }

  type User {
    id: String
    name: String
  }
`)

// Programatic approach to schemas
// or instead of creating schema "User" above you can progromatically create the Schema
// const userType = new graphql.GraphQLObjectType({
//   name: 'User',
//   fields: {
//     id: { type: graphql.GraphQLString },
//     name: { type: graphql.GraphQLString }
//   }
// })

// and instead of defining query using schema you can also programatically create the query
// const queryType = new grapql.GraphQLObjectType({
//   name: Query,
//   fields: {
//     user: {
//       type: userType,//defined above
//       args: {
//         id: { type: graphql.GraphQLString }
//       },
//       resolve: (_, { id }) => fakeDatabase[id]
//     }
//   } 
// })

// const schema = new graphql.GraphQLSchemas({ query: queryType })

const Message = (id, { content, author }) => ({
  id,
  content,
  author
})

const RandomDie = ({ numSides }) => ({
  numSides,
  rollOnce() {
    return 1 + Math.floor(Math.random() * this.numSides);
  },
  roll({numRolls}) {
    var output = [];
    for (var i = 0; i < numRolls; i++) {
      output.push(this.rollOnce());
    }
    return output;
  }
})
  
const root = {
  ip: (args, request) => {
    return request.ip
  },
  quoteOfTheDay: () => {
    return Math.random() < 0.5 ? 'Take it easy' : 'Salvation lies within'
  },
  random: () => {
    return Math.random() 
  },
  rollThreeDice: () => {
    return [1, 2, 3].map(_ => 1 + Math.floor(Math.random() * 6))
  },
  rollDice: ({numDice, numSides}) => {
    let output = []
    for (let i = 0; i < numDice; i++) {
      output.push(1 + Math.floor(Math.random() * (numSides || 6)))
    }
    return output
  },
  getDie: ({ numSides }) => {
    return RandomDie({ numSides })
  },
  getMessage: ({ id }) => {
    if (!fakeDatabase[id]) {
      throw new Error('no message exists with id ' + id)
    }
    return Message(id, fakeDatabase[id])
  },
  createMessage: ({ input }) => {
   let id = require('crypto').randomBytes(10).toString('hex')
   fakeDatabase[id] = input
   return Message(id, input) 
  },
  updateMessage: ({ id, input }) => {
    if (!fakeDatabase[id]) {
      throw new Error('no message exists with id ' + id)
    }
    fakeDatabase[id] = input
    return Message(id, input)
  }
}

const loggingMiddleware = function(req, res, next) {
  console.log('ip:', req.ip)
  next()
}

const app = express()
app.use(loggingMiddleware)
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: false
}))

app.listen(4000)
console.log('Running a GraphQL API server at localhost:4000/graphql')