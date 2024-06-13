CREATE TABLE flights (
  id SERIAL PRIMARY KEY,
  flight_number VARCHAR(10),
  airline VARCHAR(50),
  departure_city VARCHAR(50),
  destination_city VARCHAR(50),
  departure_time TIMESTAMP,
  arrival_time TIMESTAMP,
  price DECIMAL,
  distance INT
);