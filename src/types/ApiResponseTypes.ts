export type ImageSet = { [key: string]: string | { [key: string]: ImageSet } };

export type PokemonDetailsTypeApiPayload = { type: { name: string } };

export type PokemonListItemApiPayload = { name: string, url: string };

// See: https://pokeapi.co/docs/v2#resource-listspagination-section
export interface PokemonListApiPayload {
  count: number,
  next: string,
  previous: string,
  results: Array<PokemonListItemApiPayload>,
};

// See: https://pokeapi.co/docs/v2#pokemon
//
// We only care about a subset of the returned data
export interface PokemonDetailsApiPayload {
  name: string;
  id: number;
  types: Array<PokemonDetailsTypeApiPayload>,
  moves: Array<{ move: { name: string } }>,
  sprites: ImageSet,
}
