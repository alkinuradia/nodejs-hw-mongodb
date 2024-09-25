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
	const contacts = await ContactCollection.find(filter).skip(skip).limit(perPage).sort({ [sortBy]: sortOrder });
	const count = await ContactCollection.find(filter).countDocuments();

	const paginationData = calculatePaginationData({ count, perPage, page });

	return {
		page,
		perPage,
		contacts,
		totalItems: count,
		...paginationData,
	};
};
export const getContactById = async (id) => {
    const contacts = await  ContactCollection.findById(id);
    return contacts;
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
