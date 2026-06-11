import type {
  OACompanyStyleTag,
  OAExample,
  OAQuestion,
  OAQuestionDifficulty,
  OAQuestionType,
  OASeniorityTag,
  OATestCase,
} from "../types";

type SeedInput = {
  id: string;
  type: OAQuestionType;
  difficulty: OAQuestionDifficulty;
  title: string;
  prompt: string;
  questionText?: string;
  skills: string[];
  roleTags?: string[];
  companyStyleTags?: OACompanyStyleTag[];
  seniorityTags?: OASeniorityTag[];
  timeLimitMinutes?: number;
  points?: number;
  expectedAnswer?: string;
  expectedTopics?: string[];
  idealAnswerPoints?: string[];
  examples?: OAExample[];
  edgeCases?: string[];
  expectedComplexity?: string;
  constraints?: string[];
  testCases?: OATestCase[];
  hints?: string[];
};

type Scenario = {
  title: string;
  prompt: string;
  skills: string[];
  expectedTopics: string[];
  idealAnswerPoints: string[];
  constraints?: string[];
  examples?: OAExample[];
  testCases?: OATestCase[];
  edgeCases?: string[];
  expectedComplexity?: string;
};

const difficultyPoints: Record<OAQuestionDifficulty, number> = {
  Easy: 5,
  Medium: 10,
  Hard: 15,
  VeryHard: 20,
};

const difficultyTime: Record<OAQuestionDifficulty, number> = {
  Easy: 8,
  Medium: 18,
  Hard: 32,
  VeryHard: 45,
};

function q(input: SeedInput): OAQuestion {
  return {
    roleTags: ["frontend", "software", "full-stack"],
    companyStyleTags: ["product", "startup", "enterprise"],
    seniorityTags: ["early-career", "experienced"],
    timeLimitMinutes: difficultyTime[input.difficulty],
    points: difficultyPoints[input.difficulty],
    questionText: input.prompt,
    ...input,
  };
}

const seniorTags: OASeniorityTag[] = ["experienced"];
const midTags: OASeniorityTag[] = ["early-career", "experienced"];

const companyStyles: OACompanyStyleTag[][] = [
  ["faang", "product"],
  ["startup", "product"],
  ["enterprise", "consulting"],
  ["fintech", "enterprise"],
  ["service", "campus"],
  ["faang", "startup"],
  ["product", "enterprise"],
  ["fintech", "product"],
];

