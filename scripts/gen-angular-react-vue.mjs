/**
 * Generates Angular, React, and Vue interview banks (100 each).
 * Run: node scripts/gen-angular-react-vue.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "src", "data", "questions");

const TYPES = [
  "concept",
  "comparison",
  "scenario",
  "debugging",
  "architecture",
  "coding",
  "output",
  "best-practice",
];

function difficultyForIndex(i) {
  if (i < 15) return "fresh";
  if (i < 40) return "junior";
  if (i < 65) return "mid";
  if (i < 90) return "senior";
  return "lead";
}

function typeForIndex(i) {
  return TYPES[i % TYPES.length];
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function q(question, shortAnswer, detailedAnswer, extras = {}) {
  return { question, shortAnswer, detailedAnswer, ...extras };
}

function writeBank(tech, categoryFiles) {
  const dir = path.join(root, tech);
  fs.mkdirSync(dir, { recursive: true });
  let total = 0;
  const hist = {};
  for (const file of categoryFiles) {
    const questions = file.seeds.map((seed, idx) => {
      const n = String(idx + 1).padStart(3, "0");
      const globalIdx = total + idx;
      const difficulty = seed.difficulty ?? difficultyForIndex(globalIdx);
      hist[difficulty] = (hist[difficulty] || 0) + 1;
      return {
        id: `${file.idPrefix}-${n}`,
        technology: tech,
        category: file.category,
        categorySlug: file.categorySlug,
        slug: seed.slug || slugify(seed.question),
        question: seed.question,
        shortAnswer: seed.shortAnswer,
        detailedAnswer: seed.detailedAnswer,
        ...(seed.example ? { example: seed.example } : {}),
        ...(seed.interviewTip ? { interviewTip: seed.interviewTip } : {}),
        ...(seed.commonMistake ? { commonMistake: seed.commonMistake } : {}),
        difficulty,
        type: seed.type || typeForIndex(globalIdx),
        tags: seed.tags || [file.categorySlug],
      };
    });
    total += questions.length;
    fs.writeFileSync(
      path.join(dir, `${file.categorySlug}.json`),
      JSON.stringify(questions, null, 2) + "\n",
      "utf8",
    );
  }
  console.log(`${tech}: ${total} questions`, hist);
  if (total !== 100) throw new Error(`${tech} expected 100, got ${total}`);
  return { total, hist };
}

function cat(category, categorySlug, idPrefix, seeds) {
  return { category, categorySlug, idPrefix, seeds };
}

/* ===================== ANGULAR (100) ===================== */
const angular = [
  cat("Components", "components", "ng-components", [
    q("What is an Angular component and what are its core pieces?", "A component is a class with a template and styles that owns a piece of UI, declared with @Component.", "Angular components encapsulate view + logic. The decorator sets selector, template/templateUrl, styleUrls, and changeDetection. The class holds state and methods; the template binds to them. Standalone components import their own dependencies instead of needing NgModules.", { example: "@Component({\n  selector: 'app-hello',\n  standalone: true,\n  template: `<h1>{{ title() }}</h1>`,\n})\nexport class HelloComponent {\n  title = signal('Hello');\n}", tags: ["components", "standalone"] }),
    q("What is the difference between a standalone component and an NgModule-declared component?", "Standalone components declare imports in @Component; classic components are declared in an NgModule.", "Standalone (default in modern Angular) makes components self-contained and simplifies lazy loading. NgModules still exist for legacy apps and some libraries. Prefer standalone for new work; migrate gradually with standalone: true.", { type: "comparison" }),
    q("Explain @Input and @Output on Angular components.", "@Input receives data from the parent; @Output emits events via EventEmitter (or output() function).", "Inputs are one-way down; outputs notify parents of events. Prefer the signal-based input()/output() APIs in modern Angular. Avoid two-way binding unless needed; use model() for two-way signal inputs.", { example: "readonly name = input.required<string>();\nreadonly saved = output<void>();" }),
    q("What is content projection and when do you use ng-content?", "Content projection slots parent-provided markup into a child template via ng-content.", "Use select to project into multiple slots. Prefer projection for reusable shells (cards, layouts) instead of hardcoding children. Distinguish projected content from the component's own view for styling and queries.", { type: "concept" }),
    q("How do ViewChild and ContentChild differ?", "ViewChild queries the component's own template; ContentChild queries projected content.", "Timing matters: queries are available after ngAfterViewInit / ngAfterContentInit. Prefer signal queries (viewChild, contentChild) in modern Angular. Avoid querying too early in the constructor.", { type: "comparison" }),
    q("What lifecycle hooks matter most for Angular components?", "ngOnInit for setup, ngOnDestroy for cleanup; view/content hooks when querying DOM/projected nodes.", "Constructor is for DI only. Use effects/signals for reactive updates instead of heavy ngOnChanges when possible. Always unsubscribe or destroy resources in ngOnDestroy (or takeUntilDestroyed).", { type: "best-practice" }),
    q("When should you split a large component into smaller ones?", "When the template/logic mixes unrelated concerns, re-renders are expensive, or reuse/testing suffers.", "Extract presentational components, move state to services or parent containers, and keep templates readable. Prefer composition over inheritance for UI.", { type: "architecture" }),
    q("How do you share state between sibling Angular components?", "Lift state to a common parent, use a shared injectable service, or a signal store.", "Avoid prop drilling through deep trees. Services with providedIn or route-level providers scope lifetime. Signals/RxJS subjects expose reactive state.", { type: "scenario" }),
  ]),
  cat("Templates", "templates", "ng-templates", [
    q("What template syntax does Angular use for binding?", "Interpolation {{ }}, property [prop], event (event), and two-way [(ngModel)] or [()] for bananas-in-a-box.", "Prefer one-way data flow. Use attribute binding [attr.x] when needed. Event bindings pass $event. Avoid complex expressions in templates—move logic to the class or pipes/computed signals.", { tags: ["templates", "binding"] }),
    q("What is the difference between *ngIf and @if in Angular templates?", "@if is the built-in control flow; *ngIf is the structural directive from CommonModule.", "Built-in @if/@for/@switch are preferred in modern Angular: better type narrowing, no NgIf import, and clearer syntax. *ngIf still works for older codebases.", { type: "comparison" }),
    q("How does @for track items and why does track matter?", "@for requires a track expression to identify items across updates for efficient DOM reuse.", "Tracking by identity (id) prevents destroying/recreating DOM when the list reorders. track $index is a last resort. Wrong track keys cause state bugs in inputs inside lists.", { example: "@for (item of items(); track item.id) {\n  <li>{{ item.name }}</li>\n}" }),
    q("What are template reference variables?", "Local names (#ref) that point to a DOM element or directive/component instance in the template.", "Useful for focusing inputs or reading child APIs. Prefer ViewChild for class access. Don't overuse refs for state that belongs in the component model.", { type: "concept" }),
    q("When should you use a pipe vs a method in a template?", "Pipes (especially pure) are for transform display; avoid calling heavy methods every CD cycle.", "Pure pipes cache by reference/args. Methods in templates re-run on every change detection. Prefer computed signals for derived view state in modern apps.", { type: "best-practice" }),
    q("How do you safely bind HTML in Angular templates?", "Use [innerHTML] only with DomSanitizer after trusting content, or prefer text interpolation.", "Angular sanitizes by default against XSS. bypassSecurityTrustHtml is dangerous—only for trusted CMS content. Prefer markdown renderers with sanitization.", { type: "security", tags: ["templates", "security"] }),
    q("What is ng-template and how does it differ from ng-container?", "ng-template is an inert template definition; ng-container groups without a DOM element.", "ng-template content renders only when stamped (ngIf else, ngTemplateOutlet). ng-container is for structural directives without extra wrappers. Don't confuse with <template> HTML element semantics alone.", { type: "comparison" }),
  ]),
  cat("Dependency Injection", "dependency-injection", "ng-dependency-injection", [
    q("How does Angular dependency injection work?", "Angular resolves constructor (or inject()) dependencies from hierarchical injectors.", "Providers register tokens → implementations. Components, routes, and root injectors form a hierarchy. Child injectors can override parents. inject() works in injection contexts.", { tags: ["di"] }),
    q("What is providedIn: 'root' vs providing in a component?", "Root creates an app-wide singleton; component providers create an instance per component injector.", "Use root for shared services. Provide on a component/route to scope state to a feature subtree. Mis-scoping causes shared mutable state bugs.", { type: "comparison" }),
    q("What are InjectionToken and multi providers?", "InjectionToken identifies non-class dependencies; multi: true collects an array of providers.", "Use tokens for config objects and interfaces. HTTP_INTERCEPTORS is a classic multi provider. Prefer opaque tokens over string tokens.", { example: "export const API_URL = new InjectionToken<string>('API_URL');" }),
    q("When do you use useClass, useValue, useFactory, and useExisting?", "They map a token to a class, literal, factory function, or alias of another token.", "Factories enable runtime config. useExisting aliases tokens. Prefer useClass for simple swaps in tests.", { type: "concept" }),
    q("What is an injection context and why does inject() fail outside it?", "inject() must run during construction/DI setup (or runInInjectionContext), not in arbitrary async callbacks.", "Call inject() in field initializers, constructors, or factories. Capturing Injector and running later is the escape hatch. This trips people migrating from constructor DI.", { type: "debugging" }),
    q("How do you provide different implementations per environment?", "Use environment providers, APP_INITIALIZER factories, or file replacements with alternate providers.", "Keep interfaces stable; swap implementations for mock/API. Avoid branching business logic on environment strings everywhere.", { type: "architecture" }),
    q("Explain hierarchical injectors in a routed Angular app.", "Root → platform/app → lazy route injectors → component injectors form a lookup chain.", "Lazy routes get their own injector for provided services. Element injectors (directives/components) participate too. Understanding the chain explains 'NullInjectorError' and unexpected singletons.", { type: "architecture" }),
  ]),
  cat("Change Detection", "change-detection", "ng-change-detection", [
    q("What is Angular change detection?", "The process that syncs component state to the DOM by checking bindings when the app may have changed.", "Traditionally Zone.js patches async APIs and triggers CD. Default strategy checks the whole tree; OnPush checks when inputs/events/signals mark the view dirty.", { tags: ["change-detection"] }),
    q("How does ChangeDetectionStrategy.OnPush improve performance?", "OnPush skips checking a subtree unless inputs change by reference, events fire, or the view is marked dirty.", "Combine with immutable inputs and async pipe/signals. Mutating objects in place without marking dirty won't update the view.", { type: "best-practice" }),
    q("What does markForCheck vs detectChanges do?", "markForCheck marks the path to root dirty for the next CD; detectChanges runs CD immediately on that view.", "Use markForCheck inside OnPush when updating state outside Angular's knowledge. detectChanges is sharper and can be used carefully in tests/directives.", { type: "comparison" }),
    q("Why can mutating an @Input object fail to update an OnPush child?", "OnPush compares input references; in-place mutation keeps the same reference.", "Clone/update immutably or call markForCheck. Prefer signals which notify dependents on set.", { type: "debugging" }),
    q("How do signals interact with change detection?", "Updating a signal marks dependent views dirty so Angular can refresh only what needs updating.", "Signal-based CD reduces reliance on Zone.js. computed/effect form a reactive graph. Templates reading signals establish dependencies.", { type: "concept" }),
    q("When would you detach a change detector?", "Rare cases like high-frequency updates where you manually control when to reattach/detect.", "Detaching skips automatic checks. Easy to forget reattach—prefer OnPush/signals first. Useful for virtual scroll internals sometimes.", { type: "scenario" }),
  ]),
  cat("Signals", "signals", "ng-signals", [
    q("What is an Angular signal?", "A reactive wrapper around a value that notifies dependents when set or updated.", "Read with signal(), write with set/update. Templates and computed track reads. Signals are synchronous and fine-grained compared to Zone-driven CD.", { example: "const count = signal(0);\ncount.update(c => c + 1);" }),
    q("What is the difference between computed and effect?", "computed derives a memoized value; effect runs side effects when dependencies change.", "computed is pure and lazy/cached. effects are for logging, syncing imperative APIs—not for deriving state. Avoid writing to signals in ways that create cycles.", { type: "comparison" }),
    q("How do linkedSignal and resource fit modern Angular?", "linkedSignal resets/derives writable state from a source; resource manages async data as signals.", "Use linkedSignal for state that should reset when a parent id changes. resource() standardizes loading/error/value for HTTP. Prefer them over ad-hoc effect patterns.", { type: "concept" }),
    q("How do you convert an Observable to a signal?", "Use toSignal(observable, { initialValue }) in an injection context.", "toSignal subscribes and exposes the latest value. Provide initialValue or requireSync carefully. Unsubscribe is handled when the injection context destroys.", { example: "readonly users = toSignal(this.api.getUsers(), { initialValue: [] });" }),
    q("How do input() signals differ from classic @Input?", "input()/input.required() create signal inputs read as this.name() instead of properties.", "They integrate with computed and are the modern API. model() supports two-way binding. Transform functions can coerce inputs.", { type: "comparison" }),
    q("What are common pitfalls with effects?", "Using effects to sync derived state, creating write cycles, or running expensive work without untracking.", "Prefer computed for derived values. Use untracked when reading without subscribing. Keep effects small and intentional.", { type: "debugging" }),
    q("Design a feature store with signals for a product list page.", "Hold filters/items as signals, expose computed filtered lists, load via resource or service methods updating signals.", "Keep the store injectable and scoped to the route. Avoid duplicating server state in many components. Expose readonly signals to consumers.", { type: "architecture" }),
  ]),
  cat("RxJS", "rxjs", "ng-rxjs", [
    q("Why is RxJS central to Angular?", "HTTP, forms valueChanges, router events, and many APIs expose Observables for async streams.", "RxJS models push-based async data with operators for transform/cancel/combine. You must manage subscriptions. Signals increasingly coexist for local state.", { tags: ["rxjs"] }),
    q("What is the difference between switchMap, mergeMap, concatMap, and exhaustMap?", "They flatten inner Observables differently: switch cancels, merge concurrent, concat queues, exhaust ignores new until done.", "Use switchMap for typeahead/HTTP that should cancel. concatMap for ordered writes. mergeMap for independent parallel work. exhaustMap for ignoring double-submits.", { type: "comparison" }),
    q("How do you avoid memory leaks with Observables in components?", "Unsubscribe via takeUntilDestroyed, async pipe, or firstValueFrom for one-shots.", "Manual subscribe without teardown leaks. async pipe auto-unsubscribes. Prefer declarative pipelines in services.", { type: "best-practice" }),
    q("What does shareReplay do and when is it risky?", "Multicasts and replays last N values to late subscribers; can retain memory and keep sources alive.", "Use for caching HTTP among subscribers. Configure refCount carefully. Don't shareReplay(1) forever on huge payloads without strategy.", { type: "concept" }),
    q("Debug: a valueChanges subscription fires too often. What do you check?", "Look for distinctUntilChanged, debounceTime, and whether patchValue emits; also OnPush/parent CD loops.", "Filter empty emissions, compare with distinctUntilChanged, debounce user input. Avoid writing back into the form inside the same stream without care.", { type: "debugging" }),
    q("How would you implement a cancellable search-as-you-type with RxJS?", "Listen to input events, debounceTime, distinctUntilChanged, switchMap to HTTP.", "switchMap cancels in-flight requests when the query changes. Handle errors with catchError per inner observable so the outer stream survives.", { type: "coding", example: "query$.pipe(\n  debounceTime(300),\n  distinctUntilChanged(),\n  switchMap(q => this.api.search(q).pipe(catchError(() => of([]))))\n)" }),
    q("When should a service expose Observable vs signal?", "Observables for streams/events over time; signals for current synchronous state in the view model.", "You can bridge with toSignal/toObservable. Don't force everything into one model—use the right abstraction.", { type: "architecture" }),
  ]),
  cat("Routing", "routing", "ng-routing", [
    q("How does Angular Router map URLs to components?", "Routes configure path → component (or loadComponent) and optional children, guards, and resolvers.", "Router outlet renders the matched component. Lazy loading uses loadChildren/loadComponent. Params and query params are observables/signals.", { tags: ["routing"] }),
    q("What is the difference between paramMap and queryParamMap?", "paramMap is path params (/users/:id); queryParamMap is ?key=value search params.", "Path params identify resources; query params are filters/pagination. Prefer snapshot only when you don't need ongoing updates.", { type: "comparison" }),
    q("How do you lazy load a standalone route?", "Use loadComponent: () => import(...).then(m => m.FeatureComponent) on the route.", "Code-splits the feature. Combine with canMatch/canActivate for auth. Prefer standalone lazy routes over NgModule lazy loading in new apps.", { example: "{ path: 'admin', loadComponent: () => import('./admin.component').then(m => m.AdminComponent) }" }),
    q("What are child routes and nested router-outlets for?", "Feature sections with their own sub-navigation render in nested outlets.", "Parent route component hosts <router-outlet>. Children inherit URL segments. Useful for dashboards with side nav.", { type: "architecture" }),
    q("How do you pass data to a route without putting it in the URL?", "Use the route data property, a resolver, or a shared service/state store.", "Static data goes in route config. Resolvers prefetch. Avoid relying on router state extras alone for refresh-safe data.", { type: "scenario" }),
    q("What is RouterLinkActive and common pitfalls?", "It adds CSS classes when the link's route is active; exact matching options matter.", "Without exact matching, parent links stay active for children. Configure routerLinkActiveOptions carefully.", { type: "debugging" }),
  ]),
  cat("Forms", "forms", "ng-forms", [
    q("Template-driven vs reactive forms in Angular?", "Template-driven uses ngModel in templates; reactive builds FormControl/FormGroup in the class.", "Reactive forms scale better for complex validation and dynamic controls. Template-driven is fine for simple forms. Prefer reactive for enterprise apps.", { type: "comparison" }),
    q("How do FormControl, FormGroup, and FormArray relate?", "Controls are leaves; groups nest controls; arrays hold variable-length control lists.", "Compose nested structures for complex models. value/statusChanges observe updates. disable() excludes from values by default.", { type: "concept" }),
    q("How do you create a custom validator?", "Return a function (AbstractControl) => ValidationErrors | null; async validators return Observable/Promise.", "Register on controls via validators array. Cross-field validators belong on the group. Keep validators pure.", { example: "const forbidden = (c: AbstractControl) =>\n  c.value === 'admin' ? { forbidden: true } : null;" }),
    q("How do you show validation errors accessibly?", "Bind error messages when control touched/dirty, use aria-describedby, and set aria-invalid.", "Don't show errors before interaction unless after submit. Focus first invalid control on submit.", { type: "best-practice" }),
    q("What is the difference between value and getRawValue()?", "value omits disabled controls; getRawValue includes them.", "Important when disabling fields for UX but still needing their data on submit.", { type: "comparison" }),
    q("Design a dynamic form where fields come from a JSON schema.", "Build FormGroup/FormArray from schema at runtime; render controls with @for; attach validators from metadata.", "Centralize schema→control mapping. Consider performance for large schemas. Validate server-side too.", { type: "architecture" }),
  ]),
  cat("HTTP", "http", "ng-http", [
    q("How do you make HTTP calls in Angular?", "Inject HttpClient and call get/post/put/delete which return Observables.", "Provide HttpClient via provideHttpClient(). Prefer typed responses. Handle errors with catchError. Unsubscribe or use firstValueFrom carefully.", { example: "this.http.get<User[]>('/api/users')" }),
    q("Why should you not subscribe in services just to store data?", "Prefer returning Observables/signals to callers; services that subscribe hide cancellation and create leaks.", "Expose cold Observables or signal stores updated intentionally. Let components/async pipe manage subscription lifetime.", { type: "best-practice" }),
    q("How do you handle HTTP errors consistently?", "Use interceptors for cross-cutting error mapping and catchError in feature pipelines for local recovery.", "Normalize error shapes. Don't swallow errors silently. Retry only idempotent GETs with backoff.", { type: "scenario" }),
    q("What does HttpClient observe: 'response' vs 'events' give you?", "Full HttpResponse including headers/status, or upload/download progress events.", "Default observe body only. Use events for progress bars. Type the generic for body.", { type: "concept" }),
    q("How do you cancel an in-flight HTTP request when navigating away?", "Unsubscribe (async pipe / takeUntilDestroyed) or switchMap in a stream that completes on destroy.", "HttpClient aborts when unsubscribed. switchMap cancels previous searches. Don't leave orphan subscriptions.", { type: "debugging" }),
  ]),
  cat("Guards", "guards", "ng-guards", [
    q("What are Angular route guards?", "Hooks that decide whether navigation can activate, deactivate, match, or load.", "Functional guards are preferred: canActivate, canMatch, canDeactivate returning boolean/UrlTree/Observable/Promise. Use for auth and unsaved changes.", { tags: ["guards"] }),
    q("canActivate vs canMatch — when do you use each?", "canActivate runs after a route is chosen; canMatch can exclude a route from matching (useful for role-based configs).", "canMatch helps pick between alternate route configs. canActivate redirects unauthorized users. Prefer UrlTree redirects over boolean false alone.", { type: "comparison" }),
    q("How do you implement an unsaved-changes guard?", "canDeactivate checks a component interface like hasUnsavedChanges() and confirms before leaving.", "Keep the check in the component; guard stays thin. Handle browser refresh separately with beforeunload if needed.", { type: "coding" }),
    q("What are risks of doing heavy async work in guards?", "Slow navigations, race conditions, and duplicated fetches with resolvers/components.", "Keep guards fast—auth token check, not full data load. Prefetch in resolvers or components with loading UI.", { type: "architecture" }),
  ]),
  cat("Interceptors", "interceptors", "ng-interceptors", [
    q("What is an HttpInterceptor?", "Middleware that transforms requests/responses globally (auth headers, logging, errors).", "Functional interceptors with provideHttpClient(withInterceptors([...])) are modern. Order matters. Always clone requests when modifying.", { example: "export const authInterceptor: HttpInterceptorFn = (req, next) => {\n  const token = inject(Auth).token;\n  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));\n};" }),
    q("How do you attach an auth token with an interceptor?", "Clone the request, set Authorization header from an auth service, then call next.", "Skip public endpoints. Handle 401 by refreshing tokens carefully to avoid infinite loops.", { type: "scenario" }),
    q("How can interceptors cause infinite retry loops?", "Refreshing tokens on 401 and retrying without guarding refresh failures, or re-entering the same interceptor path.", "Use a single-flight refresh, fail-fast on refresh error, and whitelist the refresh URL.", { type: "debugging" }),
    q("When should logic be an interceptor vs a service method?", "Cross-cutting concerns for all HTTP → interceptor; feature-specific shaping → service.", "Don't hide business rules in interceptors. Keep them thin and testable.", { type: "architecture" }),
  ]),
  cat("Performance", "performance", "ng-performance", [
    q("List key Angular performance techniques.", "OnPush/signals, lazy routes, track in @for, defer blocks, virtual scroll, and avoiding heavy template methods.", "Measure with Angular DevTools profiler. Optimize network and bundle size too—perf is not only CD.", { type: "best-practice" }),
    q("What is @defer and when do you use it?", "Defers loading a template block until a trigger (idle, viewport, interaction), reducing initial work.", "Great for below-the-fold widgets. Provide @placeholder/@loading/@error. Don't defer critical above-the-fold UI.", { type: "concept" }),
    q("How does CDK virtual scrolling help?", "Renders only visible list items, keeping DOM small for large datasets.", "Requires item size strategy. Combine with trackBy/track. Not a substitute for pagination on huge server lists.", { type: "scenario" }),
    q("How do you diagnose unnecessary change detection cycles?", "Use profiler to see frequent checks; look for impure pipes, template methods, and noisy Zone events.", "Switch to OnPush/signals, debounce high-frequency events, run outside Angular when appropriate.", { type: "debugging" }),
    q("What bundle strategies help Angular apps load faster?", "Lazy routes, deferrable views, treeshakeable providers, and analyzing with source-map-explorer.", "Avoid importing large libraries in root. Prefer standalone imports of only needed pieces.", { type: "architecture" }),
    q("Is pure pipe caching enough for expensive list transforms?", "Helps when inputs are referentially stable; still prefer precomputing in computed signals for complex views.", "Impure pipes run every CD—avoid. For filtered lists, compute in the class with signals.", { type: "comparison" }),
  ]),
  cat("SSR", "ssr", "ng-ssr", [
    q("What is Angular SSR and why use it?", "Render pages on the server for faster first paint and better SEO/social previews.", "Angular Universal / @angular/ssr generate HTML before hydration. Mind browser-only APIs during server render.", { tags: ["ssr"] }),
    q("How do you avoid breaking SSR with window/document usage?", "Guard with isPlatformBrowser, inject DOCUMENT carefully, or move code to afterNextRender.", "Using window at import/constructor time crashes SSR. Prefer abstracting browser APIs behind services.", { type: "debugging" }),
    q("What is TransferState used for?", "Passing server-fetched data to the client to avoid duplicate HTTP calls after hydration.", "Store responses during SSR; read on client. Prevents flicker and double fetch. Keys must be stable.", { type: "concept" }),
    q("When is SSR the wrong tool?", "Highly interactive authenticated apps with little public SEO value may not justify SSR complexity.", "Consider SSG for mostly static marketing pages. Measure TTFB and caching strategy.", { type: "architecture" }),
  ]),
  cat("Hydration", "hydration", "ng-hydration", [
    q("What is hydration in Angular?", "Client Angular attaches listeners and state to server-rendered DOM instead of recreating it.", "Non-destructive hydration reuses DOM nodes. Mismatches cause errors or re-renders. Keep server/client markup consistent.", { tags: ["hydration"] }),
    q("What causes hydration mismatches?", "Different content on server vs client: random IDs, time-dependent text, browser-only branches, invalid HTML nesting.", "Use afterNextRender for client-only bits. Stabilize IDs. Validate HTML structure.", { type: "debugging" }),
    q("What is incremental/partial hydration conceptually?", "Hydrating parts of the page on demand rather than the entire app at once.", "Improves TTI for large pages. Combine with @defer. Still evolving—know the current Angular APIs you use.", { type: "concept" }),
    q("How do you verify hydration is working in production?", "Check for hydration errors in console, confirm no full DOM wipe, and measure interaction readiness.", "Monitor RUM metrics. Fix mismatches before relying on SSR SEO wins.", { type: "scenario" }),
  ]),
  cat("Zoneless Angular", "zoneless", "ng-zoneless", [
    q("What is zoneless Angular?", "Running Angular without Zone.js patching, relying on signals and explicit notifications for updates.", "provideExperimentalZonelessChangeDetection (or current zoneless APIs) removes Zone overhead. Async work must update signals/mark views dirty.", { tags: ["zoneless"] }),
    q("Why move to zoneless?", "Less monkey-patching, clearer reactivity, better performance predictability, smaller bundle.", "Requires discipline: third-party libs that expect Zone may break. Signals become the primary update path.", { type: "concept" }),
    q("How do you trigger UI updates without Zone.js after setTimeout?", "Update a signal or call ChangeDetectorRef.markForCheck/detectChanges inside the callback.", "Wrapping in NgZone.run is the Zone-era approach; zoneless prefers signals. Test carefully.", { type: "coding" }),
    q("What library risks appear when going zoneless?", "Libs that rely on Zone to refresh UI after async work may not update until you bridge updates.", "Prefer signal-friendly patterns. Audit charting/auth SDKs. Add thin adapters that set signals on callbacks.", { type: "architecture" }),
  ]),
  cat("Architecture", "architecture", "ng-architecture", [
    q("How do you structure a large Angular monorepo app?", "Feature folders with routes, shared UI lib, core singleton services, and clear public APIs.", "Use Nx or workspace libs. Avoid deep cross-feature imports. Lazy load features. Keep domain logic out of dumb components.", { type: "architecture" }),
    q("Smart vs presentational components in Angular?", "Smart containers fetch/orchestrate; presentational receive inputs and emit outputs.", "Presentational components are easier to test and reuse. Don't put HttpClient in every leaf component.", { type: "comparison" }),
    q("When do you introduce a state library (NgRx, SignalStore) vs services?", "Complex shared workflows, time-travel/debug needs, or many writers → store; simple feature state → signal services.", "Avoid premature NgRx. Signal-based stores often suffice. Consistency matters more than brand of store.", { type: "architecture" }),
    q("How should API models differ from view models?", "Map DTOs to UI-friendly models in an anti-corruption layer; don't bind raw API shapes everywhere.", "Protects UI from backend churn. Centralize adapters. Validate at boundaries.", { type: "best-practice" }),
    q("Design auth + feature modules for an enterprise Angular app.", "Core auth service, interceptor, guards; features lazy-loaded; shared UI; environment config tokens.", "Centralize permissions. Prefer canMatch for role routes. Keep secrets off the client.", { type: "scenario" }),
    q("What is the facade pattern in Angular feature design?", "A facade service exposes a narrow API over multiple stores/APIs so components stay simple.", "Helps hide NgRx complexity. Don't create facades that become god objects—keep per feature.", { type: "architecture" }),
  ]),
  cat("Testing", "testing", "ng-testing", [
    q("How do you unit test an Angular component with TestBed?", "Configure TestBed with the component and stubs, create fixture, detectChanges, assert DOM/state.", "Prefer shallow tests with mocked services. Use harnesses for CDK. Prefer testing library queries for a11y-friendly asserts.", { type: "coding" }),
    q("How do you test a service that uses HttpClient?", "Use HttpClientTestingModule / provideHttpClientTesting and HttpTestingController to flush responses.", "Assert method, URL, and body. Verify no outstanding requests. Don't hit real network in unit tests.", { example: "const req = httpMock.expectOne('/api/users');\nreq.flush([{ id: 1 }]);" }),
    q("What is the difference between isolated unit tests and integration component tests?", "Unit tests mock collaborators heavily; integration tests wire more of Angular and child components.", "Balance speed vs confidence. Use e2e (Playwright/Cypress) for critical user journeys.", { type: "comparison" }),
    q("How do you test route guards?", "Call the guard function with mock routers/auth state and assert boolean/UrlTree results.", "With functional guards, inject deps via TestBed.runInInjectionContext. Cover authorized and unauthorized paths.", { type: "coding" }),
    q("Lead approach: what testing strategy do you set for an Angular team?", "Pyramid: many fast unit tests, fewer component integration tests, selective e2e; CI required; shared testing utilities.", "Ban flaky e2e as merge blockers without quarantine. Contract-test APIs. Budget time for a11y checks.", { type: "architecture" }),
  ]),
  cat("Security", "security", "ng-security", [
    q("How does Angular help prevent XSS?", "Template binding sanitizes untrusted values; avoid bypassing DomSanitizer except for trusted content.", "Never build HTML with string concat from user input. Prefer text binding. Audit innerHTML usage.", { tags: ["security", "xss"] }),
    q("What is CSRF and how do Angular apps mitigate it?", "Cross-site request forgery tricks the browser into sending auth cookies; use tokens/SameSite and careful cookie design.", "HttpClientXsrfModule reads cookie tokens for mutating requests. Prefer token auth in headers for SPAs when appropriate.", { type: "concept" }),
    q("Why is bypassSecurityTrustHtml dangerous?", "It disables sanitization—malicious HTML/JS can execute if content isn't fully trusted.", "Only use for content you control end-to-end. Prefer sanitizing markdown pipelines.", { type: "debugging" }),
    q("Security checklist for an Angular enterprise app?", "Sanitize HTML, secure tokens/storage, HTTPS, CSP, dependency audits, least-privilege API scopes, no secrets in bundles.", "Treat XSS/CSRF/open redirects seriously. Review interceptors handling auth. Train team on DomSanitizer misuse.", { type: "architecture" }),
  ]),
];

