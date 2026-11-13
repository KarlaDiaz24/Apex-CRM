const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\d{10}$/;
const namePattern = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;
const businessTextPattern = /^[\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N} .,&'()/#:+-]*$/u;
const clientStatuses = new Set(['Nuevo', 'En Contacto', 'Cliente', 'Cerrado']);
const dealStages = new Set(['Prospecto', 'Propuesta', 'Negociación', 'Ganado', 'Perdido']);
const interactionTypes = new Set(['Llamada', 'Correo', 'Reunión', 'WhatsApp']);

const isText = (value, { min = 1, max, pattern }) => (
    typeof value === 'string' && value.trim().length >= min &&
    value.trim().length <= max && pattern.test(value.trim())
);

const isEmail = (value, max = 100) => (
    typeof value === 'string' && value.trim().length <= max && emailPattern.test(value.trim())
);

const isPhone = (value) => typeof value === 'string' && phonePattern.test(value);

const isPositiveId = (value) => Number.isInteger(Number(value)) && Number(value) > 0;

const isDate = (value, allowEmpty = false) => {
    if ((value === null || value === undefined || value === '') && allowEmpty) return true;
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?: \d{2}:\d{2}:\d{2})?$/.test(value)) return false;
    const datePart = value.slice(0, 10);
    const [year, month, day] = datePart.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return false;
    if (value.length > 10) {
        const [, hour, minute, second] = value.match(/ (\d{2}):(\d{2}):(\d{2})$/) || [];
        return Number(hour) < 24 && Number(minute) < 60 && Number(second) < 60;
    }
    return true;
};

const isAmount = (value, allowEmpty = false) => {
    if ((value === null || value === undefined || value === '') && allowEmpty) return true;
    if (typeof value === 'string' && !/^\d+(?:\.\d{1,2})?$/.test(value)) return false;
    const amount = Number(value);
    const cents = amount * 100;
    return Number.isFinite(amount) && amount >= 0 && amount <= 99999999.99 &&
        Math.abs(cents - Math.round(cents)) < 1e-8;
};

module.exports = {
    isText,
    isEmail,
    isPhone,
    isPositiveId,
    isDate,
    isAmount,
    namePattern,
    businessTextPattern,
    clientStatuses,
    dealStages,
    interactionTypes
};
