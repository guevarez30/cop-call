# Logging Standards & Implementation Guide

## Technology Decision: Pino Logger

**Selected Library**: Pino
**Rationale**:

- **Performance**: 5x faster than Winston with minimal CPU/memory overhead
- **Next.js Compatibility**: Works in both client and server environments (Winston requires 'fs' which breaks client-side)
- **Structured Logging**: JSON-formatted logs by default (NDJSON) for easy ingestion into centralized logging systems
- **Production Ready**: Designed for high-scale applications with async logging
- **Developer Experience**: Supports pretty-printing in development while maintaining JSON in production

**Alternatives Considered**:

- Winston: More feature-rich but slower performance, doesn't work client-side
- next-logger: Convenient but less flexible than direct Pino implementation
- Console.log: No structured logging, no log levels, not production-ready

## Next.js 15 Configuration

**Required next.config.ts modification**:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['pino', 'pino-pretty'],
  // ... other config
};

export default nextConfig;
```

**Why**: Prevents Next.js from bundling Pino packages for the server, which is necessary because Pino requires access to Node.js native features and worker threads.

## Log Levels

Standard Pino log levels (from lowest to highest severity):

- **trace** (10): Very detailed debugging information, trace execution flow
- **debug** (20): Detailed debugging information for development
- **info** (30): General informational messages about application flow (DEFAULT)
- **warn** (40): Warning messages for potential issues that don't prevent operation
- **error** (50): Error messages for failures that need attention
- **fatal** (60): Critical errors that may cause application termination

**Usage Guidelines**:

- **Development**: Set to `debug` or `trace` for maximum visibility
- **Production**: Set to `info` or `warn` to reduce noise
- **Error Tracking**: Always use `error` or `fatal` for exceptions
- **Performance**: Use `debug` for performance-sensitive operations during development

## Logger Configuration

### Base Logger Setup (src/lib/logger.ts)

```typescript
import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.PINO_LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),

  // Pretty print in development, JSON in production
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss.l',
          ignore: 'pid,hostname',
        },
      }
    : undefined,

  // Base configuration
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },

  // Redact sensitive fields
  redact: {
    paths: ['password', 'email', '*.password', '*.email', 'req.headers.authorization'],
    censor: '[REDACTED]',
  },
});
```

### Environment Variables

```env
# .env.local or .env
PINO_LOG_LEVEL=info          # Production
PINO_LOG_LEVEL=debug         # Development
PINO_LOG_LEVEL=trace         # Deep debugging
```

## Structured Logging Patterns

### Child Logger with Context

Create child loggers to add context that persists across multiple log statements:

```typescript
// In API routes or server components
const requestLogger = logger.child({
  requestId: crypto.randomUUID(),
  userId: session?.user?.id,
  organizationId: user?.organization_id,
  route: '/api/service-calls',
});

requestLogger.info('Processing request');
requestLogger.error({ err }, 'Failed to process request');
```

### Logging with Metadata

Always include relevant context as structured data:

```typescript
// Good: Structured with metadata
logger.info(
  {
    userId: user.id,
    organizationId: user.organization_id,
    action: 'service_call_created',
    serviceCallId: serviceCall.id,
  },
  'Service call created successfully'
);

// Bad: Unstructured string
logger.info(`Service call ${serviceCall.id} created by user ${user.id}`);
```

### Error Logging

Always include the error object with a descriptive message:

```typescript
try {
  // operation
} catch (err) {
  logger.error(
    {
      err,
      userId: session.user.id,
      operation: 'create_service_call',
      context: {
        /* relevant data */
      },
    },
    'Failed to create service call'
  );

  // Re-throw or handle appropriately
}
```

## Application-Specific Logging Patterns

### Authentication & Authorization

```typescript
// Successful auth
logger.info(
  {
    userId: session.user.id,
    action: 'login',
    provider: 'email',
  },
  'User logged in'
);

// Failed auth
logger.warn(
  {
    email: '[REDACTED]', // Already redacted by config
    action: 'login_failed',
    reason: 'invalid_credentials',
  },
  'Login attempt failed'
);

// Authorization check
logger.debug(
  {
    userId: user.id,
    role: user.role,
    requiredRole: 'admin',
    allowed: user.role === 'admin',
  },
  'Authorization check performed'
);
```

### Database Operations

```typescript
// Query logging
logger.debug(
  {
    table: 'service_calls',
    operation: 'select',
    filters: { organization_id: user.organization_id },
    resultCount: results.length,
  },
  'Database query executed'
);

// Mutation logging
logger.info(
  {
    table: 'organizations',
    operation: 'update',
    recordId: org.id,
    userId: session.user.id,
    changes: { name: 'new_name' },
  },
  'Organization updated'
);
```

### API Request/Response

```typescript
// Request start
const requestLogger = logger.child({
  requestId: crypto.randomUUID(),
  method: req.method,
  path: req.url,
  userId: session?.user?.id,
});

requestLogger.info('Request started');

