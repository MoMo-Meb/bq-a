function saveHTMLAsPDF() {
    // Get the original table
    const originalTable = document.getElementById("tableRevenuAnnuels");

    // Clone the original table
    const pdfTable = originalTable.cloneNode(true);

    // Remove the "Modifier" column from the PDF table
    /* const headerCell = pdfTable.querySelector("thead th:last-child");
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
    firstColumnCells.forEach(cell => cell.remove()); */

    pdfTable.classList.add("tableRevenuAnnuels");

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
    // Load the SheetJS library dynamically
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
        ignoredHeaderIndexes.forEach(index => {
            const bodyCell = row.querySelector(`td:nth-child(${index + 1})`);
            if (bodyCell) {
                bodyCell.remove();
            }
        });
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
function formatCurrentDate(){
    // Get the current date
    const now = new Date();

    // Format the date as a string in the correct format for the input
    const dateString = now.getFullYear().toString() + "-" +
        (now.getMonth() + 1).toString().padStart(2, "0") + "-" +
        now.getDate().toString().padStart(2, "0");
        return dateString;

}
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.append(script);
    });
}
function exportPDF() {
    saveHTMLAsPDF();
}

function exportExcel() {
    console.log("Exporting");
    saveTableAsExcel('tableRevenuAnnuels');
}