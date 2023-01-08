import React from 'react';

import Pokemon from './Pokemon';

import './PokemonDetails.css';

type Props = {
  pokemon: Pokemon,
};

export default function PokemonDetails(props: Props) {
  const { pokemon } = props;
  return (
    <div className="pokemon-details__container">
      {
        pokemon.images && pokemon.images.map(value =>
          <div className="pokemon-details__image-container" key={value.description}><img src={value.url} alt={`${pokemon.name} - ${value.description}`} /> {value.description}</div>)
      }
      {/* Check if fields exist/are not empty. These fields only exist after details have been fetched */}
      {pokemon.id && <div>ID: {pokemon.id}</div>}
      {pokemon.types && <div>Types: {pokemon.types.join(', ')}</div>}
      {
        pokemon.moves &&
        <div>
          Moves:
          <ul> {pokemon.moves.map(name => <li key={name}>{name}</li>)}</ul>
        </div>
      }
    </div>
  )
}