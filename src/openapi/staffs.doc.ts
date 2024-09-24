import { availableStaffsQuerySchema } from '@/dtos/staff.dto';
import { ZodOpenApiPathsObject } from 'zod-openapi';

const tags = ['Staffs'];
export const staffsDoc: ZodOpenApiPathsObject = {
  '/api/staffs': {
    get: {
      summary: 'Fetch staffs',
      description: 'Fetches both staffs and admins',
      tags,
      responses: {
        200: {
          description: 'Staffs list fetched successfully'
        }
      }
    }
  },
  '/api/staffs/available': {
    get: {
      summary: 'Available staffs',
      description: 'Fetch the available staffs given the service id and date',
      tags,
      requestParams: {
        query: availableStaffsQuerySchema
      },
      responses: {
        200: { description: 'Fetched available staffs successfully' }
      }
    }
  }
};
