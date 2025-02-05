import { apiReference } from '@scalar/express-api-reference';
import { createDocument, ZodOpenApiPathsObject } from 'zod-openapi';
import { appointmentsDoc } from './appointments.doc';
import { feedbacksDoc } from './feedbacks.doc';
import { servicesDoc } from './services.doc';
import { staffsDoc } from './staffs.doc';
import { usersDoc } from './users.doc';

export const openApiSpecs = createDocument({
  openapi: '3.0.0',
  info: {
    title: 'Glambeauty Server',
    version: '1.0.0',
    description: 'Api documentation for glambeauty server'
  },
  paths: Object.assign(
    {
      '/': {
        get: {
          summary: 'Check server status',
          responses: { 200: { description: 'Server is running fine' } }
        }
      }
    } satisfies ZodOpenApiPathsObject,
    usersDoc,
    staffsDoc,
    servicesDoc,
    appointmentsDoc,
    feedbacksDoc
  )
});

export const serveApiReference = apiReference({
  spec: { content: openApiSpecs },
  theme: 'kepler',
  darkMode: true,
  layout: 'modern',
  defaultHttpClient: {
    targetKey: 'javascript',
    clientKey: 'fetch'
  },
  metaData: {
    title: 'Express Server Api Reference'
  }
});
