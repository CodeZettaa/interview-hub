import type { InterviewQuestion, Technology } from "@/types/interview";

import htmlSemantics from "@/data/questions/html/semantics.json";
import htmlAccessibility from "@/data/questions/html/accessibility.json";
import htmlForms from "@/data/questions/html/forms.json";
import htmlMedia from "@/data/questions/html/media.json";
import htmlSeo from "@/data/questions/html/seo.json";
import htmlApis from "@/data/questions/html/apis.json";
import htmlPerformance from "@/data/questions/html/performance.json";
import htmlSecurity from "@/data/questions/html/security.json";

import cssCascade from "@/data/questions/css/cascade.json";
import cssSelectors from "@/data/questions/css/selectors.json";
import cssBoxModel from "@/data/questions/css/box-model.json";
import cssFlexbox from "@/data/questions/css/flexbox.json";
import cssGrid from "@/data/questions/css/grid.json";
import cssResponsive from "@/data/questions/css/responsive.json";
import cssAnimations from "@/data/questions/css/animations.json";
import cssPerformance from "@/data/questions/css/performance.json";

import jsExecutionContext from "@/data/questions/javascript/execution-context.json";
import jsScope from "@/data/questions/javascript/scope.json";
import jsHoisting from "@/data/questions/javascript/hoisting.json";
import jsClosures from "@/data/questions/javascript/closures.json";
import jsThis from "@/data/questions/javascript/this.json";
import jsPrototype from "@/data/questions/javascript/prototype.json";
import jsOop from "@/data/questions/javascript/oop.json";
import jsFunctional from "@/data/questions/javascript/functional.json";
import jsAsync from "@/data/questions/javascript/async.json";
import jsEventLoop from "@/data/questions/javascript/event-loop.json";
import jsPromises from "@/data/questions/javascript/promises.json";
import jsMemory from "@/data/questions/javascript/memory.json";
import jsDom from "@/data/questions/javascript/dom.json";
import jsBrowserApis from "@/data/questions/javascript/browser-apis.json";
import jsPerformance from "@/data/questions/javascript/performance.json";
import jsModules from "@/data/questions/javascript/modules.json";
import jsErrorHandling from "@/data/questions/javascript/error-handling.json";

import tsTypes from "@/data/questions/typescript/types.json";
import tsInterfaces from "@/data/questions/typescript/interfaces.json";
import tsGenerics from "@/data/questions/typescript/generics.json";
import tsUtilityTypes from "@/data/questions/typescript/utility-types.json";
import tsNarrowing from "@/data/questions/typescript/narrowing.json";
import tsTypeGuards from "@/data/questions/typescript/type-guards.json";
import tsClasses from "@/data/questions/typescript/classes.json";
import tsDecorators from "@/data/questions/typescript/decorators.json";
import tsAdvancedTypes from "@/data/questions/typescript/advanced-types.json";
import tsConditionalTypes from "@/data/questions/typescript/conditional-types.json";
import tsMappedTypes from "@/data/questions/typescript/mapped-types.json";
import tsInference from "@/data/questions/typescript/inference.json";
import tsTypeSafety from "@/data/questions/typescript/type-safety.json";
import tsArchitecture from "@/data/questions/typescript/architecture.json";

import scssVariables from "@/data/questions/scss/variables.json";
import scssNesting from "@/data/questions/scss/nesting.json";
import scssMixins from "@/data/questions/scss/mixins.json";
import scssFunctions from "@/data/questions/scss/functions.json";
import scssPartials from "@/data/questions/scss/partials.json";
import scssArchitecture from "@/data/questions/scss/architecture.json";
import scssPerformance from "@/data/questions/scss/performance.json";

import ngComponents from "@/data/questions/angular/components.json";
import ngTemplates from "@/data/questions/angular/templates.json";
import ngDependencyInjection from "@/data/questions/angular/dependency-injection.json";
import ngChangeDetection from "@/data/questions/angular/change-detection.json";
import ngSignals from "@/data/questions/angular/signals.json";
import ngRxjs from "@/data/questions/angular/rxjs.json";
import ngRouting from "@/data/questions/angular/routing.json";
import ngForms from "@/data/questions/angular/forms.json";
import ngHttp from "@/data/questions/angular/http.json";
import ngGuards from "@/data/questions/angular/guards.json";
import ngInterceptors from "@/data/questions/angular/interceptors.json";
import ngPerformance from "@/data/questions/angular/performance.json";
import ngSsr from "@/data/questions/angular/ssr.json";
import ngHydration from "@/data/questions/angular/hydration.json";
import ngZoneless from "@/data/questions/angular/zoneless.json";
import ngArchitecture from "@/data/questions/angular/architecture.json";
import ngTesting from "@/data/questions/angular/testing.json";
import ngSecurity from "@/data/questions/angular/security.json";

