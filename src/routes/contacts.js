import express from 'express';
import {
  getContacts,
  getContactByIdController,
} from '../controllers/contactsController.js';

const router = express.Router();

router.get('/', getContacts);
router.get('/:contactId', getContactByIdController);

export default router;