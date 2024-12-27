import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import config from '../config.json'

Sentry.init({
    dsn: config.sentry,
    integrations: [
        nodeProfilingIntegration()
    ],
    tracesSampleRate: 1.0,
})