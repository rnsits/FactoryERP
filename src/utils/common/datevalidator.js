function validateDateFormat(date) {
    // Regex to validate date in format YYYY-MM-DD
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    // return regex.test(date);
    return regex.test(date) && !isNaN(new Date(date).getTime());
}


module.exports = { validateDateFormat };
