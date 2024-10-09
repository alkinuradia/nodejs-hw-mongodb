import createHttpError from 'http-errors';
import parsePaginationParams from '../utils/parsePaginationParams.js';
import parseSortParams from '../utils/parseSortParams.js';
import * as contactServices from '../services/contacts.js';
import {parseContactsFilterParams} from '../utils/filters/parseContactsFilterParams.js';
import { sortFields } from '../db/Contacts.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { env } from '../utils/env.js';
// const enableCloudinary = env("ENABLE_CLOUDINARY");


export const getAllContactsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams({ ...req.query, sortFields });
  const filter = parseContactsFilterParams(req.query);
  const userId = req.user._id;
  const contacts = await contactServices.getAllContacts({
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
  const {id} = req.params;
  const userId = req.user._id;
  const data = await contactServices.getContactById(id, userId);

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
  // photo
  const photo = req.file;


  let photoUrl;
  if (photo) {
    if (env('ENABLE_CLOUDINARY') === 'true') {
      photoUrl = await saveFileToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploadDir(photo);
    }
  }


  req.body.photo = photoUrl;
  const userId = req.user._id;
  const data = await contactServices.createContact(req.body, userId);

  res.status(201).json({
    status: 201,
    message: "Contact add successfully",
    data,
  });
};

export const patchContactController = async(req, res)=> {
  const {id} = req.params;
  const userId = req.user._id;
// photo
  const photo = req.file;


  let photoUrl;
  if (photo) {
    if (env('ENABLE_CLOUDINARY') === 'true') {
      photoUrl = await saveFileToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploadDir(photo);
    }
  }


  req.body.photo = photoUrl;
  const contact = await contactServices.updateContact(id, req.body, userId);
  // contact.photo = photoUrl;

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
  const {id} = req.params;
  const userId = req.user._id;
  const data = await contactServices.deleteContact(id, userId);


  if (!data) {
    throw createHttpError(404, `Contact with id=${id} not found`);
  }

  res.status(204).send();
};

