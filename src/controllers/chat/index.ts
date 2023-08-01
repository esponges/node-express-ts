import type { Request, Response } from 'express';

class ChatController {
  private static instance: ChatController | undefined;

  constructor() {}

  static getInstance() {
    if (!ChatController.instance) {
      ChatController.instance = new ChatController();
    }
    return ChatController.instance;
  }

  async conversationalChat(req: Request, res: Response) {
    // Get all users from the database.
    res.send('here the chat');
  }
}

export default ChatController;

