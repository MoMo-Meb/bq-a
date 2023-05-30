// Command constructor
const Command = function (command) {
    this.AbonnementId = command.AbonnementId;
    this.PayerId = command.PayerId;
    this.CurrentOffice = command.CurrentOffice;
    this.ServiceId = command.ServiceId;
    this.EmployeeId = command.EmployeeId;
    this.Etat = command.Etat;
    this.Date = command.Date;
    this.Time = command.Time;
    this.Notes = command.Notes;
};


// Export the User object when using require
module.exports = Command;