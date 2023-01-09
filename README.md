# Getting Started with Sample Pokemon App
Example app to get a refresh with React and front-end development
- Demonstrate some industry engineering practices
- Get reacquainted with modern React and TypeScript
- Built on top of PokeApi

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Basic Features
1. Two views
    1. Search a specific pokemon by name or id as a typeahead
    2. Pokedex
        1. Use reducer instead of useState
2. Caching for PokeApi requests
    1. Configurable for in-memory, session storage or local storage
3. Update window.location/URL for most recent search and main view and respect browser history navigation
4. An early implementation of the App with just a single view that was later refactored into the Pokedex view in the main implementation


## TODO
- [x] Add caching for fetch requests
- [x] Identify cache hits as recently accessed
- [ ] Consider caching 404 responses too
- [ ] Make cache hit updates efficient with binary heap
- [x] Make cache generic and decoupled from PokeApiClient
- [x] Backup cache to SessionStorage
- [ ] Consider replacing URL/browser navigation with something more robust like React Router
- [ ] Consider replacing usage of PokeApi REST API with queries to the GraphQL API to minimize overfetching
- [ ] Extract all configurations into a configuration file
- [ ] Maybe compress/encode cached data
- [ ] Add unit tests
- [ ] Parse nested ImageSet data properly
- [ ] Error messages
- [ ] Input validation in typeahead before fetch requests when input is clearly invalid
- [ ] Properly preserve pokedex view between navigations
- [ ] Add analytics

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
