let editedRowCount = 0;
const editButtons = document.querySelectorAll('.edit-button');
const saveButtons = document.querySelectorAll('.save-button');
const cancelButtons = document.querySelectorAll('.cancel-button');

for (let i = 0; i < editButtons.length; i++) {
    editButtons[i].style.display = 'inline-block';
    saveButtons[i].style.display = 'none';
    cancelButtons[i].style.display = 'none';
}

function resetButtons(trElement, isEdit) {
    const editButton = trElement.querySelector('.edit-button');
    const saveButton = trElement.querySelector('.save-button');
    const cancelButton = trElement.querySelector('.cancel-button');

    editButton.style.display = isEdit ? 'inline-block' : 'none';
    saveButton.style.display = isEdit ? 'none' : 'inline-block';
    cancelButton.style.display = isEdit ? 'none' : 'inline-block';
}

function createSelectElement(options, currentValue) {
    let select = '<select>';

    options.forEach(option => {
        select += `<option value="${option}"${option === currentValue ? ' selected' : ''}>${option}</option>`;
    });

    select += '</select>';
    return select;
}

async function saveTableRow(trElement) {
    const editableTds = trElement.querySelectorAll('.editable');
    let updateValues = {};
    let hasChanges = false;
    const personneId = trElement.querySelector('td:first-child').textContent.trim();

    for (let i = 0; i < editableTds.length; i++) {
        const editableTd = editableTds[i];
        const columnName = editableTd.getAttribute('data-column-name');
        let newValue;

        if (columnName === 'Sexe') {
            newValue = editableTd.querySelector('select').value;
        } else if (columnName === 'DateNaissance') {
            newValue = editableTd.querySelector('input[type="date"]').value;
        } else {
            newValue = editableTd.textContent.trim();
        }

        const originalValue = editableTd.dataset.originalValue;

        if (newValue !== originalValue) {
            hasChanges = true;
            updateValues[columnName] = newValue;
        }

        if (columnName === 'Sexe') {
            editableTd.innerHTML = newValue;
        } else if (columnName === 'DateNaissance') {
            editableTd.innerHTML = newValue;
        } else {
            editableTd.contentEditable = false;
        }

        editableTd.classList.remove('editing');
    }

    if (hasChanges) {
        try {
            const response = await fetch('/rapport/modifie_abonnement_personne', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    updateValues: updateValues,
                    queryCondition: { id: parseInt(personneId) },
                }),
            });

            const result = await response.json();
            if (response.status === 200) {
                if (result.message === 'Personne updated successfully') {
                    editedRowCount++;
                    resetButtons(trElement, true);
                    alert('Data updated successfully'); // Add this line to show an alert for successful updates
                } else {
                    alert('Error updating data: ' + result.message);
                    cancelTableRow(trElement); // Cancel and restore the row to its original state
                }
            } else {
                alert('Error updating data: server returned status ' + response.status);
                cancelTableRow(trElement); // Cancel and restore the row to its original state
            }
        } catch (error) {
            alert('Error updating data: ' + error);
            cancelTableRow(trElement);
        }
    } else {
        cancelTableRow(trElement);
    }
}

function editTableRow(trElement) {
    const editableTds = trElement.querySelectorAll('.editable');
    for (let i = 0; i < editableTds.length; i++) {
        const editableTd = editableTds[i];
        const columnName = editableTd.getAttribute('data-column-name');

        if (columnName === 'Sexe') {
            const sexeOptions = ['', 'Homme', 'Femme'];
            const currentValue = editableTd.textContent.trim();
            editableTd.dataset.originalValue = currentValue;
            editableTd.innerHTML = createSelectElement(sexeOptions, currentValue);
        } else if (columnName === 'DateNaissance') {
            const currentValue = editableTd.textContent.trim();
            editableTd.dataset.originalValue = currentValue;
            editableTd.innerHTML = `<input type="date" value="${currentValue}">`;
        } else {
            editableTd.contentEditable = true;
            editableTd.dataset.originalValue = editableTd.textContent.trim();
        }

        editableTd.classList.add('editing');
    }
    resetButtons(trElement, false);
}



function cancelTableRow(trElement) {
    const editableTds = trElement.querySelectorAll('.editable');
    for (let i = 0; i < editableTds.length; i++) {
        const editableTd = editableTds[i];
        editableTd.contentEditable = false;
        editableTd.classList.remove('editing');
        editableTd.textContent = editableTd.dataset.originalValue;
    }
    resetButtons(trElement, true);
}
