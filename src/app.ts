import 'colors';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import morgan from 'morgan';
import passport from 'passport';
import { env, validateEnv } from './config/env.config';
import { NotFoundException } from './lib/exceptions';
import { devConsole, sessionOptions } from './lib/utils';
import { handleAsync } from './middlewares/handle-async';
import { handleErrorRequest } from './middlewares/handle-error-request';
import { GoogleStrategy } from './passport/google.strategy';
import { serializer } from './passport/serializer';
import { appointmentRoute } from './routes/appointment.route';
import { notificationRoute } from './routes/notification.route';
import { serviceRoute } from './routes/service.route';
import { statsRoute } from './routes/stats.route';
import { userRoute } from './routes/user.route';

const app = express();
validateEnv();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: env.FRONTEND_URLS }));
app.enable('trust proxy');
app.use(session(sessionOptions));
if (env.NODE_ENV === 'development') {
  app.use(morgan('common'));
}
app.use(passport.initialize());
app.use(passport.session());
passport.use('google', GoogleStrategy);
serializer();

app.get(
  '/',
  handleAsync(async (req, res) => {
    return res.json({
      env: env.NODE_ENV,
      date: new Date().toISOString()
    });
  })
);

/* --------- routes --------- */
app.use('/api', userRoute);
app.use('/api/services', serviceRoute);
app.use('/api/appointments', appointmentRoute);
app.use('/api/stats', statsRoute);
app.use('/api/notifications', notificationRoute);
app.use(() => {
  throw new NotFoundException();
});
app.use(handleErrorRequest);

if (env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => {
    devConsole(`⚡[Server]: listening at http://localhost:${env.PORT}`.yellow);
  });
}
export default app;
