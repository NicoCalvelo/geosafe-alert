# GeoSafe Alert

## Project Overview

GeoSafe Alert is a project that aims to provide real-time alerts and notifications for various geospatial events. The system is designed to monitor specific geographic areas and send alerts based on predefined criteria.

We want to make a project to show how to use Three.js and GeoJSON to create a 3D visualization of geospatial data. The project include a web application that displays a 3D map with various geospatial features, such as terrain, buildings, and points of interest. Users will be able to interact with the map, zoom in and out, and view detailed information about specific locations.

4 principal types of alerts are currently supported:
- Fire
- Flood
- Earthquake
- Thunderstorm

## Technologies Used

- Three.js: A JavaScript library for creating 3D graphics in the browser.
- AdonisJS: A Node.js web framework for the backend API.
- Angular: A TypeScript-based web application framework for building the frontend.

## Project Structure

The project is organized into the following main directories:

- `backend/`: Contains the AdonisJS backend API code.
  - `app/`: Contains the main application logic, including controllers, models, and services.
  - `config/`: Contains configuration files for the AdonisJS application.
  - `database/`: Contains database migration and seed files.
  - `public/`: Contains static assets such as images, stylesheets, and JavaScript files.
- `frontend/`: Contains the Angular frontend application code.
  - `src/`: Contains the main source code for the Angular application, including components, services, and modules.
    - `app/`: Contains the main application components and services.
      - `core/models/`: Contains TypeScript interfaces and classes that define the data models used in the application.
      - `core/services/`: Contains Angular services for handling API requests and business logic.
      - `pages/`: Contains Angular components for different pages of the application.
      - `shared/components/`: Contains reusable Angular components that can be used across the application.
    - `environments/`: Contains environment configuration files for different deployment environments (e.g., development, production).

## Constraints

- Let AdonisJS handle the migrations and database seeding. Do not write any SQL scripts or use any other tool for database management.
- The frontend application should be built using Angular and should not use any other frontend framework or library.
- The 3D visualization should be implemented using Three.js and should not use any other 3D graphics library.
- The project should be developed using TypeScript for both the frontend and backend code.
- Do only what you are asked to do. Do not add any extra features or functionality that is not explicitly requested.
- Keep the codebase clean and well-organized, following best practices for both frontend and backend development.
- Keep it simple. Do not overcomplicate the implementation or add unnecessary complexity to the codebase.
- If you are unsure about any aspect of the project or have any questions, ask for clarification before proceeding with the implementation.