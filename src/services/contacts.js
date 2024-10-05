import ContactCollection from "../db/Contacts.js";

import calculatePaginationData from '../utils/calculatePaginationData.js';
import { SORT_ORDER } from '../constants/index.js';

export const getAllContacts = async ({
    page = 1,
    perPage = 10,
    sortBy = 'name',
    sortOrder = SORT_ORDER[0],
    filter = {},
    userId,
  }) => {
	const skip = (page - 1) * perPage;
    const limit = perPage;
    const contactsFilter = ContactCollection.find();

	if (filter.type) {
        contactsFilter.where('contactType').equals(filter.type);
      }

      if (filter.isFavourite !== null) {
        contactsFilter.where('isFavourite').equals(filter.isFavourite);
      }

      contactsFilter.where('userId').equals(userId);

      const [count, data] = await Promise.all([
        ContactCollection.find().merge(contactsFilter).countDocuments(),
        ContactCollection.find()
        // .merge(contactsFilter)
          // .skip(skip)
          // .limit(limit)
          // .sort({
          //   [sortBy]: sortOrder,
          // })
          .exec(),
      ]);

      const paginationInformation = calculatePaginationData(page, perPage, count);

      return { data, ...paginationInformation };
    };

export const getContactById = async (id, userId) => {
    return await ContactCollection.findOne({
      _id: id,
      userId,
    });
  };
export const createContact = payload => ContactCollection.create(payload);

export const updateContact = async(filter, data, options = {})=> {
    const rawResult = await ContactCollection.findOneAndUpdate(filter, data, {
        new: true,
        runValidators: true,
        includeResultMetadata: true,
        ...options,
    });

    if(!rawResult || !rawResult.value) return null;

    return {
        data: rawResult.value,
        isNew: Boolean(rawResult?.lastErrorObject?.upserted),
    };
};

export const deleteContact = filter => ContactCollection.findOneAndDelete(filter);
