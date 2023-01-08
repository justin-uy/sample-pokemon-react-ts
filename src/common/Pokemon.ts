import type { PokemonListItemApiPayload, PokemonDetailsApiPayload, ImageSet } from '../types/ApiResponseTypes';

import { capitalize } from './Utils';

export default class Pokemon {
  name: string;
  url?: string;
  id?: number;
  types?: Array<string>;
  moves?: Array<string>;
  images: Array<{ description: string, url: string }> = [];

  // See: https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates
  // 
  // Check for existence of fields/properties unique to the type to assert what the type is
  isApiResponsePokemonListItem(apiResponse: any): apiResponse is PokemonListItemApiPayload {
    return (apiResponse as PokemonListItemApiPayload).url !== undefined
  }

  isApiResponsePokemonDetails(apiResponse: any): apiResponse is PokemonDetailsApiPayload {
    return (apiResponse as PokemonDetailsApiPayload).id !== undefined
  }

  constructor(apiResponse: PokemonDetailsApiPayload | PokemonListItemApiPayload) {
    this.name = apiResponse.name;
    if (this.isApiResponsePokemonListItem(apiResponse)) {
      this.url = apiResponse.url;
    }

    if (this.isApiResponsePokemonDetails(apiResponse)) {
      this.id = apiResponse.id;
      this.types = apiResponse.types.map(entry => capitalize(entry.type.name));
      this.moves = apiResponse.moves.map(entry => entry.move.name);
      if (apiResponse.sprites) {
        this.appendImageSetToImages(apiResponse.sprites);
      }
    }
  }

  appendImageSetToImages(imageSet: ImageSet) {
    Object.keys(imageSet).forEach((key: string) => {
      const imageData = imageSet[key];
      if (!imageData) {
        return;
      }

      // ignore special sprite sets for now
      if (typeof (imageData) === 'string') {
        this.images.push({
          description: capitalize(key.split('_').join(' ')),
          url: imageData as string,
        });
      }
    });
  }
}