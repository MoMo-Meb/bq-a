// User constructor
const Personnes = function (user) {
    this.FirstName = user.FirstName;
    this.LastName = user.LastName;
    this.Sexe = user.Sexe;
    this.DateNaissance = user.DateNaissance;
    this.Particularities = user.Particularities;

};

// Export the User object when using require
module.exports = Personnes;