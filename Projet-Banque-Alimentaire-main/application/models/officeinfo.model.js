// OfficeInfo constructor
const OfficeInfo = function (officeInfo) {
    this.Name = officeInfo.Name;
    this.Location = officeInfo.Location;
};

// Export the OfficeInfo object when using require
module.exports = OfficeInfo;
