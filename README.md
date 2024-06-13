# Flight Search API

## Overview
This project is a flight search application that supports multiple passengers and calculates CO2 emissions for each passenger based on flight distance. The application is built using Node.js, React, Redis, PostgreSQL, Docker, and Apollo GraphQL.

## Features
- Filter flights based on departure city, destination city, and date.
- Return flight details including flight number, airline, departure time, arrival time, price, and CO2 emissions.
- Calculate CO2 emissions based on flight distance.
- Handle edge cases such as no flights found, invalid dates, etc.
- Cache GraphQL query results using Redis for improved performance.
- Basic logging and error handling.
- Small web application using React for the simple search form and results.
- Sorting of flights by price, duration, or departure time.
- Filtering by airline or price range.

## System Design
### Architecture
The system consists of the following components:
- **Node.js API**: Handles flight search queries and CO2 emissions calculations.
- **React Web Application**: Provides a user interface for searching flights.
- **Redis**: Used for caching GraphQL query results.
- **PostgreSQL**: Stores flight data and CO2 emissions information.
- **Apollo GraphQL**: Provides a GraphQL API for querying flight data.

### Database Schema
#### Tables
- **airlines**: Stores airline information.
- **airports**: Stores airport information.
- **flights**: Stores flight information including departure and arrival times, prices, and distances.
- **co2_emissions**: Stores CO2 emissions data for each flight.

## Installation and Setup
### Prerequisites
- Node.js
- Docker
- PostgreSQL
- Redis

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/chengcui2021/flight-search-api.git
   cd flight-search-api
   
2. Set up Backend server, PostgreSQL and Redis:
   ```bash
   docker compose up --build

3. Access to database and create the table and seed the PostgreSQL database with sample data:
   ```bash
   psql postgresql://root:12345@localhost:5432/flight
   \i db.sql
   \i sample_data.sql

4. Start the frontend server:
   ```bash
   cd flight-search-frontend
   npm install
   npm start

5. Open browser and navigate to http://localhost:3000.

6. Naviagte to http://localhost:4000/graphql to run graphql queries
   ```bash
   query SearchFlights($departureCity: String!, $destinationCity: String!, $date: String!) {
    searchFlights(departureCity: $departureCity, destinationCity: $destinationCity, date: $date) {
      id
      flight_number
      airline
      departure_city
      destination_city
      departure_time
      arrival_time
    	distance
      price
      co2Emissions
    }
   }


### Design Decisions
- Database: PostgreSQL is chosen for its robust relational data handling and ACID compliance.
- Caching: Redis is used to cache query results and reduce database load.
- Deployment: Docker container is created and can be deployed as a microservice to aws fargate working with ecs or eks for horizontal scalling.
### Future Improvements
- Add user authentication.
- Implement pagination for flight results.
- Integrate with real flight data APIs.

#### System Design Document

## Architecture Overview

The Flight Search API is built using Node.js with Apollo Server for the backend and React for the frontend. The system uses PostgreSQL for data storage and Redis for caching.

### Components

1. **Backend (Node.js with Apollo Server)**
   - Handles GraphQL queries and mutations.
   - Connects to PostgreSQL database to fetch and manipulate flight data.
   - Utilizes Redis for caching query results to improve performance.
   - Implements CO2 emissions calculation based on flight distance.

2. **Frontend (React)**
   - Provides a user interface for searching flights.
   - Displays flight details including CO2 emissions.

3. **Database (PostgreSQL)**
   - Stores flight details including flight number, airline, departure time, arrival time, prices and distance for CO2Emission calculation.

4. **Cache (Redis)**
   - Caches flight search results to reduce database load and improve response time.

### Data Storage and Schema

#### PostgreSQL Schema

- **flights**
  - `id`: Serial, Primary Key
  - `flight_number`: Varchar(10)
  - `airline`: Varchar(50)
  - `departure_city`: Varchar(50)
  - `destination_city`: Varchar(50)
  - `departure_time`: Timestamp
  - `arrival_time`: Timestamp
  - `price`: Decimal
  - `distance`: Decimal

### Scaling and Bottlenecks

1. **Scalability**
   - The backend can handle concurrent requests efficiently due to Node.js's non-blocking I/O.
   - Redis caching helps to reduce database load and improves performance.


2. **Potential Bottlenecks**
   - High number of cache misses can lead to increased database load.
   - Large volume of flight data may require database sharding or partitioning.

### Logging and Error Handling

- Basic logging is implemented using `console.log` for simplicity. In production, a logging framework like Winston or Morgan can be used.
- Error handling includes validation for input parameters and proper error messages for different scenarios (e.g., no flights found, invalid dates).

## Conclusion

The Flight Search API is a robust system designed to efficiently handle flight searches with CO2 emissions calculation. The use of caching and asynchronous processing ensures good performance and scalability.
   