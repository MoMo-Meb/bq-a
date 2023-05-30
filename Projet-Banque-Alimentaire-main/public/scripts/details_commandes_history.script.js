const dataContainer = document.getElementById('data-container');
const commandes = JSON.parse(dataContainer.getAttribute('data-commandes'));
const services = JSON.parse(dataContainer.getAttribute('data-services'));
const abonnements = JSON.parse(dataContainer.getAttribute('data-abonnements'));
const offices = JSON.parse(dataContainer.getAttribute('data-offices'));
const users = JSON.parse(dataContainer.getAttribute('data-users'));
const personnes = JSON.parse(dataContainer.getAttribute('data-personnes'));

const table = document.querySelector('table');
const tbody = table.querySelector('tbody');

const sortRows = document.querySelectorAll('.sort-row');
const headers = document.querySelectorAll('.head-filter');
console.log(sortRows);
console.log(headers);
sortRows.forEach((row) => {
    headers.forEach((header, index) => {
        header.addEventListener('click', () => {
            sortTable(index, row);
        });
    });
});

function clearStart() {
    document.getElementById('startDate').value = '';
    document.getElementById('startTime').value = '';
}
function showEndDate(){
    
    document.getElementById('endDateContainer').style.display = document.getElementById('startDate').value ==''?'none':'block';
}

function clearEnd() {
    document.getElementById('endDate').value = '';
    document.getElementById('endTime').value = '';
}

function clearAll() {
    clearStart();
    clearEnd();
}

function clearSearch() {
    displayCommandes(commandes);
}


function displayCommandes(filteredCommandes) {
    const filteredCommandeIds = filteredCommandes.map(commande => commande.Id);

    for (let i = 0; i < commandes.length; i++) {
        const currentCommande = commandes[i];
        const row = document.getElementById(`commande-${currentCommande.Id}`);

        if (row){
            if (filteredCommandeIds.includes(currentCommande.Id)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    }
}

function timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

function filterCommandes() {
    // Get the values of the start date, start time, end date, and end time input elements
    const startDateInput = document.getElementById('startDate').value;
    const startTimeInput = document.getElementById('startTime').value;
    const endDateInput = document.getElementById('endDate').value;
    const endTimeInput = document.getElementById('endTime').value;
    const sortRows = document.querySelectorAll('.sort-row');
    const tableHeaders = commandesTable.getElementsByTagName("th");
    // Validate that start date is provided
    if (!startDateInput) {
        alert('Start date is required');
        return;
    }

    // Alert if there is an end time without an end date
    if (endTimeInput && !endDateInput) {
        alert('End date is required when providing an end time');
        return;
    }

    // Create the start date and time objects
    const startDate = new Date(startDateInput);
    startDate.setUTCHours(0, 0, 0, 0);
    const startTimeInMinutes = startTimeInput ? timeToMinutes(startTimeInput) : null;

    // Create the end date and time objects
    let endDate = endDateInput ? new Date(endDateInput) : null;
    const endTimeInMinutes = endTimeInput ? timeToMinutes(endTimeInput) : null;

    if (!endDate) {
        endDate = new Date(startDate);
    }
    endDate.setUTCHours(0, 0, 0, 0);

    // Filter the commandes array based on the start and end date/time
    const filteredCommandes = commandes.filter(commande => {
        const commandeDate = new Date(commande.Date);
        commandeDate.setUTCHours(0, 0, 0, 0);
        const commandeTimeInMinutes = timeToMinutes(commande.Time);

        if (commandeDate >= startDate && commandeDate <= endDate) {
            if (startTimeInMinutes !== null && endTimeInMinutes !== null) {
                if (commandeDate > startDate && commandeDate < endDate) {
                    return true;
                } else if (commandeDate.getTime() === startDate.getTime() && commandeDate.getTime() === endDate.getTime()) {
                    return commandeTimeInMinutes >= startTimeInMinutes && commandeTimeInMinutes <= endTimeInMinutes;
                } else if (commandeDate.getTime() === startDate.getTime()) {
                    return commandeTimeInMinutes >= startTimeInMinutes;
                } else if (commandeDate.getTime() === endDate.getTime()) {
                    return commandeTimeInMinutes <= endTimeInMinutes;
                }
            } else if (startTimeInMinutes !== null) {
                return commandeDate > startDate || (commandeDate.getTime() === startDate.getTime() && commandeTimeInMinutes >= startTimeInMinutes);
            } else {
                return true;
            }
        }
        return false;
    });

    // Display the filtered commandes
    displayCommandes(filteredCommandes);
}