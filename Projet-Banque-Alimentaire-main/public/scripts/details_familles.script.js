let editedRowCount = 0;
const editButtons = document.querySelectorAll('.edit-button');
const saveButtons = document.querySelectorAll('.save-button');
const cancelButtons = document.querySelectorAll('.cancel-button');

for (let i = 0; i < editButtons.length; i++) {
    editButtons[i].style.display = 'inline-block';
    saveButtons[i].style.display = 'none';
    cancelButtons[i].style.display = 'none';
}

function createAnchor(content, link) {
    return `<a href="${link}">${content}</a>`;
}

function createSelectElement(options, currentValue) {
    let select = '<select>';

    options.forEach(option => {
        select += `<option value="${option}"${option === currentValue ? ' selected' : ''}>${option}</option>`;
    });

    select += '</select>';
    return select;
}

function resetButtons(trElement, isEdit) {
    const editButton = trElement.querySelector('.edit-button');
    const saveButton = trElement.querySelector('.save-button');
    const cancelButton = trElement.querySelector('.cancel-button');
    const removeButton = trElement.querySelector('.remove-button');

    if (isEdit) {
        editButton.style.display = 'inline-block';
        saveButton.style.display = 'none';
        cancelButton.style.display = 'none';
    } else {
        editButton.style.display = 'none';
        saveButton.style.display = 'inline-block';
        cancelButton.style.display = 'inline-block';
    }
    removeButton.style.display = 'inline-block';
}


function editTableRow(trElement) {

    // Make all editable cells of the row editable
    const editableTds = trElement.querySelectorAll('.editable');
    for (let i = 0; i < editableTds.length; i++) {
        const editableTd = editableTds[i];
        editableTd.style.outline = "1px solid #ffbf00";
        editableTd.style.borderRadius = "5px";

        const columnName = editableTd.getAttribute('data-column-name');
        if (columnName === 'Etat') {
            const etatOptions = ['', 'CompteVierge', 'ConfirmeParEmail', 'ValideParSecretaire', 'Inactif'];
            const currentValue = editableTd.textContent.trim();
            editableTd.dataset.href = editableTd.querySelector('a').getAttribute('href');
            editableTd.dataset.originalValue = currentValue; // Store the original value for the "Etat" field
            editableTd.innerHTML = createSelectElement(etatOptions, currentValue);
        } else {
            editableTd.contentEditable = true;
            editableTd.dataset.originalValue = editableTd.textContent;
        }
    }
    resetButtons(trElement, false);
}


async function saveTableRow(trElement) {
    const editableTds = trElement.querySelectorAll('.editable');
    let updateValues = {};
    let hasChanges = false;
    const firstMemberId = trElement.querySelector('td:first-child a').textContent.trim();

    const confirmSave = confirm('Êtes-vous certain de vouloir sauvegarder les modifications?');
    if (!confirmSave) {
        cancelEditTableRow(trElement);
        return;
    }

    for (let i = 0; i < editableTds.length; i++) {
        const editableTd = editableTds[i];
        editableTd.style.outline = "";
        editableTd.style.borderRadius = "";
        const columnName = editableTd.getAttribute('data-column-name');
        const newValue = columnName === 'Etat' ? editableTd.querySelector('select').value : editableTd.textContent.trim();
        const originalValue = editableTd.dataset.originalValue;

        if (newValue !== originalValue) {
            hasChanges = true;
            updateValues[columnName] = newValue;
        }

        const anchorElement = editableTd.querySelector('a');
        if (anchorElement) {
            const href = anchorElement.getAttribute('href');
            const updatedHref = href.replace(encodeURIComponent(anchorElement.textContent.trim()), encodeURIComponent(newValue));
            editableTd.innerHTML = createAnchor(newValue, updatedHref);
        } else if (columnName === 'Etat') {
            editableTd.innerHTML = createAnchor(newValue, editableTd.dataset.href);
        }

        editableTd.contentEditable = false;
    }

    if (hasChanges) {
        try {
            const response = await fetch('/rapport/modifie_abonnement', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    updateValues: updateValues,
                    queryCondition: { id: parseInt(firstMemberId) },
                }),
            });

            const result = await response.json();
            if (response.status === 200) {
                if (result.message === 'Abonnement updated successfully') {
                    editedRowCount++;
                    resetButtons(trElement, true);
                    alert('Data updated successfully'); // Add this line to show an alert for successful updates
                } else {
                    alert('Error updating data: ' + result.message);
                    cancelEditTableRow(trElement); // Cancel and restore the row to its original state
                }
            } else {
                alert('Error updating data: server returned status ' + response.status);
                cancelEditTableRow(trElement); // Cancel and restore the row to its original state
            }
        } catch (error) {
            alert('Error updating data: ' + error);
            cancelEditTableRow(trElement);
        }
    } else {
        cancelEditTableRow(trElement);
    }
}

