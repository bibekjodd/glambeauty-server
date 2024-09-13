import { env } from '@/config/env.config';
import {
  getProfile,
  getUserDetails,
  logoutUser,
  updateProfile
} from '@/controllers/user.controller';
import express from 'express';
import passport from 'passport';

const router = express.Router();
router.get('/login/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
router.get('/callback/google', passport.authenticate('google'), (req, res) => {
  return res.redirect(env.AUTH_REDIRECT_URI);
});
router.route('/profile').get(getProfile).put(updateProfile);
router.get('/user/:id', getUserDetails);
router.route('/logout').get(logoutUser).post(logoutUser);

export const userRoute = router;
