import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  // next: implement logic from controller
  res.send('here the chat');
});

export default router;
