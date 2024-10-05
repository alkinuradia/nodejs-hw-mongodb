import createHttpError from 'http-errors';
import parsePaginationParams from '../utils/parsePaginationParams.js';
import parseSortParams from '../utils/parseSortParams.js';
import * as contactServices from '../services/contacts.js';
import {parseContactsFilterParams} from '../utils/filters/parseContactsFilterParams.js';
import { sortFields } from '../db/Contacts.js';

export const getAllContactsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams({ ...req.query, sortFields });
  const filter = parseContactsFilterParams(req.query);
  const {_id: userId} = req.user;
  const contacts = await contactServices.getAllContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter: {...filter, userId},
    });

  res.json({
      status: 200,
      message: 'Successfully found contacts',
      data: contacts,
    });
};

export const getContactByIdController = async (req, res) => {
  const { id } = req.params;
  const {_id: userId} = req.user;
  const data = await contactServices.getContact({_id: id, userId});

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
  const {_id: userId} = req.user;
  const data = await contactServices.createContact({...req.body, userId});

  res.status(201).json({
    status: 201,
    message: "Contact add successfully",
    data,
  });
};

export const upsertContactController = async(req, res)=> {
  const {id} = req.params;
  const {isNew, data} = await contactServices.updateContact({_id: id}, req.body, {upsert: true});

  const status = isNew ? 201 : 200;

  res.status(status).json({
    status,
    message: "Contact upsert successfully",
    data,
  });
};

export const patchContactController = async(req, res)=> {
  const {id} = req.params;
  const result = await contactServices.updateContact({_id: id}, req.body);

  if (!result) {
    throw createHttpError(404, `Contact with id=${id} not found`);
  }

  res.json({
    status: 200,
    message: "Contact patched successfully",
    data: result.data,
  });
};

export const deleteContactController = async(req, res)=> {
  const {id} = req.params;
  const data = await contactServices.deleteContact({_id: id});

  if (!data) {
    throw createHttpError(404, `Contact with id=${id} not found`);
  }

  res.status(204).send();
};
