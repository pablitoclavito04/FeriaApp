import { lazy } from 'react';

// React.lazy that recovers from a failed dynamic import. After a new deploy the
// chunk file names change (new hashes); a browser holding a stale index.html
// requests an old chunk that no longer exists, the import() rejects, and
// <Suspense> would otherwise hang on its fallback forever ("Loading…").
//
// When that happens we reload the page ONCE to pull the fresh index.html (and
// its current chunk names). A sessionStorage flag prevents an infinite reload
// loop if the failure is caused by something other than a stale chunk.
const lazyWithRetry = (importer) =>
  lazy(async () => {
    const flagKey = 'chunk-reload-attempted';
    try {
      const module = await importer();
      window.sessionStorage.removeItem(flagKey);
      return module;
    } catch (error) {
      const alreadyTried = window.sessionStorage.getItem(flagKey);
      if (!alreadyTried) {
        window.sessionStorage.setItem(flagKey, '1');
        window.location.reload();
        // Return a never-resolving promise so nothing renders before reload.
        return new Promise(() => {});
      }
      // Second failure: the problem is not a stale chunk — surface it.
      throw error;
    }
  });

export default lazyWithRetry;
