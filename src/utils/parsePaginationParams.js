const parseInteger  = (number, defaultValue) => {
    const isString = typeof number === 'string';
    if (!isString) return defaultValue;

    const parsedNumber  = parseInt(number);
    if (Number.isNaN(parsedNumber)) {
        return defaultValue;
    }
    return parsedNumber;
};

const parsePaginationParams = (query) => {
    const { page, perPage } = query;

    const parsedPage = parseInteger(page, 1);
    const parsedPerPage = parseInteger(perPage, 10);

    return {
      page: parsedPage,
      perPage: parsedPerPage,
    };
  };

export default parsePaginationParams;