const codingBases: Scenario[] = [
  {
    title: "Implement Debounce With Cancel And Flush",
    prompt: "Implement debounce(fn, delay) for a search box. The returned function must delay execution, expose cancel() and flush(), preserve this binding, and forward the latest arguments.",
    skills: ["JavaScript", "Frontend Development", "Performance Optimization"],
    expectedTopics: ["timer cleanup", "latest arguments", "this binding", "cancel", "flush"],
    idealAnswerPoints: ["Use setTimeout and clearTimeout", "Store last args and context", "cancel clears pending work", "flush executes pending call immediately"],
    constraints: ["No external libraries", "Multiple rapid calls should run only the latest call"],
    examples: [{ input: "calls at 0ms, 40ms, 80ms with delay 100", output: "one call at about 180ms with last arguments" }],
    testCases: [{ input: "debounced(1); debounced(2); flush()", expectedOutput: "fn receives 2 once" }],
    edgeCases: ["flush before any call", "cancel after scheduled call", "method call relying on this"],
    expectedComplexity: "O(1) per invocation",
  },
  {
    title: "Implement Throttle With Leading And Trailing Options",
    prompt: "Implement throttle(fn, wait, options) supporting leading and trailing execution. It must be safe for scroll handlers and preserve the latest event payload.",
    skills: ["JavaScript", "Performance Optimization", "Frontend Development"],
    expectedTopics: ["leading call", "trailing call", "timestamp tracking", "timer cleanup"],
    idealAnswerPoints: ["Track last execution time", "Schedule trailing invocation when needed", "Preserve latest args", "Avoid duplicate trailing calls"],
    constraints: ["Support { leading: false, trailing: true }", "No lodash"],
    examples: [{ input: "10 events over 100ms with wait 50", output: "at most 3 function executions" }],
    testCases: [{ input: "leading false, first call at 0ms", expectedOutput: "first execution waits until throttle window ends" }],
    edgeCases: ["clock drift", "unmount cleanup", "rapid events after trailing call"],
    expectedComplexity: "O(1) per event",
  },
  {
    title: "Build A Memoize Utility With TTL",
    prompt: "Implement memoize(fn, ttlMs) for expensive frontend computations. Cache entries must expire, support primitive and object arguments, and avoid returning stale results after TTL.",
    skills: ["JavaScript", "Hash Maps", "Performance Optimization"],
    expectedTopics: ["cache key generation", "ttl expiry", "Map usage", "object argument handling"],
    idealAnswerPoints: ["Use Map for cache storage", "Store value and expiry", "Serialize or weak-map object inputs carefully", "Delete expired entries"],
    constraints: ["Do not mutate input arguments", "Same argument list should hit cache before TTL"],
    examples: [{ input: "memoized(2,3) twice within ttl", output: "fn called once" }],
    testCases: [{ input: "call after ttl expires", expectedOutput: "fn recomputes value" }],
    edgeCases: ["different argument order", "object references", "zero TTL"],
    expectedComplexity: "O(k) key creation, O(1) cache lookup",
  },
  {
    title: "Implement LRU Cache For API Responses",
    prompt: "Implement an LRU cache with get(key), set(key, value), delete(key), and size(). It will cache API responses in a frontend data layer.",
    skills: ["Hash Maps", "Linked Lists", "Data Structures", "Frontend Architecture"],
    expectedTopics: ["Map insertion order", "least recently used eviction", "constant time get", "capacity handling"],
    idealAnswerPoints: ["Use Map or doubly linked list plus hash map", "Move accessed keys to most recent", "Evict oldest key on overflow", "Handle updates without growing size"],
    constraints: ["Capacity is positive", "get and set should be near O(1)"],
    examples: [{ input: "capacity=2; set(a); set(b); get(a); set(c)", output: "b is evicted" }],
    testCases: [{ input: "set existing key", expectedOutput: "value updates and key becomes most recent" }],
    edgeCases: ["capacity one", "missing key", "delete then set"],
    expectedComplexity: "O(1) average get/set",
  },
  {
    title: "Flatten Nested Objects For Analytics Payloads",
    prompt: "Write flattenObject(input) that converts nested objects and arrays into dot/bracket paths for analytics events without mutating the original object.",
    skills: ["JavaScript", "Recursion", "Objects"],
    expectedTopics: ["recursive traversal", "array path notation", "immutability", "null handling"],
    idealAnswerPoints: ["Distinguish plain objects, arrays, and primitives", "Build stable path keys", "Preserve null values", "Avoid mutation"],
    constraints: ["Arrays should use bracket indexes", "Ignore undefined values"],
    examples: [{ input: "{ user: { id: 7 }, tags: ['a'] }", output: "{ 'user.id': 7, 'tags[0]': 'a' }" }],
    testCases: [{ input: "{ a: null, b: { c: 1 } }", expectedOutput: "{ 'a': null, 'b.c': 1 }" }],
    edgeCases: ["empty object", "arrays of objects", "Date objects"],
    expectedComplexity: "O(n) over visited nodes",
  },
  {
    title: "Create Cursor Pagination Helpers",
    prompt: "Implement mergePage(existingItems, newPage, cursor) for infinite scroll. It must append unique items, preserve order, and expose the next cursor safely.",
    skills: ["Arrays", "Frontend Development", "REST APIs"],
    expectedTopics: ["deduplication", "cursor handling", "stable ordering", "immutable merge"],
    idealAnswerPoints: ["Use item id for dedupe", "Return a new array", "Handle missing next cursor", "Do not reorder existing items"],
    constraints: ["Items have id and updatedAt", "Duplicate IDs may appear across pages"],
    examples: [{ input: "[1,2] + [2,3]", output: "[1,2,3]" }],
    testCases: [{ input: "empty existing items", expectedOutput: "new page is returned in server order" }],
    edgeCases: ["duplicate page retry", "null cursor", "out-of-order server data"],
    expectedComplexity: "O(n + m)",
  },
  {
    title: "Implement A Virtualized List Range Calculator",
    prompt: "Given itemCount, itemHeight, viewportHeight, scrollTop, and overscan, compute the visible start and end indexes for a virtualized list.",
    skills: ["Math", "Performance Optimization", "Frontend Development"],
    expectedTopics: ["visible range", "overscan", "bounds clamping", "scroll math"],
    idealAnswerPoints: ["Compute floor(scrollTop / itemHeight)", "Add visible item count", "Clamp indexes", "Apply overscan on both sides"],
    constraints: ["itemHeight is fixed", "indexes must stay within [0, itemCount - 1]"],
    examples: [{ input: "1000 items, 40px, viewport 400, scrollTop 200", output: "start near 5, end near 15 plus overscan" }],
    testCases: [{ input: "scrollTop 0 with overscan 3", expectedOutput: "start is 0" }],
    edgeCases: ["empty list", "scroll past end", "viewport taller than list"],
    expectedComplexity: "O(1)",
  },
  {
    title: "Build Optimistic Update Rollback Logic",
    prompt: "Implement applyOptimisticUpdate(state, mutation) and rollback(state, token) for a comment list. Failed network requests must restore the correct previous state.",
    skills: ["State Management", "REST APIs", "Frontend Architecture"],
    expectedTopics: ["optimistic state", "rollback token", "request ordering", "immutability"],
    idealAnswerPoints: ["Store inverse patch or snapshot", "Use mutation IDs", "Avoid rolling back newer successful edits", "Return immutable state"],
    constraints: ["Multiple mutations can be in flight", "Server may respond out of order"],
    examples: [{ input: "edit A then delete A, edit fails after delete succeeds", output: "do not resurrect deleted item incorrectly" }],
    testCases: [{ input: "two edits to same item, first fails, second succeeds", expectedOutput: "final state keeps second edit" }],
    edgeCases: ["duplicate retries", "temporary IDs", "server reconciliation"],
    expectedComplexity: "O(n) per affected collection unless indexed",
  },
  {
    title: "Implement A usePreviousDistinct Hook",
    prompt: "Implement a React hook usePreviousDistinct(value, isEqual) that returns the previous value only when the value changes by a custom comparator.",
    skills: ["React", "JavaScript", "Frontend Development"],
    expectedTopics: ["useRef", "custom comparator", "render timing", "previous value"],
    idealAnswerPoints: ["Use refs instead of state", "Compare current and stored value", "Update after comparison", "Avoid extra renders"],
    constraints: ["No external libraries", "Comparator defaults to Object.is"],
    examples: [{ input: "values 1,1,2", output: "previous distinct is undefined, undefined, 1" }],
    testCases: [{ input: "custom comparator for object id", expectedOutput: "previous changes only when id changes" }],
    edgeCases: ["first render", "comparator throws", "object reference changes"],
    expectedComplexity: "O(comparator cost)",
  },
  {
    title: "Implement A Stable Search Filter",
    prompt: "Write filterAndRank(items, query) for a command palette. Match by title, tags, and aliases, rank exact prefix matches highest, and preserve stable order for ties.",
    skills: ["Strings", "Sorting", "Frontend Development"],
    expectedTopics: ["normalization", "ranking", "stable sort", "multi-field matching"],
    idealAnswerPoints: ["Normalize case and whitespace", "Score title prefix over substring", "Include aliases and tags", "Use original index for stable ties"],
    constraints: ["Do not mutate items", "Query may be empty"],
    examples: [{ input: "query='repo' with title Repository and alias repo", output: "Repository ranked first" }],
    testCases: [{ input: "empty query", expectedOutput: "original order" }],
    edgeCases: ["diacritics", "duplicate scores", "large item list"],
    expectedComplexity: "O(n log n) with sorting",
  },
  {
    title: "Implement Tree Selection Propagation",
    prompt: "Implement toggleNode(tree, nodeId) for a permissions tree. Selecting a parent selects children; child changes update parent as checked, unchecked, or indeterminate.",
    skills: ["Trees", "State Management", "Frontend Architecture"],
    expectedTopics: ["tree traversal", "tri-state selection", "immutable updates", "parent aggregation"],
    idealAnswerPoints: ["Find target node", "Propagate selection downward", "Recompute parent states upward", "Preserve untouched branches"],
    constraints: ["Tree depth may be 100", "Do not mutate original tree"],
    examples: [{ input: "toggle parent with 3 unchecked children", output: "parent and children checked" }],
    testCases: [{ input: "uncheck one child", expectedOutput: "parent becomes indeterminate" }],
    edgeCases: ["missing id", "deep recursion", "single child parent"],
    expectedComplexity: "O(n)",
  },
  {
    title: "Synchronize Local Drafts With Server State",
    prompt: "Implement reconcileDraft(serverRecord, localDraft) for a profile editor. Preserve unsaved user edits while applying fresh server fields that the user has not touched.",
    skills: ["State Management", "REST APIs", "Frontend Architecture"],
    expectedTopics: ["dirty fields", "conflict detection", "server freshness", "immutability"],
    idealAnswerPoints: ["Track dirty field map", "Apply server updates only to clean fields", "Surface conflicts", "Avoid dropping user edits"],
    constraints: ["Nested fields are supported", "Server may return older version"],
    examples: [{ input: "user edited name, server updates avatar", output: "keep name draft and update avatar" }],
    testCases: [{ input: "server version older than local base", expectedOutput: "flag conflict" }],
    edgeCases: ["deleted fields", "nested arrays", "server validation errors"],
    expectedComplexity: "O(number of fields)",
  },
  {
    title: "Build A Client-Side Request Deduper",
    prompt: "Implement fetchOnce(key, factory) that deduplicates concurrent API requests and evicts completed promises based on a success TTL.",
    skills: ["JavaScript", "REST APIs", "Performance Optimization"],
    expectedTopics: ["promise cache", "request deduplication", "ttl eviction", "error handling"],
    idealAnswerPoints: ["Store in-flight promises by key", "Share promise for concurrent calls", "Evict failed requests immediately", "Cache successful response for TTL"],
    constraints: ["Factory returns a Promise", "Do not swallow errors"],
    examples: [{ input: "three same-key calls before first resolves", output: "factory called once" }],
    testCases: [{ input: "first request rejects then retry", expectedOutput: "factory is called again" }],
    edgeCases: ["different keys", "ttl zero", "abort signals"],
    expectedComplexity: "O(1) map operations",
  },
  {
    title: "Implement A Tiny Event Emitter",
    prompt: "Implement an EventEmitter with on, once, off, and emit. It will coordinate frontend modules without leaking listeners.",
    skills: ["JavaScript", "Data Structures", "Frontend Architecture"],
    expectedTopics: ["listener storage", "once semantics", "unsubscribe", "safe iteration"],
    idealAnswerPoints: ["Use Map of event to Set listeners", "Return unsubscribe from on", "Remove once listener after first call", "Clone listeners during emit"],
    constraints: ["Listeners can remove themselves during emit", "Multiple events supported"],
    examples: [{ input: "once('save', fn); emit save twice", output: "fn called once" }],
    testCases: [{ input: "off removes a listener", expectedOutput: "removed listener not called" }],
    edgeCases: ["unknown event", "listener throws", "duplicate listener registration"],
    expectedComplexity: "O(k) per emit",
  },
  {
    title: "Parse Query Params Into Typed Filter State",
    prompt: "Implement parseFilters(urlSearchParams) for a data dashboard. It must parse arrays, booleans, numbers, and defaults without accepting invalid filter values.",
    skills: ["TypeScript", "Frontend Development", "Data Analysis"],
    expectedTopics: ["input validation", "defaults", "array params", "type narrowing"],
    idealAnswerPoints: ["Validate enum values", "Convert numeric strings safely", "Handle repeated params", "Return typed object"],
    constraints: ["Invalid values fall back to defaults", "Unknown keys are ignored"],
    examples: [{ input: "?status=open&status=closed&page=2", output: "{ status: ['open','closed'], page: 2 }" }],
    testCases: [{ input: "?page=-1", expectedOutput: "default page" }],
    edgeCases: ["NaN", "empty strings", "URL encoding"],
    expectedComplexity: "O(number of params)",
  },
  {
    title: "Implement A Batched State Queue",
    prompt: "Create createBatcher(flushFn, wait) that collects UI updates and flushes them in batches, preserving order and exposing flushNow().",
    skills: ["JavaScript", "Performance Optimization", "Frontend Architecture"],
    expectedTopics: ["batching", "timer management", "order preservation", "manual flush"],
    idealAnswerPoints: ["Queue items", "Schedule one timer per batch", "Flush and clear atomically", "Support manual flush"],
    constraints: ["flushFn may be async", "No item should be lost if flush fails"],
    examples: [{ input: "add A, B, C before wait", output: "flushFn receives [A,B,C]" }],
    testCases: [{ input: "flushNow before timer", expectedOutput: "timer does not flush duplicate batch" }],
    edgeCases: ["flush failure", "new items during flush", "empty flush"],
    expectedComplexity: "O(n) per flush",
  },
  {
    title: "Build A Form Dirty-State Tracker",
    prompt: "Implement getDirtyFields(initial, current) for a nested settings form. Return changed paths and support arrays by stable item id.",
    skills: ["JavaScript", "Frontend Development", "State Management"],
    expectedTopics: ["deep comparison", "path generation", "array identity", "immutability"],
    idealAnswerPoints: ["Compare recursively", "Use stable id for arrays", "Return exact changed paths", "Handle missing fields"],
    constraints: ["Do not stringify whole objects as the only comparison", "Objects may be deeply nested"],
    examples: [{ input: "initial.email != current.email", output: "['email']" }],
    testCases: [{ input: "array item reorder with same ids", expectedOutput: "no dirty value unless fields changed" }],
    edgeCases: ["null vs undefined", "new item", "deleted item"],
    expectedComplexity: "O(n) visited fields",
  },
  {
    title: "Implement Client Feature Flag Resolution",
    prompt: "Implement resolveFlag(flag, user, environment) for frontend feature flags. Support default values, percentage rollout, allowlists, and environment overrides.",
    skills: ["Hash Maps", "Frontend Architecture", "JavaScript"],
    expectedTopics: ["deterministic hashing", "rollout percentage", "allowlist", "environment override"],
    idealAnswerPoints: ["Check explicit overrides first", "Use stable user hash", "Respect rollout percentage", "Return default when no rule matches"],
    constraints: ["Same user should get same result", "Rules are ordered by priority"],
    examples: [{ input: "50% rollout for user id 123", output: "deterministic true or false" }],
    testCases: [{ input: "allowlisted user", expectedOutput: "enabled even if rollout is 0" }],
    edgeCases: ["anonymous user", "missing environment", "conflicting rules"],
    expectedComplexity: "O(number of rules)",
  },
  {
    title: "Implement Graph Dependency Ordering",
    prompt: "Given frontend plugin definitions with dependsOn IDs, return a safe initialization order or throw when a cycle exists.",
    skills: ["Graphs", "Topological Sort", "Frontend Architecture"],
    expectedTopics: ["topological sort", "cycle detection", "missing dependency", "stable order"],
    idealAnswerPoints: ["Build adjacency map", "Use DFS or Kahn algorithm", "Detect cycles", "Report missing dependencies"],
    constraints: ["Plugin IDs are unique", "Order should be stable for independent plugins"],
    examples: [{ input: "A depends on B, B depends on C", output: "C, B, A" }],
    testCases: [{ input: "A depends on B, B depends on A", expectedOutput: "cycle error" }],
    edgeCases: ["missing dependency id", "diamond dependency", "empty list"],
    expectedComplexity: "O(V + E)",
  },
  {
    title: "Build A Retry Policy With Backoff And Jitter",
    prompt: "Implement retry(factory, policy) for API calls. It must support exponential backoff, jitter, max attempts, and cancellation.",
    skills: ["JavaScript", "REST APIs", "Frontend Architecture"],
    expectedTopics: ["backoff", "jitter", "max attempts", "abort handling"],
    idealAnswerPoints: ["Retry only retryable errors", "Compute exponential delay with jitter", "Stop at max attempts", "Respect AbortSignal"],
    constraints: ["Do not retry non-idempotent mutations by default", "Expose final error"],
    examples: [{ input: "two transient failures then success", output: "returns success after retries" }],
    testCases: [{ input: "AbortSignal aborts during wait", expectedOutput: "rejects without further attempts" }],
    edgeCases: ["HTTP 429", "network offline", "zero retry policy"],
    expectedComplexity: "O(attempts)",
  },
];

const contexts = [
  "admin dashboard",
  "checkout workflow",
  "analytics workspace",
  "collaboration tool",
];

function codingQuestions(): OAQuestion[] {
  return codingBases.flatMap((base, baseIndex) =>
    contexts.map((context, contextIndex) =>
      q({
        id: `oa-fe-coding-${String(baseIndex * contexts.length + contextIndex + 1).padStart(3, "0")}`,
        type: "coding",
        difficulty: contextIndex === 0 ? "Medium" : contextIndex === 3 ? "VeryHard" : "Hard",
        title: `${base.title} In A ${context.replace(/\b\w/g, (letter) => letter.toUpperCase())}`,
        prompt: `${base.prompt} Adapt the implementation for a ${context} where failures and edge cases must be visible to users.`,
        skills: base.skills,
        expectedTopics: base.expectedTopics,
        idealAnswerPoints: base.idealAnswerPoints,
        constraints: base.constraints,
        examples: base.examples,
        testCases: base.testCases,
        edgeCases: base.edgeCases,
        expectedComplexity: base.expectedComplexity,
        roleTags: ["frontend", "senior frontend", "full-stack"],
        companyStyleTags: companyStyles[(baseIndex + contextIndex) % companyStyles.length],
        seniorityTags: contextIndex === 0 ? midTags : seniorTags,
      })
    )
  );
}

