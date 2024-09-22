import { availableStaffs, getStaffs } from '@/controllers/staff.controller';
import { Router } from 'express';

const router = Router();
export const staffRoute = router;

router.get('/', getStaffs);
router.get('/available', availableStaffs);