/* ===================== REACT (100) ===================== */
const react = [
  cat("Components", "components", "react-components", [
    q("What is a React component?", "A function (or class) that returns React elements describing UI for given props/state.", "Function components are the modern standard. They should be pure with respect to props/state during render. Side effects belong in effects or event handlers.", { tags: ["components"] }),
    q("Function vs class components today?", "Prefer functions + hooks; classes are legacy for most new code.", "Hooks cover state, lifecycle, and context. Class knowledge still helps reading older codebases.", { type: "comparison" }),
    q("What does it mean for a render to be pure?", "Same props/state → same output; no side effects during render.", "Don't fetch, mutate external variables, or call random APIs while rendering. Impure renders cause subtle bugs and break concurrent features.", { type: "best-practice" }),
    q("Controlled vs uncontrolled components?", "Controlled: form values driven by React state; uncontrolled: DOM holds state via refs.", "Controlled enables validation and instant UI reactions. Uncontrolled can be simpler for basic forms or non-React integrations.", { type: "comparison" }),
    q("When should you split a component?", "When it mixes concerns, is hard to test, or causes avoidable re-renders of large subtrees.", "Extract presentational pieces and custom hooks. Avoid premature micro-components that hurt readability.", { type: "architecture" }),
    q("What are fragments and why use them?", "<>...</> groups children without an extra DOM node.", "Useful when a component must return multiple siblings. Keys still needed on lists of fragments when mapping.", { type: "concept" }),
    q("How do error boundaries work?", "Class components implementing getDerivedStateFromError/componentDidCatch catch render errors in subtrees.", "They don't catch event handler or async errors. Use for resilient section fallbacks. Libraries exist for function-style wrappers.", { type: "scenario" }),
    q("Design a reusable Modal component API.", "Compose with portal, focus trap, labelledby, onClose; avoid baking business logic into the shell.", "Support controlled open state. Ensure a11y (Escape, focus restore). Keep styling flexible via slots/children.", { type: "architecture" }),
  ]),
  cat("JSX", "jsx", "react-jsx", [
    q("What is JSX?", "Syntactic sugar that compiles to React.createElement / jsx() calls describing the element tree.", "JSX is not HTML—attribute names differ (className), and expressions wrap in {}. Must return a single root or fragment.", { tags: ["jsx"] }),
    q("Why use className instead of class in JSX?", "class is a reserved word in JS; DOM property is className.", "Similarly htmlFor instead of for. React normalizes these to DOM attributes.", { type: "concept" }),
    q("How do you conditionally render in JSX?", "&&, ternary, or early return null; avoid leaving 0/NaN accidentally rendered.", "Prefer clear ternaries for if/else UI. Extract variables for readability. Don't put hooks inside conditions.", { type: "coding" }),
    q("What are the rules for the key prop in lists?", "Keys should be stable unique IDs among siblings—not random, preferably not index if list reorders.", "Keys help reconciliation. Wrong keys remount components and reset state.", { type: "best-practice" }),
    q("What does spreading props {...props} risk?", "Forwarding unexpected DOM attrs, overriding important props, or leaking sensitive data.", "Be explicit. Destructure known props and pass the rest carefully to DOM elements.", { type: "debugging" }),
    q("JSX vs React.createElement — when does it matter?", "Same runtime result; JSX needs a transform. Understanding createElement helps debug compiled output.", "In modern React 17+ automatic runtime, import React for JSX is often unnecessary.", { type: "comparison" }),
  ]),
  cat("Props", "props", "react-props", [
    q("What are props in React?", "Inputs passed from parent to child; read-only from the child's perspective.", "Props enable composition and reuse. Changing props triggers re-render (subject to memo). Don't mutate props.", { tags: ["props"] }),
    q("Why shouldn't you mutate props?", "Props are owned by the parent; mutation breaks purity and one-way data flow.", "Copy then update in local state, or lift state and pass a setter/callback.", { type: "best-practice" }),
    q("What are children as a prop pattern?", "Using props.children or explicit slots to inject nested UI into a wrapper.", "Enables layout components. Render props / function-as-children pass data downward dynamically.", { type: "concept" }),
    q("How do default props work with function components?", "Destructure defaults in parameters: ({ size = 'md' }) => ...", "defaultProps on functions is legacy. Prefer parameter defaults and TypeScript optional props.", { type: "coding" }),
    q("Prop drilling — problems and alternatives?", "Passing props through many layers that don't use them; use composition, context, or state libraries.", "Context for sparse global concerns. Composition (children) often beats deep drilling.", { type: "architecture" }),
    q("How do you type props well in TypeScript?", "Define a Props type/interface; use React.PropsWithChildren; narrow event types.", "Avoid any. Prefer discriminated unions for variant components. Export props types for reuse.", { type: "best-practice" }),
  ]),
  cat("State", "state", "react-state", [
    q("What is useState and when do you use it?", "Hook that adds local reactive state to a function component.", "Returns [value, setState]. Updates queue a re-render. Prefer multiple state variables when unrelated.", { example: "const [count, setCount] = useState(0);" }),
    q("Why can setState appear async / batched?", "React batches updates for performance; reading state right after setState shows the old value.", "Use functional updates setCount(c => c + 1) when next value depends on previous. In React 18+, more updates batch automatically.", { type: "concept" }),
    q("When do you lift state up?", "When multiple siblings need the same data or a parent must orchestrate them.", "Single source of truth prevents desync. Don't lift everything to the app root prematurely.", { type: "architecture" }),
    q("useState vs useReducer?", "useState for simple values; useReducer for complex transitions or related multi-field updates.", "Reducers make event→state transitions explicit and testable. Prefer when next state logic is intricate.", { type: "comparison" }),
    q("Storing derived data in state — why is it a smell?", "Duplicated state drifts out of sync; derive during render or with useMemo instead.", "Keep minimal state; compute filtered lists from source + filter query.", { type: "debugging" }),
    q("How do you update objects/arrays in state immutably?", "Create new references via spread/map/filter; never mutate nested fields in place.", "Immutability enables correct change detection and time-travel debugging. Libraries like Immer help.", { example: "setItems(items => items.map(i => i.id === id ? { ...i, done: true } : i));" }),
    q("Design state for a multi-step wizard form.", "Hold step index + form draft in parent or reducer; persist optionally; validate per step.", "Avoid losing draft on step change. Consider URL step sync for deep links.", { type: "scenario" }),
  ]),
  cat("Hooks", "hooks", "react-hooks", [
    q("What are the Rules of Hooks?", "Only call hooks at the top level of React functions; only call from React functions or custom hooks.", "No hooks in loops/conditions. Ensures stable hook order between renders. ESLint plugin enforces this.", { tags: ["hooks"] }),
    q("What is a custom hook?", "A function starting with use that composes built-in hooks to reuse stateful logic.", "Share behavior, not UI. Return stable APIs. Don't hide surprising side effects.", { example: "function useToggle(init = false) {\n  const [on, setOn] = useState(init);\n  return [on, () => setOn(v => !v)] as const;\n}" }),
    q("useRef vs useState — when each?", "useRef holds mutable values without re-render; useState triggers re-render on update.", "Refs for DOM nodes, timers IDs, previous values. Don't use refs to 'avoid' renders when UI must update.", { type: "comparison" }),
    q("What does useId solve?", "Stable unique IDs for a11y attributes that match between server and client.", "Prefer over Math.random() for label/input linking under SSR.", { type: "concept" }),
    q("useTransition vs useDeferredValue?", "useTransition marks state updates as non-urgent; useDeferredValue defers a derived value.", "Keep typing snappy while heavy lists update. Don't wrap every update—profile first.", { type: "comparison" }),
    q("What is useImperativeHandle for?", "Customize the instance value exposed to parent refs via forwardRef.", "Rare—prefer declarative props. Useful for focus() APIs on design-system inputs.", { type: "concept" }),
    q("How do you test a custom hook?", "Use renderHook from Testing Library; assert returned values after act updates.", "Mock dependencies. Cover edge cases and cleanup.", { type: "coding" }),
    q("Lead: how do you govern hooks usage across a large React codebase?", "Lint rules, shared hooks library, code review for effect overuse, docs for data-fetching standards.", "Ban ad-hoc fetch-in-effect if a data library is standard. Measure re-renders in critical flows.", { type: "architecture" }),
  ]),
  cat("useEffect", "useeffect", "react-useeffect", [
    q("What is useEffect for?", "Synchronize with external systems after render: subscriptions, timers, non-React widgets.", "Not for computing derived state. Specify dependencies. Return a cleanup function.", { tags: ["useeffect"] }),
    q("Why does an effect run twice in React Strict Mode (dev)??", "React mounts, unmounts, remounts to surface missing cleanup bugs.", "Write resilient effects with proper cleanup. Don't disable Strict Mode to 'fix' double fetch without understanding.", { type: "debugging" }),
    q("How do you correctly depend on props/state in effects?", "List every reactive value used; use functional updates; extract stable callbacks or use refs for latest values intentionally.", "Exhaustive-deps warnings matter. Avoid empty deps when you read changing values.", { type: "best-practice" }),
    q("Fetching in useEffect — modern guidance?", "Works but race-prone; prefer frameworks/data libraries (React Query) or server components where appropriate.", "AbortController on cleanup. Don't ignore race conditions when query changes quickly.", { type: "scenario" }),
    q("When is useLayoutEffect preferred?", "When you must measure/mutate DOM before paint to avoid flicker.", "Blocks paint—use sparingly. SSR warnings: layout effects don't run on server.", { type: "comparison" }),
    q("Effect cleanup examples?", "Clear timers, abort fetches, unsubscribe events, disconnect observers.", "Missing cleanup causes leaks and duplicate handlers. Always pair subscriptions with teardown.", { type: "coding" }),
    q("Anti-pattern: chaining many effects to mirror state. What instead?", "Derive during render, use events to update state directly, or reducers for transitions.", "Effect chains are hard to reason about and cause cascading renders.", { type: "architecture" }),
  ]),
  cat("useMemo", "usememo", "react-usememo", [
    q("What does useMemo do?", "Memoizes a calculated value until dependencies change.", "Use for expensive pure calculations or referential stability for children. Don't memoize everything by default.", { example: "const sorted = useMemo(() => [...items].sort(cmp), [items]);" }),
    q("When is useMemo unnecessary?", "Cheap calculations; premature optimization without measured cost.", "React Compiler may memoize automatically in supporting setups—follow team guidance.", { type: "best-practice" }),
    q("useMemo for object identity — why?", "Keep the same reference so memoized children skip re-renders when contents unchanged.", "Alternative: move object creation higher or split state. Measure before sprinkling memos.", { type: "concept" }),
    q("Dependency mistakes with useMemo?", "Omitting deps yields stale values; unstable deps (new object each render) defeat memoization.", "Stabilize inputs. Prefer primitive deps when possible.", { type: "debugging" }),
    q("useMemo vs computing during render?", "Always prefer simple render computation first; memoize when profiling shows cost or identity needs.", "Clarity beats micro-optimization. Expensive filters on large lists are a good candidate.", { type: "comparison" }),
  ]),
  cat("useCallback", "usecallback", "react-usecallback", [
    q("What does useCallback do?", "Returns a memoized callback that changes only when deps change.", "Useful when passing functions to memoized children or as effect deps. Not free—has its own cost.", { tags: ["usecallback"] }),
    q("useCallback vs useMemo for functions?", "useCallback(fn, deps) ≡ useMemo(() => fn, deps); prefer useCallback for readability.", "Same underlying idea: stable function identity.", { type: "comparison" }),
    q("When does useCallback actually help?", "When a child is React.memo and would re-render from new function props, or when used in dependency arrays.", "Without memoized consumers, useCallback often does nothing useful.", { type: "best-practice" }),
    q("Stale closure bugs with useCallback?", "Missing deps capture old state; over-empty deps are a common trap.", "Use functional setState or refs for latest values when intentionally stabilizing callbacks.", { type: "debugging" }),
    q("Refactor: child re-renders every parent keystroke due to inline handlers. Options?", "Memoize child + useCallback, lift less state, or split components so inputs don't rerender heavy trees.", "Often component split beats memo theater.", { type: "scenario" }),
  ]),
  cat("Context", "context", "react-context", [
    q("What is React Context?", "A way to pass data through the tree without prop drilling via Provider + useContext.", "Good for theme, locale, auth session. Not a full replacement for complex server cache.", { tags: ["context"] }),
    q("Why can context cause wide re-renders?", "All consumers re-render when the Provider value changes by reference.", "Split contexts, memoize value, or use selectors/external stores for fine-grained subscriptions.", { type: "performance" }),
    q("How do you memoize a context value correctly?", "useMemo the object/functions provided, with correct deps.", "Recreating {user, setUser } each render defeats consumers' memoization.", { type: "coding" }),
    q("Context vs Redux/Zustand?", "Context is built-in DI for relatively stable values; dedicated stores handle high-frequency updates better.", "Many apps mix: context for DI, Zustand/Query for state/cache.", { type: "comparison" }),
    q("Pattern: separate StateContext and DispatchContext — why?", "Consumers that only dispatch don't re-render when state changes.", "Classic performance pattern with useReducer + dual providers.", { type: "architecture" }),
    q("Pitfall: providing a new context default object.", "Default values are only used without a Provider; mutating defaults is bad; usually require a Provider.", "Throw in useX() if missing provider for clearer DX.", { type: "debugging" }),
  ]),
  cat("Rendering", "rendering", "react-rendering", [
    q("What triggers a React re-render?", "State/context updates in that component (or parents re-rendering children), and hooks that schedule updates.", "Re-render ≠ DOM update. Reconciliation decides DOM mutations. Children re-render by default when parents do.", { tags: ["rendering"] }),
    q("Render vs commit phase?", "Render calculates the next element tree; commit applies DOM changes and runs layout/effects.", "Understanding phases helps reason about Suspense and concurrent features.", { type: "concept" }),
    q("What is concurrent rendering in React 18+?", "React can interrupt, prioritize, and reuse work so urgent updates stay responsive.", "Features: startTransition, Suspense, selective hydration. Write pure renders.", { type: "concept" }),
    q("How does Suspense change loading UX?", "Declaratively show fallbacks while lazy components or data resolve.", "Coordinate boundaries. Avoid waterfalls. Frameworks integrate data fetching with Suspense differently.", { type: "scenario" }),
    q("Why did my child re-render when props look the same?", "Parent re-rendered and child isn't memoized; or props are new references each time.", "Use React DevTools highlight updates. Stabilize props or memoize carefully.", { type: "debugging" }),
    q("Automatic batching — what changed in React 18?", "Updates inside timeouts/promises batch too, not only React event handlers.", "Fewer intermediate renders. Use flushSync sparingly when you must read DOM immediately.", { type: "comparison" }),
    q("Architecture tip for render performance?", "State down, components up: keep state close; split contexts; virtualize lists; profile before memo everywhere.", "Structure beats micro-memoization.", { type: "architecture" }),
  ]),
  cat("Reconciliation", "reconciliation", "react-reconciliation", [
    q("What is reconciliation?", "React's diffing algorithm that compares element trees and updates the DOM minimally.", "Same type → update; different type → remount. Keys guide list diffing.", { tags: ["reconciliation"] }),
    q("Why do keys matter for list reconciliation?", "Keys identify item identity across renders so React can move/reuse nodes and state.", "Index keys break on insert/reorder. Unstable keys remount and lose focus/state.", { type: "concept" }),
    q("What happens when a component type changes at the same position?", "React tears down the old tree and mounts a new one—state resets.", "Conditional swapping of component types remounts. Use keys intentionally to force reset when needed.", { type: "output" }),
    q("How does React treat DOM attributes during updates?", "It updates changed attributes/properties; ignores unchanged ones.", "Understanding host config helps when wrapping non-DOM targets (React Native).", { type: "concept" }),
    q("Explain bailing out of rendering with memo.", "React.memo shallow-compares props and skips render if equal.", "Custom compare functions possible but easy to get wrong. Children/function props often break memo.", { type: "comparison" }),
    q("Debug: input loses focus when typing in a list item.", "Likely remount from bad keys or recreating component types inside render.", "Stable keys and don't define components inside parents.", { type: "debugging" }),
  ]),
  cat("Performance", "performance", "react-performance", [
    q("How do you approach React performance work?", "Measure first (Profiler), then fix state location, reduce work, memoize hotspots, virtualize.", "Don't sprinkle memo/useMemo blindly. Network and bundle size matter too.", { type: "best-practice" }),
    q("What does React.lazy + Suspense do for bundles?", "Code-splits components into separate chunks loaded on demand.", "Great for routes/modals. Provide meaningful fallbacks. Prefetch when likely needed.", { type: "concept" }),
    q("Windowing/virtualization — when?", "Long lists where DOM node count dominates cost.", "Libraries like react-window. Combine with stable keys and measured row heights.", { type: "scenario" }),
    q("How can Context hurt performance and how to fix?", "Broad value changes re-render all consumers—split context or use external store subscriptions.", "useSyncExternalStore powers many modern stores efficiently.", { type: "debugging" }),
    q("startTransition for expensive filtered lists?", "Keep input state urgent; mark filtered list updates as transition for smoother typing.", "Show isPending UI. Don't transition every tiny update.", { type: "coding" }),
    q("Images and React perf?", "Use modern formats, sizing, lazy loading; avoid layout shift; consider CDN.", "UI jank isn't always JS—assets matter. Next/Image-like patterns help.", { type: "best-practice" }),
    q("Lead: set performance budgets for a React SPA.", "Define CWV targets, bundle size limits, CI checks, and profiling rituals for major features.", "Own regressions. Educate on state architecture as the main lever.", { type: "architecture" }),
  ]),
  cat("State Management", "state-management", "react-state-management", [
    q("Local state vs global state — how do you choose?", "Keep state local unless many distant consumers need it or it represents app-wide session/cache.", "Over-globalizing creates coupling. Server cache ≠ UI state.", { type: "architecture" }),
    q("What problem do Redux/Zustand/Jotai solve?", "Predictable shared client state beyond what Context handles comfortably.", "Redux Toolkit for structured enterprise flows; Zustand for minimal stores; Jotai for atomic models. Pick team conventions.", { type: "comparison" }),
    q("Server state vs client state?", "Server state is persisted remotely and cached (React Query); client state is ephemeral UI.", "Don't duplicate server lists in Redux without a strategy. Use query libraries for fetching/caching.", { type: "concept" }),
    q("How does React Query change architecture?", "Components declare queries/mutations; cache handles staleness, retries, deduping.", "Less custom fetch glue. Align mutations with cache updates. Still need local UI state.", { type: "scenario" }),
    q("Immutable updates in stores — why?", "Predictable changes, efficient equality checks, easier debugging.", "Immer often used under the hood. Avoid silent mutations.", { type: "best-practice" }),
    q("Normalize relational data in the client?", "Store entities by id and reference by ids to avoid duplication.", "Helps updates stay consistent. Can be overkill for simple trees.", { type: "architecture" }),
    q("When is Context enough without a store library?", "Low-frequency updates (theme/auth) with few consumers.", "If many high-frequency updates, prefer a store with selectors.", { type: "comparison" }),
  ]),
  cat("Server Components", "server-components", "react-server-components", [
    q("What are React Server Components (RSC)?", "Components that render on the server and send UI payload to the client without shipping their code.", "They can access backend resources directly. They cannot use state/effects or browser APIs.", { tags: ["rsc"] }),
    q("Server vs Client Components — boundaries?", "Add 'use client' to modules that need interactivity; server components can import client children.", "Keep client islands small. Pass serializable props across the boundary.", { type: "comparison" }),
    q("Why can't RSCs use useState?", "They don't run on the client as interactive instances; state/effects require client runtime.", "Push interactivity into client children. Fetch on server instead of effects.", { type: "concept" }),
    q("How do you share data from a server parent to client children?", "Fetch in the server component and pass props; or use endorsed framework patterns.", "Avoid duplicate fetches when possible. Mind serialization limits.", { type: "scenario" }),
    q("Security implication of RSCs?", "Don't leak secrets into props sent to the client; server-only modules must stay server-only.", "Treat the client boundary as public. Validate auth on the server.", { type: "best-practice" }),
    q("How do RSCs interact with Suspense?", "Wrap slow server fetches in Suspense to stream fallbacks then content.", "Enables progressive rendering. Design boundaries intentionally to avoid waterfalls.", { type: "architecture" }),
  ]),
  cat("Architecture", "architecture", "react-architecture", [
    q("Feature-based folder structure vs type-based (components/hooks)?", "Feature folders scale better by colocating related UI, hooks, and tests.", "Type-based folders become dumping grounds. Shared UI stays in a design-system package.", { type: "architecture" }),
    q("How do you design a design system with React?", "Primitives with a11y, tokens, composition APIs, documented variants, and strict versioning.", "Avoid business logic in DS components. Provide headless + styled layers if needed.", { type: "architecture" }),
    q("Handling cross-cutting concerns (auth, analytics, errors)?", "Providers at the app shell, route guards/loaders in the framework, centralized error boundaries.", "Keep feature code free of SDK spaghetti via thin adapters.", { type: "scenario" }),
    q("When to introduce microfrontends with React?", "Independent deployability across teams outweighs complexity—rare for small orgs.", "Prefer modular monolith with clear package boundaries first.", { type: "architecture" }),
    q("Lead: code review standards for React PRs?", "Purity of render, effect necessity, a11y, perf hotspots, test coverage for logic, API boundaries.", "Reject prop-drilling explosions and untyped any. Prefer incremental refactors.", { type: "best-practice" }),
  ]),
  cat("Testing", "testing", "react-testing", [
    q("What does React Testing Library encourage?", "Testing user-visible behavior via accessible queries rather than internals.", "Prefer getByRole/text. Avoid testing implementation details like state values.", { type: "best-practice" }),
    q("How do you test asynchronous UI updates?", "use findBy*, waitFor, and ensure promises flush; mock network.", "Avoid arbitrary setTimeout. Assert loading and success states.", { type: "coding" }),
    q("Unit vs integration vs e2e for React?", "Unit for hooks/utils; integration for components with providers; e2e for critical flows.", "Balance cost. Mock at boundaries thoughtfully.", { type: "comparison" }),
    q("How do you mock useRouter / navigation in tests?", "Mock the framework module or wrap with a memory router provider.", "Keep tests resilient to minor API changes by abstracting navigation helpers.", { type: "scenario" }),
  ]),
];

