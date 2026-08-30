// vitest 运行在 node 环境，为依赖浏览器存储的模块补一个内存实现
const createMemoryStorage = () => {
  const store = new Map();
  return {
    getItem: (key) => (store.has(String(key)) ? store.get(String(key)) : null),
    setItem: (key, value) => store.set(String(key), String(value)),
    removeItem: (key) => store.delete(String(key)),
    clear: () => store.clear(),
    key: (index) => [...store.keys()][index] ?? null,
    get length() {
      return store.size;
    }
  };
};

if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = createMemoryStorage();
}

if (typeof globalThis.sessionStorage === 'undefined') {
  globalThis.sessionStorage = createMemoryStorage();
}
