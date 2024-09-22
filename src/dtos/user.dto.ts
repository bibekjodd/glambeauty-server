import z from 'zod';

const imageRegExp = new RegExp(`(https?://.*.(png|gif|webp|jpeg|jpg))`);
export const imageSchema = z
  .string({ invalid_type_error: 'Invalid image url' })
  .trim()
  .regex(imageRegExp, 'invalid image url')
  .max(200, 'Too long image uri');

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .min(4, 'Too short name')
      .max(40, 'Too long name')
      .trim()
      .transform((value) => value.split(' ').slice(0, 3).join(' ')),
    image: imageSchema,
    address: z.string().min(3, 'Invalid address').max(200, 'Too long address').trim(),
    phone: z.number().refine((phone) => {
      return phone.toString().length === 10;
    }, 'Invalid phone number')
  })
  .partial()
  .refine((value) => {
    return Object.keys(value).length > 0;
  }, 'Please provide at least one property to update');

export const updateUserSchema = z
  .object({
    role: z.enum(['staff', 'user', 'admin']).optional(),
    active: z.boolean().optional()
  })
  .refine((val) => {
    return Object.keys(val).length !== 0;
  }, 'Provide at least one property to update user');

export const queryUsersSchema = z.object({
  q: z.string().default(''),
  page: z.preprocess((val) => Number(val) || undefined, z.number().min(1).default(1)),
  limit: z.preprocess((val) => Number(val) || undefined, z.number().min(1).max(20).default(20)),
  role: z.enum(['user', 'staff', 'admin']).optional()
});
