const Abonnement = function(user) {
    this.Adresse = user.Adresse;
    this.Telephone = user.Telephone;
    this.Email = user.Email;
    this.Location = user.Location;
    this.Etat = user.Etat || 'CompteVierge'; // Utilisation de la valeur par défaut "ValideParSecretaire" si aucune valeur n'est fournie
    this.FamilyMembers = user.FamilyMembers;
  };
  
  module.exports = Abonnement;