const debugTopics = [
  {
    title: "useEffect Fetch Loop",
    code: "useEffect(() => { setFilters({ ...filters, page: 1 }); fetchData(filters); }, [filters]);",
    root: "effect updates a dependency and retriggers itself",
    fix: "separate derived state from fetching or use a reducer with stable dependencies",
    skills: ["React", "Debugging", "REST APIs"],
  },
  {
    title: "Stale Closure In Interval",
    code: "useEffect(() => { const id = setInterval(() => setCount(count + 1), 1000); return () => clearInterval(id); }, []);",
    root: "interval callback captures the initial count",
    fix: "use functional state update or a ref for latest state",
    skills: ["React", "JavaScript", "Debugging"],
  },
  {
    title: "Hydration Mismatch From Browser API",
    code: "export default function Theme() { return <span>{localStorage.theme}</span>; }",
    root: "server render reads browser-only state differently from client",
    fix: "guard browser access in a client effect or render stable initial markup",
    skills: ["Next.js", "React", "Debugging"],
  },
  {
    title: "Context Over-Rendering",
    code: "const value = { user, permissions, updateUser }; return <AppContext.Provider value={value}>{children}</AppContext.Provider>;",
    root: "provider value changes identity on every render",
    fix: "memoize value, split contexts, or use selector-based subscriptions",
    skills: ["React", "Performance Optimization", "Frontend Architecture"],
  },
  {
    title: "Index Key Reordering Bug",
    code: "{items.map((item, index) => <Row key={index} item={item} />)}",
    root: "array index keys reuse component state for different records",
    fix: "use stable item identifiers as keys",
    skills: ["React", "Debugging", "Frontend Development"],
  },
  {
    title: "Unsafe Type Assertion",
    code: "const user = response.data as User; return user.profile.name.toUpperCase();",
    root: "runtime data is trusted without validation",
    fix: "validate unknown response shape before narrowing",
    skills: ["TypeScript", "REST APIs", "Debugging"],
  },
  {
    title: "Duplicate Request Race",
    code: "onChange={(q) => { setQuery(q); search(q).then(setResults); }}",
    root: "older responses can overwrite newer search results",
    fix: "track request ids, abort previous calls, or ignore stale responses",
    skills: ["REST APIs", "JavaScript", "Debugging"],
  },
  {
    title: "Memoization With Wrong Dependencies",
    code: "const total = useMemo(() => expensive(items, currency), [items]);",
    root: "currency changes do not recompute memoized value",
    fix: "include all reactive values or remove memoization",
    skills: ["React", "Performance Optimization", "Debugging"],
  },
  {
    title: "Server Client Boundary Leak",
    code: "import fs from 'fs'; export function ClientWidget() { return <button>Export</button>; }",
    root: "server-only module is imported into client code",
    fix: "move server logic to an action/API route and keep client imports browser-safe",
    skills: ["Next.js", "TypeScript", "Debugging"],
  },
  {
    title: "Mutation Of React State",
    code: "items.push(newItem); setItems(items);",
    root: "same array reference prevents reliable render updates",
    fix: "create a new array with setItems([...items, newItem]) or functional update",
    skills: ["React", "JavaScript", "Debugging"],
  },
  {
    title: "Leaking Subscription",
    code: "useEffect(() => socket.on('message', onMessage), [socket, onMessage]);",
    root: "listener is never unsubscribed",
    fix: "return cleanup that removes the exact listener",
    skills: ["React", "Frontend Architecture", "Debugging"],
  },
  {
    title: "Next.js Cache Shows Stale Data",
    code: "const data = await fetch('/api/orders').then(r => r.json());",
    root: "fetch caching or revalidation settings are not aligned with dynamic data",
    fix: "set cache mode, revalidate policy, or tag invalidation intentionally",
    skills: ["Next.js Caching", "REST APIs", "Debugging"],
  },
  {
    title: "Generic Component Loses Type Safety",
    code: "function Select(props: any) { return <select>{props.options.map((o: any) => <option>{o.label}</option>)}</select>; }",
    root: "any removes relationship between option value and change handler",
    fix: "define generic option/value types and typed callbacks",
    skills: ["TypeScript", "Frontend Development", "Debugging"],
  },
  {
    title: "Large Bundle From Static Imports",
    code: "import MonacoEditor from 'monaco-editor'; import Charting from 'heavy-chart-lib';",
    root: "heavy modules are loaded into the initial bundle",
    fix: "dynamic import route-specific or interaction-specific modules",
    skills: ["Performance Optimization", "Next.js", "Debugging"],
  },
];

function debuggingQuestions(): OAQuestion[] {
  return Array.from({ length: 70 }, (_, index) => {
    const topic = debugTopics[index % debugTopics.length];
    const scenario = contexts[index % contexts.length];
    return q({
      id: `oa-fe-debug-${String(index + 1).padStart(3, "0")}`,
      type: "debugging",
      difficulty: index % 5 === 0 ? "VeryHard" : index % 3 === 0 ? "Medium" : "Hard",
      title: `${topic.title} In ${scenario.replace(/\b\w/g, (letter) => letter.toUpperCase())}`,
      prompt: `Debug this ${scenario} issue:\n\n${topic.code}\n\nIdentify the bug, explain the root cause, and provide a production-safe fix.`,
      skills: topic.skills,
      expectedAnswer: `${topic.root}; ${topic.fix}.`,
      expectedTopics: ["bug identification", "root cause", "production-safe fix", ...topic.skills],
      idealAnswerPoints: [topic.root, topic.fix, "mention user-facing impact", "describe how to test the fix"],
      constraints: ["Do not rewrite unrelated code", "Explain why the current code fails"],
      hints: ["Look for render timing, stale data, dependency, or boundary issues."],
      roleTags: ["frontend", "senior frontend", "full-stack"],
      companyStyleTags: companyStyles[index % companyStyles.length],
      seniorityTags: index % 3 === 0 ? midTags : seniorTags,
    });
  });
}

const architectureScenarios = [
  "a dashboard with 100 widgets, saved filters, and live updates",
  "a multi-tenant SaaS app with route protection and permission-aware navigation",
  "a shared component library migration across five product squads",
  "a realtime notification center with retries, read receipts, and offline recovery",
  "a micro-frontend migration from a monolith without stopping releases",
  "a design system rollout with tokens, theming, accessibility, and analytics",
  "an enterprise table system with column pinning, virtualization, and exports",
  "a frontend data layer for orders, invoices, refunds, and optimistic updates",
  "a checkout experience that supports experiments, fraud checks, and localization",
  "a collaborative editor with presence, comments, and conflict resolution",
  "a low-latency trading dashboard with streaming prices and alert rules",
  "a feature flag platform used by product, QA, and release managers",
  "a role-based admin console with audit logs and bulk operations",
  "a media browsing app with recommendations, prefetching, and failures",
  "a customer support workspace with queues, SLAs, and canned responses",
];

function architectureQuestions(): OAQuestion[] {
  return architectureScenarios.flatMap((scenario, scenarioIndex) =>
    ["state management", "routing and ownership boundaries", "data fetching and caching", "rollout and observability"].map((focus, focusIndex) =>
      q({
        id: `oa-fe-arch-${String(scenarioIndex * 4 + focusIndex + 1).padStart(3, "0")}`,
        type: "architecture",
        difficulty: focusIndex === 0 ? "Hard" : "VeryHard",
        title: `Design ${scenario.replace(/^a /, "").replace(/^an /, "")}`,
        prompt: `Design the frontend architecture for ${scenario}. Constraints: 250k daily active users, p95 interaction latency under 150ms, partial network failure, phased migration, and multiple contributing teams. Focus on ${focus}, tradeoffs, failure handling, maintainability, and how you would validate the design under production traffic.`,
        skills: ["Frontend Architecture", "React", "TypeScript", "Performance Optimization"],
        expectedTopics: [focus, "scale constraints", "performance requirements", "state boundaries", "data fetching", "error handling", "observability", "tradeoffs"],
        idealAnswerPoints: ["Define ownership boundaries", "Choose state and cache strategy intentionally", "Discuss failure states and retries", "Explain migration or rollout plan", "Name measurable success signals", "Call out latency, memory, and cache tradeoffs"],
        constraints: ["250k DAU", "p95 interaction latency under 150ms", "Assume multiple teams will contribute", "The design must be testable and observable", "Handle backend partial outages gracefully"],
        hints: ["Clarify data freshness, ownership, and failure modes before choosing libraries."],
        roleTags: ["frontend", "senior frontend", "staff frontend", "full-stack"],
        companyStyleTags: companyStyles[(scenarioIndex + focusIndex) % companyStyles.length],
        seniorityTags: seniorTags,
      })
    )
  );
}

