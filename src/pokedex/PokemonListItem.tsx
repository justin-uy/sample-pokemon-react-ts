
import { useState, MouseEventHandler, MouseEvent } from 'react';
import Pokemon from '../common/Pokemon';
import { capitalize } from '../common/Utils';
import pokeApiClient from '../data-access/PokeApiClient';

import './PokemonListItem.css';
import PokemonDetails from '../common/PokemonDetails';

type Props = {
  pokemon: Pokemon,
  updatePokemonDict: (pokemon: Pokemon) => void,
}

export default function PokemonListItem(props: Props) {
  const { pokemon, updatePokemonDict } = props;
  const [isFetchingDetails, setIsFetchingDetails] = useState(false)

  // define function here so that `updatePokemonDict` is in the scope/closure
  const onPokemonDetailsClick = (detailsUrl: string): MouseEventHandler => async (e: MouseEvent) => {
    setIsFetchingDetails(true);
    try {
      const pokemon = await pokeApiClient.fetchPokemonDetails(detailsUrl);
      updatePokemonDict(pokemon);
    } finally {
      setIsFetchingDetails(false);
    }
  }

  return (
    <div key={pokemon.name}>
      <h3>
        {capitalize(pokemon.name)}
        {/* url only exists if the details have not yet been fetched yet */}
        {pokemon.url
          && <button type="button" className="pokemon-list-item__details-button" disabled={isFetchingDetails} onClick={onPokemonDetailsClick(pokemon.url)}>Details</button>}
      </h3>
      <PokemonDetails pokemon={pokemon} />
    </div>
  );
}
