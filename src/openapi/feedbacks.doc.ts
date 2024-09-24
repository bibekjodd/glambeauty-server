import { getFeedbacksQuerySchema, postFeedbackSchema } from '@/dtos/feedback.dto';
import { ZodOpenApiPathsObject } from 'zod-openapi';

const tags = ['Feedbacks'];
export const feedbacksDoc: ZodOpenApiPathsObject = {
  '/api/feedbacks': {
    get: {
      summary: 'Fetch feedbacks',
      tags,
      requestParams: {
        query: getFeedbacksQuerySchema
      },
      responses: {
        200: { description: 'Feedbacks list fetched successfully' },
        400: { description: 'Invalid request query' },
        401: { description: 'User is not authenticated' },
        403: { description: 'Only admins can fetch the feedbacks' }
      }
    },
    post: {
      summary: 'Post feedback',
      tags,
      requestBody: {
        content: {
          'application/json': { schema: postFeedbackSchema }
        }
      },
      responses: {
        201: { description: 'Feedback posted successfully' },
        400: { description: 'Invalid request body payload' },
        401: { description: 'User is not authenticated' },
        403: { description: 'Admins and staffs are not allowed to post feedback' }
      }
    }
  }
};
