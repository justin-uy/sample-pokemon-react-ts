import { PokemonListApiPayload, PokemonDetailsApiPayload } from "../types/ApiResponseTypes";
import Pokemon from "../common/Pokemon";
import SimpleCache, { CacheType } from "./SimpleCache";

// Arbitrary number could be bigger or smaller depending on how much storage we're willing to take
// (note: for in-browser testing, just make this a small number to see least recently used items removed)
const MAX_CACHE_SIZE = 15;

class PokeApiClient {
  #cache: SimpleCache<Response> = new SimpleCache('poke-api-client', CacheType.SESSION_STORAGE, MAX_CACHE_SIZE);
  #fetchesInProgress: Set<string> = new Set();

  async fetchPokemonDetails(url: string): Promise<Pokemon> {
    const payload = await this.#fetch(url) as PokemonDetailsApiPayload;
    return new Pokemon(payload);
  }

  async fetchPokemonList(url: string): Promise<PokemonListApiPayload> {
    const payload = await this.#fetch(url) as PokemonListApiPayload;
    return payload;
  }

  // N.B. This is a es2015 feature
  // 
  // I'm not worried about backward compatibility for the purposes of this sample app, but we
  // could make this not private if we wanted to fallback to es5 compatibility
  //
  // N.B We cache the parsed payloads and not the Response, since we can only call `response.json()` once on a Response
  async #fetch(url: string): Promise<any> {
    const cachedPayload = this.#cache.get(url);
    if (cachedPayload) {
      return Promise.resolve(cachedPayload);
    }

    // if is in progress 
    if (this.#fetchesInProgress.has(url)) {
      return Promise.reject();
    }

    this.#fetchesInProgress.add(url);

    // let callers handle errors
    try {
      const response = await fetch(url);
      const parsedResponse = await response.json();
      this.#cache.put(url, parsedResponse);
      return parsedResponse;
    } catch (e: any) {
      // we may want to cache 404s also
      console.error(e);
      throw e;
    } finally {
      this.#fetchesInProgress.delete(url)
    }
  }
}

// return a singleton so that the cache is shared across views
export default new PokeApiClient();