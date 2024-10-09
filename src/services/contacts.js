import ContactCollection from "../db/Contacts.js";

import calculatePaginationData from '../utils/calculatePaginationData.js';
import { SORT_ORDER } from '../constants/index.js';

export const getAllContacts = async ({
        page = 1,
        perPage = 10,
        sortBy = 'name',
        sortOrder = SORT_ORDER[0],
        filter = {},
  }) => {
    const skip = (page - 1) * perPage;
    const data = await ContactCollection.find(filter).skip(skip).limit(perPage).sort({ [sortBy]: sortOrder });
    const count = await ContactCollection.find(filter).countDocuments();

    const paginationData = calculatePaginationData({ count, perPage, page });

    return {
      data,
      page,
      perPage,
      totalItems: count,
      ...paginationData,
    };
  };

export const getContactById = async (id, userId) => {
    return await ContactCollection.findOne({
      _id: id,
      userId,
    });
  };
export const createContact = async (payload, userId) => {
  return await ContactCollection.create({ ...payload, userId });
};

export const updateContact = async (id, payload, userId) => {
  return await ContactCollection.findOneAndUpdate(
    { _id: id, userId },
    payload,
    { new: true },

  );
};

export const deleteContact = async (id, userId) => {
  return await ContactCollection.findOneAndDelete({ _id: id, userId });
};

