const db_utilities = require("./db_utilities.js")
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'zitoune0213';
const ALGORITHM = ['HS256'];

async function decodeToken(req) {
	let userId;
	if (req.headers.cookie) {
		const cookies = req.headers.cookie.split(';');
		for (let cookie of cookies) {
			cookie = cookie.trim();
			if (cookie.startsWith('token=')) {
				const token = cookie.substring('token='.length, cookie.length);
				try {
					const decodedToken = jwt.verify(token, SECRET_KEY, { algorithms: ALGORITHM });
					userId = decodedToken.user_id;
					break;
				} catch (err) {
					// Token is invalid or expired
					console.error('Error decoding token:', err.message);
					throw new Error('Invalid or expired token');
				}
			}
		}
	}
	if (userId) {
		const conditions = { Id: userId };
		const userExists = await db_utilities.checkExistFrom("users", conditions);
		if (userExists) {
			const result = await db_utilities.getDataFrom("users", conditions);
			return result[0];
		}
	}
	return null;
}

async function checkAccountType(accountTypes, req, res, next) {
	try {
		const user = await decodeToken(req);
		if (user && accountTypes.includes(user.AccountType)) {
			return next();
		}
	} catch (err) {
		// Token is invalid or expired
		console.error('Error decoding token:', err.message);
	}
	res.redirect("/login");
}

async function checkNotAuthenticated(req, res, next) {
	const user = await decodeToken(req);
	if (!user) {
		return next();
	}
	res.redirect("/profil");
}

module.exports = {
	checkNotAuthenticated,
	decodeToken,
	checkAuthenticated: (req, res, next) => checkAccountType(["ADMIN", "SECRETARY", "COMPTABLE"], req, res, next),
	checkAccountSecretaire: (req, res, next) => checkAccountType(["ADMIN", "SECRETARY"], req, res, next),
	checkAccountAdmin: (req, res, next) => checkAccountType(["ADMIN"], req, res, next),
	checkAccountComptable: (req, res, next) => checkAccountType(["ADMIN", "COMPTABLE"], req, res, next)
};