const advancedCodingBases: Scenario[] = [
  {
    title: "Implement Query Cache With Stale While Revalidate",
    prompt: "Implement a query cache for React screens with get, subscribe, invalidate, prefetch, staleTime, and background revalidation.",
    skills: ["React", "Frontend Architecture", "REST APIs", "Performance Optimization"],
    expectedTopics: ["cache key", "stale time", "subscription", "invalidation", "background revalidation"],
    idealAnswerPoints: ["Normalize cache keys", "Notify subscribers after updates", "Return stale data while refetching", "Deduplicate in-flight requests", "Expose explicit invalidation"],
    constraints: ["Multiple components may subscribe to the same key", "Failed refresh should not erase usable stale data"],
    examples: [{ input: "two components call same query key", output: "one network request and two subscribers updated" }],
    testCases: [{ input: "invalidate key then read", expectedOutput: "marks stale and triggers refresh" }],
    edgeCases: ["out-of-order responses", "component unmount during fetch", "cache entry eviction"],
    expectedComplexity: "O(1) cache lookup, O(s) subscriber notification",
  },
  {
    title: "Implement useIntersectionObserver Hook",
    prompt: "Implement useIntersectionObserver(targetRef, options) for infinite scroll. It must support cleanup, changing options, disabled state, and multiple observed targets.",
    skills: ["React", "JavaScript", "Frontend Development", "Performance Optimization"],
    expectedTopics: ["IntersectionObserver", "cleanup", "ref handling", "disabled state", "threshold changes"],
    idealAnswerPoints: ["Create observer inside effect", "Disconnect on cleanup", "Guard missing target", "Memoize options or handle changes", "Avoid stale callback closure"],
    constraints: ["No polling", "Must not leak observers after unmount"],
    examples: [{ input: "sentinel enters viewport", output: "callback receives intersecting entry" }],
    testCases: [{ input: "disabled=true", expectedOutput: "observer is not attached" }],
    edgeCases: ["ref changes", "unsupported browser fallback", "rapid mount/unmount"],
    expectedComplexity: "O(t) observed targets",
  },
  {
    title: "Implement Infinite Scroll Controller",
    prompt: "Implement a controller that loads cursor-paginated results when a sentinel becomes visible, prevents duplicate page loads, and supports retry after failure.",
    skills: ["React", "REST APIs", "State Management", "Performance Optimization"],
    expectedTopics: ["cursor pagination", "loading guard", "retry", "dedupe", "hasMore"],
    idealAnswerPoints: ["Track in-flight request", "Use cursor from last successful page", "Deduplicate results by id", "Stop when hasMore is false", "Expose retry for failed page"],
    constraints: ["Network responses can arrive out of order", "Users can scroll quickly"],
    examples: [{ input: "sentinel fires three times while loading", output: "only one request starts" }],
    testCases: [{ input: "page two fails", expectedOutput: "page one remains and retry can load page two" }],
    edgeCases: ["empty page", "duplicate item across pages", "cursor reset after filter change"],
    expectedComplexity: "O(n + m) merge per page",
  },
  {
    title: "Implement Realtime Notification Queue",
    prompt: "Implement a notification queue that accepts websocket events, groups duplicates, caps visible notifications, and preserves unread counts.",
    skills: ["JavaScript", "Frontend Architecture", "State Management"],
    expectedTopics: ["event queue", "deduplication", "max visible", "unread count", "ordering"],
    idealAnswerPoints: ["Use stable event IDs", "Coalesce duplicate events", "Separate visible list from unread count", "Drop or archive oldest visible items", "Handle reconnect replay"],
    constraints: ["Events may arrive in bursts of 100 per second", "Duplicate event IDs can be replayed after reconnect"],
    examples: [{ input: "same notification id arrives twice", output: "one notification with updated count" }],
    testCases: [{ input: "maxVisible=3 and 5 events arrive", expectedOutput: "3 visible, unread count is 5" }],
    edgeCases: ["clock skew", "reconnect replay", "manual dismiss"],
    expectedComplexity: "O(1) insert with id map",
  },
  {
    title: "Implement Abortable API Request Deduplication",
    prompt: "Implement a request deduper that shares identical GET requests, supports AbortController per consumer, and avoids aborting the shared network call until all consumers cancel.",
    skills: ["JavaScript", "REST APIs", "Frontend Architecture"],
    expectedTopics: ["in-flight map", "consumer cancellation", "shared promise", "abort controller", "reference count"],
    idealAnswerPoints: ["Store shared request by cache key", "Track active consumers", "Abort underlying request only when all consumers cancel", "Evict after settle", "Propagate errors consistently"],
    constraints: ["Only idempotent GET requests are deduped", "Consumer cancellation should reject only that consumer"],
    examples: [{ input: "two consumers request /users, one cancels", output: "other still receives response" }],
    testCases: [{ input: "all consumers cancel", expectedOutput: "underlying fetch aborts" }],
    edgeCases: ["late subscriber", "failed request retry", "different headers"],
    expectedComplexity: "O(1) map operations",
  },
  {
    title: "Implement Optimistic Update Conflict Resolver",
    prompt: "Implement conflict resolution for optimistic edits where the server may return a newer version, a rejected mutation, or a canonical transformed entity.",
    skills: ["State Management", "REST APIs", "Frontend Architecture"],
    expectedTopics: ["optimistic patches", "server reconciliation", "versioning", "conflict state", "rollback"],
    idealAnswerPoints: ["Track mutation IDs and base version", "Apply canonical server entity", "Do not rollback newer successful changes", "Surface conflicts to users", "Keep inverse patches"],
    constraints: ["Several edits can be in flight for the same entity", "Server responses may arrive out of order"],
    examples: [{ input: "edit v3, server returns canonical v4", output: "merge or replace according to version policy" }],
    testCases: [{ input: "older failed mutation after newer success", expectedOutput: "do not undo newer success" }],
    edgeCases: ["deleted entity", "temporary client IDs", "offline retry"],
    expectedComplexity: "O(patches for entity)",
  },
  {
    title: "Implement Windowed Grid Virtualization",
    prompt: "Implement getVisibleGridCells for a two-dimensional virtualized grid with fixed row height, variable column width, sticky headers, and overscan.",
    skills: ["Performance Optimization", "Math", "Frontend Development"],
    expectedTopics: ["2D virtualization", "overscan", "sticky header", "bounds", "variable width"],
    idealAnswerPoints: ["Compute visible rows from scrollTop", "Compute visible columns using cumulative widths", "Clamp ranges", "Add overscan", "Keep sticky headers separate"],
    constraints: ["100k rows and 200 columns", "Should not iterate over all cells"],
    examples: [{ input: "scrollTop=1000, rowHeight=40", output: "row range starts near 25" }],
    testCases: [{ input: "scrollLeft beyond last column", expectedOutput: "column range is clamped" }],
    edgeCases: ["empty grid", "viewport larger than grid", "column resize"],
    expectedComplexity: "O(log c) with prefix widths, O(1) rows",
  },
  {
    title: "Implement Middleware-Style Client Route Guards",
    prompt: "Implement a client route guard resolver that evaluates auth state, tenant membership, feature flags, and unsaved form blockers before navigation.",
    skills: ["Frontend Architecture", "TypeScript", "State Management"],
    expectedTopics: ["guard ordering", "async checks", "redirects", "unsaved changes", "tenant permissions"],
    idealAnswerPoints: ["Run guards in priority order", "Represent allow, block, redirect outcomes", "Handle async permission checks", "Avoid navigation flicker", "Report guard reason"],
    constraints: ["Some checks are async", "Do not show protected content before validation"],
    examples: [{ input: "unauthenticated user opens /admin", output: "redirect to sign-in" }],
    testCases: [{ input: "dirty form blocks route", expectedOutput: "navigation is blocked with reason" }],
    edgeCases: ["tenant switch", "expired session", "concurrent navigation attempts"],
    expectedComplexity: "O(number of guards)",
  },
  {
    title: "Implement Streaming Response Parser",
    prompt: "Implement a parser for newline-delimited JSON chunks from a streaming API. It must emit complete events, buffer partial chunks, and handle malformed records.",
    skills: ["JavaScript", "REST APIs", "Frontend Architecture"],
    expectedTopics: ["stream parsing", "buffering", "partial chunk", "malformed record", "backpressure"],
    idealAnswerPoints: ["Maintain a text buffer", "Split by newline", "Parse only complete records", "Preserve trailing partial data", "Surface malformed rows without stopping valid rows"],
    constraints: ["Chunks may split JSON objects", "Records are newline-delimited"],
    examples: [{ input: "'{\"a\":1}\\n{\"b\"' then ':2}\\n'", output: "two parsed events" }],
    testCases: [{ input: "malformed line between two valid lines", expectedOutput: "valid lines still emit" }],
    edgeCases: ["empty chunks", "large event", "stream closes with partial buffer"],
    expectedComplexity: "O(total bytes)",
  },
  {
    title: "Implement Accessible Roving Tabindex",
    prompt: "Implement roving tabindex behavior for a toolbar with arrow-key navigation, disabled items, wrapping, and Home/End support.",
    skills: ["Accessibility", "JavaScript", "Frontend Development"],
    expectedTopics: ["roving tabindex", "keyboard navigation", "disabled items", "focus management", "Home End keys"],
    idealAnswerPoints: ["Only active item has tabIndex=0", "Arrow keys move focus", "Skip disabled items", "Support Home and End", "Keep DOM order meaningful"],
    constraints: ["Keyboard-only users must reach every enabled control", "Disabled controls are skipped"],
    examples: [{ input: "Right arrow on first item", output: "focus moves to next enabled item" }],
    testCases: [{ input: "End key", expectedOutput: "focus moves to last enabled item" }],
    edgeCases: ["all items disabled", "dynamic item removal", "RTL layouts"],
    expectedComplexity: "O(n) next enabled lookup",
  },
  {
    title: "Implement Type-Safe Event Bus",
    prompt: "Implement a TypeScript event bus where event names map to payload types. on('order.updated') must enforce the correct payload shape.",
    skills: ["TypeScript", "JavaScript", "Frontend Architecture"],
    expectedTopics: ["mapped types", "generic constraints", "typed callbacks", "unsubscribe", "payload inference"],
    idealAnswerPoints: ["Define event map type", "Use keyof event map", "Infer callback payload from event key", "Return unsubscribe", "Avoid any assertions in public API"],
    constraints: ["No unsafe any in exported API", "Events can have different payload shapes"],
    examples: [{ input: "emit('order.updated', { id: '1' })", output: "type-checks only if payload matches event map" }],
    testCases: [{ input: "emit wrong payload", expectedOutput: "TypeScript compile error" }],
    edgeCases: ["void payload events", "multiple listeners", "listener cleanup"],
    expectedComplexity: "O(k) listeners per event",
  },
  {
    title: "Implement Client-Side Rate Limiter",
    prompt: "Implement a token-bucket rate limiter for client analytics events. It should allow bursts, refill over time, and drop or queue overflow events by policy.",
    skills: ["JavaScript", "Performance Optimization", "Frontend Architecture"],
    expectedTopics: ["token bucket", "refill", "burst", "queue policy", "time math"],
    idealAnswerPoints: ["Track tokens and last refill time", "Refill based on elapsed time", "Cap tokens at bucket size", "Apply drop or queue policy", "Avoid setInterval when not needed"],
    constraints: ["Events can burst during page load", "Policy can be drop-oldest or drop-newest"],
    examples: [{ input: "capacity=3, 5 events immediately", output: "3 sent and 2 handled by overflow policy" }],
    testCases: [{ input: "wait one refill interval", expectedOutput: "new token becomes available" }],
    edgeCases: ["clock jump", "hidden tab", "zero capacity"],
    expectedComplexity: "O(1) per event",
  },
  {
    title: "Implement Undo Redo History For Form Builder",
    prompt: "Implement undo/redo history for a form builder with bounded history, grouped operations, and discard of redo stack after a new edit.",
    skills: ["State Management", "JavaScript", "Frontend Architecture"],
    expectedTopics: ["history stack", "redo invalidation", "bounded memory", "operation grouping", "immutable state"],
    idealAnswerPoints: ["Store past, present, future", "Clear future after new edit", "Cap history length", "Group related operations", "Avoid mutating snapshots"],
    constraints: ["History limit is 50 groups", "Large form state should not be cloned unnecessarily"],
    examples: [{ input: "edit A, undo, edit B", output: "redo A is no longer available" }],
    testCases: [{ input: "50+ edits", expectedOutput: "oldest history is evicted" }],
    edgeCases: ["undo at first state", "redo at latest state", "grouped drag operations"],
    expectedComplexity: "O(size of stored patch)",
  },
  {
    title: "Implement Priority Task Scheduler",
    prompt: "Implement a cooperative task scheduler for expensive UI work. It must process high-priority tasks first and yield between chunks to avoid blocking input.",
    skills: ["JavaScript", "Performance Optimization", "Frontend Architecture"],
    expectedTopics: ["priority queue", "chunking", "yielding", "input responsiveness", "cancellation"],
    idealAnswerPoints: ["Represent task priority", "Process within a time budget", "Yield using scheduler or setTimeout", "Support cancellation", "Prevent starvation"],
    constraints: ["Long tasks must stay under 50ms", "High priority user input should preempt background work"],
    examples: [{ input: "background export plus user search", output: "search runs before remaining export chunks" }],
    testCases: [{ input: "cancel pending task", expectedOutput: "task never runs" }],
    edgeCases: ["priority inversion", "many tasks", "task throws"],
    expectedComplexity: "O(log n) enqueue with heap",
  },
  {
    title: "Implement Form Validation Dependency Graph",
    prompt: "Implement validation scheduling for a form where fields depend on other fields. Changing one field should revalidate only affected fields in topological order.",
    skills: ["Graphs", "TypeScript", "Frontend Development"],
    expectedTopics: ["dependency graph", "topological order", "cycle detection", "incremental validation", "affected fields"],
    idealAnswerPoints: ["Build reverse dependency map", "Find affected fields", "Topologically sort affected subgraph", "Detect cycles", "Avoid validating unrelated fields"],
    constraints: ["Some validators are async", "Cycles must be reported"],
    examples: [{ input: "country changes", output: "state and zip validators rerun" }],
    testCases: [{ input: "A depends on B and B depends on A", expectedOutput: "cycle error" }],
    edgeCases: ["async validator race", "removed field", "optional dependency"],
    expectedComplexity: "O(V + E) affected subgraph",
  },
  {
    title: "Implement Batched Websocket Event Reducer",
    prompt: "Implement reduceEvents(state, events) for websocket bursts. It must apply inserts, updates, deletes, and tombstones idempotently.",
    skills: ["State Management", "JavaScript", "Frontend Architecture"],
    expectedTopics: ["event ordering", "idempotency", "tombstones", "batching", "version checks"],
    idealAnswerPoints: ["Use entity id and version", "Ignore stale events", "Apply tombstones for deletes", "Process batch deterministically", "Return immutable state"],
    constraints: ["Events can be duplicated", "Deletes can arrive before updates"],
    examples: [{ input: "delete v3 then update v2", output: "entity remains deleted" }],
    testCases: [{ input: "same event twice", expectedOutput: "state changes once" }],
    edgeCases: ["missing entity", "out-of-order versions", "reconnect replay"],
    expectedComplexity: "O(events)",
  },
  {
    title: "Implement Server Action Pending State Manager",
    prompt: "Implement a pending-state manager for multiple form submissions using server actions. It should track per-action status, prevent duplicate submits, and reconcile optimistic UI.",
    skills: ["Next.js", "React", "State Management"],
    expectedTopics: ["server actions", "pending state", "duplicate submit guard", "optimistic UI", "error reconciliation"],
    idealAnswerPoints: ["Track action key and request id", "Disable duplicate submissions", "Apply optimistic updates carefully", "Reconcile success and error", "Avoid global pending that blocks unrelated forms"],
    constraints: ["Multiple forms can submit concurrently", "Responses can arrive out of order"],
    examples: [{ input: "submit profile and billing forms", output: "each pending state is isolated" }],
    testCases: [{ input: "double-click submit", expectedOutput: "one request is accepted" }],
    edgeCases: ["navigation during submit", "server validation error", "retry"],
    expectedComplexity: "O(1) per action key",
  },
  {
    title: "Implement Image Preload Queue",
    prompt: "Implement an image preload queue for a gallery. It should prioritize viewport-near images, limit concurrency, retry transient failures, and cancel low-priority work.",
    skills: ["Performance Optimization", "JavaScript", "Frontend Development"],
    expectedTopics: ["priority queue", "concurrency limit", "retry", "cancellation", "viewport priority"],
    idealAnswerPoints: ["Sort by distance to viewport", "Limit concurrent loads", "Retry transient failures with backoff", "Cancel deprioritized images", "Avoid blocking critical resources"],
    constraints: ["Max three concurrent preloads", "User can scroll quickly"],
    examples: [{ input: "images near viewport and far below", output: "near viewport loads first" }],
    testCases: [{ input: "scroll changes priority", expectedOutput: "queue reprioritizes pending images" }],
    edgeCases: ["image load error", "cached images", "route change cleanup"],
    expectedComplexity: "O(log n) priority updates",
  },
  {
    title: "Implement Dependency-Aware Chunk Loader",
    prompt: "Implement a loader that dynamically imports feature chunks with dependencies, caches loaded modules, and surfaces loading failures.",
    skills: ["Next.js", "JavaScript", "Performance Optimization"],
    expectedTopics: ["dynamic import", "dependency ordering", "module cache", "error state", "preload"],
    idealAnswerPoints: ["Load dependencies before feature", "Cache fulfilled modules", "Share in-flight imports", "Expose preload", "Handle failed chunks and retries"],
    constraints: ["Feature can depend on multiple chunks", "Failed chunk should not poison future retry forever"],
    examples: [{ input: "load editor with syntax dependency", output: "syntax loads before editor init" }],
    testCases: [{ input: "same chunk requested twice", expectedOutput: "one import call" }],
    edgeCases: ["chunk load failure", "route transition", "circular dependency"],
    expectedComplexity: "O(V + E) dependency graph",
  },
  {
    title: "Implement Stable Column Resize Algorithm",
    prompt: "Implement resizeColumns(columns, dragDelta, constraints) for a data grid with min/max widths, pinned columns, and horizontal virtualization.",
    skills: ["Frontend Development", "Math", "Performance Optimization"],
    expectedTopics: ["width constraints", "pinned columns", "virtualization", "drag delta", "layout stability"],
    idealAnswerPoints: ["Apply min and max constraints", "Keep pinned columns stable", "Distribute overflow intentionally", "Avoid layout thrash", "Return immutable column model"],
    constraints: ["Thousands of rows", "Column resize should stay under one frame"],
    examples: [{ input: "delta +80 with max width reached", output: "remaining delta is ignored or redistributed by policy" }],
    testCases: [{ input: "resize below min", expectedOutput: "column clamps to min" }],
    edgeCases: ["hidden column", "pinned boundary", "RTL layout"],
    expectedComplexity: "O(columns)",
  },
  {
    title: "Implement Fine-Grained Store Selectors",
    prompt: "Implement a tiny external store with subscribe(selector, listener, equalityFn) so components rerender only when their selected slice changes.",
    skills: ["React", "State Management", "Performance Optimization"],
    expectedTopics: ["selector subscription", "equality function", "external store", "rerender prevention", "unsubscribe"],
    idealAnswerPoints: ["Store listener with selector and last selected value", "Compare selected slice after state update", "Notify only changed slices", "Return unsubscribe", "Avoid tearing with React store APIs"],
    constraints: ["Hundreds of subscribed widgets", "State updates can be frequent"],
    examples: [{ input: "widget selects user.name, theme changes", output: "widget does not rerender" }],
    testCases: [{ input: "selected value changes by equalityFn", expectedOutput: "listener fires once" }],
    edgeCases: ["selector throws", "unsubscribe during notification", "nested updates"],
    expectedComplexity: "O(subscribers) per update",
  },
  {
    title: "Implement Accessible Typeahead Matching",
    prompt: "Implement keyboard typeahead for a listbox. It should buffer typed characters, jump to matching option, reset after timeout, and announce active option.",
    skills: ["Accessibility", "JavaScript", "Frontend Development"],
    expectedTopics: ["typeahead buffer", "timeout reset", "active descendant", "keyboard navigation", "screen reader announcement"],
    idealAnswerPoints: ["Normalize labels", "Buffer typed keys", "Reset buffer after timeout", "Move active index to next match", "Use aria-activedescendant or focus movement"],
    constraints: ["List can have disabled options", "Matching wraps from current option"],
    examples: [{ input: "type 're'", output: "focus moves to first option beginning with re" }],
    testCases: [{ input: "wait past timeout then type", expectedOutput: "buffer starts fresh" }],
    edgeCases: ["no match", "duplicate labels", "IME composition"],
    expectedComplexity: "O(n) per search",
  },
  {
    title: "Implement Data Export Job Poller",
    prompt: "Implement a poller for long-running export jobs. It should back off, stop on terminal states, recover after tab visibility changes, and avoid duplicate polling.",
    skills: ["REST APIs", "JavaScript", "Frontend Architecture"],
    expectedTopics: ["polling backoff", "terminal state", "visibility handling", "dedupe", "cleanup"],
    idealAnswerPoints: ["Track job id and status", "Use backoff with max interval", "Stop on success or failure", "Pause or adjust for hidden tab", "Share polling for same job"],
    constraints: ["Several components may observe same job", "Server may return 429"],
    examples: [{ input: "job completes", output: "polling stops and subscribers are notified" }],
    testCases: [{ input: "two observers same job", expectedOutput: "one polling loop" }],
    edgeCases: ["job not found", "network offline", "route unmount"],
    expectedComplexity: "O(observers) notification",
  },
  {
    title: "Implement Safe HTML Sanitization Wrapper",
    prompt: "Implement a wrapper for rendering limited rich text. It should sanitize allowed tags, preserve safe links, remove scripts, and prevent hydration differences.",
    skills: ["Frontend Development", "Security", "React"],
    expectedTopics: ["sanitization", "allowed tags", "safe links", "XSS prevention", "hydration consistency"],
    idealAnswerPoints: ["Use a trusted sanitizer or strict allowlist", "Strip scripts and event handlers", "Validate link protocols", "Produce stable server/client output", "Test malicious payloads"],
    constraints: ["Content comes from users", "SSR and client output must match"],
    examples: [{ input: "<script>alert(1)</script><b>Safe</b>", output: "<b>Safe</b>" }],
    testCases: [{ input: "javascript: link", expectedOutput: "link removed or neutralized" }],
    edgeCases: ["malformed HTML", "SVG payloads", "style attributes"],
    expectedComplexity: "Depends on sanitizer/parser",
  },
];