function cancelEditTableRow(trElement) {
    const editableTds = trElement.querySelectorAll('.editable');
    for (let i = 0; i < editableTds.length; i++) {
        const editableTd = editableTds[i];
        editableTd.style.outline = "";
        editableTd.style.borderRadius = "";
        const columnName = editableTd.getAttribute('data-column-name');
        const originalValue = editableTd.dataset.originalValue;

        if (columnName === 'Etat') {
            editableTd.innerHTML = createAnchor(originalValue, editableTd.dataset.href);
        } else {
            const anchorElement = editableTd.querySelector('a');
            if (anchorElement) {
                const href = anchorElement.getAttribute('href');
                editableTd.innerHTML = createAnchor(originalValue, href);
            } else {
                editableTd.innerHTML = originalValue;
            }
        }

        editableTd.contentEditable = false;
    }

    resetButtons(trElement, true);
}

async function removeTableRow(trElement) {
    const abonnementId = trElement.querySelector('td:first-child').textContent.trim();

    const confirmDelete = confirm('Êtes-vous sûr de vouloir supprimer ces données?');
    if (!confirmDelete) {
        cancelEditTableRow(trElement);
        return;
    }

    try {
        const response = await fetch('/rapport/delete_abonnement', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ abonnementId: parseInt(abonnementId) }),
        });

        const result = await response.json();
        if (response.status === 200) {
            if (result.message === 'Abonnement deleted successfully') {
                trElement.remove();
                alert('Abonnement removed successfully');
            } else {
                alert('Error deleting abonnement: ' + result.message);
            }
        } else {
            alert('Error deleting abonnement: server returned status ' + response.status);
        }
    } catch (error) {
        alert('Error deleting abonnement: ' + error);
    }
}

async function completeTableRow(trElement) {
    const columns = trElement.querySelectorAll('.editable');
    const rowData = {};
    let hasRequiredFields = true;

    for (let i = 0; i < columns.length; i++) {
        const column = columns[i];
        const columnName = column.dataset.columnName;
        let columnValue;

        if (columnName === 'Etat') {
            columnValue = column.querySelector('select').value;
        } else {
            columnValue = column.textContent.trim();
        }

        rowData[columnName] = columnValue;

        if (columnValue === '') {
            column.style.outline = "1px solid red";
            column.style.borderRadius = "5px";
            hasRequiredFields = false;
        } else {
            column.style.outline = "";
            column.style.borderRadius = "";
        }
    }


    if (!hasRequiredFields) {
        alert('Veuillez remplir tous les champs requis');
        return;
    } else {
        const confirmAdd = confirm('Êtes-vous sûr de vouloir ajouter ces données?');
        if (!confirmAdd) {
            cancelAddTableRow(trElement);
            return;
        }
    }

    try {
        const response = await fetch('/rapport/ajout_abonnement', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(rowData),
        });

        const result = await response.json();
        if (response.status === 200) {
            alert('Abonnement added successfully');
            window.location.reload(); // Reload the page to display the new row
        } else {
            alert('Error adding abonnement: ' + result.message);
        }
    } catch (error) {
        alert('Error adding abonnement: ' + error);
    }
}



