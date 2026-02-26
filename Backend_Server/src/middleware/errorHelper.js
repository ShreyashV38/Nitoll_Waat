/**
 * Sends a standardised error response.
 *  - In development  → includes the real error message for easy debugging.
 *  - In production   → sends a generic "Server Error" to avoid leaking internals.
 *
 * Usage:  const { sendError } = require('../middleware/errorHelper');
 *         catch (err) { sendError(res, err, 'Create Bin'); }
 */
const sendError = (res, err, context = '') => {
    if (context) console.error(`${context} Error:`, err);
    else console.error(err);

    const isDev = process.env.NODE_ENV !== 'production';

    res.status(500).json({
        error: isDev ? err.message : 'Server Error',
        ...(isDev && { stack: err.stack })
    });
};

module.exports = { sendError };