/* ===================== VUE (100) ===================== */
const vue = [
  cat("Components", "components", "vue-components", [
    q("What is a Vue component?", "A reusable unit with template, script, and optional style that encapsulates UI and behavior.", "SFCs (.vue) are standard. Composition API with <script setup> is preferred in Vue 3. Components communicate via props/emits and provide/inject.", { tags: ["components"] }),
    q("Options API vs Composition API?", "Options groups by option type; Composition groups by feature using functions.", "Composition scales better for complex logic reuse via composables. Options remains valid and readable for simple components.", { type: "comparison" }),
    q("What does <script setup> give you?", "Syntactic sugar for Composition API: top-level bindings auto-expose to template, better DX/ perf compile.", "Use defineProps/defineEmits. No explicit return. Preferred default for new Vue 3 code.", { type: "concept" }),
    q("Single-file component structure best practices?", "Keep components focused; extract composables; colocated scoped styles; clear props/emits.", "Avoid giant SFCs. Split presentational vs container when needed.", { type: "best-practice" }),
    q("How do async components work in Vue?", "defineAsyncComponent loads a component on demand with optional loading/error components.", "Code-split heavy widgets. Combine with Suspense for awaiting setup.", { type: "concept" }),
    q("What is Vue Suspense used for?", "Coordinate async setup/dependencies with fallback content while resolving.", "Useful with async components and top-level await in setup. Nest carefully.", { type: "scenario" }),
    q("Functional vs stateful components in Vue 3?", "Functional components are stateless/perf niche; most UI uses stateful SFCs.", "Prefer normal components unless you have a measured need. Vue 3 optimized differently than Vue 2.", { type: "comparison" }),
    q("How do slots enable composition?", "Parents pass template content into child slot outlets; named/scoped slots pass data outward.", "Prefer slots over brittle prop render flags for flexible APIs.", { example: "<slot name=\"actions\" :item=\"item\" />" }),
    q("When do you use keep-alive?", "Cache dynamic component instances so state/scroll survive toggles.", "Include/exclude names carefully. Watch memory growth with many cached trees.", { type: "scenario" }),
    q("Teleports — what problem do they solve?", "Render UI (modals/toasts) elsewhere in the DOM while keeping logical component ownership.", "Helps stacking contexts and accessibility focus management patterns.", { type: "concept" }),
    q("Recursive components — when and pitfalls?", "Components that render themselves for trees; ensure a base case and unique keys.", "Mind performance on deep trees. Prefer iterative virtualization when huge.", { type: "debugging" }),
    q("Design a reusable DataTable component API in Vue.", "Props for columns/rows; scoped slots for cell rendering; emits for sort/select; avoid over-config props.", "Composition over endless boolean props. Document slot contracts.", { type: "architecture" }),
  ]),
  cat("Reactivity", "reactivity", "vue-reactivity", [
    q("How does Vue 3 reactivity work?", "Proxies track property access during render and trigger updates when reactive data changes.", "ref/reactive/computed form the core. Dependency tracking is automatic when values are read in reactive contexts.", { tags: ["reactivity"] }),
    q("ref vs reactive — when each?", "ref wraps any value (.value); reactive wraps objects. Prefer ref for primitives and often for consistency.", "Destructuring reactive breaks reactivity unless toRefs. Templates auto-unwrap refs.", { type: "comparison", example: "const count = ref(0)\ncount.value++" }),
    q("What does computed do?", "Creates a cached derived value that recomputes when dependencies change.", "Prefer computed over methods in templates for derived state. Writable computed possible but use carefully.", { type: "concept" }),
    q("watch vs watchEffect?", "watch is explicit about sources; watchEffect auto-tracks dependencies and runs immediately.", "Use watch when you need old/new values or lazy control. Avoid heavy async without cleanup.", { type: "comparison" }),
    q("Why does destructuring props break reactivity and how do you fix it?", "Destructuring loses the reactive proxy link; use toRefs/toRef or access props.x.", "Common footgun in setup. ESLint plugins can help.", { type: "debugging" }),
    q("shallowRef / shallowReactive — when?", "Track only .value / top-level changes for large immutable replacements.", "Useful for performance with big data structures you replace wholesale.", { type: "performance" }),
    q("What is markRaw?", "Marks an object so Vue never makes it reactive—useful for third-party class instances.", "Prevent Proxy wrapping overhead/bugs with external libs.", { type: "concept" }),
    q("Triggering updates with Map/Set?", "Use reactive collections carefully; prefer replacing or Vue-aware mutation patterns.", "Know which mutations are tracked. Prefer arrays of objects for simple lists.", { type: "debugging" }),
    q("effectScope — what is it for?", "Groups effects so they can be stopped together—useful in advanced composables/libraries.", "Helps avoid leaks when dynamically creating watchers.", { type: "concept" }),
    q("How do you debug unexpected re-renders/updates?", "Vue DevTools timeline, check reactive sources, avoid creating new reactive objects each render unnecessarily.", "Watchers logging help. Ensure keys are stable in v-for.", { type: "debugging" }),
    q("Readonly proxies — why use readonly()?", "Expose reactive state to consumers without allowing mutation.", "Good for store public APIs. Mutations should go through actions.", { type: "best-practice" }),
    q("Architecture: model a complex form with Vue reactivity.", "Use reactive form state + computed validity; watchers for autosave; composables per section.", "Avoid deep watchers when computed suffices. Debounce remote sync.", { type: "architecture" }),
  ]),
  cat("Composition API", "composition-api", "vue-composition-api", [
    q("What is a composable in Vue?", "A function starting with use that encapsulates reusable stateful logic via Composition API.", "Similar spirit to React hooks but different rules. Return refs/functions. Document side effects.", { example: "export function useCounter() {\n  const n = ref(0)\n  const inc = () => n.value++\n  return { n, inc }\n}" }),
    q("Lifecycle hooks in setup / script setup?", "onMounted, onUpdated, onUnmounted, etc., register when called synchronously during setup.", "Don't register hooks async after await without care—call before await or use other patterns.", { type: "concept" }),
    q("How do provide/inject work with Composition API?", "provide(key, value) in ancestor; inject(key) in descendants; can be reactive if value is.", "Prefer explicit props for public component APIs; provide/inject for app-level concerns.", { type: "comparison" }),
    q("Top-level await in <script setup> — implications?", "Makes the component async; use with Suspense; be mindful of SSR and error handling.", "Great for gated data loading. Provide fallbacks.", { type: "scenario" }),
    q("Sharing state with a module-level ref composable?", "A singleton ref outside the function creates shared state across callers.", "Intentional for global stores; accidental for per-component state—create refs inside the function.", { type: "debugging" }),
    q("Composable design best practices?", "Accept refs/getters for inputs, return consistent APIs, clean up side effects, avoid hidden globals.", "Keep composables focused. Name clearly. Test independently.", { type: "best-practice" }),
    q("How do you migrate an Options API component to Composition?", "Move data→ref/reactive, methods→functions, computed/watch similarly; use script setup gradually.", "Don't big-bang rewrite. Extract composables as you go.", { type: "scenario" }),
    q("defineExpose — when do you need it?", "With script setup, bindings are closed by default; expose selectively for parent template refs.", "Prefer props/emits over imperative parent calls when possible.", { type: "concept" }),
    q("TypeScript with defineProps/defineEmits?", "Use generic type params or runtime declaration with types; prefer type-based for clarity.", "defineProps<{ title: string }>(). Avoid duplicating runtime + types inconsistently.", { type: "coding" }),
    q("Composables vs Pinia stores?", "Composables for local/reusable logic; Pinia for shared app state with tooling.", "Don't put every bit of state in Pinia. Use composables inside stores too.", { type: "architecture" }),
    q("How do you unit test a composable?", "Call it inside a setup wrapper or @vue/test-utils; assert returned refs after actions.", "Mock dependencies. Test cleanup on unmount.", { type: "coding" }),
    q("Lead: standards for composables in a large Vue codebase?", "Lint naming, folder conventions (composables/), review for singleton leaks, docs with examples.", "Encourage composition over mixins. Ban new mixins for greenfield.", { type: "architecture" }),
  ]),
  cat("Props & Emits", "props-emits", "vue-props-emits", [
    q("How do props work in Vue 3?", "Declared via defineProps; one-way down from parent to child; validated/typed optionally.", "Mutating props is an anti-pattern—emit events or use v-model. Defaults via withDefaults.", { tags: ["props", "emits"] }),
    q("How do emits work?", "declare via defineEmits; child triggers events; parent listens with @event.", "Prefer explicit emit declarations for documentation and validation. Payload typing matters in TS.", { example: "const emit = defineEmits<{ save: [id: number] }>()\nemit('save', 1)" }),
    q("How does v-model work on components?", "Default model is modelValue prop + update:modelValue emit; can define multiple v-models.", "Enables two-way binding ergonomics while staying explicit under the hood.", { type: "concept" }),
    q("Props validation — runtime vs TypeScript?", "Runtime props options validate in dev; TS validates at compile time—use both thoughtfully.", "Runtime validators help JS consumers. Don't rely on runtime alone in TS apps.", { type: "comparison" }),
    q("Fallthrough attributes — what are they?", "Non-prop attributes fall onto the root element unless inheritAttrs: false.", "Important for wrapper components—bind $attrs intentionally to the right element.", { type: "debugging" }),
    q("When to use prop drilling vs provide/inject vs Pinia?", "Shallow trees: props; sparse deep concerns: provide/inject; broad shared state: Pinia.", "Prefer the simplest that stays clear.", { type: "architecture" }),
    q("Boolean props casting quirks?", "Presence of a boolean prop without value becomes true; be careful with string 'false'.", "Prefer explicit :flag=\"false\". Know attribute fallthrough behavior.", { type: "debugging" }),
    q("Design events for a complex picker component.", "Emit update:modelValue, change with full payload, and blur/focus when a11y needs; document payloads.", "Don't emit redundant events. Keep names consistent with Vue style guide.", { type: "architecture" }),
    q("one-way data flow — why does Vue emphasize it?", "Predictable updates: parents own state; children request changes via events.", "Two-way binding is sugar over this. Mutating props breaks the model.", { type: "best-practice" }),
    q("How do you type v-model with TypeScript?", "Type modelValue and update:modelValue emit; or use defineModel in supported Vue versions.", "defineModel simplifies boilerplate—know your Vue version.", { type: "coding" }),
  ]),
  cat("Directives", "directives", "vue-directives", [
    q("What are Vue directives?", "Template annotations that apply reactive behavior to DOM (v-if, v-for, v-model, v-show, etc.).", "Built-ins cover common cases; custom directives handle low-level DOM integrations.", { tags: ["directives"] }),
    q("v-if vs v-show?", "v-if conditionally creates/destroys; v-show toggles display CSS.", "Use v-if for rarely shown costly trees; v-show for frequent toggles.", { type: "comparison" }),
    q("v-for key best practices?", "Always provide a stable unique key; avoid index when list reorders/filters.", "Keys preserve component state correctly across patches.", { type: "best-practice" }),
    q("v-model modifiers — .lazy .number .trim?", "Alter when/how the model updates from inputs.", "Built-in modifiers cover common form needs; components can support custom modifiers.", { type: "concept" }),
    q("What does v-bind / v-on shorthand look like?", ":attr for bind, @event for on; can bind objects of attributes/listeners.", "Object bind is powerful for forwarding. Prefer clarity in complex templates.", { type: "coding" }),
    q("Custom directives — when preferred over components?", "When you need direct DOM access that isn't worth a wrapper component (focus, analytics hook).", "Prefer components/composables for most UI. Directives are escape hatches.", { type: "architecture" }),
    q("Directive hooks in Vue 3 (created/mounted/updated/...)?", "Lifecycle for the element the directive is bound to.", "Clean up in beforeUnmount/unmounted. Avoid assuming component instance internals.", { type: "concept" }),
    q("v-html security concerns?", "Renders raw HTML—XSS risk if content is user-controlled.", "Sanitize thoroughly or avoid. Prefer text interpolation.", { type: "debugging" }),
    q("v-memo — what does it do?", "Memoizes a sub-tree until dependency values change—perf optimization for heavy lists.", "Use selectively after measuring. Wrong deps serve stale UI.", { type: "performance" }),
    q("Common v-for + v-if pitfall?", "Don't use them on the same element; filter computed lists then v-for.", "Vue 3 treats them differently than Vue 2—still prefer computed filtering.", { type: "debugging" }),
  ]),
  cat("Routing", "routing", "vue-routing", [
    q("How does Vue Router map paths to views?", "Create a router with route records (path, component, children) and install it on the app.", "router-view renders matched components; router-link navigates. History vs hash modes.", { tags: ["routing"] }),
    q("Params vs query in Vue Router?", "Params are path segments; query is search string. Both available on route object.", "Use params for identity; query for filters. Watch route for changes.", { type: "comparison" }),
    q("Navigation guards — beforeEach vs beforeEnter vs in-component?", "Global, per-route, and per-component hooks to control navigation.", "Use for auth. Prefer returning false/new path carefully. Don't over-fetch in guards.", { type: "concept" }),
    q("How do you lazy load routes?", "() => import('./Page.vue') as component—webpack/vite code splitting.", "Speeds initial load. Group related routes thoughtfully.", { example: "{ path: '/admin', component: () => import('./Admin.vue') }" }),
    q("Nested routes and named views?", "Children render in nested router-view; named views fill multiple outlets.", "Useful for complex layouts with sidebars. Keep structures understandable.", { type: "architecture" }),
    q("How do you scroll restore / scroll behavior?", "Configure scrollBehavior on the router for back/forward and anchors.", "Important for UX on long pages. Coordinate with keep-alive.", { type: "scenario" }),
    q("Passing props to route components?", "props: true maps params to props; or a function mapping route to props.", "Keeps components decoupled from $route. Prefer props for testability.", { type: "best-practice" }),
    q("Dynamic route matching and catch-all?", "Param patterns and pathMatch for 404s.", "Order matters—specific routes before catch-alls.", { type: "debugging" }),
    q("Composition API: useRouter and useRoute?", "Composable accessors for navigation and current route inside setup.", "Watch () => route.params.id for param changes when reusing components.", { type: "coding" }),
    q("Architecture for large Vue apps' routing?", "Route modules per feature, typed route names, centralized auth guards, layout routes.", "Avoid a single giant routes file. Align folders with route segments.", { type: "architecture" }),
  ]),
  cat("Pinia", "pinia", "vue-pinia", [
    q("What is Pinia?", "The official Vue store library: modular stores with state, getters, actions.", "Replaces Vuex patterns with simpler APIs and great TS support. Works with Options or Setup stores.", { tags: ["pinia"] }),
    q("Options store vs setup store?", "Options uses state/getters/actions objects; setup uses Composition API inside defineStore.", "Setup stores compose naturally with composables. Pick one style per codebase.", { type: "comparison" }),
    q("How do you persist Pinia state?", "Plugins or manual watch + localStorage; beware sensitive data.", "Rehydrate carefully on SSR. Version your persisted schema.", { type: "scenario" }),
    q("Why prefer multiple stores over one mega-store?", "Clear domains, code-splitting, smaller reactivity surfaces.", "Cross-store calls via actions. Avoid circular dependencies.", { type: "architecture" }),
    q("Getters in Pinia — best practices?", "Pure derived state from store state; avoid side effects.", "Similar to Vue computed. Compose getters thoughtfully.", { type: "best-practice" }),
    q("Actions async patterns?", "async actions for API calls; update state after await; handle errors explicitly.", "Don't duplicate React Query-like caching unless needed—or integrate a query lib.", { type: "coding" }),
    q("Using stores outside components?", "Call useXStore() inside active pinia (setup, actions); pass pinia instance outside.", "Common footgun in router guards—ensure app.use(pinia) ran.", { type: "debugging" }),
    q("Pinia vs provide/inject for shared state?", "Pinia for app-wide stateful domains with DevTools; provide/inject for localized trees.", "Don't invent a second global store system.", { type: "comparison" }),
    q("How do store plugins help?", "Extend stores for logging, persistence, API injection.", "Keep plugins focused. Document side effects.", { type: "concept" }),
    q("Lead: state management guidelines with Pinia?", "Store boundaries by domain, naming conventions, no UI concerns in stores, test actions, SSR rules.", "Review PRs for prop drilling vs premature store usage.", { type: "architecture" }),
  ]),
  cat("Performance", "performance", "vue-performance", [
    q("Key Vue 3 performance techniques?", "v-once/v-memo, shallow refs, computed caching, virtualize lists, async components, avoid unnecessary watchers.", "Profile with DevTools. Optimize update scope, not just initial load.", { type: "best-practice" }),
    q("Why can huge reactive objects be costly?", "Deep proxies and dependency tracking overhead; prefer shallow + immutable replace for big blobs.", "Normalize data. Don't make everything reactive.", { type: "concept" }),
    q("List rendering performance tips?", "Stable keys, virtual scroll, avoid heavy work in templates, use computed filters.", "Split row components. Memoize expensive cells with v-memo when appropriate.", { type: "scenario" }),
    q("How does Vite help Vue app performance in practice?", "Fast HMR/dev, efficient bundling/code-split with dynamic import.", "Still own route-level splitting and asset strategy.", { type: "concept" }),
    q("Avoiding unnecessary component updates?", "Keep props stable, use computed, check parent render churn, consider v-memo.", "Don't overuse functional micro-optimizations without metrics.", { type: "debugging" }),
    q("SSR/SSG performance considerations for Vue?", "Cache rendered pages, stream when available, hydrate efficiently, avoid blocking setup.", "Frameworks like Nuxt provide patterns—know your stack.", { type: "architecture" }),
    q("Images and fonts in Vue SPAs?", "Lazy-load, correct sizes, modern formats, font-display strategies.", "LCP often dominated by media, not Vue runtime.", { type: "best-practice" }),
    q("Lead: performance culture on a Vue team?", "Budgets, RUM, PR checklist for lists/reactivity, shared virtualization utilities.", "Teach shallowRef/markRaw patterns for chart libs.", { type: "architecture" }),
  ]),
  cat("Architecture", "architecture", "vue-architecture", [
    q("How do you structure a scalable Vue 3 app?", "Feature modules with routes, composables, components; shared UI kit; Pinia domains.", "Colocate tests. Enforce public API boundaries between features.", { type: "architecture" }),
    q("Container vs presentational components in Vue?", "Containers fetch/orchestrate; presentational receive props/emit events and use slots.", "Improves reuse and testing. Don't be dogmatic for tiny views.", { type: "comparison" }),
    q("When choose Nuxt vs plain Vite+Vue?", "Nuxt for SSR/SSG, file routing, conventions; Vite+Vue for simple SPAs or custom setups.", "Nuxt accelerates product apps with SEO needs. Understand lock-in/conventions.", { type: "architecture" }),
    q("Handling API clients cleanly?", "Thin API module, typed DTOs, map to view models, central error handling.", "Composables/stores call API—not raw axios in every component.", { type: "best-practice" }),
    q("Microfrontends with Vue — considerations?", "Shared design tokens, routing ownership, bundle duplication, team autonomy.", "Prefer modular monolith unless org constraints demand otherwise.", { type: "architecture" }),
    q("Error handling strategy across the app?", "Global error hooks, route-level boundaries, user-friendly toasts, logging pipeline.", "Don't swallow errors in composables silently.", { type: "scenario" }),
    q("Design auth flow architecture in Vue.", "Auth store, router guards, token refresh interceptor, secure storage choices.", "Keep tokens out of localStorage if threat model requires; prefer httpOnly cookies when feasible.", { type: "architecture" }),
    q("Lead: migrating a Vue 2 app to Vue 3?", "Build/tooling first, compat build if needed, replace filters/global API, Vuex→Pinia, test critical paths.", "Incremental migration beats big bang. Train the team on Composition API.", { type: "architecture" }),
  ]),
  cat("Testing", "testing", "vue-testing", [
    q("How do you test Vue components with Vue Test Utils?", "mount/shallowMount, set props, trigger events, assert emitted events and text.", "Prefer testing behavior. Use Testing Library Vue for a11y-oriented queries when possible.", { type: "coding" }),
    q("Testing Pinia stores?", "createPinia + setActivePinia in beforeEach; call actions; assert state/getters.", "Mock API modules. Reset state between tests.", { type: "coding" }),
    q("How do you test composables that use lifecycle hooks?", "wrap in a component harness or use dedicated helpers so onMounted runs.", "Assert cleanup on unmount. Mock timers for intervals.", { type: "scenario" }),
    q("Snapshot tests — useful or harmful?", "Useful for small pure presentational output; brittle for large templates.", "Prefer explicit assertions for critical behavior.", { type: "comparison" }),
    q("E2E testing Vue apps?", "Playwright/Cypress against real flows; seed data; avoid coupling to CSS class churn.", "Cover login, critical CRUD, routing. Run in CI.", { type: "best-practice" }),
    q("Mocking Vue Router in unit tests?", "createRouter with memory history or stub useRouter/useRoute.", "Test navigation emits/guards separately from UI when needed.", { type: "coding" }),
    q("How do you test async components / Suspense?", "Await flushPromises; stub async children when focusing parent; assert fallbacks.", "Don't leave dangling timers. Control resolved data.", { type: "debugging" }),
    q("Lead: testing strategy for a Vue product team?", "Unit for composables/stores, component tests for UI contracts, e2e for journeys; coverage on critical paths not vanity %.", "Share fixtures. Fail CI on flakes with quarantine process.", { type: "architecture" }),
  ]),
];

function countSeeds(banks) {
  return banks.reduce((n, c) => n + c.seeds.length, 0);
}

function main() {
  const aCount = countSeeds(angular);
  const rCount = countSeeds(react);
  const vCount = countSeeds(vue);
  if (aCount !== 100) throw new Error(`Angular seeds ${aCount}`);
  if (rCount !== 100) throw new Error(`React seeds ${rCount}`);
  if (vCount !== 100) throw new Error(`Vue seeds ${vCount}`);

  const a = writeBank("angular", angular);
  const r = writeBank("react", react);
  const v = writeBank("vue", vue);

  console.log("\nSummary");
  console.log(JSON.stringify({ angular: a, react: r, vue: v }, null, 2));
}

main();
