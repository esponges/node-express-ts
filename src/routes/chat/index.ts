import express from 'express';
import ChatController from '../../controllers/chat';

const router = express.Router();

// create singleton instance of ChatController
const chatInstance = ChatController.getInstance();

router.post('/', chatInstance.conversationalChat);

export default router;
