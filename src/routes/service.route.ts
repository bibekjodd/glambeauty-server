import {
  createService,
  deleteService,
  getServices,
  updateService
} from '@/controllers/service.controller';
import { Router } from 'express';

const router = Router();
export const serviceRoute = router;

router.route('/').post(createService).get(getServices).put(updateService).delete(deleteService);
