import { getFeedbacks, postFeedback } from '@/controllers/feedback.controller';
import { Router } from 'express';

const router = Router();
export const feedbackRoute = router;
router.route('/').post(postFeedback).get(getFeedbacks);
