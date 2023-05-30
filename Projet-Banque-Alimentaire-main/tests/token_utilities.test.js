const token_utilities = require("../middlewares/token_utilities");
const jwt = require("jsonwebtoken");
const taille = 10;


describe("token_utilities tests", () => {
    
    describe('generation du string du token', () => {
        test('Vérifie que la fonction génère une chaîne aléatoire de longueur spécifiée', () => {
            const result = token_utilities.generateRandomString(taille);
            expect(result.length).toBe(taille); // La longueur de la chaîne retournée doit être égale à la longueur spécifiée
        });

        test('Vérifie que la fonction génère une chaîne unique à chaque appel', () => {
            const result1 = token_utilities.generateRandomString(taille);
            const result2 = token_utilities.generateRandomString(taille);
            expect(result1).not.toBe(result2); // Les deux chaînes générées doivent être différentes l'une de l'autre
        });

        test('Vérifie que la fonction génère une chaîne composée uniquement de caractères alphanumériques', () => {
            const result = token_utilities.generateRandomString(taille);
            const regex = /^[a-zA-Z0-9]+$/;
            expect(regex.test(result)).toBe(true); // La chaîne générée ne doit contenir que des caractères alphanumériques
        });
    });

    describe("asigner un token au user", () => {
        test("should return a valid token", async () => {
            const id = 123;
            const token = await token_utilities.asignTokenToUser(id);
            expect(token).toBeTruthy();
        });
    });
    
    describe("verifier le token", () => {
        test("devrait appeler next si le token est valide", () => {
            const req = {
                headers: {
                    authorization: "Bearer valid_token",
                },
            };
            const res = {};
            const next = jest.fn();

            // Simulant la méthode jwt.verify pour renvoyer un jeton décodé valide.
            jest.spyOn(jwt, "verify").mockReturnValueOnce({ user_id: 123 });

            token_utilities.verifyToken(req, res, next);

            expect(req.user).toEqual({ user_id: 123 });
            expect(next).toHaveBeenCalledTimes(1);
        });

        test("devrait retourner un code d'état 401 si le token est manquant", () => {
            const req = {
                headers: {},
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            };
            const next = jest.fn();

            token_utilities.verifyToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.send).toHaveBeenCalledWith({ message: "Token manquant" });
            expect(next).not.toHaveBeenCalled();
        });

        test("devrait retourner un code d'état 401 si le token est invalide", () => {
            const req = {
                headers: {
                    authorization: "Bearer invalid_token",
                },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            };
            const next = jest.fn();

            // Simulant l'erreur de la méthode jwt.verify
            jest.spyOn(jwt, "verify").mockImplementationOnce(() => {
                throw new Error();
            });

            token_utilities.verifyToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.send).toHaveBeenCalledWith({ message: "Token invalide ou expiré" });
            expect(next).not.toHaveBeenCalled();
        });

        test("devrait retourner un code d'état 401 si le token est expiré", () => {
            const req = {
                headers: {
                    authorization: "Bearer expired_token",
                },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            };
            const next = jest.fn();

            // Simulant l'erreur de la méthode jwt.verify avec le nom "TokenExpiredError"
            jest.spyOn(jwt, "verify").mockImplementationOnce(() => {
                const error = new Error();
                error.name = "TokenExpiredError";
                throw error;
            });

            token_utilities.verifyToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.send).toHaveBeenCalledWith({ message: "Token invalide ou expiré" });
            expect(next).not.toHaveBeenCalled();
        });
    });
});