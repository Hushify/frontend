export const HEADER_SIZE = 24;
export const AUTH_SIZE = 17;
export const AMZ_MIN_CHUNK_SIZE = 5 * 1024 * 1024;
export const DEFAULT_CHUNK_SIZE = 64 * 1024;
export const ENCRYPTED_CHUNK_SIZE = DEFAULT_CHUNK_SIZE + AUTH_SIZE;