import reactComponents from "@/data/questions/react/components.json";
import reactJsx from "@/data/questions/react/jsx.json";
import reactProps from "@/data/questions/react/props.json";
import reactState from "@/data/questions/react/state.json";
import reactHooks from "@/data/questions/react/hooks.json";
import reactUseEffect from "@/data/questions/react/useeffect.json";
import reactUseMemo from "@/data/questions/react/usememo.json";
import reactUseCallback from "@/data/questions/react/usecallback.json";
import reactContext from "@/data/questions/react/context.json";
import reactRendering from "@/data/questions/react/rendering.json";
import reactReconciliation from "@/data/questions/react/reconciliation.json";
import reactPerformance from "@/data/questions/react/performance.json";
import reactStateManagement from "@/data/questions/react/state-management.json";
import reactServerComponents from "@/data/questions/react/server-components.json";
import reactArchitecture from "@/data/questions/react/architecture.json";
import reactTesting from "@/data/questions/react/testing.json";

import vueComponents from "@/data/questions/vue/components.json";
import vueReactivity from "@/data/questions/vue/reactivity.json";
import vueCompositionApi from "@/data/questions/vue/composition-api.json";
import vuePropsEmits from "@/data/questions/vue/props-emits.json";
import vueDirectives from "@/data/questions/vue/directives.json";
import vueRouting from "@/data/questions/vue/routing.json";
import vuePinia from "@/data/questions/vue/pinia.json";
import vuePerformance from "@/data/questions/vue/performance.json";
import vueArchitecture from "@/data/questions/vue/architecture.json";
import vueTesting from "@/data/questions/vue/testing.json";

import nextAppRouter from "@/data/questions/nextjs/app-router.json";
import nextServerComponents from "@/data/questions/nextjs/server-components.json";
import nextClientComponents from "@/data/questions/nextjs/client-components.json";
import nextRendering from "@/data/questions/nextjs/rendering.json";
import nextSsr from "@/data/questions/nextjs/ssr.json";
import nextSsg from "@/data/questions/nextjs/ssg.json";
import nextIsr from "@/data/questions/nextjs/isr.json";
import nextCaching from "@/data/questions/nextjs/caching.json";
import nextRouteHandlers from "@/data/questions/nextjs/route-handlers.json";
import nextServerActions from "@/data/questions/nextjs/server-actions.json";
import nextAuthentication from "@/data/questions/nextjs/authentication.json";
import nextMiddleware from "@/data/questions/nextjs/middleware.json";
import nextMetadata from "@/data/questions/nextjs/metadata.json";
import nextSeo from "@/data/questions/nextjs/seo.json";
import nextPerformance from "@/data/questions/nextjs/performance.json";
import nextDeployment from "@/data/questions/nextjs/deployment.json";

import nodeRuntime from "@/data/questions/nodejs/runtime.json";
import nodeEventLoop from "@/data/questions/nodejs/event-loop.json";
import nodeStreams from "@/data/questions/nodejs/streams.json";
import nodeBuffers from "@/data/questions/nodejs/buffers.json";
import nodeFileSystem from "@/data/questions/nodejs/file-system.json";
import nodeAsync from "@/data/questions/nodejs/async.json";
import nodeModules from "@/data/questions/nodejs/modules.json";
import nodeApis from "@/data/questions/nodejs/apis.json";
import nodeExpress from "@/data/questions/nodejs/express.json";
import nodeAuthentication from "@/data/questions/nodejs/authentication.json";
import nodeSecurity from "@/data/questions/nodejs/security.json";
import nodePerformance from "@/data/questions/nodejs/performance.json";
import nodeScaling from "@/data/questions/nodejs/scaling.json";
import nodeClustering from "@/data/questions/nodejs/clustering.json";
import nodeProcesses from "@/data/questions/nodejs/processes.json";
import nodeMemory from "@/data/questions/nodejs/memory.json";
import nodeErrorHandling from "@/data/questions/nodejs/error-handling.json";

import nestModules from "@/data/questions/nestjs/modules.json";
import nestControllers from "@/data/questions/nestjs/controllers.json";
import nestProviders from "@/data/questions/nestjs/providers.json";
import nestDependencyInjection from "@/data/questions/nestjs/dependency-injection.json";
import nestMiddleware from "@/data/questions/nestjs/middleware.json";
import nestGuards from "@/data/questions/nestjs/guards.json";
import nestPipes from "@/data/questions/nestjs/pipes.json";
import nestInterceptors from "@/data/questions/nestjs/interceptors.json";
import nestExceptionFilters from "@/data/questions/nestjs/exception-filters.json";
import nestDtos from "@/data/questions/nestjs/dtos.json";
import nestValidation from "@/data/questions/nestjs/validation.json";
import nestAuthentication from "@/data/questions/nestjs/authentication.json";
import nestAuthorization from "@/data/questions/nestjs/authorization.json";
import nestOrm from "@/data/questions/nestjs/orm.json";
import nestMicroservices from "@/data/questions/nestjs/microservices.json";
import nestTesting from "@/data/questions/nestjs/testing.json";
import nestArchitecture from "@/data/questions/nestjs/architecture.json";

