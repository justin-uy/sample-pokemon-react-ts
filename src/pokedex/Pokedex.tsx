import { PokemonListItemApiPayload } from '../types/ApiResponseTypes';

import { useEffect, useReducer, MouseEventHandler, MouseEvent, Dispatch } from 'react';
import PokemonListItem from './PokemonListItem';
import PokeApiClient from '../data-access/PokeApiClient';
import Pokemon from '../common/Pokemon';

enum ActionType {
  HANDLE_POKEMON_LIST_RESPONSE = 'HANDLE_POKEMON_LIST_RESPONSE',
  UPDATE_POKEMON_DETAILS = 'UPDATE_POKEMON_DETAILS',
  FETCHING_POKEMON = 'FETCHING_POKEMON',
  FETCHING_POKEMON_FAILED = 'FETCHING_POKEMON_FAILED',
  CLEAR_POKEMON_FROM_STALE_STATE = 'CLEAR_POKEMON_FROM_STALE_STATE',
};

type State = {
  isFetchingPokemon: boolean,
  pokemonDict: { [key: string]: Pokemon }
  url: string,
};

const initialState: State = {
  isFetchingPokemon: false,
  pokemonDict: {},
  url: 'https://pokeapi.co/api/v2/pokemon?limit=10&offset=0',
};

interface Action {
  type: ActionType,
  payload?: any,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.HANDLE_POKEMON_LIST_RESPONSE:
      const { additionalApiPayloads, url } = action.payload;
      additionalApiPayloads.forEach((pokemonApiPayload: PokemonListItemApiPayload) => {
        state.pokemonDict[pokemonApiPayload.name] = new Pokemon(pokemonApiPayload);
      });
      return { ...state, url: url, isFetchingPokemon: false };
    case ActionType.UPDATE_POKEMON_DETAILS:
      const { pokemon } = action.payload;
      state.pokemonDict[pokemon.name] = pokemon;
      return { ...state };
    case ActionType.FETCHING_POKEMON:
      return { ...state, isFetchingPokemon: true };
    case ActionType.FETCHING_POKEMON_FAILED:
      return { ...state, isFetchingPokemon: false };
    case ActionType.CLEAR_POKEMON_FROM_STALE_STATE:
      return { ...state, pokemonDict: {} };
  }
}

const fetchPokemon = async (url: string, dispatch: Dispatch<Action>) => {
  dispatch({
    type: ActionType.FETCHING_POKEMON,
  });

  try {
    const payload = await PokeApiClient.fetchPokemonList(url);
    dispatch({
      type: ActionType.HANDLE_POKEMON_LIST_RESPONSE,
      payload: { url: payload.next, additionalApiPayloads: payload.results },
    });
  } catch (e: unknown) {
    console.error("Get Pokemon HTTP request failure");
    console.error(e);

    dispatch({
      type: ActionType.FETCHING_POKEMON_FAILED,
    });
  }
}

const onMorePokemonClick = (url: string, dispatch: Dispatch<Action>): MouseEventHandler => async (e: MouseEvent) => {
  await fetchPokemon(url, dispatch);
};

export default function Pokedex() {
  const [{ url, pokemonDict, isFetchingPokemon }, dispatch] = useReducer(reducer, initialState);

  const totalPokemon = Object.keys(pokemonDict).length;
  // Fetch initial set of pokemon on load
  useEffect(() => {
    // currently navigating to and this view will keep stale pokemonDict state, which makes the UI janky
    // 
    // Remove this if/when this is updated to properly preserve pokedex view between navigations
    dispatch({
      type: ActionType.CLEAR_POKEMON_FROM_STALE_STATE,
    });
    fetchPokemon(url, dispatch);
    // Intentionally include provide empty dependency array because we only want it to run on initial page load
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      <h1>Pokedex ({totalPokemon ? `Loaded: ${totalPokemon}` : 'Loading...'})</h1>
      <div>
        {Object.keys(pokemonDict).map(name => {
          const pokemon = pokemonDict[name];
          return <PokemonListItem key={name} pokemon={pokemon} updatePokemonDict={(pokemon) => {
            dispatch({
              type: ActionType.UPDATE_POKEMON_DETAILS,
              payload: { pokemon },
            })
          }} />;
        })}
      </div>
      <h2>Need more Pokemon?</h2>
      <div>
        {/* disabled while fetching in case of slow network, we don't want to re-fetch the same url of re-clicking */}
        <button type="button" disabled={isFetchingPokemon} onClick={onMorePokemonClick(url, dispatch)}>Get More Pokemon!</button>
      </div>
    </div>
  );
}
