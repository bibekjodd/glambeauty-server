import { env } from '@/config/env.config';
import MongoStore from 'connect-mongo';
import { CookieOptions, SessionOptions } from 'express-session';

export const devConsole = (...args: string[]) => {
  if (env.NODE_ENV !== 'production') {
    console.log(args.join(' '));
  }
};

export const cookieOptions: CookieOptions = {
  maxAge: Date.now() + 365 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: env.NODE_ENV !== 'production' ? false : true,
  sameSite: env.NODE_ENV !== 'production' ? 'lax' : 'none'
};

export const sessionOptions: SessionOptions = {
  resave: false,
  saveUninitialized: false,
  secret: env.SESSION_SECRET,
  proxy: true,
  cookie: cookieOptions,
  store: new MongoStore({ mongoUrl: env.MONGO_URI })
};

export const formatDate = (value: string | Date | number) => {
  const date = new Date(value);
  const month = date.toLocaleString('default', { month: 'long' });
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${month} ${day}, ${hours % 12 || 12}${minutes !== 0 ? `:${minutes}` : ''}${hours > 12 ? 'pm' : 'am'}`;
};
