import {
  getProfile,
  getUserDetails,
  queryUsers,
  updateProfile,
  updateUser
} from '@/controllers/user.controller';
import express from 'express';

const router = express.Router();

router.route('/profile').get(getProfile).put(updateProfile);
router.get('/', queryUsers);
router.route('/:id').get(getUserDetails).put(updateUser);

export const userRoute = router;
