import ContactCollection from "../db/Contacts.js";

import calculatePaginationData from '../utils/calculatePaginationData.js';
import { SORT_ORDER } from '../constants/index.js';

export const getAllContacts = async ({
    page,
    perPage,
    sortBy = '_id',
    sortOrder = SORT_ORDER[0],
    filter = {},
    userId,
  }) => {
	const skip = (page - 1) * perPage;
    // const limit = perPage;
    const contactsFilter = ContactCollection.find();
    console.log(filter)
	    if (filter.type) {
        contactsFilter.where('contactType').equals(filter.type);
      }

      if (filter.isFavourite) {
        contactsFilter.where('isFavourite').equals(filter.isFavourite);
      }

      contactsFilter.where('userId').equals(userId);

      // const [count, data] = await Promise.all([
      //   ContactCollection.find().merge(contactsFilter).countDocuments(),

      //   ContactCollection.find()
      //   .merge(contactsFilter)
      //     .skip(skip)
      //     .limit(limit)
      //     .sort({
      //       [sortBy]: sortOrder,
      //     })
      //     .exec(),
      // ]);

      const count = await ContactCollection.find().merge(contactsFilter).countDocuments();
      const data = await contactsFilter.skip(skip).limit(perPage).sort({[sortBy]: sortOrder}).exec();

      const paginationInformation = calculatePaginationData(page, perPage, count);

      return { data, ...paginationInformation };
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

export const deleteContactById = async (id, userId) => {
  return await ContactCollection.findOneAndDelete({ _id: id, userId });
};
