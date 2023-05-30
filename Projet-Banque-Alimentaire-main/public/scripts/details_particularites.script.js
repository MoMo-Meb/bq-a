const dataContainer = document.getElementById('data-container');
const abonnements = JSON.parse(dataContainer.getAttribute('data-abonnements'));
const personnes = JSON.parse(dataContainer.getAttribute('data-personnes'));
const commandes = JSON.parse(dataContainer.getAttribute('data-commandes'));
let searchedParticularities = [];


function createAnchor(content, link) {
    return `<a href="${link}">${content}</a>`;
}


function clearSearch() {
    document.getElementById('searchValue').value = '';
}

function clearAll() {
    const listContainer = document.getElementById("particularities-list");
    listContainer.innerHTML = ""; // Clear the inner HTML of the container
    searchedParticularities = []; // Reset the list of particularities used for filtering

    clearStart();
    clearEnd();
    clearSearch();
    displayAbonnements(abonnements);
}


function displayAbonnements(filteredAbonnements) {
    const filteredAbonnementIds = filteredAbonnements.map(abonnement => abonnement.Id);

    for (let i = 0; i < abonnements.length; i++) {
        const currentAbonnement = abonnements[i];
        const row = document.getElementById(`abonnement-${currentAbonnement.Id}`);

        if (row) {
            if (filteredAbonnementIds.includes(currentAbonnement.Id)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    }
}

function clearStart() {
    document.getElementById('startDate').value = '';
}
function showEndDate(){
    
    document.getElementById('endDateContainer').style.display = document.getElementById('startDate').value ==''?'none':'block';
}
function showDateFilters(){
    const commandeEtat = document.getElementById('commande').value;
    const conteneur_date = document.getElementById('date-filter-container');
    conteneur_date.style.display = commandeEtat == ""?'none':'block';
}
function clearEnd() {
    document.getElementById('endDate').value = '';
}
function filterParticularity() {
    const emailValue = document.getElementById('emailsearchValue').value.trim().toLowerCase();
    const searchValue = document.getElementById('searchValue').value.trim().toLowerCase();
    const normalizedSearchValue = searchValue.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const commandeEtat = document.getElementById('commande').value;
    const startDateInput = document.getElementById('startDate').value;
    const endDateInput = document.getElementById('endDate').value;
    let particularities = normalizedSearchValue.includes(',') ? normalizedSearchValue.split(',') : [normalizedSearchValue];

    particularities.forEach(particularity => {
        particularity = particularity.trim().toLowerCase();
        if (particularity !== "" && !searchedParticularities.includes(particularity)) {
            searchedParticularities.push(particularity);
        }
    });

    clearSearch();

    const filteredAbonnements = abonnements.filter(abonnement => {
        const familyMembers = abonnement.FamilyMembers.split(',').map(memberId => parseInt(memberId.trim()));
        commandeMatching = commandes;
        filterCommande = commandeEtat != "";
        filterDate = startDateInput && filterCommande ? true : false;
        if (filterCommande && commandeEtat != "Aucune") {
            // Get the values of the start date, start time, end date, and end time input elements

            commandeMatching = commandes.filter(commande => {
                if (commande.AbonnementId != abonnement.Id) {
                    return false;
                } else if (commandeEtat.includes(commande.Etat)) {
                    return true;
                } else {
                    return false;
                }
            });


        }
        if (filterDate) {
            commandeMatching = commandes.filter(commande => {
                // Create the start date and time objects
                const startDate = new Date(startDateInput);
                startDate.setUTCHours(0, 0, 0, 0);

                // Create the end date and time objects
                let endDate = endDateInput ? new Date(endDateInput) : null;

                if (!endDate) {
                    endDate = new Date(startDate);
                }
                endDate.setUTCHours(0, 0, 0, 0);

                console.log("Set time");
                const commandeDate = new Date(commande.Date);
                commandeDate.setUTCHours(0, 0, 0, 0);
                if (commandeDate >= startDate && commandeDate <= endDate) {

                    return true;

                }
                return false;
            });
        }

        const abonnementIds = commandeMatching.map((command) => command.AbonnementId);
        
        console.log(abonnementIds);
        if (filterCommande) {
            console.log("FILTER");
            if(abonnementIds.includes(abonnement.Id) && commandeEtat == "Aucune"){
                console.log(abonnementIds);
                return false;
            }else if(!abonnementIds.includes(abonnement.Id) && commandeEtat != "Aucune"){
                return false;
            }
        }
        if(emailValue != ""){
            if(!abonnement.Email.toLowerCase().includes(emailValue)){
                return false;
            }
        }
        return searchedParticularities.every(searchedParticularity => {
            return familyMembers.some(memberId => {

                const currentMember = personnes.find(personne => personne.Id === memberId);
                if (currentMember) {
                    let currentPart = currentMember.Particularities;
                    if (currentPart) {
                        let normalizedCurrentPart = currentPart.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                        let allParticularities = normalizedCurrentPart.includes(',') ? normalizedCurrentPart.split(',') : [normalizedCurrentPart];
                        return allParticularities.some(part => part.trim().toLowerCase().includes(searchedParticularity.trim().toLowerCase()));

                    }
                }
                return false;
            });
        });
    });
    console.log(filteredAbonnements);
    displayAbonnements(filteredAbonnements);
    displayParticularitiesFilter(searchedParticularities); // Call displayParticularitiesFilter with the updated list
}



function displayParticularitiesFilter(searchedParticularities) {
    const listContainer = document.getElementById("particularities-list");
    let html = "";

    searchedParticularities.forEach((particularity, index) => {
        if (index % 6 === 0) {
            html += "<div class='particularities-row'>";
        }
        html += `<div class='particularity'>${particularity}<button class="remove-btn" onclick="removeParticularity('${particularity}')">x</button></div>`;
        if ((index + 1) % 6 === 0 || index === searchedParticularities.length - 1) {
            html += "</div>";
        }
    });

    listContainer.innerHTML = html;
}


function removeParticularity(particularity) {
    searchedParticularities = searchedParticularities.filter(p => p !== particularity);
    filterParticularity();
}


function clearAllParticularities() {
    const listContainer = document.getElementById("particularities-list");
    listContainer.innerHTML = ""; // Clear the inner HTML of the container
    searchedParticularities = []; // Reset the list of particularities used for filtering
    clearAll();
}