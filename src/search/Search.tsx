
import { useEffect, useState } from 'react';
import PokemonDetails from '../common/PokemonDetails';
import Pokemon from '../common/Pokemon';
import './Search.css';
import pokeApiClient from '../data-access/PokeApiClient';
import { Nullable } from '../types/common';

const SEARCH_DELAY_MS = 500;
let lastChange = 0;

async function fetchPokemon(input: string, setIsFetching: (value: boolean) => void, setResult: (value: Pokemon) => void) {
  // if input is empty no need to fetch
  if (!input.trim()) {
    return;
  }

  setIsFetching(true);

  try {
    const pokemon = await pokeApiClient.fetchPokemonDetails(`https://pokeapi.co/api/v2/pokemon/${input}/`);
    setResult(pokemon);
  } finally {
    setIsFetching(false);
  }
}

// keep track of the last query in the URL, so people can share links
// of pokemon they searched
function updateBrowserHistory(input: string) {
  const url = new URL(window.location.href);
  url.search = `q=${input.toLowerCase()}`;
  window.history.pushState({}, '', url);
}

function getQueryFromUrl(): string {
  return (new URLSearchParams(window.location.search)).get('q') as string;
}

export default function Search() {
  const [query, setQuery] = useState(getQueryFromUrl());
  const [result, setResult] = useState(null as Nullable<Pokemon>)
  const [isFetching, setIsFetching] = useState(false);

  // automatically load the last query
  useEffect(() => {
    fetchPokemon(query, setIsFetching, setResult);

    // Handle browser back and forward
    const onPopStateCallback = () => {
      const newQuery = getQueryFromUrl();
      setQuery(newQuery)
      fetchPokemon(newQuery, setIsFetching, setResult);
    };

    window.addEventListener('popstate', onPopStateCallback, true);

    return () => {
      window.removeEventListener('popstate', onPopStateCallback, true);
    };
  }, []);

  return (
    <div className="search">
      <h1>Search</h1>
      <input
        value={query}
        placeholder="Pokemon Name or ID (e.g. Pikachu or 25)"
        onChange={(e) => {
          lastChange = Date.now();
          const input = e.target.value;
          setQuery(input);

          if (!input) {
            setResult(null);
            updateBrowserHistory('');
            return;
          }

          setTimeout(async () => {
            // Only fetch if there haven't been any input changes in the last SEARCH_DELAY_MS
            if (!input || Date.now() - lastChange < SEARCH_DELAY_MS) {
              return;
            }

            updateBrowserHistory(input);

            fetchPokemon(input, setIsFetching, setResult);
          }, SEARCH_DELAY_MS)
        }}
      />
      <div>
        {isFetching && <h2>Loading...</h2>}
        {result && <PokemonDetails pokemon={result} />}
      </div>
    </div>
  );
}