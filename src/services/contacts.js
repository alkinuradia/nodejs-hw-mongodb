import ContactCollection from "../db/Contacts.js";

export const getAllContacts = async () => {
    const contacts = await ContactCollection.find();
    return contacts;
};
export const getContactById = async (id) => {
    const contacts = await  ContactCollection.findById(id);
    return contacts;
};
export const createContact = payload => ContactCollection.create(payload);

export const updateContact = async(filter, data, options = {})=> {
    const rawResult = await ContactCollection.findOneAndUpdate(filter, data, {
        new: true,
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