const advancedCodingContexts = [
  "enterprise dashboard",
  "fintech workflow",
  "collaboration workspace",
  "high-traffic marketplace",
  "global consumer app",
];

function advancedCodingQuestions(): OAQuestion[] {
  return advancedCodingBases.flatMap((base, baseIndex) =>
    advancedCodingContexts.map((context, contextIndex) =>
      q({
        id: `oa-fe-coding-adv-${String(baseIndex * advancedCodingContexts.length + contextIndex + 1).padStart(3, "0")}`,
        type: "coding",
        difficulty: contextIndex === 0 ? "Medium" : contextIndex === 3 ? "VeryHard" : "Hard",
        title: `${base.title} For A ${context.replace(/\b\w/g, (letter) => letter.toUpperCase())}`,
        prompt: `${base.prompt} Production context: ${context}, strict failure handling, no silent data loss, and observable behavior under load.`,
        skills: base.skills,
        expectedTopics: base.expectedTopics,
        idealAnswerPoints: base.idealAnswerPoints,
        constraints: base.constraints,
        examples: base.examples,
        testCases: base.testCases,
        edgeCases: base.edgeCases,
        expectedComplexity: base.expectedComplexity,
        roleTags: ["frontend", "senior frontend", "staff frontend", "full-stack"],
        companyStyleTags: companyStyles[(baseIndex + contextIndex + 1) % companyStyles.length],
        seniorityTags: contextIndex === 0 ? midTags : seniorTags,
      })
    )
  );
}

