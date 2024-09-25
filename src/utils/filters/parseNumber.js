import { contactList } from "../../constants/contacts.js";

export const parseContactType = type => {
	const isString = typeof type === 'string';
	if (!isString) return;
	const isType = (type) => contactList.includes(type);
	if (isType(type)) return type;
};

export const parseIsFavourite = value => {
	if (typeof value === 'boolean') {
		return value;
	}

	if (value === 'true') return true;
	if (value === 'false') return false;

	return undefined;
};
