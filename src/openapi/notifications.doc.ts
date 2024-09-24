import { getNotificationsQuerySchema } from '@/dtos/notification.dto';
import { ZodOpenApiPathsObject } from 'zod-openapi';

const tags = ['Notifications'];
export const notificationsDoc: ZodOpenApiPathsObject = {
  '/api/notifications': {
    get: {
      summary: 'Get notifications list',
      tags,
      requestParams: {
        query: getNotificationsQuerySchema
      },
      responses: {
        200: { description: 'Notifications list fetched successfully' },
        400: { description: 'Invalid request query' },
        401: { description: 'User is not authenticated' }
      }
    }
  }
};
