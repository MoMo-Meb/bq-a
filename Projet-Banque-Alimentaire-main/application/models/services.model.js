// Service constructor
const Service = function (service) {
    this.Name = service.Name;
    this.Description = service.Description;
    this.NumberOfPersons = service.NumberOfPersons;
    this.Price = service.Price;
};

// Export the Service object when using require
module.exports = Service;