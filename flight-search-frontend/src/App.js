import React, { useState } from 'react';
import { ApolloProvider, useQuery, gql } from '@apollo/client';
import client from './ApolloClient';

const SEARCH_FLIGHTS = gql`
query SearchFlights($departureCity: String!, $destinationCity: String!, $date: String!, $sortBy: SortByInput, $filterBy: FilterByInput) {
  searchFlights(departureCity: $departureCity, destinationCity: $destinationCity, date: $date, sortBy: $sortBy, filterBy: $filterBy) {
    flight_number
    airline
    departure_city
    destination_city
    departure_time
    arrival_time
    price
    co2Emissions
  }
}
`;

function FlightSearch() {
  const [departureCity, setDepartureCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [date, setDate] = useState('');
  const [sortBy, setSortBy] = useState({ field: 'PRICE', order: 'ASC' });
  const [filterBy, setFilterBy] = useState({ airline: '', priceRange: { min: 0, max: 1000 } });

  const { loading, error, data, refetch } = useQuery(SEARCH_FLIGHTS, {
    variables: { departureCity, destinationCity, date, sortBy, filterBy},
    skip: !departureCity || !destinationCity || !date,
  });

  const handleSearch = () => {
    console.log(date)
    if (departureCity && destinationCity && date) {
      refetch();
      console.log("show search data: ", data)
    }
  };

  const handleSortChange = (e) => {
    const [field, order] = e.target.value.split('-');
    setSortBy({ field, order });
  };

  const handleAirlineChange = (e) => {
    setFilterBy({ ...filterBy, airline: e.target.value });
  };

  const handlePriceRangeChange = (e) => {
    const { name, value } = e.target;
    setFilterBy({ ...filterBy, priceRange: { ...filterBy.priceRange, [name]: parseFloat(value) } });
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
        <select onChange={handleSortChange}>
          <option value="PRICE-ASC">Price: Low to High</option>
          <option value="PRICE-DESC">Price: High to Low</option>
          <option value="DURATION-ASC">Duration: Short to Long</option>
          <option value="DURATION-DESC">Duration: Long to Short</option>
          <option value="DEPARTURE_TIME-ASC">Departure Time: Earliest First</option>
          <option value="DEPARTURE_TIME-DESC">Departure Time: Latest First</option>
        </select>
        <input type="text" placeholder="Airline" value={filterBy.airline} onChange={handleAirlineChange} />
        <input type="number" name="min" placeholder="Min Price" value={filterBy.priceRange.min} onChange={handlePriceRangeChange} />
        <input type="number" name="max" placeholder="Max Price" value={filterBy.priceRange.max} onChange={handlePriceRangeChange} />
      <button onClick={handleSearch}>Search</button>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && (
        <div>
          {data.searchFlights.map((searchFlight) => (
            <div key={searchFlight.id}>
              <p>
                {searchFlight.flight_number} - {searchFlight.airline}: {searchFlight.departure_city} to {searchFlight.destination_city}
              </p>
              <p>
                Departure: {new Date(searchFlight.departure_time).toLocaleTimeString()}, Arrival: {new Date(searchFlight.arrival_time).toLocaleTimeString()}
              </p>
              <p>
                Price: ${searchFlight.price}, CO2 Emissions: {searchFlight.co2Emissions} kg
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