import { env } from '@/config/env.config';
import { sendMail } from '@/lib/send-mail';
import { formatDate } from '@/lib/utils';
import { addNotification } from '@/services/notification.service';

type UserOptions = { name: string; email: string; id: string };
export const appointmentStatusNotification = async ({
  user,
  staff,
  appointmentId,
  date,
  serviceTitle,
  status,
  reason
}: {
  user: UserOptions;
  staff: UserOptions;
  date: string;
  appointmentId: string;
  serviceTitle: string;
  status: 'pending' | 'cancelled' | 'rescheduled';
  reason: string | null;
}) => {
  const appointmentDetailsLink = `${env.FRONTEND_URLS[0]}/?appointment_id=${appointmentId}`;
  let userMessageTitle = 'Appointment registered successfully!';
  let staffMessageTitle = 'A customer has made an appointment with you';
  let notificationDescription = `Appointment for the service - ${serviceTitle} has been scheduled to ${formatDate(date)}`;
  let userMailMessage = `<p>
  Heyy ${user.name}, your appointment for the service - ${serviceTitle} is scheduled to ${formatDate(date)} <br>
  You can get more details about appointment at this <strong><a href='${appointmentDetailsLink}'>Link </a></strong> <br>
  See you at <strong>Glambeauty</strong> 😀
  </p>`;
  let staffMailMessage = `<p>
  Heyy ${staff.name}, you have been booked for the appointment on ${formatDate(date)} for the service - ${serviceTitle}<br>
  You can get more details about appointment at this <strong><a href='${appointmentDetailsLink}'>Link </a></strong> <br>
  </p>`;

  if (status === 'cancelled') {
    userMessageTitle = 'Appointment cancelled';
    staffMessageTitle = userMessageTitle;
    notificationDescription = `Appointment for the service - ${serviceTitle} which was scheduled at ${formatDate(date)} has been cancelled`;
    userMailMessage = `<p>
  Heyy ${user.name}, your appointment for the service - ${serviceTitle} was scheduled to ${formatDate(date)} has been cancelled ${reason ? `due to reason - ${reason}` : ''}<br>
  You can get more details about appointment at this <strong><a href='${appointmentDetailsLink}'>Link </a></strong> <br>
  </p>`;
    staffMailMessage = `<p>
  Heyy ${staff.name}, the appointment on ${formatDate(date)} for the service - ${serviceTitle} has been cancelled ${reason ? `due to reason - ${reason}` : ''}<br>
  You can get more details about appointment at this <strong><a href='${appointmentDetailsLink}'>Link </a></strong> <br>
  </p>`;
  } else if (status === 'rescheduled') {
    userMessageTitle = 'Appointment rescheduled';
    staffMailMessage = userMessageTitle;
    notificationDescription = `Appointment for the service - ${serviceTitle} has been rescheduled to ${formatDate(date)}`;
    userMailMessage = `<p>
    Heyy ${user.name}, your appointment for the service - ${serviceTitle} has been rescheduled to ${formatDate(date)} ${reason ? `due to reason - ${reason}` : ''}<br>
    You can get more details about appointment at this <strong><a href='${appointmentDetailsLink}'>Link </a></strong> <br>
    </p>`;
    staffMailMessage = `<p>
    Heyy ${staff.name}, the appointment for the service - ${serviceTitle} has been rescheduled to ${formatDate(date)} ${reason ? `due to reason - ${reason}` : ''}<br>
    You can get more details about appointment at this <strong><a href='${appointmentDetailsLink}'>Link </a></strong> <br>
    </p>`;
  }

  const promises: Promise<unknown>[] = [];
  let promise: Promise<unknown>;
  promise = addNotification(
    {
      entity: 'appointments',
      title: userMessageTitle,
      userId: user.id,
      description: notificationDescription,
      params: appointmentId
    },
    {
      entity: 'appointments',
      title: staffMessageTitle,
      userId: staff.id,
      description: notificationDescription,
      params: appointmentId
    }
  );

  promises.push(promise);
  promise = sendMail(
    { mail: user.email, subject: userMessageTitle, text: userMailMessage },
    { mail: staff.email, subject: staffMessageTitle, text: staffMailMessage }
  );
  promises.push(promise);
  await Promise.all(promises);
};
