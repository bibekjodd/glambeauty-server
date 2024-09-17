import {
  createService,
  deleteService,
  getServices,
  updateService
} from '@/controllers/service.controller';
import { Router } from 'express';

const router = Router();
export const serviceRoute = router;

router.route('/').post(createService).get(getServices);
router.route('/:id').put(updateService).delete(deleteService);
