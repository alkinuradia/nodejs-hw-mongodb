import createHttpError from 'http-errors';
import parsePaginationParams from '../utils/parsePaginationParams.js';
import parseSortParams from '../utils/parseSortParams.js';
import * as contactServices from '../services/contacts.js';
import {parseContactsFilterParams} from '../utils/filters/parseContactsFilterParams.js';
import { sortFields } from '../db/Contacts.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { env } from '../utils/env.js';
const enableCloudinary = env("URL");


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
  let photo;
  if(req.file) {
      if(enableCloudinary === "true"){
          photo = await saveFileToCloudinary(req.file, "photos");
      }
      else{
          photo = await saveFileToUploadDir(req.file);
      }
  }

  const userId = req.user._id;
  const data = await contactServices.createContact(req.body, userId, photo);

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
let photo;
if(req.file) {
    if(enableCloudinary === "true") {
        photo = await saveFileToCloudinary(req.file, "photos");
    }
     else {
        photo = await saveFileToUploadDir(req.file);
     }
}

const updateData = {
    ...req.body,
    // photo: photo,
    ...(photo && {photo}),
}


  const contact = await contactServices.updateContact(id, req.body, userId, updateData);

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

