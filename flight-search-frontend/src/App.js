import React, { useState } from 'react';
import { ApolloProvider, useQuery, gql } from '@apollo/client';
import client from './ApolloClient';

const SEARCH_FLIGHTS = gql`
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
`;

function FlightSearch() {
  const [departureCity, setDepartureCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [date, setDate] = useState('');

  const { loading, error, data, refetch } = useQuery(SEARCH_FLIGHTS, {
    variables: { departureCity, destinationCity, date },
    skip: !departureCity || !destinationCity || !date,
  });

  const handleSearch = () => {
    console.log(date)
    if (departureCity && destinationCity && date) {
      refetch();
    }
  };

  return (
    <div>
      <h2>Flight Search</h2>
      <input
        type="text"
        placeholder="Departure City"
        value={departureCity}
        onChange={(e) => setDepartureCity(e.target.value)}
      />
      <input
        type="text"
        placeholder="Destination City"
        value={destinationCity}
        onChange={(e) => setDestinationCity(e.target.value)}
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && (
        <div>
          {data.searchFlights.map(({ id, flightNumber, airline, departureCity, destinationCity, departureTime, arrivalTime, price, co2Emissions }) => (
            <div key={id}>
              <p>
                {flightNumber} - {airline}: {departureCity} to {destinationCity}
              </p>
              <p>
                Departure: {new Date(departureTime).toLocaleString()}, Arrival: {new Date(arrivalTime).toLocaleString()}
              </p>
              <p>
                Price: ${price}, CO2 Emissions: {co2Emissions} kg
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <ApolloProvider client={client}>
      <div className="App">
        <FlightSearch />
      </div>
    </ApolloProvider>
  );
}

export default App;