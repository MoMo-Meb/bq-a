// Particularity constructor
const Particularity = function (particularity) {
    this.Name = particularity.Name;
    this.Description = particularity.Description;
};

// Export the Particularity object when using require
module.exports = Particularity;