function saveHTMLAsPDF() {
    // Get the original table
    const originalTable = document.querySelector(".professional-style");
    // Clone the original table
    const pdfTable = originalTable.cloneNode(true);

    // Remove the "Modifier" column from the PDF table
    const headerCell = pdfTable.querySelector("thead th:last-child");
    const firstHeaderCell = pdfTable.querySelector("thead th:first-child");
    const bodyCells = pdfTable.querySelectorAll("tbody td:last-child");
    const firstColumnCells = pdfTable.querySelectorAll("tbody td:first-child");

    if (headerCell) {
        headerCell.remove();
    }

    if (firstHeaderCell) {
        firstHeaderCell.remove();
    }

    bodyCells.forEach(cell => cell.remove());
    firstColumnCells.forEach(cell => cell.remove());

    pdfTable.classList.add("professional-style");

    // Temporarily create a wrapper element for the PDF table
    const wrapper = document.createElement("div");
    wrapper.appendChild(pdfTable);

    // Get the HTML content of the wrapper element
    const wrapperHTML = wrapper.innerHTML;

    const cssStyles = `
        @page {
        size: A4;
        margin: 0;
        }

        body {
        margin: 0;
        padding: 20px;
        }

        .pdf-table-container {
        overflow-x: auto;
        max-width: 800px;
        margin: 0 85px;
        }
        table {
        display: table;
        width: 70%;
        margin: 0 auto;
        border-collapse: collapse;
        white-space: nowrap;
        }

        tr {
        display: table-row;
        }

        td {
        display: table-cell;
        vertical-align: middle;
        }

        table th,
        table td {
        border: 1px solid #ddd;
        text-align: center;
        min-width: 70px;
        justify-content: center;
        align-items: center;
        }

        table th {
        background-color: #ffbf00;
        }
    `;

    fetch('/generate-pdf', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tableHTML: wrapperHTML, cssStyles })
    })
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `RapportFamille${formatCurrentDate()}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => console.error('Error:', error));
}

async function saveTableAsExcel(tableId, ignoredHeaderIndexes = []) {
    await loadScript('https://unpkg.com/xlsx/dist/xlsx.full.min.js');

    const tableElement = document.getElementById(tableId);
    const table = tableElement.cloneNode(true);
    const headerCells = table.querySelectorAll('thead th');
    const bodyRows = table.querySelectorAll('tbody tr');
    const anchorTags = table.querySelectorAll('a');

    // Remove anchor tags to prevent clickable cells in the Excel file
    anchorTags.forEach(anchor => {
        const parent = anchor.parentNode;
        while (anchor.firstChild) {
            parent.insertBefore(anchor.firstChild, anchor);
        }
        anchor.remove();
    });

    ignoredHeaderIndexes.forEach(index => {
        if (headerCells[index]) {
            headerCells[index].remove();
        }
    });

    bodyRows.forEach(row => {
        if (row.id === "adding_row") {
            row.remove();
        } else {
            ignoredHeaderIndexes.forEach(index => {
                const bodyCell = row.querySelector(`td:nth-child(${index + 1})`);
                if (bodyCell) {
                    bodyCell.remove();
                }
            });
        }
    });
    

    const workBook = XLSX.utils.book_new();
    const workSheet = XLSX.utils.table_to_sheet(table);
    XLSX.utils.book_append_sheet(workBook, workSheet, 'Sheet1');
    const excelData = XLSX.write(workBook, { type: 'array', bookType: 'xlsx' });

    const a = document.createElement('a');
    const file = new Blob([excelData], { type: 'application/octet-stream' });
    a.href = URL.createObjectURL(file);
    a.download = `ExcelFamilyTable${formatCurrentDate()}.xlsx`;
    a.click();
}

function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${url}`));
        document.head.appendChild(script);
    });
}

function formatCurrentDate() {
    const currentDate = new Date();
    return [
        currentDate.getFullYear(),
        String(currentDate.getMonth() + 1).padStart(2, '0'),
        String(currentDate.getDate()).padStart(2, '0'),
        String(currentDate.getHours()).padStart(2, '0'),
        String(currentDate.getMinutes()).padStart(2, '0'),
        String(currentDate.getSeconds()).padStart(2, '0'),
    ].join('');
}

function exportTableToExcel() {
    const tableId = "originalTable";
    const tableElement = document.getElementById(tableId);
    const headerCells = tableElement.querySelectorAll('thead th');
    const totalColumns = headerCells.length;

    const ignoredHeaderIndexes = [totalColumns - 1];
    saveTableAsExcel(tableId, ignoredHeaderIndexes);
}