const advancedDebugTopics = [
  {
    title: "Stale Closure In Debounced Search",
    code: "const runSearch = useMemo(() => debounce(() => search(query), 300), []);",
    root: "debounced callback closes over the first query value",
    fix: "pass query as an argument or keep latest query in a ref",
    skills: ["React", "JavaScript", "Debugging"],
  },
  {
    title: "Hydration Mismatch From Date Formatting",
    code: "export default function Row(){ return <span>{new Date().toLocaleString()}</span>; }",
    root: "server and client render different time strings",
    fix: "render stable server markup and format client-only after hydration",
    skills: ["Next.js", "React", "Debugging"],
  },
  {
    title: "Memory Leak From ResizeObserver",
    code: "useEffect(() => { const ro = new ResizeObserver(onResize); ro.observe(node); }, [node]);",
    root: "observer is never disconnected",
    fix: "disconnect observer in cleanup and guard missing node",
    skills: ["React", "Performance Optimization", "Debugging"],
  },
  {
    title: "Race Condition In User Search",
    code: "useEffect(() => { fetchUsers(query).then(setUsers); }, [query]);",
    root: "older requests can resolve after newer requests",
    fix: "abort previous request or ignore stale response using request id",
    skills: ["REST APIs", "React", "Debugging"],
  },
  {
    title: "Cache Invalidation Miss After Mutation",
    code: "await updateOrder(id, patch); queryCache.invalidate('orders');",
    root: "invalidates list key but detail and filtered keys remain stale",
    fix: "invalidate all affected keys or update normalized entities",
    skills: ["Next.js Caching", "REST APIs", "Debugging"],
  },
  {
    title: "Context Provider Recreates Callbacks",
    code: "const value = { filters, setFilter: (k,v) => setFilters({ ...filters, [k]: v }) };",
    root: "provider value and callback identity change every render",
    fix: "use reducer, memoized callbacks, split providers, or external store selectors",
    skills: ["React", "Performance Optimization", "Debugging"],
  },
  {
    title: "Server Action Double Submit",
    code: "<form action={save}><button>Save</button></form>",
    root: "button is not disabled while pending and duplicate submissions can race",
    fix: "track pending state per action and use idempotency on server",
    skills: ["Next.js", "React", "Debugging"],
  },
  {
    title: "Streaming UI Never Reveals Fallback",
    code: "<Suspense fallback={<Skeleton/>}><SlowServerComponent /></Suspense>",
    root: "slow work may happen above the Suspense boundary or block the shell",
    fix: "move async work below boundary and stream independent segments",
    skills: ["Next.js", "React", "Debugging"],
  },
  {
    title: "Middleware Redirect Loop",
    code: "if (!session) return NextResponse.redirect('/login');",
    root: "middleware also redirects /login because route is not excluded",
    fix: "exclude public routes and static assets before auth redirect",
    skills: ["Next.js", "Debugging", "Frontend Architecture"],
  },
  {
    title: "ISR Page Serves Old Feature Flag",
    code: "export const revalidate = 3600; const flag = await getFlag(user.segment);",
    root: "user-specific or rapidly changing flag is cached in static output",
    fix: "separate static content from dynamic flag evaluation",
    skills: ["Next.js Caching", "Debugging", "Frontend Architecture"],
  },
  {
    title: "Optimistic Delete Resurrects Entity",
    code: "rollback(() => setItems(previousItems));",
    root: "rollback snapshot ignores newer successful mutations",
    fix: "use mutation IDs and inverse patches scoped to affected entity version",
    skills: ["State Management", "REST APIs", "Debugging"],
  },
  {
    title: "React Memo Hides Changed Nested Data",
    code: "export default memo(Row, (a,b) => a.item.id === b.item.id);",
    root: "custom comparator ignores changed fields for same id",
    fix: "compare fields actually used by Row or remove custom comparator",
    skills: ["React", "Performance Optimization", "Debugging"],
  },
  {
    title: "Websocket Listener Uses Old Tenant",
    code: "useEffect(() => socket.on('event', e => handle(e, tenantId)), [socket]);",
    root: "listener captures stale tenantId",
    fix: "include tenantId with cleanup or use latest ref carefully",
    skills: ["React", "Frontend Architecture", "Debugging"],
  },
  {
    title: "Route Handler Leaks Private Cache",
    code: "export async function GET(){ return Response.json(await getUserData(), { headers:{ 'Cache-Control':'public' } }); }",
    root: "private user data is publicly cacheable",
    fix: "use private/no-store caching and auth-aware response policy",
    skills: ["Next.js", "Security", "Debugging"],
  },
  {
    title: "Form Validation Race",
    code: "validateEmail(value).then(setEmailStatus);",
    root: "older validation results overwrite newer input state",
    fix: "track validation request id or abort stale validations",
    skills: ["React", "REST APIs", "Debugging"],
  },
  {
    title: "Virtualized Row State Bleeds",
    code: "<VirtualRow key={index} row={rows[index]} />",
    root: "recycled/index keyed rows keep state for different records",
    fix: "key by stable row id and keep row-local state keyed by entity",
    skills: ["React", "Performance Optimization", "Debugging"],
  },
  {
    title: "Focus Trap Never Releases",
    code: "useEffect(() => trap.activate(), []);",
    root: "focus trap is not deactivated on close or unmount",
    fix: "deactivate in cleanup and return focus to trigger element",
    skills: ["Accessibility", "React", "Debugging"],
  },
  {
    title: "Bundle Analyzer Shows Duplicate React",
    code: "import { Widget } from '@legacy/widget';",
    root: "legacy package bundles its own React copy or mismatched dependency",
    fix: "externalize peer dependencies and align package versions",
    skills: ["Performance Optimization", "Frontend Architecture", "Debugging"],
  },
  {
    title: "RSC Imports Client Hook",
    code: "export default async function Page(){ const size = useWindowSize(); return <div>{size.width}</div>; }",
    root: "server component uses a client-only hook",
    fix: "move hook into a client component boundary",
    skills: ["Next.js", "React", "Debugging"],
  },
  {
    title: "Analytics Flood From Effect Dependency",
    code: "useEffect(() => track('view', filters), [filters]);",
    root: "filters object identity changes on every render",
    fix: "stabilize filters, track specific fields, or debounce analytics",
    skills: ["React", "Performance Optimization", "Debugging"],
  },
  {
    title: "Suspense Cache Corruption",
    code: "const cache = new Map(); export function read(key){ if(!cache.has(key)) cache.set(key, fetchData(key)); return cache.get(key); }",
    root: "cache never invalidates and may share data across incompatible contexts",
    fix: "scope cache by tenant/user and implement invalidation",
    skills: ["Next.js Caching", "Frontend Architecture", "Debugging"],
  },
  {
    title: "Transition Drops Error State",
    code: "startTransition(() => setResults(next)); setError(null);",
    root: "urgent and transition updates are not coordinated",
    fix: "model pending, error, and result state together",
    skills: ["React", "State Management", "Debugging"],
  },
  {
    title: "API Poller Continues After Unmount",
    code: "useEffect(() => { setInterval(load, 5000); }, []);",
    root: "interval id is not cleared",
    fix: "store interval id and clear it in cleanup",
    skills: ["React", "REST APIs", "Debugging"],
  },
  {
    title: "Search Params Cause Full State Reset",
    code: "useEffect(() => setState(parse(searchParams)), [searchParams]);",
    root: "entire state is replaced for every URL object identity change",
    fix: "compare parsed values and update only changed fields",
    skills: ["Next.js", "State Management", "Debugging"],
  },
  {
    title: "Hydration Mismatch From Random IDs",
    code: "<input id={`field-${Math.random()}`} />",
    root: "server and client generate different IDs",
    fix: "use React useId or stable ID from data",
    skills: ["React", "Next.js", "Debugging"],
  },
  {
    title: "Client Cache Ignores Auth Scope",
    code: "cache.set('/api/me', userData);",
    root: "cache key does not include authenticated user or tenant context",
    fix: "scope cache keys by auth context and clear on logout",
    skills: ["REST APIs", "Security", "Debugging"],
  },
  {
    title: "Slow Input From Synchronous Filtering",
    code: "onChange={(e) => setVisible(items.filter(x => expensiveMatch(x, e.target.value)))}",
    root: "expensive filtering runs synchronously on every keystroke",
    fix: "defer filtering, debounce, pre-index, or transition non-urgent work",
    skills: ["React", "Performance Optimization", "Debugging"],
  },
  {
    title: "Ref Callback Creates Render Loop",
    code: "const ref = (node) => { setNode(node); }; return <div ref={ref} />;",
    root: "new ref callback identity and state update can retrigger renders",
    fix: "use stable callback ref and avoid setting same node repeatedly",
    skills: ["React", "Debugging", "JavaScript"],
  },
  {
    title: "Route Prefetch Breaks Tenant Switch",
    code: "<Link href='/settings' prefetch />",
    root: "prefetched data may be tied to old tenant/session context",
    fix: "invalidate tenant-scoped data on switch and scope cache keys",
    skills: ["Next.js Caching", "Debugging", "Frontend Architecture"],
  },
  {
    title: "Mutation Response Overwrites Local Sort",
    code: "save(row).then(updated => setRows([updated, ...rows]));",
    root: "async callback captures stale rows and ignores active sort/filter",
    fix: "use functional update and reapply normalized sort/filter state",
    skills: ["React", "State Management", "Debugging"],
  },
  {
    title: "Server Component Fetch Waterfall",
    code: "const a = await fetchA(); const b = await fetchB(a.id); const c = await fetchC();",
    root: "independent fetches are serialized unnecessarily",
    fix: "start independent fetches in parallel and await dependencies only when needed",
    skills: ["Next.js", "Performance Optimization", "Debugging"],
  },
  {
    title: "Unbounded Toast Queue",
    code: "setToasts((items) => [...items, toast]);",
    root: "toast list grows without cap or dedupe",
    fix: "cap visible toasts, group duplicates, and expire old items",
    skills: ["State Management", "Performance Optimization", "Debugging"],
  },
  {
    title: "Feature Flag Flash",
    code: "const enabled = useFlag('new-nav'); return enabled ? <NewNav/> : <OldNav/>;",
    root: "client flag loads after initial render causing layout flash",
    fix: "hydrate with server-provided flag snapshot or render stable skeleton",
    skills: ["React", "Next.js", "Debugging"],
  },
  {
    title: "Incorrect Dependency In Callback",
    code: "const save = useCallback(() => api.save(form), [api]);",
    root: "form changes are not included in callback dependencies",
    fix: "include form, use functional state, or pass form explicitly",
    skills: ["React", "Debugging", "JavaScript"],
  },
  {
    title: "Modal Scroll Lock Leak",
    code: "useEffect(() => { document.body.style.overflow = 'hidden'; }, []);",
    root: "body style is not restored on unmount",
    fix: "restore previous overflow value in cleanup and handle nested modals",
    skills: ["React", "Accessibility", "Debugging"],
  },
];

