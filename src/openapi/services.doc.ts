import { createServiceSchema, updateServiceSchema } from '@/dtos/service.dto';
import { z } from 'zod';
import { ZodOpenApiPathsObject } from 'zod-openapi';

const tags = ['Services'];
export const servicesDoc: ZodOpenApiPathsObject = {
  '/api/services': {
    get: {
      summary: 'Fetch the services list',
      tags,
      responses: {
        200: { description: 'Services list fetched successfully' }
      }
    },
    post: {
      summary: 'Add new service',
      tags,
      requestBody: {
        content: { 'application/json': { schema: createServiceSchema } }
      },
      responses: {
        201: {
          description: 'New service added successfully'
        },
        400: {
          description: 'Invalid request body payload'
        },
        401: {
          description: 'User is not authenticated'
        },
        403: {
          description: 'Only admin can add new service'
        }
      }
    }
  },
  '/api/services/{id}': {
    put: {
      summary: 'Update service',
      tags,
      requestParams: {
        path: z.object({ id: z.string() })
      },
      requestBody: {
        content: {
          'application/json': { schema: updateServiceSchema }
        }
      },
      responses: {
        200: { description: 'Service updated successfully' },
        400: { description: "Current service has pending appointments and can't be updated" },
        401: { description: 'User is not authenticated' },
        403: { description: 'Only admin can update the service' },
        404: { description: 'Service does not exist' }
      }
    },
    delete: {
      summary: 'Delete service',
      tags,
      requestParams: {
        path: z.object({ id: z.string() })
      },
      responses: {
        200: { description: 'Service deleted successfully' },
        400: { description: "Current service has pending appointments and can't be deleted" },
        401: { description: 'User is not authenticated' },
        403: { description: 'Only admin can delete the service' },
        404: { description: 'Service does not exist' }
      }
    }
  }
};
