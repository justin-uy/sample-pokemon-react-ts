import type { PokemonListApiPayload, PokemonListItemApiPayload } from './types/ApiResponseTypes';

import { useState, useCallback, useReducer, MouseEventHandler, MouseEvent } from 'react';
import PokemonListItem from './pokedex/PokemonListItem';

import Pokemon from './common/Pokemon';

import './App.css';

function App() {
  const [pokemonDict, setPokemonDict] = useState({} as { [key: string]: Pokemon });
  const [url, setUrl] = useState('https://pokeapi.co/api/v2/pokemon?limit=10&offset=0');

  // Creating separate function since it's called by useEffect() on intial render and when "More Pokemon" is clicked
  const fetchPokemon = async () => {
    try {
      const response = await fetch(url);
      const results = await response.json() as PokemonListApiPayload;
      setUrl(results.next);
      results.results.forEach((pokemonApiPayload: PokemonListItemApiPayload) => {
        pokemonDict[pokemonApiPayload.name] = new Pokemon(pokemonApiPayload);
      });
      setPokemonDict(pokemonDict);
    } catch (e: unknown) {
      console.error("Get Pokemon HTTP request failure");
      console.error(e);
    }
  }

  const onMorePokemonClick = (): MouseEventHandler => async (e: MouseEvent) => {
    fetchPokemon();
  };

  // fetch initial set of pokemon on load
  useCallback(() => {
    fetchPokemon();
  }, [fetchPokemon]);

  return (
    <div className="App">
      <h1>Pokemon</h1>
      <div>
        {Object.keys(pokemonDict).map(name => {
          const pokemon = pokemonDict[name];
          return <PokemonListItem key={name} pokemon={pokemon} updatePokemonDict={(pokemon) => {
            setPokemonDict({
              ...pokemonDict,
              [pokemon.name]: pokemon,
            });
          }} />;
        })}
      </div>
      <h2>Need more Pokemon?</h2>
      <div>
        <button type="button" onClick={onMorePokemonClick()}>Get More Pokemon!</button>
      </div>
    </div>
  );
}

export default App;
