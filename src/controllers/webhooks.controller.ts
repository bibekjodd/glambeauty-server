import { env } from '@/config/env.config';
import { db } from '@/lib/database';
import { BadRequestException, HttpException, InternalServerException } from '@/lib/exceptions';
import { stripe } from '@/lib/stripe';
import { handleAsync } from '@/middlewares/handle-async';
import { appointmentStatusNotification } from '@/notifications/appointment.notifications';
import { appointments } from '@/schemas/appointment.schema';
import { services } from '@/schemas/service.schema';
import { users } from '@/schemas/user.schema';
import { eq } from 'drizzle-orm';

export type CheckoutMetadata = {
  customerId: string;
  startsAt: string;
  endsAt: string;
  staffId: string;
  serviceId: string;
};
export const webhookController = handleAsync(async (req, res) => {
  if (!(req.body instanceof Buffer || typeof req.body === 'string'))
    throw new BadRequestException('Invalid body provided');

  const stripeSignature = req.headers['stripe-signature'];
  if (!stripeSignature) throw new BadRequestException('Invalid stripe signature');

  const event = await stripe.webhooks.constructEventAsync(
    req.body,
    stripeSignature,
    env.STRIPE_SECRET_WEBHOOK_KEY
  );

  if (event.type !== 'checkout.session.completed')
    throw new HttpException('Method is not implemented', 501);

  const metadata = event.data.object.metadata as CheckoutMetadata;

  const [bookedAppointment] = await db
    .insert(appointments)
    .values({
      customerId: metadata.customerId,
      startsAt: metadata.startsAt,
      endsAt: metadata.endsAt,
      staffId: metadata.staffId,
      serviceId: metadata.serviceId,
      status: 'pending'
    })
    .returning();

  const [user, staff, service] = await Promise.all([
    db
      .select()
      .from(users)
      .where(eq(users.id, metadata.customerId))
      .execute()
      .then((res) => res[0]),
    db
      .select()
      .from(users)
      .where(eq(users.id, metadata.staffId))
      .execute()
      .then((res) => res[0]),
    db
      .select()
      .from(services)
      .where(eq(services.id, metadata.serviceId))
      .execute()
      .then((res) => res[0])
  ]);

  if (!user || !service || !staff) throw new InternalServerException();

  if (!bookedAppointment) throw new BadRequestException(`Unknown error occurred`);
  appointmentStatusNotification({
    appointmentId: bookedAppointment.id,
    date: bookedAppointment.startsAt,
    reason: null,
    serviceTitle: service.title,
    staff,
    user: user,
    status: 'pending'
  });

  return res.json({ message: 'Appointment booked successfully' });
});
