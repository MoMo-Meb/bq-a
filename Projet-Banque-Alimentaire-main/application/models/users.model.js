// User constructor
const User = function (user) {
    this.FirstName = user.FirstName;
    this.LastName = user.LastName;
    this.Telephone = user.Telephone;
    this.Email = user.Email;
    this.Password = user.Password;
    this.AccountType = user.AccountType || 'ACCOUNTANT';
    this.LastAuthentication = user.LastAuthentication || new Date();
};

// Export the User object when using require
module.exports = User;