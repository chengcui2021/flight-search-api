const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { Pool } = require('pg');
const redis = require('redis');
const util = require('util');

const pool = new Pool({
  user: 'root',
  host: 'localhost',
  database: 'flight',
  password: '12345',
  port: 5432,
});

const calculateCO2Emissions = (distance) => {
  const CO2_PER_KM = 0.115;
  return distance * CO2_PER_KM;
};


const typeDefs = gql`
  type Flight {
    id: ID!
    flight_number: String!
    airline: String!
    departure_city: String!
    destination_city: String!
    departure_time: String!
    arrival_time: String!
    price: Float!
    distance: Int!
    co2Emissions: Float!
  }

  type Query {
    searchFlights(departureCity: String!, destinationCity: String!, date: String!): [Flight]
  }
`;

const resolvers = {
  Query: {
    searchFlights: async (_, { departureCity, destinationCity, date }) => {

      const res = await pool.query(
        `SELECT * FROM flights WHERE departure_city = $1 AND destination_city = $2 AND DATE(departure_time) = $3`,
        [departureCity, destinationCity, date]
      );

      if (res.rows.length === 0) {
        throw new Error('No flights found');
      }

      const flights = res.rows.map(flight => {
        const co2Emissions = calculateCO2Emissions(flight.distance);
        return { ...flight, co2Emissions };
      });
      return flights;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();
server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
  console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
);