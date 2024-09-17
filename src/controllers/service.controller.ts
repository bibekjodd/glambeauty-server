import { createServiceSchema, updateServiceSchema } from '@/dtos/service.dto';
import { db } from '@/lib/database';
import { BadRequestException, ForbiddenException, UnauthorizedException } from '@/lib/exceptions';
import { handleAsync } from '@/middlewares/handle-async';
import { appointments } from '@/schemas/appointment.schema';
import { services } from '@/schemas/service.schema';
import { and, eq } from 'drizzle-orm';

export const createService = handleAsync(async (req, res) => {
  if (!req.user) throw new UnauthorizedException();
  if (req.user.role !== 'admin') throw new ForbiddenException('Only admin can add the service');

  const data = createServiceSchema.parse(req.body);

  const [service] = await db.insert(services).values(data).returning();
  return res.json({ message: 'New service added successfully', service });
});

export const getServices = handleAsync(async (req, res) => {
  const result = await db.select().from(services);
  return res.json({ services: result });
});

export const updateService = handleAsync<{ id: string }>(async (req, res) => {
  if (!req.user) throw new UnauthorizedException();
  if (req.user.role !== 'admin') throw new ForbiddenException('Only admin can update the service');
  const data = updateServiceSchema.parse(req.body);

  const serviceId = req.params.id;
  const pendingAppointments = await db
    .select({ id: appointments.id })
    .from(appointments)
    .where(and(eq(appointments.service_id, serviceId), eq(appointments.status, 'pending')));

  if (pendingAppointments.length !== 0)
    throw new BadRequestException(
      `Can't update service while ${pendingAppointments.length} ${pendingAppointments.length === 1 ? 'appointment is' : 'appointments are'} pending`
    );

  const [updatedService] = await db
    .update(services)
    .set(data)
    .where(eq(services.id, serviceId))
    .returning();
  if (!updatedService) throw new BadRequestException('Service does not exist');

  return res.json({ service: updatedService, message: 'Service updated successfully' });
});

export const deleteService = handleAsync<{ id: string }>(async (req, res) => {
  if (!req.user) throw new UnauthorizedException();
  if (req.user.role !== 'admin') throw new ForbiddenException();

  const serviceId = req.params.id;
  const pendingAppointments = await db
    .select({ id: appointments.id })
    .from(appointments)
    .where(and(eq(appointments.service_id, serviceId), eq(appointments.status, 'pending')));

  if (pendingAppointments.length !== 0)
    throw new BadRequestException(
      `Can't delete service while ${pendingAppointments.length} ${pendingAppointments.length === 1 ? 'appointment is' : 'appointments are'} pending`
    );

  const [deletedService] = await db.delete(services).where(eq(services.id, serviceId)).returning();
  if (!deletedService)
    throw new BadRequestException('Service does not exist or is already deleted');

  return res.json({ message: 'Service deleted successfully' });
});