// Request end
requestLogger.info(
  {
    statusCode: response.status,
    duration: Date.now() - startTime,
  },
  'Request completed'
);
```

### Multi-tenant Context

Always include organization context for data isolation tracking:

```typescript
logger.info(
  {
    userId: user.id,
    organizationId: user.organization_id,
    action: 'data_access',
    resource: 'service_calls',
    count: results.length,
  },
  'User accessed organization data'
);
```

## Client-Side Logging

For client-side logging, create a lightweight wrapper:

```typescript
// src/lib/client-logger.ts
const isDevelopment = process.env.NODE_ENV === 'development';

export const clientLogger = {
  debug: (...args: any[]) => isDevelopment && console.debug(...args),
  info: (...args: any[]) => console.info(...args),
  warn: (...args: any[]) => console.warn(...args),
  error: (...args: any[]) => console.error(...args),
};
```

**Note**: Pino can be used client-side but adds bundle size. Use console methods for client logging and save Pino for server-side.

## Security & Privacy Considerations

### Sensitive Data Redaction

**Always redact**:

- Passwords
- Email addresses (in production)
- Authorization tokens
- API keys
- Session tokens
- Personal identifiable information (PII)

**Configuration**:

```typescript
redact: {
  paths: [
    'password',
    'email',
    '*.password',
    '*.email',
    'req.headers.authorization',
    'token',
    'api_key',
    'session_id'
  ],
  censor: '[REDACTED]'
}
```

### Production Logging

- **Never log sensitive user data** in production
- **Use appropriate log levels** to avoid excessive logging costs
- **Implement log rotation** if self-hosting
- **Consider centralized logging** (e.g., Datadog, LogRocket, Axiom, Better Stack)

## Best Practices Checklist

- [ ] Use appropriate log level for each message
- [ ] Include structured context (user ID, org ID, request ID)
- [ ] Log errors with full error object and context
- [ ] Use child loggers for request-scoped context
- [ ] Redact sensitive information
- [ ] Log business-critical operations (auth, data mutations)
- [ ] Include timing information for performance-sensitive operations
- [ ] Use descriptive messages that explain what happened
- [ ] Avoid logging in tight loops (use debug level if necessary)
- [ ] Include correlation IDs for tracking requests across services

## Integration with Centralized Logging

Pino outputs NDJSON which can be ingested by most logging platforms:

**Recommended platforms**:

- **Datadog**: Full-featured APM with log correlation
- **Better Stack (Logtail)**: Pino-friendly, cost-effective
- **Axiom**: Serverless-optimized, generous free tier
- **LogRocket**: Frontend + backend correlation

**Setup pattern**:

```typescript
// In production, logs go to stdout in JSON format
// Logging platform ingests from stdout/stderr
// No code changes needed, just configure log ingestion
```

## Migration Strategy

1. **Install dependencies**: `pnpm add pino pino-pretty`
2. **Update next.config.ts**: Add serverExternalPackages
3. **Create logger utility**: src/lib/logger.ts
4. **Replace console.log**: Gradually migrate to structured logging
5. **Add request logging**: Implement in API routes
6. **Add error logging**: Update error handlers
7. **Test in development**: Verify pretty printing works
8. **Test in production**: Verify JSON output format

## Common Patterns for This Application

### Service Call Logging

```typescript
logger.info(
  {
    userId: user.id,
    organizationId: user.organization_id,
    serviceCallId: serviceCall.id,
    status: 'created',
    assignedTo: serviceCall.assigned_to,
  },
  'Service call created'
);
```

### Onboarding Flow

```typescript
logger.info(
  {
    userId: session.user.id,
    action: 'onboarding_complete',
    organizationCreated: true,
    organizationId: org.id,
  },
  'User completed onboarding'
);
```

### Admin Actions

```typescript
logger.info(
  {
    adminUserId: session.user.id,
    targetUserId: targetUser.id,
    action: 'role_change',
    oldRole: targetUser.role,
    newRole: 'admin',
    organizationId: user.organization_id,
  },
  'Admin changed user role'
);
```

## When to Log

**Always log**:

- Authentication events (login, logout, signup)
- Authorization failures
- Data mutations (create, update, delete)
- API errors
- Business-critical operations
- Security-relevant events

**Consider logging**:

- Performance-sensitive operations (with timing)
- External API calls
- Background jobs
- Scheduled tasks

**Avoid logging**:

- Every database read
- Render cycles
- Static asset requests
- Health check endpoints (unless they fail)

## Troubleshooting

**Issue**: Logs not appearing

- Check PINO_LOG_LEVEL environment variable
- Verify serverExternalPackages in next.config.ts
- Ensure logger is imported correctly

**Issue**: Pino breaks client-side

- Use conditional imports: `const logger = await import('@/lib/logger')`
- Or use client-logger wrapper for client components

**Issue**: Too many logs in production

- Increase log level to 'warn' or 'error'
- Add sampling for high-volume operations
- Use log filtering in centralized logging platform

## References

- [Pino Documentation](https://getpino.io/)
- [Pino Next.js Example](https://github.com/pinojs/pino-nextjs-example)
- [Next.js Logging Best Practices](https://blog.arcjet.com/structured-logging-in-json-for-next-js/)
