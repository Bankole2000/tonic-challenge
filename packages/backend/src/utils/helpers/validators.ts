const numOnlyRegex = /^[0-9]+$/i;
const validStringRegex = /([^\s])/;
const hexStringRegex = /^[a-f0-9]{24}$/i;

export const isValidDate = (datelike: string) => new Date(datelike) instanceof Date
    && !Number.isNaN(datelike)
    && typeof datelike !== 'boolean'
    && new Date(datelike).toString() !== 'Invalid Date';

export const isNumbersOnly = (numLike: string) => (numLike ? numOnlyRegex.test(numLike) : false);

export const isNotEmpty = (stringLike: string) => validStringRegex.test(stringLike);

export const isValidObjectId = (idLike: string) => hexStringRegex.test(idLike);
