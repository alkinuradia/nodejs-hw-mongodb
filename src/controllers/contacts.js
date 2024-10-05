import createHttpError from 'http-errors';
import parsePaginationParams from '../utils/parsePaginationParams.js';
import parseSortParams from '../utils/parseSortParams.js';
import {
  createContact,
  deleteContactById,
  getAllContacts,
  getContactById,
  updateContact,
} from '../services/contacts.js';
import {parseContactsFilterParams} from '../utils/filters/parseContactsFilterParams.js';
import { sortFields } from '../db/Contacts.js';

export const getAllContactsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams({ ...req.query, sortFields });
  const filter = parseContactsFilterParams(req.query);
  const userId = req.user._id;
  const contacts = await getAllContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
    userId,
    });

  res.json({
      status: 200,
      message: 'Successfully found contacts',
      data: contacts,
    });
};

export const getContactByIdController = async (req, res) => {
  // const { id } = req.params;
  const {id} = req.params;
  const userId = req.user._id;
  const data = await getContactById(id, userId);

  if (!data) {
    throw createHttpError(404, `Contact with id=${id} not found`);
  }

  res.json({
    status: 200,
    message: `Contact with ${id} successfully find`,
    data,
  });
};

export const addContactController = async(req, res)=> {
  const { body } = req;
  const userId = req.user._id;
  const data = await createContact(body, userId);

  res.status(201).json({
    status: 201,
    message: "Contact add successfully",
    data,
  });
};

export const upsertContactController = async(req, res)=> {
  const id = req.params.contactId;
  const userId = req.user._id;
  const contact = await updateContact(id, req.body, userId);

  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: `Successfully patched a contact!`,
    data: contact,
  });
};

export const deleteContactController = async(req, res)=> {
  const id = req.params.contactId;
  const userId = req.user._id;
  const data = await deleteContactById(id, userId);


  if (!data) {
    throw createHttpError(404, `Contact with id=${id} not found`);
  }

  res.status(204).send();
};
