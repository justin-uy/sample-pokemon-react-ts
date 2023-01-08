import { Nullable } from "../types/common";

export enum CacheType {
  IN_MEMORY,
  SESSION_STORAGE,
  LOCAL_STORAGE,
}

type KeyMetadata = {
  key: Key,
  lastAccessed: number,
}

type Key = string | number;

const KEY_METADATA_STORAGE_KEY_SUFFIX = 'key-metadata';

export default class SimpleCache<T> {
  name: string;
  type: CacheType;
  size: number;
  data: Nullable<{ [key: Key]: T }> = null;
  keyMetadata: Array<KeyMetadata> = [];

  constructor(name: string, type: CacheType, size: number) {
    this.name = name;
    this.type = type;
    this.size = size;

    switch (type) {
      case CacheType.IN_MEMORY:
        this.data = {};
        break;
      case CacheType.SESSION_STORAGE:
        this.#updateKeyMetadataFromStorage(window.sessionStorage);
        break;
      case CacheType.LOCAL_STORAGE:
        this.#updateKeyMetadataFromStorage(window.localStorage);
        break;
    }
  }

  /// PRIVATE APIs START ///

  // helper functions to make calls to storage simpler in core logic
  #getStorageKey(key: Key): string {
    return `${this.name}-${key}`;
  }

  #getItemFromStorage(storage: Storage, key: Key): Nullable<T> {
    const stringifiedValue = storage.getItem(this.#getStorageKey(key));
    if (!stringifiedValue) {
      return null;
    }

    return JSON.parse(stringifiedValue) as T;
  }

  #setItemInStorage(storage: Storage, key: Key, value: any) {
    storage.setItem(this.#getStorageKey(key), JSON.stringify(value));
  }

  #removeItemFromStorage(storage: Storage, key: Key) {
    storage.removeItem(this.#getStorageKey(key))
  }

  #updateKeyMetadataInStorage(storage: Storage) {
    this.#setItemInStorage(storage, KEY_METADATA_STORAGE_KEY_SUFFIX, this.keyMetadata);
  }

  #updateKeyMetadataFromStorage(storage: Storage) {
    const keyMetadataJson = storage.getItem(this.#getStorageKey(KEY_METADATA_STORAGE_KEY_SUFFIX));
    if (!keyMetadataJson) {
      return;
    }

    this.keyMetadata = JSON.parse(keyMetadataJson);
  }

  /// PRIVATE APIs END ///


  get(key: Key): Nullable<T> {
    let cachedValue: Nullable<T> = null;
    switch (this.type) {
      case CacheType.IN_MEMORY:
        cachedValue = this.data && this.data[key] || null;
        break;
      case CacheType.LOCAL_STORAGE:
        cachedValue = this.#getItemFromStorage(window.localStorage, key);
        break;
      case CacheType.SESSION_STORAGE:
        cachedValue = this.#getItemFromStorage(window.sessionStorage, key);
        break;
    }

    if (!cachedValue) {
      return null;
    }

    // CACHE HIT! Update cache metadata to mark a key as recently accessed
    //
    // Note: this is inefficient, but this is fine for small cache size
    //// if we want to make this truly generic and efficient, we can refactor this into a binary heap
    this.keyMetadata.forEach(metadata => {
      if (metadata.key !== key) {
        return;
      }

      metadata.lastAccessed = Date.now();
    });

    // sort the key metadata so that the next value shifted out is the least recently used
    this.keyMetadata.sort((a, b) => b.lastAccessed - a.lastAccessed);

    let storage;
    switch (this.type) {
      case CacheType.SESSION_STORAGE:
        storage = window.sessionStorage;
        break;
      case CacheType.LOCAL_STORAGE:
        storage = window.localStorage;
        break;
    }

    if (storage) {
      this.#updateKeyMetadataInStorage(storage);
    }

    return cachedValue;
  }

  put(key: Key, value: T) {
    this.keyMetadata.push({
      key: key,
      lastAccessed: Date.now(),
    });

    let storage: Nullable<Storage> = null;

    switch (this.type) {
      case CacheType.SESSION_STORAGE:
        storage = window.sessionStorage;
        break;
      case CacheType.LOCAL_STORAGE:
        storage = window.localStorage;
        break;
    }

    if (storage) {
      this.#setItemInStorage(storage, key, value);
    } else if (this.data) { // this should always be true if `storage` is falsey
      this.data[key] = value;
    }

    // Remove least recently used item from cache
    if (this.keyMetadata.length > this.size) {
      const leastRecentlyUsedKey = this.keyMetadata.shift() as KeyMetadata;

      // this.data will never be null for IN_MEMORY caches
      if (this.type === CacheType.IN_MEMORY && this.data) {
        delete this.data[leastRecentlyUsedKey.key];
      } else if (storage) { // this will always be truthy if this is storage based cache
        console.log(`remove: ${leastRecentlyUsedKey.key}`)
        this.#removeItemFromStorage(storage, leastRecentlyUsedKey.key);
      }
    }

    if (storage) {
      this.#updateKeyMetadataInStorage(storage);
    }
  }
}