type QuestionFile = InterviewQuestion[];

const REGISTRY: Partial<Record<Technology, QuestionFile[]>> = {
  html: [
    htmlSemantics,
    htmlAccessibility,
    htmlForms,
    htmlMedia,
    htmlSeo,
    htmlApis,
    htmlPerformance,
    htmlSecurity,
  ] as QuestionFile[],
  css: [
    cssCascade,
    cssSelectors,
    cssBoxModel,
    cssFlexbox,
    cssGrid,
    cssResponsive,
    cssAnimations,
    cssPerformance,
  ] as QuestionFile[],
  javascript: [
    jsExecutionContext,
    jsScope,
    jsHoisting,
    jsClosures,
    jsThis,
    jsPrototype,
    jsOop,
    jsFunctional,
    jsAsync,
    jsEventLoop,
    jsPromises,
    jsMemory,
    jsDom,
    jsBrowserApis,
    jsPerformance,
    jsModules,
    jsErrorHandling,
  ] as QuestionFile[],
  typescript: [
    tsTypes,
    tsInterfaces,
    tsGenerics,
    tsUtilityTypes,
    tsNarrowing,
    tsTypeGuards,
    tsClasses,
    tsDecorators,
    tsAdvancedTypes,
    tsConditionalTypes,
    tsMappedTypes,
    tsInference,
    tsTypeSafety,
    tsArchitecture,
  ] as QuestionFile[],
  scss: [
    scssVariables,
    scssNesting,
    scssMixins,
    scssFunctions,
    scssPartials,
    scssArchitecture,
    scssPerformance,
  ] as QuestionFile[],
  angular: [
    ngComponents,
    ngTemplates,
    ngDependencyInjection,
    ngChangeDetection,
    ngSignals,
    ngRxjs,
    ngRouting,
    ngForms,
    ngHttp,
    ngGuards,
    ngInterceptors,
    ngPerformance,
    ngSsr,
    ngHydration,
    ngZoneless,
    ngArchitecture,
    ngTesting,
    ngSecurity,
  ] as QuestionFile[],
  react: [
    reactComponents,
    reactJsx,
    reactProps,
    reactState,
    reactHooks,
    reactUseEffect,
    reactUseMemo,
    reactUseCallback,
    reactContext,
    reactRendering,
    reactReconciliation,
    reactPerformance,
    reactStateManagement,
    reactServerComponents,
    reactArchitecture,
    reactTesting,
  ] as QuestionFile[],
  nextjs: [
    nextAppRouter,
    nextServerComponents,
    nextClientComponents,
    nextRendering,
    nextSsr,
    nextSsg,
    nextIsr,
    nextCaching,
    nextRouteHandlers,
    nextServerActions,
    nextAuthentication,
    nextMiddleware,
    nextMetadata,
    nextSeo,
    nextPerformance,
    nextDeployment,
  ] as QuestionFile[],
  vue: [
    vueComponents,
    vueReactivity,
    vueCompositionApi,
    vuePropsEmits,
    vueDirectives,
    vueRouting,
    vuePinia,
    vuePerformance,
    vueArchitecture,
    vueTesting,
  ] as QuestionFile[],
  nodejs: [
    nodeRuntime,
    nodeEventLoop,
    nodeStreams,
    nodeBuffers,
    nodeFileSystem,
    nodeAsync,
    nodeModules,
    nodeApis,
    nodeExpress,
    nodeAuthentication,
    nodeSecurity,
    nodePerformance,
    nodeScaling,
    nodeClustering,
    nodeProcesses,
    nodeMemory,
    nodeErrorHandling,
  ] as QuestionFile[],
  nestjs: [
    nestModules,
    nestControllers,
    nestProviders,
    nestDependencyInjection,
    nestMiddleware,
    nestGuards,
    nestPipes,
    nestInterceptors,
    nestExceptionFilters,
    nestDtos,
    nestValidation,
    nestAuthentication,
    nestAuthorization,
    nestOrm,
    nestMicroservices,
    nestTesting,
    nestArchitecture,
  ] as QuestionFile[],
};

let cache: InterviewQuestion[] | null = null;

export function loadAllQuestions(): InterviewQuestion[] {
  if (cache) return cache;
  const all: InterviewQuestion[] = [];
  for (const files of Object.values(REGISTRY)) {
    for (const file of files ?? []) {
      all.push(...(file as InterviewQuestion[]));
    }
  }
  cache = all;
  return all;
}

export function loadQuestionsByTechnology(
  technology: Technology,
): InterviewQuestion[] {
  return loadAllQuestions().filter((q) => q.technology === technology);
}

export function clearQuestionCache() {
  cache = null;
}
