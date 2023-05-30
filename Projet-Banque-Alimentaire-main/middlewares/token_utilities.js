const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const token_minutes = 30;
const SECRET_KEY = 'zitoune0213';
const ALGORITHM = 'HS256';


function generateRandomString(length) {
    const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const buffer = crypto.randomBytes(length);
    const result = [];

    for (let i = 0; i < length; i++) {
        const index = buffer[i] % char.length;
        result.push(char[index]);
    }

    return result.join('');
}

async function asignTokenToUser(Id) {
    const user_id = Id;
    //const last_api_request = ''

    // on va creer le payload qui sera le token avant detre encoder avec la key
    const payload = {
        user_id: user_id,
        expiration: Math.floor(Date.now() / 1000) + (60 * token_minutes),
    };

    // ici on va encoder la clee et le payload qui nous donera notre token
    const encodedToken = jwt.sign(payload, SECRET_KEY, { algorithm: ALGORITHM });

    try {
        const decodedToken = jwt.verify(encodedToken, SECRET_KEY, { algorithms: [ALGORITHM] });
    } catch (err) {
        console.error(`Error decoding token: ${err.message}`);
    }
    return encodedToken;
}

function verifyToken(req, res, next) {
    // Récupérer le token depuis le header Authorization de la requête
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    // Vérifier si le token est présent
    if (!token) {
        return res.status(401).send({ message: 'Token manquant' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY, { algorithm: ALGORITHM });
        req.user = decoded;
        next();
    } catch (error) {
        // Si le token est invalide ou expiré, renvoyer une réponse d'erreur
        return res.status(401).send({ message: 'Token invalide ou expiré' });
    }
}

module.exports = {
    token_minutes,
    generateRandomString,
    asignTokenToUser,
    verifyToken
}