import { env } from '@/config/env.config';
import {
  availableStaffs,
  getProfile,
  getStaffs,
  getUserDetails,
  logoutUser,
  queryUsers,
  updateProfile,
  updateUser
} from '@/controllers/user.controller';
import express from 'express';
import passport from 'passport';

const router = express.Router();
router.get('/login/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
router.get('/callback/google', passport.authenticate('google'), (req, res) => {
  return res.redirect(env.AUTH_REDIRECT_URI);
});
router.route('/profile').get(getProfile).put(updateProfile);
router.get('/users', queryUsers);
router.get('/staffs', getStaffs);
router.get('/staffs/available', availableStaffs);

router.route('/users/:id').get(getUserDetails).put(updateUser);
router.route('/logout').get(logoutUser).post(logoutUser);

export const userRoute = router;
