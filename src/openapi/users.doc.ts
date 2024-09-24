import { queryUsersSchema, updateProfileSchema, updateUserSchema } from '@/dtos/user.dto';
import { z } from 'zod';
import { ZodOpenApiPathsObject } from 'zod-openapi';
import 'zod-openapi/extend';

const tags = ['Users'];
export const usersDoc: ZodOpenApiPathsObject = {
  '/api/users': {
    get: {
      summary: 'Query users',
      tags,
      responses: {
        200: { description: 'Users list fetched successfully' },
        400: { description: 'Invalid queries' }
      },
      requestParams: {
        query: queryUsersSchema
      }
    }
  },
  '/api/users/profile': {
    get: {
      summary: 'Get profile',
      tags,
      responses: {
        200: {
          description: 'User profile fetched successfully'
        },
        401: {
          description: 'User is not authenticated'
        }
      }
    },
    put: {
      summary: 'Update profile',
      tags,
      responses: {
        200: {
          description: 'User profile updated successfully'
        },
        400: {
          description: 'Invalid request body payload'
        },
        401: {
          description: 'User is not authenticated'
        }
      },
      requestBody: {
        content: {
          'application/json': {
            schema: updateProfileSchema.openapi({
              example: { name: 'John doe...', address: 'Bharatpur-2, Chitwan', phone: 9812345678 }
            })
          }
        }
      }
    }
  },

  '/api/users/{id}': {
    get: {
      summary: 'Get user details',
      tags,
      requestParams: { path: z.object({ id: z.string() }) },
      responses: {
        200: {
          description: 'User details fetched successfully'
        },
        404: {
          description: 'User does not exist'
        }
      }
    },
    put: {
      summary: 'Update user details',
      tags,
      description:
        'Update the role of user as user, admin or staff. Change the active status of user',

      requestParams: {
        path: z.object({ id: z.string() })
      },
      requestBody: {
        content: {
          'application/json': { schema: updateUserSchema }
        }
      },
      responses: {
        200: {
          description: 'User details updated successfully'
        },
        401: {
          description: 'User is not authenticated'
        },
        403: {
          description: 'Must be admin to update details'
        }
      }
    }
  }
};
