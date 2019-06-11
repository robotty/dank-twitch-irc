import 'source-map-support/register';

if (process.env.NODE_ENV !== 'production'){
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    let longjohn = require('longjohn');
    // eslint-disable-next-line @typescript-eslint/camelcase
    longjohn.async_trace_limit = -1;  // unlimited
}

export { MultiClient as Client } from './client/multi-client';