function advancedDebuggingQuestions(): OAQuestion[] {
  return advancedDebugTopics.flatMap((topic, topicIndex) =>
    contexts.map((scenario, scenarioIndex) =>
      q({
        id: `oa-fe-debug-adv-${String(topicIndex * contexts.length + scenarioIndex + 1).padStart(3, "0")}`,
        type: "debugging",
        difficulty: scenarioIndex === 0 ? "Medium" : scenarioIndex === 3 ? "VeryHard" : "Hard",
        title: `${topic.title} In ${scenario.replace(/\b\w/g, (letter) => letter.toUpperCase())}`,
        prompt: `Debug this production ${scenario} issue:\n\n${topic.code}\n\nTasks: identify the bug, explain root cause, describe user impact, provide a minimal safe fix, and name one regression test.`,
        skills: topic.skills,
        expectedAnswer: `${topic.root}; ${topic.fix}.`,
        expectedTopics: ["bug identification", "root cause", "user impact", "safe fix", "regression test", ...topic.skills],
        idealAnswerPoints: [topic.root, topic.fix, "explain why it appears in production", "add a focused regression test"],
        constraints: ["Do not rewrite unrelated architecture", "Fix must be safe during active production traffic"],
        hints: ["Look for stale data, cleanup, cache scope, async ordering, or server/client boundary mistakes."],
        roleTags: ["frontend", "senior frontend", "staff frontend", "full-stack"],
        companyStyleTags: companyStyles[(topicIndex + scenarioIndex + 2) % companyStyles.length],
        seniorityTags: scenarioIndex === 0 ? midTags : seniorTags,
      })
    )
  );
}

const codeReviewSnippets = [
  {
    title: "Review Dashboard Fetching Component",
    code: "function Dashboard(){ const [data,setData]=useState([]); fetch('/api/widgets').then(r=>r.json()).then(setData); return data.map((w,i)=><Widget key={i} {...w}/>); }",
    problems: ["fetch during render", "index keys", "no loading/error state", "no abort or cache strategy"],
    skills: ["React", "REST APIs", "Debugging"],
  },
  {
    title: "Review Server Action Form",
    code: "export function Profile(){ async function save(fd){ 'use server'; await db.user.update({ data:Object.fromEntries(fd) }); } return <form action={save}><button>Save</button></form>; }",
    problems: ["missing auth ownership checks", "no validation", "duplicate submit risk", "unsafe raw form data"],
    skills: ["Next.js", "Security", "TypeScript"],
  },
  {
    title: "Review Client Cache Utility",
    code: "const cache = {}; export async function get(key){ if(cache[key]) return cache[key]; cache[key]=await fetch(key).then(r=>r.json()); return cache[key]; }",
    problems: ["plain object cache hazards", "no auth scope", "no invalidation", "failed requests can poison cache"],
    skills: ["REST APIs", "Next.js Caching", "Debugging"],
  },
  {
    title: "Review Modal Accessibility",
    code: "function Modal({children}){ return <div className='modal'><button>x</button>{children}</div>; }",
    problems: ["no dialog semantics", "no focus trap", "no labelledby", "no focus return"],
    skills: ["Accessibility", "React", "Testing"],
  },
  {
    title: "Review Search Input Performance",
    code: "function Search({items}){ const [q,setQ]=useState(''); const results=items.filter(i=>expensive(i,q)); return <input onChange={e=>setQ(e.target.value)} />; }",
    problems: ["expensive sync filtering", "no deferred work", "input jank", "missing rendering of results in snippet"],
    skills: ["React", "Performance Optimization", "Debugging"],
  },
  {
    title: "Review Websocket Hook",
    code: "function useSocket(url){ const socket = new WebSocket(url); socket.onmessage = console.log; return socket; }",
    problems: ["creates socket during render", "no cleanup", "no reconnect strategy", "unstable identity"],
    skills: ["React", "Frontend Architecture", "Debugging"],
  },
  {
    title: "Review TypeScript Select Component",
    code: "type Props = { options:any[]; onChange:(v:any)=>void }; function Select(p:Props){ return <select onChange={e=>p.onChange(e.target.value)}>{p.options.map(o=><option>{o.label}</option>)}</select>; }",
    problems: ["unsafe any", "missing option keys", "value type not preserved", "uncontrolled semantics unclear"],
    skills: ["TypeScript", "React", "Frontend Development"],
  },
  {
    title: "Review Optimistic Mutation",
    code: "setItems(items.map(i=>i.id===id?patch:i)); mutate(id, patch).catch(()=>setItems(items));",
    problems: ["stale snapshot rollback", "patch replaces entity", "out-of-order mutation risk", "no user-visible error"],
    skills: ["State Management", "REST APIs", "Debugging"],
  },
  {
    title: "Review Next.js Route Handler Cache",
    code: "export async function GET(){ const user = await auth(); return Response.json(await getOrders(user.id)); }",
    problems: ["cache policy unspecified", "auth failure not handled", "possible private data caching", "no error response shape"],
    skills: ["Next.js", "REST APIs", "Security"],
  },
  {
    title: "Review Virtualized Table Row",
    code: "const Row = memo(({ row }) => <tr><td>{row.name}</td><td>{row.status}</td></tr>, () => true);",
    problems: ["memo comparator blocks all updates", "stale row display", "accessibility table semantics may be incomplete", "debugging is difficult"],
    skills: ["React", "Performance Optimization", "Debugging"],
  },
  {
    title: "Review Analytics Effect",
    code: "useEffect(() => { track('view', { filters, user }); }, [{ filters, user }]);",
    problems: ["object literal dependency changes every render", "analytics flood", "PII risk", "no debounce or sampling"],
    skills: ["React", "Performance Optimization", "Security"],
  },
  {
    title: "Review Image Gallery",
    code: "images.map(src => <img src={src} />)",
    problems: ["missing alt text", "no lazy loading or sizing", "layout shift", "missing priority for above-fold images"],
    skills: ["Accessibility", "Performance Optimization", "Frontend Development"],
  },
  {
    title: "Review Permission Gate",
    code: "if(user.role === 'admin') return children; return null;",
    problems: ["client-only authorization", "role too coarse", "no loading/fallback state", "server enforcement still required"],
    skills: ["Frontend Architecture", "Security", "React"],
  },
  {
    title: "Review Suspense Boundary",
    code: "<Suspense fallback={<Spinner/>}><Header/><SlowDashboard/><Footer/></Suspense>",
    problems: ["boundary too coarse", "header/footer blocked by slow content", "spinner may cause layout shift", "no error boundary"],
    skills: ["Next.js", "React", "Performance Optimization"],
  },
  {
    title: "Review Bulk Action Handler",
    code: "selectedIds.forEach(id => fetch(`/api/items/${id}`, { method:'DELETE' })); setSelectedIds([]);",
    problems: ["API flooding", "no concurrency limit", "clears selection before success", "no retry/error aggregation"],
    skills: ["REST APIs", "Frontend Architecture", "Debugging"],
  },
  {
    title: "Review External Store Subscription",
    code: "store.subscribe(() => setState(store.getState()));",
    problems: ["rerenders on every store update", "no selector/equality", "possible tearing", "cleanup not shown"],
    skills: ["React", "State Management", "Performance Optimization"],
  },
  {
    title: "Review Form Error UI",
    code: "<input className={error ? 'red' : ''} /><span>{error}</span>",
    problems: ["error not programmatically associated", "color-only signal risk", "no aria-invalid", "no live announcement"],
    skills: ["Accessibility", "React", "Testing"],
  },
  {
    title: "Review Dynamic Import",
    code: "const Editor = dynamic(() => import('./Editor'), { ssr:false });",
    problems: ["blank SSR output risk", "missing loading fallback", "may hide hydration issue", "could hurt SEO/accessibility"],
    skills: ["Next.js", "Performance Optimization", "React"],
  },
  {
    title: "Review Retry Logic",
    code: "while(true){ try { return await fetch(url); } catch(e){} }",
    problems: ["infinite retry", "no backoff", "no abort", "retries non-idempotent requests"],
    skills: ["REST APIs", "JavaScript", "Debugging"],
  },
  {
    title: "Review Feature Flag Rendering",
    code: "const enabled = Math.random() > 0.5; return enabled ? <A/> : <B/>;",
    problems: ["nondeterministic render", "hydration mismatch", "no stable assignment", "cannot analyze experiment results"],
    skills: ["React", "Next.js", "Debugging"],
  },
  {
    title: "Review Table Export Button",
    code: "onClick={() => exportCsv(rows.map(JSON.stringify).join('\\n'))}",
    problems: ["incorrect CSV escaping", "main-thread blocking", "exports filtered state ambiguously", "no progress/error state"],
    skills: ["JavaScript", "Performance Optimization", "Frontend Development"],
  },
  {
    title: "Review Notification Reducer",
    code: "case 'message': return [event, ...state];",
    problems: ["no dedupe", "unbounded list", "no unread semantics", "replayed events duplicate notifications"],
    skills: ["State Management", "Frontend Architecture", "Debugging"],
  },
  {
    title: "Review Theme Initialization",
    code: "const [theme,setTheme]=useState(localStorage.theme || 'dark');",
    problems: ["browser API during render/SSR", "hydration mismatch", "no system preference handling", "possible flash"],
    skills: ["Next.js", "React", "Debugging"],
  },
  {
    title: "Review Drag And Drop List",
    code: "items.splice(from,1); items.splice(to,0,item); setItems(items);",
    problems: ["mutates state", "missing keyboard alternative", "index-based identity", "no collision/failure handling"],
    skills: ["React", "Accessibility", "State Management"],
  },
  {
    title: "Review Data Loader",
    code: "Promise.all(ids.map(id => fetch(`/api/detail/${id}`))).then(setDetails);",
    problems: ["unbounded concurrency", "N+1 risk", "no cancellation", "partial failure not handled"],
    skills: ["REST APIs", "Performance Optimization", "Debugging"],
  },
];

function codeReviewQuestions(): OAQuestion[] {
  return codeReviewSnippets.flatMap((review, reviewIndex) =>
    ["correctness", "performance", "accessibility or security"].slice(0, 2).map((focus, focusIndex) =>
      q({
        id: `oa-fe-code-review-${String(reviewIndex * 2 + focusIndex + 1).padStart(3, "0")}`,
        type: "debugging",
        difficulty: focusIndex === 0 ? "Hard" : "VeryHard",
        title: `${review.title}: ${focus.replace(/\b\w/g, (letter) => letter.toUpperCase())}`,
        prompt: `Given code:\n\n${review.code}\n\nReview it for ${focus}. Identify at least three problems, explain production impact, and propose concrete fixes.`,
        skills: review.skills,
        expectedAnswer: review.problems.join("; "),
        expectedTopics: ["code review", "problem identification", "production impact", "concrete fixes", ...review.skills],
        idealAnswerPoints: [...review.problems, "prioritize fixes by user/business impact", "suggest regression tests"],
        constraints: ["Do not rewrite the entire feature", "Focus on issues that would matter in production"],
        hints: ["Look for correctness, accessibility, performance, security, and maintainability risks."],
        roleTags: ["frontend", "senior frontend", "staff frontend", "full-stack"],
        companyStyleTags: companyStyles[(reviewIndex + focusIndex + 4) % companyStyles.length],
        seniorityTags: seniorTags,
      })
    )
  );
}

