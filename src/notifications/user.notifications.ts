import { env } from '@/config/env.config';
import { sendMail } from '@/lib/send-mail';
import { UserRole } from '@/schemas/user.schema';
import { addNotification } from '@/services/notification.service';

type UserOptions = { name: string; email: string; id: string };
export const roleUpdateNotification = async ({
  user,
  role
}: {
  user: UserOptions;
  role: UserRole;
}) => {
  let title = `You have been added as a staff at Glambeauty`;
  let description = `You can now be booked by customers for the services on Glambeauty`;
  let mailMessage = `<p>
  Heyy ${user.name}, you have been added as a staff to Glambeauty<br>
  Visit <a href='${env.FRONTEND_URLS[0]}'>Glambeauty</a> to see appointments
  </p>`;

  if (role === 'user') {
    title = `You have been demoted as user at Glambeauty`;
    mailMessage = `<p>
    Heyy ${user.name}, you are now no longer available for the appointment bookings and management at Glambeauty
    </p>`;
  } else if (role === 'admin') {
    title = `You have been added as admin at Glambeauty`;
    description = `You can now manage dashboards`;
    mailMessage = `<p>
    Heyy ${user.name}, you are now authorized to manage appointments, staffs and all the admin responsibilities<br>
    Visit <strong><a href='${env.FRONTEND_URLS[0]}/dashboard'>Dashboard</a></strong> to see the stats, reports and latest updates
    </p>`;
  }

  const promises: Promise<unknown>[] = [];
  let promise: Promise<unknown>;
  promise = addNotification({ entity: 'role', title, description, userId: user.id, params: role });
  promises.push(promise);

  promise = sendMail({ mail: user.email, text: mailMessage, subject: title });
  promises.push(promise);
  await Promise.all(promises);
};
