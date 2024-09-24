import { getAppointmentsQuerySchema, registerAppointmentSchema } from '@/dtos/appointment.dto';
import { z } from 'zod';
import { ZodOpenApiPathsObject } from 'zod-openapi';

const tags = ['Appointments'];
export const appointmentsDoc: ZodOpenApiPathsObject = {
  '/api/appointments': {
    get: {
      summary: 'Get appointments of user',
      tags,
      description: 'Fetch the appointments by status filters',
      requestParams: {
        query: getAppointmentsQuerySchema
      },
      responses: {
        200: {
          description: 'Appointments list fetched successfully'
        },
        400: {
          description: 'Invalid request query passed'
        },
        401: {
          description: 'User is not authenticated'
        }
      }
    },
    post: {
      summary: 'Book an appointment',
      tags,
      requestBody: {
        content: {
          'application/json': { schema: registerAppointmentSchema }
        }
      },
      responses: {
        201: {
          description: 'Appointment booked successfully'
        },
        400: {
          description: 'Invalid request body payload'
        },
        401: {
          description: 'User is not authenticated'
        },
        403: { description: "Staff or admins can't book appointment" }
      }
    }
  },

  '/api/appointments/{id}': {
    get: {
      summary: 'Get appointments detail',
      tags,
      requestParams: {
        path: z.object({ id: z.string() })
      },
      responses: {
        200: { description: 'Successfully fetched appointment details' },
        404: { description: 'Appointment does not exist' }
      }
    }
  },
  '/api/appointments/{id}/cancel': {
    put: {
      summary: 'Cancel Appointment',
      tags,
      requestParams: {
        path: z.object({ id: z.string() })
      },
      responses: {
        200: { description: 'Appointment cancelled successfully' },
        400: { description: 'Appoint is already cancelled or finished' },
        401: { description: 'User is not authenticated' },
        403: { description: "Staffs can't cancel the appointment" },
        404: { description: 'Appointment does not exist' }
      }
    }
  }
};
