const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { Pool } = require('pg');
const redis = require('redis');

const pool = new Pool({
  user: 'root',
  host: 'db',
  database: 'flight',
  password: '12345',
  port: 5432,
});

const redisClient = redis.createClient({
  url: 'redis://redis:6379'
});

redisClient.connect().catch(console.error)



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

  input SortByInput {
    field: String!
    order: String!
  }

  input FilterByInput {
    airline: String
    priceRange: PriceRangeInput
  }

  input PriceRangeInput {
    min: Float
    max: Float
  }

  type Query {
    searchFlights(departureCity: String!, destinationCity: String!, date: String!, sortBy: SortByInput, filterBy: FilterByInput): [Flight]
  }
`;

const resolvers = {
  Query: {
    searchFlights: async (_, { departureCity, destinationCity, date, sortBy, filterBy }) => {
      const cacheKey = `flights_${departureCity}_${destinationCity}_${date}`;
      const cachedFlights = await redisClient.get(cacheKey);
      if (cachedFlights) {
        return JSON.parse(cachedFlights);
      }

      const res = await pool.query(
        `SELECT * FROM flights WHERE departure_city = $1 AND destination_city = $2 AND DATE(departure_time) = $3`,
        [departureCity, destinationCity, date]
      );

      if (res.rows.length === 0) {
        throw new Error('No flights found');
      }


      if (filterBy) {
        if (filterBy.airline) {
          res.rows.filter(flight => flight.airline === filterBy.airline);
        }
        if (filterBy.priceRange) {
          const { min, max } = filterBy.priceRange;
          res.rows.filter(flight => flight.price >= min && flight.price <= max);
        }
      }

      if (sortBy) {
        res.rows.sort((a, b) => {
          if (sortBy.field === 'PRICE') {
            return sortBy.order === 'ASC' ? a.price - b.price : b.price - a.price;
          }
          if (sortBy.field === 'DURATION') {
            const durationA = new Date(a.arrival_time) - new Date(a.departure_time);
            const durationB = new Date(b.arrival_time) - new Date(b.departure_time);
            return sortBy.order === 'ASC' ? durationA - durationB : durationB - durationA;
          }
          if (sortBy.field === 'DEPARTURE_TIME') {
            return sortBy.order === 'ASC' ? new Date(a.departure_time) - new Date(b.departure_time) : new Date(b.departure_time) - new Date(a.departureTime);
          }
          return 0;
        });
      }

      const flights = res.rows.map(flight => {
        const co2Emissions = calculateCO2Emissions(flight.distance);
        return { ...flight, co2Emissions };
      });


      await redisClient.set(cacheKey, JSON.stringify(flights), 'EX', 3600);
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