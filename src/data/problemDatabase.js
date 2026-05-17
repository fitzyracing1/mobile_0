export const PROBLEMS = {
  'git-conflict': {
    id: 'git-conflict',
    title: 'Git Merge Conflict',
    icon: '⚡',
    category: 'Version Control',
    severity: 'medium',
    description:
      'Two branches modified the same lines, creating conflicting changes that Git cannot automatically merge.',
    symptoms: [
      'CONFLICT markers in files (<<<<<<, =======, >>>>>>>)',
      'git status shows "both modified"',
      'git merge or git pull aborted',
      'Unresolved conflicts in staging area',
    ],
    quickFixes: [
      {
        step: 1,
        title: 'See all conflicting files',
        code: 'git status\ngit diff --name-only --diff-filter=U',
        description: 'List every file with unresolved conflicts.',
      },
      {
        step: 2,
        title: 'Open a conflict and resolve',
        code: '# Edit the file and remove conflict markers:\n# <<<<<<< HEAD\n# your change\n# =======\n# incoming change\n# >>>>>>> branch-name\n\n# Keep one side, both, or write a new version.',
        description: 'Delete the markers and leave the final desired code.',
      },
      {
        step: 3,
        title: 'Stage resolved files',
        code: 'git add <resolved-file>\n# or stage everything\ngit add .',
        description: 'Mark each conflict as resolved.',
      },
      {
        step: 4,
        title: 'Complete the merge',
        code: 'git commit\n# or if rebasing:\ngit rebase --continue',
        description: 'Finish the merge or rebase.',
      },
    ],
    resources: [
      { title: 'Git merge docs', url: 'https://git-scm.com/docs/git-merge' },
      { title: 'Atlassian conflict guide', url: 'https://www.atlassian.com/git/tutorials/using-branches/merge-conflicts' },
    ],
    aiPrompt:
      'I have a Git merge conflict. Explain the best strategies to resolve it cleanly, including when to use git merge vs git rebase vs git cherry-pick, and how to prevent conflicts in the future.',
  },

  'null-undefined': {
    id: 'null-undefined',
    title: 'Null / Undefined Error',
    icon: '🔴',
    category: 'Runtime Error',
    severity: 'high',
    description:
      'Accessing a property or calling a method on a null or undefined value causes a runtime crash.',
    symptoms: [
      "TypeError: Cannot read property 'x' of undefined",
      "TypeError: Cannot read properties of null",
      'NullPointerException (Java/Kotlin)',
      'Unexpected behavior from optional chaining gone wrong',
    ],
    quickFixes: [
      {
        step: 1,
        title: 'Guard with optional chaining (JS/TS)',
        code: '// Before (crashes)\nconst name = user.profile.name;\n\n// After (safe)\nconst name = user?.profile?.name ?? "Unknown";',
        description: 'Use ?. and ?? to short-circuit safely.',
      },
      {
        step: 2,
        title: 'Add a null check',
        code: 'if (user !== null && user !== undefined) {\n  console.log(user.profile.name);\n}',
        description: 'Explicitly guard before accessing.',
      },
      {
        step: 3,
        title: 'Trace the data source',
        code: 'console.log("user at entry:", user);\nconsole.log("profile:", user?.profile);',
        description: 'Log each level to find where the chain breaks.',
      },
      {
        step: 4,
        title: 'Provide a default value',
        code: 'const user = fetchUser() ?? defaultUser;\nconst items = response.data?.items ?? [];',
        description: 'Never trust external data — always default.',
      },
    ],
    resources: [
      { title: 'MDN Optional chaining', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining' },
      { title: 'Nullish coalescing', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing' },
    ],
    aiPrompt:
      'I have a null/undefined error in my code. Help me trace the root cause, fix it safely using modern JavaScript patterns, and prevent it in the future with TypeScript or runtime guards.',
  },

  'async-error': {
    id: 'async-error',
    title: 'Async / Await Problem',
    icon: '⏳',
    category: 'Async',
    severity: 'medium',
    description:
      'Promises are not awaited, errors are not caught, or async code runs in the wrong order.',
    symptoms: [
      'UnhandledPromiseRejection warning',
      'Data is undefined right after a fetch',
      'Functions return Promise {} instead of the value',
      'Race conditions or out-of-order execution',
    ],
    quickFixes: [
      {
        step: 1,
        title: 'Always await async calls',
        code: '// Wrong\nconst data = fetchData(); // returns Promise\n\n// Correct\nconst data = await fetchData();',
        description: 'Every async call must be awaited.',
      },
      {
        step: 2,
        title: 'Wrap in try/catch',
        code: 'async function loadData() {\n  try {\n    const data = await fetchData();\n    return data;\n  } catch (error) {\n    console.error("Fetch failed:", error);\n    throw error;\n  }\n}',
        description: 'Catch errors at every async boundary.',
      },
      {
        step: 3,
        title: 'Parallel fetches with Promise.all',
        code: '// Sequential (slow)\nconst a = await fetchA();\nconst b = await fetchB();\n\n// Parallel (fast)\nconst [a, b] = await Promise.all([fetchA(), fetchB()]);',
        description: 'Use Promise.all for independent async calls.',
      },
      {
        step: 4,
        title: 'Handle loading state in React',
        code: 'const [data, setData] = useState(null);\nconst [loading, setLoading] = useState(true);\n\nuseEffect(() => {\n  fetchData()\n    .then(setData)\n    .finally(() => setLoading(false));\n}, []);',
        description: 'Track loading/error state to avoid undefined renders.',
      },
    ],
    resources: [
      { title: 'MDN async/await', url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Promises' },
    ],
    aiPrompt:
      'I have async/await issues in my JavaScript code. Help me understand the event loop, proper error handling with try/catch, and common async anti-patterns to avoid.',
  },

  'type-error': {
    id: 'type-error',
    title: 'Type Error',
    icon: '🏷️',
    category: 'Type System',
    severity: 'medium',
    description:
      'A value has an unexpected type — a string where a number is expected, wrong interface shape, or TypeScript compile error.',
    symptoms: [
      "TypeError: x.toUpperCase is not a function",
      "Type 'string' is not assignable to type 'number'",
      'NaN from numeric operations on strings',
      'TypeScript red squiggles on assignments',
    ],
    quickFixes: [
      {
        step: 1,
        title: 'Log the actual type',
        code: 'console.log(typeof value, value);\nconsole.log(Array.isArray(value));',
        description: 'Confirm what type you actually have.',
      },
      {
        step: 2,
        title: 'Parse or coerce correctly',
        code: '// String to number\nconst n = Number(str);       // NaN if invalid\nconst n = parseInt(str, 10); // integer\nconst n = parseFloat(str);   // float\n\n// Number to string\nconst s = String(n);\nconst s = n.toString();',
        description: 'Convert types explicitly instead of relying on coercion.',
      },
      {
        step: 3,
        title: 'Add TypeScript types',
        code: 'interface User {\n  id: number;\n  name: string;\n  email: string;\n}\n\nfunction greet(user: User): string {\n  return `Hello, ${user.name}`;\n}',
        description: 'TypeScript catches type errors at compile time.',
      },
      {
        step: 4,
        title: 'Validate at runtime boundaries',
        code: 'function safeAdd(a: unknown, b: unknown): number {\n  if (typeof a !== "number" || typeof b !== "number") {\n    throw new TypeError("Both arguments must be numbers");\n  }\n  return a + b;\n}',
        description: 'Validate API responses and user input.',
      },
    ],
    resources: [
      { title: 'TypeScript handbook', url: 'https://www.typescriptlang.org/docs/handbook/2/types-from-types.html' },
    ],
    aiPrompt:
      'I have a type error in my code. Help me diagnose the root cause, add proper TypeScript types, and understand best practices for type safety in JavaScript/TypeScript.',
  },

  'import-error': {
    id: 'import-error',
    title: 'Import / Module Error',
    icon: '📦',
    category: 'Modules',
    severity: 'high',
    description:
      'A module cannot be found or imported, due to wrong paths, missing packages, or CommonJS/ESM conflicts.',
    symptoms: [
      "Cannot find module './foo'",
      "Module not found: Error: Can't resolve",
      "SyntaxError: Cannot use import statement in a CommonJS module",
      "require is not defined in ES module scope",
    ],
    quickFixes: [
      {
        step: 1,
        title: 'Verify the import path',
        code: '// Relative paths need ./ prefix\nimport { foo } from "./utils/foo";\n\n// Not\nimport { foo } from "utils/foo"; // wrong!',
        description: 'Check for typos and correct relative vs absolute paths.',
      },
      {
        step: 2,
        title: 'Install the missing package',
        code: 'npm install <package-name>\n# or\nyarn add <package-name>\n# or\npnpm add <package-name>',
        description: 'Run in the project root where package.json lives.',
      },
      {
        step: 3,
        title: 'Fix ESM / CJS mismatch',
        code: '// package.json — pick one:\n{\n  "type": "module"   // use import/export everywhere\n}\n// OR\n{\n  "type": "commonjs" // use require/module.exports\n}\n\n// Interop: require() an ESM module:\nimport("./esm-module.mjs").then(m => m.default);',
        description: 'Match your module system or use dynamic import.',
      },
      {
        step: 4,
        title: 'Check tsconfig paths (TypeScript)',
        code: '// tsconfig.json\n{\n  "compilerOptions": {\n    "baseUrl": ".",\n    "paths": {\n      "@utils/*": ["src/utils/*"]\n    }\n  }\n}\n// Now you can: import { x } from "@utils/helper";',
        description: 'Set up path aliases for cleaner imports.',
      },
    ],
    resources: [
      { title: 'Node.js ESM guide', url: 'https://nodejs.org/api/esm.html' },
    ],
    aiPrompt:
      'I have an import/module error. Help me diagnose whether it is a path issue, missing package, ESM/CJS conflict, or TypeScript configuration problem.',
  },

  'build-error': {
    id: 'build-error',
    title: 'Build / Compile Error',
    icon: '🏗️',
    category: 'Build',
    severity: 'high',
    description:
      'The project fails to compile or bundle due to syntax errors, missing dependencies, or misconfiguration.',
    symptoms: [
      'Webpack/Vite/tsc build exits with non-zero code',
      'Red errors in terminal during npm run build',
      'Missing peer dependencies warnings',
      'Babel transform errors',
    ],
    quickFixes: [
      {
        step: 1,
        title: 'Read the first error, not the last',
        code: '# Pipe to less to navigate errors:\nnpm run build 2>&1 | less\n\n# Or save to file:\nnpm run build 2>&1 | tee build.log',
        description: 'Build errors cascade — fix the first one first.',
      },
      {
        step: 2,
        title: 'Clear caches and reinstall',
        code: 'rm -rf node_modules .next dist .cache\nnpm install\nnpm run build',
        description: 'Stale caches and lockfile drift cause phantom errors.',
      },
      {
        step: 3,
        title: 'Check Node.js and engine versions',
        code: 'node --version\nnpm --version\n\n# package.json engines field:\n{\n  "engines": { "node": ">=18.0.0" }\n}',
        description: 'Wrong Node.js version breaks native modules.',
      },
      {
        step: 4,
        title: 'Run TypeScript check separately',
        code: 'npx tsc --noEmit\n# Fix all type errors before building.',
        description: 'Isolate type errors from bundler errors.',
      },
    ],
    resources: [],
    aiPrompt:
      'I have a build error. Help me systematically diagnose whether it is a dependency issue, configuration problem, syntax error, or version conflict.',
  },

  'dependency-error': {
    id: 'dependency-error',
    title: 'Dependency / Package Error',
    icon: '🧩',
    category: 'Dependencies',
    severity: 'medium',
    description:
      'Package installation fails, peer dependency conflicts, or package versions are incompatible.',
    symptoms: [
      'npm ERR! peer dep missing',
      'ERESOLVE could not resolve',
      'Conflicting peer dependency warnings',
      'package not found or 404 from registry',
    ],
    quickFixes: [
      {
        step: 1,
        title: 'Force install with legacy peer deps',
        code: 'npm install --legacy-peer-deps\n# or\nnpm install --force',
        description: 'Bypasses strict peer dep checking — use as last resort.',
      },
      {
        step: 2,
        title: 'Use npm dedupe',
        code: 'npm dedupe\nnpm ls <package-name>',
        description: 'Deduplicates packages and shows the dependency tree.',
      },
      {
        step: 3,
        title: 'Pin conflicting packages',
        code: '// package.json overrides (npm 8.3+):\n{\n  "overrides": {\n    "problematic-package": "2.0.0"\n  }\n}\n\n// yarn resolutions:\n{\n  "resolutions": {\n    "problematic-package": "2.0.0"\n  }\n}',
        description: 'Force a specific version across the dependency tree.',
      },
      {
        step: 4,
        title: 'Clear npm cache',
        code: 'npm cache clean --force\nrm -rf node_modules package-lock.json\nnpm install',
        description: 'Full clean install resolves many lock file issues.',
      },
    ],
    resources: [
      { title: 'npm overrides docs', url: 'https://docs.npmjs.com/cli/v8/configuring-npm/package-json#overrides' },
    ],
    aiPrompt:
      'I have npm dependency conflicts. Help me diagnose the conflict tree, choose between --legacy-peer-deps and overrides, and understand how to keep dependencies healthy long-term.',
  },

  'performance': {
    id: 'performance',
    title: 'Performance Problem',
    icon: '🐌',
    category: 'Performance',
    severity: 'medium',
    description:
      'The app, page, or function is slow — high CPU, slow renders, blocking the main thread, or slow API responses.',
    symptoms: [
      'UI janks or drops frames (below 60fps)',
      'High memory usage growing over time',
      'Slow initial load or Time to Interactive',
      'API calls taking multiple seconds',
    ],
    quickFixes: [
      {
        step: 1,
        title: 'Profile first, optimize second',
        code: '// Browser: DevTools > Performance tab\n// Node.js:\nnode --prof app.js\nnode --prof-process isolate-*.log\n\n// React:\nimport { Profiler } from "react";\n<Profiler id="List" onRender={callback}>',
        description: 'Measure before guessing — find the actual bottleneck.',
      },
      {
        step: 2,
        title: 'Memoize expensive computations',
        code: '// React\nconst sorted = useMemo(() => items.sort(compareFn), [items]);\nconst handler = useCallback(() => doThing(id), [id]);\nconst Child = React.memo(({ value }) => <Text>{value}</Text>);',
        description: 'Prevent unnecessary re-renders and recalculations.',
      },
      {
        step: 3,
        title: 'Virtualize long lists',
        code: '// React Native\nimport { FlatList } from "react-native";\n<FlatList\n  data={items}\n  renderItem={({ item }) => <Row item={item} />}\n  keyExtractor={item => item.id}\n  windowSize={5}\n/>',
        description: 'Only render visible rows — essential for 1000+ items.',
      },
      {
        step: 4,
        title: 'Debounce frequent calls',
        code: 'import { useCallback } from "react";\nimport debounce from "lodash/debounce";\n\nconst search = useCallback(\n  debounce((q) => fetchResults(q), 300),\n  []\n);',
        description: 'Prevent hammering APIs or expensive functions.',
      },
    ],
    resources: [
      { title: 'React Native performance', url: 'https://reactnative.dev/docs/performance' },
      { title: 'web.dev performance', url: 'https://web.dev/performance/' },
    ],
    aiPrompt:
      'I have a performance problem in my app. Help me build a profiling plan, identify the most common bottlenecks in React Native / JavaScript, and apply targeted optimizations.',
  },

  'memory-leak': {
    id: 'memory-leak',
    title: 'Memory Leak',
    icon: '💧',
    category: 'Memory',
    severity: 'high',
    description:
      'Memory usage grows unbounded because subscriptions, timers, or references are never cleaned up.',
    symptoms: [
      'App slows down gradually over time',
      'Heap size grows on every navigation/action',
      '"setState on unmounted component" warning',
      'Browser tab memory climbs without bound',
    ],
    quickFixes: [
      {
        step: 1,
        title: 'Clean up in useEffect',
        code: 'useEffect(() => {\n  const timer = setInterval(tick, 1000);\n  const sub = eventEmitter.on("event", handler);\n\n  // ALWAYS return cleanup:\n  return () => {\n    clearInterval(timer);\n    sub.remove();\n  };\n}, []);',
        description: 'Every subscription/timer in useEffect needs a cleanup.',
      },
      {
        step: 2,
        title: 'Cancel async operations on unmount',
        code: 'useEffect(() => {\n  let cancelled = false;\n  fetchData().then(data => {\n    if (!cancelled) setState(data);\n  });\n  return () => { cancelled = true; };\n}, []);',
        description: 'Prevent setState calls after the component unmounts.',
      },
      {
        step: 3,
        title: 'Use WeakMap / WeakRef for caches',
        code: 'const cache = new WeakMap();\n// Keys are garbage-collected when the object is gone.\ncache.set(domNode, computedValue);',
        description: 'Weak references allow GC to reclaim memory.',
      },
      {
        step: 4,
        title: 'Profile with DevTools heap snapshot',
        code: '// Chrome DevTools > Memory > Heap snapshot\n// Take 3 snapshots:\n// 1. Initial state\n// 2. After many actions\n// 3. Compare - look for detached DOM nodes',
        description: 'Heap snapshots reveal what objects are accumulating.',
      },
    ],
    resources: [
      { title: 'Chrome memory profiling', url: 'https://developer.chrome.com/docs/devtools/memory-problems/' },
    ],
    aiPrompt:
      'I have a memory leak in my JavaScript/React app. Help me identify it using heap snapshots, explain the most common leak patterns in React hooks, and show how to fix them.',
  },

  'auth-error': {
    id: 'auth-error',
    title: 'Auth / JWT Error',
    icon: '🔐',
    category: 'Auth',
    severity: 'high',
    description:
      'Authentication fails — JWT is expired, malformed, wrong secret, or session tokens are not refreshed.',
    symptoms: [
      '401 Unauthorized from API',
      '403 Forbidden — wrong role/scope',
      'JsonWebTokenError: invalid signature',
      'TokenExpiredError: jwt expired',
    ],
    quickFixes: [
      {
        step: 1,
        title: 'Decode and inspect the JWT',
        code: '// Paste token at jwt.io to inspect payload.\n// Or in Node.js:\nconst [h, p, s] = token.split(".");\nconst payload = JSON.parse(atob(p));\nconsole.log(payload); // check exp, iss, aud',
        description: 'Check expiry (exp), issuer (iss), and claims.',
      },
      {
        step: 2,
        title: 'Implement token refresh',
        code: 'async function authFetch(url, options) {\n  let res = await fetch(url, withToken(options));\n  if (res.status === 401) {\n    await refreshAccessToken();\n    res = await fetch(url, withToken(options));\n  }\n  return res;\n}',
        description: 'Intercept 401s and retry after refreshing the token.',
      },
      {
        step: 3,
        title: 'Check token storage',
        code: '// Secure storage in React Native:\nimport * as SecureStore from "expo-secure-store";\nawait SecureStore.setItemAsync("token", jwt);\nconst jwt = await SecureStore.getItemAsync("token");',
        description: 'Never store tokens in plain AsyncStorage.',
      },
      {
        step: 4,
        title: 'Verify server-side secret',
        code: '// Node.js (jsonwebtoken)\nconst jwt = require("jsonwebtoken");\ntry {\n  const decoded = jwt.verify(token, process.env.JWT_SECRET);\n} catch (err) {\n  console.error(err.name, err.message);\n}',
        description: 'Confirm the secret matches between signing and verifying.',
      },
    ],
    resources: [
      { title: 'JWT debugger', url: 'https://jwt.io' },
    ],
    aiPrompt:
      'I have an authentication error. Help me diagnose JWT issues, implement proper token refresh, secure token storage in mobile apps, and understand OAuth 2.0 best practices.',
  },

  'cors-error': {
    id: 'cors-error',
    title: 'CORS Error',
    icon: '🌐',
    category: 'Network',
    severity: 'medium',
    description:
      'The browser blocks a cross-origin request because the server does not send the correct CORS headers.',
    symptoms: [
      'Access to fetch at … has been blocked by CORS policy',
      'No "Access-Control-Allow-Origin" header present',
      'Preflight OPTIONS request returns 404 or 403',
      'Works in curl/Postman but not in the browser',
    ],
    quickFixes: [
      {
        step: 1,
        title: 'Add CORS headers on the server',
        code: '// Express.js\nconst cors = require("cors");\napp.use(cors({\n  origin: "https://yourapp.com",\n  methods: ["GET", "POST", "PUT", "DELETE"],\n  allowedHeaders: ["Content-Type", "Authorization"],\n}));\n\n// FastAPI (Python)\nfrom fastapi.middleware.cors import CORSMiddleware\napp.add_middleware(CORSMiddleware, allow_origins=["*"])',
        description: 'CORS must be configured on the server, not the client.',
      },
      {
        step: 2,
        title: 'Handle OPTIONS preflight',
        code: '// Express — respond 200 to all OPTIONS:\napp.options("*", cors());\n\n// Or manually:\napp.use((req, res, next) => {\n  if (req.method === "OPTIONS") {\n    res.header("Access-Control-Allow-Methods", "GET,POST");\n    return res.status(200).end();\n  }\n  next();\n});',
        description: 'Preflights are sent before POST/PUT with custom headers.',
      },
      {
        step: 3,
        title: 'Use a proxy in development',
        code: '// vite.config.js\nexport default defineConfig({\n  server: {\n    proxy: {\n      "/api": {\n        target: "http://localhost:3001",\n        changeOrigin: true,\n      },\n    },\n  },\n});',
        description: 'Proxy avoids CORS entirely in local dev.',
      },
    ],
    resources: [
      { title: 'MDN CORS guide', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS' },
    ],
    aiPrompt:
      'I have a CORS error. Help me understand the CORS security model, configure my server correctly, handle preflight requests, and secure my API properly.',
  },

  'syntax-error': {
    id: 'syntax-error',
    title: 'Syntax Error',
    icon: '✏️',
    category: 'Syntax',
    severity: 'low',
    description:
      'The code cannot be parsed because of a typo, missing bracket, unexpected token, or invalid syntax.',
    symptoms: [
      "SyntaxError: Unexpected token '}'",
      "SyntaxError: missing ) after argument list",
      'Linter shows red underline with unexpected token',
      'File fails to load with parse error',
    ],
    quickFixes: [
      {
        step: 1,
        title: 'Run the linter',
        code: 'npx eslint src --fix\nnpx tsc --noEmit\nnpx prettier --check src',
        description: 'Linters pinpoint the exact line faster than reading stack traces.',
      },
      {
        step: 2,
        title: 'Check matching brackets',
        code: '// Use editor shortcuts:\n// VS Code: Ctrl+Shift+P → "Balance Bracket"\n// Or count: { { } } — must be balanced\n// Same for: ( ), [ ], <>, /* */',
        description: 'Unbalanced delimiters are the #1 syntax error cause.',
      },
      {
        step: 3,
        title: 'Check template literal syntax',
        code: '// Wrong:\nconst msg = `Hello ${name}`;\n//                ^^^ must be backtick, not quote\n\n// Wrong placeholder:\nconst msg = `${user.name + }`; // dangling operator\n\n// Correct:\nconst msg = `Hello ${user.name}`;',
        description: 'Template literals use backticks and ${ } not %s or +.',
      },
    ],
    resources: [],
    aiPrompt:
      'I have a syntax error. Help me read the error message, understand common JavaScript/TypeScript syntax pitfalls, and set up a linter to catch these automatically.',
  },

  'logic-bug': {
    id: 'logic-bug',
    title: 'Logic Bug',
    icon: '🐛',
    category: 'Logic',
    severity: 'medium',
    description:
      'The code runs without crashing but produces wrong output — off-by-one errors, wrong conditions, inverted boolean, etc.',
    symptoms: [
      'Output is always off by 1',
      'Loop runs one too many or one too few times',
      'Condition checks the wrong variable',
      'Feature works sometimes but not always',
    ],
    quickFixes: [
      {
        step: 1,
        title: 'Add strategic console.logs',
        code: 'for (let i = 0; i < arr.length; i++) {\n  console.log(`i=${i}, arr[i]=${arr[i]}, length=${arr.length}`);\n  // ... logic\n}',
        description: 'Log every variable at every step through the buggy path.',
      },
      {
        step: 2,
        title: 'Use a debugger breakpoint',
        code: '// In browser or VS Code:\ndebugger; // pauses execution here\n\n// Or in Node.js:\nnode --inspect-brk app.js\n// Then open chrome://inspect',
        description: 'Step through code line by line to catch wrong values.',
      },
      {
        step: 3,
        title: 'Check boundary conditions',
        code: '// Common off-by-one fixes:\nfor (let i = 0; i < arr.length; i++)   // correct\nfor (let i = 0; i <= arr.length; i++)  // off-by-one!\n\n// Slice is exclusive of end index:\narr.slice(0, 3); // [0], [1], [2] — not [3]',
        description: 'Test edge cases: empty array, single element, max length.',
      },
      {
        step: 4,
        title: 'Write a unit test for the bug',
        code: 'test("calculateTotal returns correct sum", () => {\n  expect(calculateTotal([1, 2, 3])).toBe(6);\n  expect(calculateTotal([])).toBe(0);\n  expect(calculateTotal([0])).toBe(0);\n});',
        description: 'A failing test proves the bug; a passing test proves the fix.',
      },
    ],
    resources: [],
    aiPrompt:
      'I have a logic bug in my code. Help me apply systematic debugging techniques, think through boundary conditions and edge cases, and write tests to prevent regressions.',
  },

  'regex-help': {
    id: 'regex-help',
    title: 'Regex Problem',
    icon: '🔍',
    category: 'Regex',
    severity: 'low',
    description:
      'A regular expression does not match as expected, has catastrophic backtracking, or captures the wrong groups.',
    symptoms: [
      'Pattern matches nothing when it should',
      'Pattern matches too much (greedy)',
      'Wrong capture groups extracted',
      'RegExp hanging/freezing on certain inputs',
    ],
    quickFixes: [
      {
        step: 1,
        title: 'Test interactively at regex101.com',
        code: '// Use https://regex101.com — paste your pattern\n// and test strings to see match highlights\n// and group captures in real time.',
        description: 'Interactive testing is faster than trial-and-error in code.',
      },
      {
        step: 2,
        title: 'Use named groups',
        code: 'const re = /(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})/;\nconst match = "2024-01-15".match(re);\nconsole.log(match.groups); // { year:"2024", month:"01", day:"15" }',
        description: 'Named groups are self-documenting and easier to extract.',
      },
      {
        step: 3,
        title: 'Prefer lazy over greedy quantifiers',
        code: '// Greedy (matches too much):\n/<.+>/g          // matches "<a>text</a>" as one match\n\n// Lazy (matches minimum):\n/<.+?>/g         // matches "<a>" and "</a>" separately',
        description: 'Add ? after + or * to make it non-greedy.',
      },
      {
        step: 4,
        title: 'Avoid catastrophic backtracking',
        code: '// Dangerous — nested quantifiers:\n/(a+)+$/\n// Input "aaaaX" causes exponential backtracking\n\n// Safe alternative:\n/a+$/\n// Or use atomic groups (not all engines support)',
        description: 'Nested quantifiers can freeze your app on adversarial input.',
      },
    ],
    resources: [
      { title: 'regex101 tester', url: 'https://regex101.com' },
      { title: 'Regexr cheatsheet', url: 'https://regexr.com' },
    ],
    aiPrompt:
      'I need help with a regular expression. Help me build the right pattern, explain the components, test for edge cases, and warn me about catastrophic backtracking risks.',
  },

  'database-error': {
    id: 'database-error',
    title: 'Database Error',
    icon: '🗄️',
    category: 'Database',
    severity: 'high',
    description:
      'A database query fails — connection refused, constraint violation, timeout, or ORM misconfiguration.',
    symptoms: [
      'ECONNREFUSED connecting to database',
      'Unique constraint violation',
      'Query timeout exceeded',
      'ORM cannot find table or column',
      'Transaction rollback or deadlock',
    ],
    quickFixes: [
      {
        step: 1,
        title: 'Verify connection string',
        code: '// Check each component:\n// postgresql://user:pass@host:5432/dbname\n// mysql://user:pass@127.0.0.1:3306/mydb\n\n// Test connectivity:\nnpx prisma db pull\n// or\npsql $DATABASE_URL -c "SELECT 1"',
        description: 'Most DB errors are wrong host, port, or credentials.',
      },
      {
        step: 2,
        title: 'Run pending migrations',
        code: '# Prisma:\nnpx prisma migrate deploy\nnpx prisma generate\n\n# Sequelize:\nnpx sequelize db:migrate\n\n# TypeORM:\nnpx typeorm migration:run',
        description: 'Schema out of sync with code causes "column does not exist" errors.',
      },
      {
        step: 3,
        title: 'Debug with query logging',
        code: '// Prisma:\nconst prisma = new PrismaClient({\n  log: ["query", "error"],\n});\n\n// TypeORM:\nDataSource({ logging: true })\n\n// Sequelize:\nnew Sequelize({ logging: console.log })',
        description: 'See the exact SQL being generated.',
      },
      {
        step: 4,
        title: 'Handle transactions correctly',
        code: '// Prisma transaction:\nawait prisma.$transaction(async (tx) => {\n  const user = await tx.user.create({ data });\n  const profile = await tx.profile.create({\n    data: { userId: user.id },\n  });\n  return { user, profile };\n});',
        description: 'Use transactions for multi-step writes to ensure atomicity.',
      },
    ],
    resources: [
      { title: 'Prisma docs', url: 'https://www.prisma.io/docs' },
    ],
    aiPrompt:
      'I have a database error. Help me diagnose the connection issue, check my schema and migrations, optimize my queries, and handle errors gracefully in production.',
  },
};

export const PROBLEM_KEYWORDS = {
  git: 'git-conflict',
  merge: 'git-conflict',
  conflict: 'git-conflict',
  rebase: 'git-conflict',
  null: 'null-undefined',
  undefined: 'null-undefined',
  'cannot read': 'null-undefined',
  nullpointer: 'null-undefined',
  async: 'async-error',
  await: 'async-error',
  promise: 'async-error',
  unhandled: 'async-error',
  type: 'type-error',
  typescript: 'type-error',
  assignable: 'type-error',
  import: 'import-error',
  module: 'import-error',
  require: 'import-error',
  resolve: 'import-error',
  build: 'build-error',
  compile: 'build-error',
  webpack: 'build-error',
  vite: 'build-error',
  dependency: 'dependency-error',
  package: 'dependency-error',
  npm: 'dependency-error',
  peer: 'dependency-error',
  slow: 'performance',
  performance: 'performance',
  lag: 'performance',
  render: 'performance',
  memory: 'memory-leak',
  leak: 'memory-leak',
  heap: 'memory-leak',
  auth: 'auth-error',
  jwt: 'auth-error',
  token: 'auth-error',
  '401': 'auth-error',
  '403': 'auth-error',
  cors: 'cors-error',
  origin: 'cors-error',
  preflight: 'cors-error',
  syntax: 'syntax-error',
  bracket: 'syntax-error',
  unexpected: 'syntax-error',
  logic: 'logic-bug',
  bug: 'logic-bug',
  wrong: 'logic-bug',
  regex: 'regex-help',
  regexp: 'regex-help',
  pattern: 'regex-help',
  database: 'database-error',
  db: 'database-error',
  sql: 'database-error',
  prisma: 'database-error',
  connection: 'database-error',
};

export const ALL_PROBLEM_IDS = Object.keys(PROBLEMS);