const productionIncidents = [
  {
    title: "Dashboard Slow After Widget Rollout",
    symptom: "p95 interaction latency increased from 120ms to 1900ms after a widget rollout.",
    focus: ["profiling", "widget isolation", "render optimization", "rollback plan"],
    skills: ["Performance Optimization", "React", "Frontend Architecture"],
    type: "performance" as OAQuestionType,
  },
  {
    title: "API Flooding During Bulk Delete",
    symptom: "bulk delete triggers thousands of parallel requests and backend 429s.",
    focus: ["concurrency limit", "batching", "retry policy", "user feedback"],
    skills: ["REST APIs", "Frontend Architecture", "Debugging"],
    type: "debugging" as OAQuestionType,
  },
  {
    title: "Bundle Explosion After Editor Launch",
    symptom: "initial JavaScript bundle grew by 1.8MB after a rich text editor feature.",
    focus: ["bundle analysis", "dynamic imports", "route splitting", "monitoring"],
    skills: ["Performance Optimization", "Next.js", "Frontend Development"],
    type: "performance" as OAQuestionType,
  },
  {
    title: "Websocket Instability In Notifications",
    symptom: "notifications duplicate, disappear, and arrive out of order during reconnects.",
    focus: ["idempotent reducer", "reconnect replay", "event ordering", "observability"],
    skills: ["Frontend Architecture", "State Management", "Debugging"],
    type: "architecture" as OAQuestionType,
  },
  {
    title: "Cache Corruption Across Tenants",
    symptom: "users occasionally see stale entities after switching tenants.",
    focus: ["cache scoping", "tenant invalidation", "auth boundaries", "regression testing"],
    skills: ["Next.js Caching", "Security", "Debugging"],
    type: "debugging" as OAQuestionType,
  },
  {
    title: "Hydration Errors Spike After A/B Test",
    symptom: "production logs show hydration mismatch on the checkout route after an experiment.",
    focus: ["stable experiment assignment", "server/client parity", "rollback", "instrumentation"],
    skills: ["Next.js", "React", "Debugging"],
    type: "debugging" as OAQuestionType,
  },
  {
    title: "LCP Regression On Product Pages",
    symptom: "LCP moved from 2.1s to 5.4s on mobile after image personalization.",
    focus: ["image optimization", "priority loading", "server rendering", "web vitals"],
    skills: ["Performance Optimization", "Next.js", "Frontend Development"],
    type: "performance" as OAQuestionType,
  },
  {
    title: "Accessibility Incident In Modal Flow",
    symptom: "keyboard users cannot complete a critical modal workflow after a release.",
    focus: ["focus trap", "keyboard navigation", "screen reader labels", "release remediation"],
    skills: ["Accessibility", "React", "Testing"],
    type: "accessibility" as OAQuestionType,
  },
  {
    title: "Server Action Creates Duplicate Orders",
    symptom: "some users double-click submit and create duplicate order records.",
    focus: ["pending state", "idempotency key", "server validation", "user feedback"],
    skills: ["Next.js", "REST APIs", "Debugging"],
    type: "debugging" as OAQuestionType,
  },
  {
    title: "Realtime Table Drops Updates Under Load",
    symptom: "a trading-style table misses updates during high-volume websocket bursts.",
    focus: ["event batching", "version ordering", "backpressure", "low-latency rendering"],
    skills: ["Performance Optimization", "State Management", "Frontend Architecture"],
    type: "architecture" as OAQuestionType,
  },
];

function productionIncidentQuestions(): OAQuestion[] {
  return productionIncidents.flatMap((incident, incidentIndex) =>
    ["triage", "root cause", "mitigation", "long-term fix", "monitoring"].map((focus, focusIndex) =>
      q({
        id: `oa-fe-incident-${String(incidentIndex * 5 + focusIndex + 1).padStart(3, "0")}`,
        type: incident.type,
        difficulty: focusIndex < 2 ? "Hard" : "VeryHard",
        title: `${incident.title}: ${focus.replace(/\b\w/g, (letter) => letter.toUpperCase())}`,
        prompt: `Production incident: ${incident.symptom} As the senior frontend owner, describe your ${focus} plan. Include immediate customer impact reduction, data you would inspect, frontend changes, backend coordination points, and how you prevent recurrence.`,
        skills: incident.skills,
        expectedTopics: ["incident response", focus, ...incident.focus],
        idealAnswerPoints: ["state customer impact and severity", "use metrics/logs/traces before guessing", "propose safe mitigation or rollback", "identify code/config fix", "define regression and monitoring follow-up"],
        constraints: ["Production traffic is live", "Avoid speculative rewrites", "Plan must include rollback or containment"],
        hints: ["A strong answer separates mitigation from long-term prevention."],
        roleTags: ["frontend", "senior frontend", "staff frontend", "full-stack"],
        companyStyleTags: companyStyles[(incidentIndex + focusIndex + 5) % companyStyles.length],
        seniorityTags: seniorTags,
      })
    )
  );
}

const performanceScenarios = [
  "a page rendering 5000 cards with filters and bulk selection",
  "a dashboard whose TTI is 8 seconds after adding chart widgets",
  "a route whose LCP regressed after a hero image and personalization rollout",
  "a product page with heavy third-party scripts and hydration cost",
  "a search screen that janks while typing on low-end devices",
  "a table that rerenders every row after a single checkbox change",
  "a Next.js app whose initial JavaScript bundle doubled in size",
  "a realtime feed that drops frames when events arrive in bursts",
  "a form wizard that blocks interaction during validation",
  "a mobile checkout route with slow image loading and long tasks",
];

function performanceQuestions(): OAQuestion[] {
  return performanceScenarios.flatMap((scenario, scenarioIndex) =>
    ["diagnose", "rank fixes", "implement optimization plan", "define monitoring"].map((focus, focusIndex) =>
      q({
        id: `oa-fe-perf-${String(scenarioIndex * 4 + focusIndex + 1).padStart(3, "0")}`,
        type: "performance",
        difficulty: focusIndex === 1 ? "Hard" : "VeryHard",
        title: `Optimize ${scenario.replace(/^a /, "").replace(/^an /, "")}`,
        prompt: `You inherit ${scenario}. ${focus === "rank fixes" ? "Rank optimization opportunities by impact and effort." : `Describe how you would ${focus} with concrete frontend changes.`}`,
        skills: ["Performance Optimization", "React", "Next.js", "Frontend Development"],
        expectedTopics: ["measurement", "React Profiler", "bundle optimization", "virtualization", "code splitting", "caching"],
        idealAnswerPoints: ["Measure before changing code", "Identify render and bundle bottlenecks", "Use virtualization or memoization when appropriate", "Apply code splitting and lazy loading", "Track Web Vitals after release"],
        constraints: ["Do not guess without metrics", "Prioritize user-perceived performance"],
        hints: ["Name what you would measure, then choose the smallest high-impact fix."],
        roleTags: ["frontend", "senior frontend"],
        companyStyleTags: companyStyles[(scenarioIndex + focusIndex + 2) % companyStyles.length],
        seniorityTags: seniorTags,
      })
    )
  );
}

const accessibilityTargets = [
  "modal dialog with nested form fields",
  "combobox search selector",
  "data table with sortable headers",
  "toast notification and alert center",
  "checkout form with validation errors",
];

function accessibilityQuestions(): OAQuestion[] {
  return accessibilityTargets.flatMap((target, targetIndex) =>
    ["keyboard navigation", "focus management", "screen reader semantics", "ARIA and labels", "contrast and error messaging"].map((focus, focusIndex) =>
      q({
        id: `oa-fe-a11y-${String(targetIndex * 5 + focusIndex + 1).padStart(3, "0")}`,
        type: "accessibility",
        difficulty: focusIndex < 2 ? "Hard" : "VeryHard",
        title: `Audit ${target.replace(/^a /, "").replace(/^an /, "")}`,
        prompt: `Audit a ${target} for ${focus}. Identify WCAG risks, explain user impact, and describe code-level fixes you would make in React.`,
        skills: ["Accessibility", "React", "Frontend Development", "Testing"],
        expectedTopics: ["WCAG", focus, "user impact", "React implementation", "testing"],
        idealAnswerPoints: ["Identify keyboard and screen reader behavior", "Use semantic HTML before ARIA", "Manage focus predictably", "Describe automated and manual tests", "Explain severity and user impact"],
        constraints: ["Do not rely only on color", "Keyboard-only users must complete the flow"],
        hints: ["Think through tab order, announcement, focus return, and error state behavior."],
        roleTags: ["frontend", "senior frontend"],
        companyStyleTags: ["enterprise", "product", "consulting"],
        seniorityTags: seniorTags,
      })
    )
  );
}

const testingFlows = [
  "checkout flow with payment failure and retry",
  "role-based admin permissions screen",
  "infinite-scroll search results page",
  "optimistic comment composer",
  "multi-step onboarding wizard",
];

function testingQuestions(): OAQuestion[] {
  return testingFlows.flatMap((flow, flowIndex) =>
    ["unit tests", "React Testing Library coverage", "mocking APIs", "integration tests", "E2E strategy"].map((focus, focusIndex) =>
      q({
        id: `oa-fe-test-${String(flowIndex * 5 + focusIndex + 1).padStart(3, "0")}`,
        type: "testing",
        difficulty: focusIndex === 0 ? "Medium" : focusIndex === 4 ? "VeryHard" : "Hard",
        title: `Test ${flow.replace(/^a /, "").replace(/^an /, "")}`,
        prompt: `Design a ${focus} plan for a ${flow}. Include what to test, what to mock, what not to mock, and how to prevent flaky tests.`,
        skills: ["Testing", "React Testing Library", "Jest", "E2E Testing"],
        expectedTopics: [focus, "test pyramid", "mocking strategy", "user behavior", "flakiness prevention"],
        idealAnswerPoints: ["Test user-visible behavior", "Mock network boundaries intentionally", "Cover failure and loading states", "Avoid implementation-detail assertions", "Use E2E only for critical workflows"],
        constraints: ["Tests must be maintainable across refactors", "Include accessibility-relevant assertions where applicable"],
        hints: ["Balance confidence, speed, and brittleness."],
        roleTags: ["frontend", "senior frontend", "full-stack"],
        companyStyleTags: companyStyles[(flowIndex + focusIndex + 3) % companyStyles.length],
        seniorityTags: focusIndex === 0 ? midTags : seniorTags,
      })
    )
  );
}

export const oaQuestionBank: OAQuestion[] = [
  ...codingQuestions(),
  ...advancedCodingQuestions(),
  ...debuggingQuestions(),
  ...advancedDebuggingQuestions(),
  ...codeReviewQuestions(),
  ...productionIncidentQuestions(),
  ...architectureQuestions(),
  ...performanceQuestions(),
  ...accessibilityQuestions(),
  ...testingQuestions(),
];

export const OA_QUESTION_BANK_SIZE = oaQuestionBank.length;
