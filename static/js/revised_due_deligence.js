
// let savedOptions = []; 
// Array to hold selected options

function populateSubCategory() {
    const category = document.getElementById("category").value;
    const subcategorySelect = document.getElementById("subcategory");
    const customSubcategoryInput = document.getElementById("customSubcategory");
    const saveCustomSubcategoryButton = document.getElementById(
        "saveCustomSubcategory"
    );

    // Reset and clear the subcategory dropdown
    subcategorySelect.innerHTML = '<option value="">Select Sub Category</option>';

    // If "Other" is selected in the category dropdown
    if (category === "Other") {
        // Add "Other" option in the subcategory dropdown
        const optionOther = document.createElement("option");
        optionOther.value = "Other";
        optionOther.textContent = "Other";
        subcategorySelect.appendChild(optionOther);

        // Show the subcategory dropdown so the user can select "Other"
        subcategorySelect.style.display = "block"; // Show dropdown
        customSubcategoryInput.style.display = "none"; // Hide input
        saveCustomSubcategoryButton.style.display = "none"; // Hide Save button
    } else {
        // If a real category is selected, fetch subcategories from the server
        fetch("/get_subcategories", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ category: category }),
        })
        .then((response) => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
        .then((data) => {
            // Populate subcategory dropdown with fetched data
            data.forEach((subcategory) => {
            const option = document.createElement("option");
            option.value = subcategory;
            option.textContent = subcategory;
            subcategorySelect.appendChild(option);
            });

            // Add "Other" option at the end of the subcategory dropdown
            const optionOther = document.createElement("option");
            optionOther.value = "Other";
            optionOther.textContent = "Other";
            subcategorySelect.appendChild(optionOther);
        })
        .catch((error) => {
            console.error("Error fetching subcategories:", error);
        });
    }
}

function populateOptions() {
    const subcategory = document.getElementById("subcategory").value;

    fetch("/get_assets", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({ subcategory: subcategory }),
    })
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((data) => {
        console.log('options', data)
      const optionsList = document.getElementById("optionsList");
      optionsList.innerHTML = ""; // Clear previous options

      data.forEach((d) => {
        const optionDiv = document.createElement("div");
        optionDiv.className = "form-check";
        optionDiv.innerHTML = `
                        <input type="checkbox" class="form-check-input" name="assets" id="${d.name}" value="${d.name}" onclick="updateSelectAll()">
                        <label class="form-check-label" for="${d.name}">${d.name}</label>
                    `;
        optionsList.appendChild(optionDiv);
      });
      document.querySelectorAll('input[name="assets"]').forEach((checkbox) => {
        checkbox.addEventListener('change', () => {
            const selectedAssets = Array.from(document.querySelectorAll('input[name="assets"]:checked')).map(asset => asset.value);
            console.log('Selected assets:', selectedAssets);
        });
    });
    })
    .catch((error) => {
      console.error("Error fetching options:", error);
    });
}

function updateSelectAll() {
    const checkboxes = document.querySelectorAll(
        "#optionsList .form-check-input"
    );
    const selectAllCheckbox = document.getElementById("selectAll");

    selectAllCheckbox.checked = [...checkboxes].every(
        (checkbox) => checkbox.checked
    );
}

function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById("selectAll");
    const checkboxes = document.querySelectorAll(
        "#optionsList .form-check-input"
    );

    checkboxes.forEach((checkbox) => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

function saveOptions() {
    const checkboxes = document.querySelectorAll(
        "#optionsList .form-check-input"
    );
    const selectedOptions = [];

    checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
        selectedOptions.push(checkbox.id);
        }
    });

    // Add selected options to savedOptions array if not already present
    savedOptions = [...new Set([...savedOptions, ...selectedOptions])];
    
    // Close the dropdown
    $("#dropdownMenuButton").dropdown("toggle");
}
// Function to initialize tooltips for all elements with data-toggle="tooltip"

function showError(selector, message) {
    const errorElement = document.querySelector(selector);
    errorElement.classList.add("error");
    errorElement.innerText = message;
    errorElement.style.display = "block";
  }
  
  function removeError(selector) {
    const errorElement = document.querySelector(selector);
    errorElement.classList.remove("error");
    errorElement.innerText = "";
    errorElement.style.display = "none";
  }



document.getElementById("evaluationForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const category = document.getElementById("customCategory").value.trim() || document.getElementById("category").value;
    const screenName = document.querySelector('.screen-name').value.trim();
    const subcategory = document.getElementById("subcategory").value.trim() || document.getElementById("subcategory").value;
    const countData = document.querySelector('.count-data').value.trim();
    // let isValid = true;
    if(formValidation()){
        var tableName="";
        if(subcategory){
            tableName=`${category.replace(/\s+/g, '_')}_${subcategory.replace(/\s+/g, '_')}_${screenName.replace(/\s+/g, '_')}`;
        } else{
            tableName=`${category.replace(/\s+/g, '_')}_${screenName.replace(/\s+/g, '_')}`;
        }
        tableCreation(tableName,countData);
        document.querySelector("#evaluationForm").reset();
    }
    // formValidation(isValid)
    // Reset the form after creating the table
});

document.querySelector(".reset-btn").addEventListener('click', function (event ){
    event.preventDefault();
    console.log('reset started')
    removeError('.department-error')
    removeError('.count-error')
    removeError('.screen-error')
    document.querySelector("#evaluationForm").reset();
})
// Add an event listener for the reset button
// Using event delegation for dynamically added reset button



function formValidation(){
    const category = document.getElementById("customCategory").value.trim() || document.getElementById("category").value;
    const screenName = document.querySelector('.screen-name').value.trim();
    const countData = document.querySelector('.count-data').value.trim();
    let isValid = true;
    // Ensure category and subcategory are selected before building the table
    
    console.log('entering form')
    if (!category ) {
        // Send data to the server
        showError('.department-error', 'Please select department');
        isValid = false;
    } else {
        removeError('.department-error');
    }
    if (screenName === ""){
        console.log('screen name error')
        showError('.screen-error', "Please enter screen name");
        isValid = false
    } else {
        removeError('.screen-error');
    }
    if (countData == 0){
        console.log('count data error')
        showError('.count-error', "Please enter valid count value");
        isValid = false
    } else {
        removeError('.count-error');
    }
    
    return isValid;
}

let tableData = [];

function tableCreation(tableName, count) {
    const tablesContainer = document.getElementById('tablesContainer');
    const newSection = document.createElement("div");
    newSection.classList.add( tableName);
    newSection.innerHTML = `
            <div class="table-title" style="padding-inline: 60px">
                <div class="row">
                    <div class="col-10"><h2>${tableName}</h2></div>
                </div>
            </div>
        `;
    const newTable = document.createElement("table");
    newTable.className = "container table table-bordered mt-3 assets-table"; // Bootstrap styling
    newTable.style.width = "100%";

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    
    const rowData = {};
    
    // Create columns with editable feature
    if (count > 0) {
        for (let i = 1; i <= count; i++) {
            const th = document.createElement("th");
            const columnText = `Column${i}`;
            // Make column name and add edit button as HTML
            th.innerHTML = `<span class="editable-column">${columnText}</span>
                <a class="edit" title="Edit" data-toggle="tooltip" style="display: inline;">
                <i class="fa fa-pencil"></i></a>`;
            th.style.position = "relative";
            th.addEventListener('click', makeEditable); // Add event listener for editable column
            headerRow.appendChild(th);
        }
    }

    thead.appendChild(headerRow);
    newTable.appendChild(thead);

    // Create a row for dynamic dropdown and input type selection
    const tbody = document.createElement("tbody");
    const dataRow = document.createElement("tr");

    // First column: Dropdown for selecting input type
    

    for (let i = 0; i < count; i++) {
        const inputTypeCell = document.createElement("td");
        const inputTypeSelector = document.createElement("select");
        inputTypeSelector.className = "form-control input-type-selector";
        
        // Populate the dropdown
        const options = ["select", "textbox", "textarea", "date", "dropdown"];
        options.forEach(option => {
            const opt = document.createElement("option");
            opt.value = option;
            opt.textContent = option.charAt(0).toUpperCase() + option.slice(1);
            inputTypeSelector.appendChild(opt);
        });

        // Set up change event listener
        inputTypeSelector.addEventListener('change', function () {
            rowData[`Column${i + 1}`] = this.value; // Store the selected input type
        });
        
        inputTypeCell.appendChild(inputTypeSelector);
        dataRow.appendChild(inputTypeCell);
    }
    // Append the row to the table body
    tbody.appendChild(dataRow);
    newTable.appendChild(tbody);

    // Append the new table to the container
    newSection.appendChild(newTable);
    tablesContainer.appendChild(newSection);

    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = "submit-table mt-3";  
    // Add "mt-3" class for some margin on top
    buttonsDiv.innerHTML = `
        <button type="submit" class="btn btn-primary" id="save-table">Save</button>
        <button type="reset" class="btn btn-warning" id="reset-table">Reset</button>
        <button class="btn btn-info back-btn">Back</button>
    `;
    newSection.appendChild(buttonsDiv);
    document.addEventListener('click', function (event) {
        if (event.target && event.target.id === 'reset-table') {
            console.log('Reset table');
    
            // Reset each input type selector back to "Select"
            const inputTypeSelectors = newTable.querySelectorAll('.input-type-selector');
            inputTypeSelectors.forEach(selector => {
                selector.value = 'select'; // Reset to 'Select'
            });
        }
    });

    // Store row data in tableData array
    tableData.push({ tableName, rowData });
}


document.getElementById("category").addEventListener("change", function () {
    removeError('.department-error'); // Remove department error when the dropdown is changed
});

document.querySelector('.screen-name').addEventListener("input", function () {
    removeError('.screen-error'); // Remove screen name error when the user starts typing
});

document.querySelector('.count-data').addEventListener("input", function () {
    removeError('.count-error'); 
});



document.addEventListener('click', function (event) {
    const columns = []
    if (event.target && event.target.id === 'save-table') {
        document.querySelectorAll('.editable-column').forEach(ele=>{
            columns.push(ele.innerText)
        })
        tableData.push({columns})
        console.log('rev data', tableData);
        fetch('/submit-table-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tableData: tableData })
        })
        .then(response => {
            if (response.ok) {
                // Handle success if needed (optional)
                console.log('Successfully submitted data');
                window.location.href = '/due-deligence';

            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
});


// Function to make the column names editable
function makeEditable(event) {
    const th = event.currentTarget;
    const columnText = th.querySelector('.editable-column');
    const editButton = th.querySelector('.edit');
    
    // Check if the column is already being edited
    if (columnText.isContentEditable) {
        return;
    }

    // Make column content editable and focus on it
    columnText.contentEditable = "true";
    columnText.focus();

    // Save on blur (clicking outside) or pressing 'Enter'
    columnText.addEventListener('blur', () => saveColumnName(columnText));
    columnText.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            columnText.blur();
        }
    });
}




// Function to save the new column name
function saveColumnName(columnText) {
    columnText.contentEditable = "false"; // Disable contentEditable
    // Optionally: Send the new column name to the backend if needed
}

// Function to update the second column based on the selected input type
// function updateCellWithSelectedInput(dynamicInputCell, selectedType) {
//     let newInput;
//     switch (selectedType) {
//         case 'textbox':
//             newInput = '<input type="text" class="form-control dynamic-input" placeholder="Input here">';
//             break;
//         case 'textarea':
//             newInput = '<textarea class="form-control dynamic-input" placeholder="Input here"></textarea>';
//             break;
//         case 'date':
//             newInput = '<input type="date" class="form-control dynamic-input">';
//             break;
//         case 'dropdown':
//             newInput = `<select class="form-control dynamic-input">
//                             <option value="one">One</option>
//                             <option value="two">Two</option>
//                         </select>`;
//             break;
//         default:
//             newInput = '<input type="text" class="form-control dynamic-input" placeholder="Input here">';
//     }
//     dynamicInputCell.innerHTML = newInput;
// }



// Refactored initializeTableActions to work with the newly created table
function initializeTableActions(table,data) {
    console.log('init tab act', table)
    const tableClass = `.${table}`

    $(document).ready(function () {
        var actions = `
            <a class="add-asset" title="Add" data-toggle="tooltip"><i class="fa fa-plus"></i></a>
            <a class="edit" title="Edit" data-toggle="tooltip" style="display: inline;"><i class="fa fa-pencil"></i></a>
            <a class="delete" title="Delete" data-toggle="tooltip"><i class="fa fa-trash"></i></a>
        `;
        // Add new row on add-new button click

        $(tableClass).on("click",  `.add-new`, function () {
            $(this).attr("disabled", "disabled");
            var index = $(tableClass).find("tbody tr:last-child").index();
            var row = '<tr>';
            console.log('add new is clicked');
            // Loop through savedOptions to dynamically create <td> for each option
            data.forEach(function(option, i) {
                // You might want to exclude the last element (if savedOptions.length - 1 is required)
                if (i < data.length) {
                    row += `<td><input type="text" class="form-control" name="${option}" id="${option}"></td>`;
                }
            });
        
            // Append the action buttons <td>
            row += `<td>${actions}</td></tr>`;
            $(tableClass).find("tbody").append(row);
            $(tableClass).find("tbody tr").eq(index + 1).find(".add-asset, .edit").toggle();
            // $('[data-toggle="tooltip"]').tooltip();
        }); 

        // Add row on add-asset button click
        $(tableClass).on("click", `.add-asset`, function () {
            var empty = false;
            var input = $(this).parents("tr").find('input[type="text"]');
            var rowData = {};

            input.each(function () {
                if (!$(this).val()) {
                    $(this).addClass("error");
                    empty = true;
                } else {
                    $(this).removeClass("error");
                    rowData[$(this).attr("name")] = $(this).val();
                    console.log('row data',rowData)
                    console.log('table name',table)
                }
            });
            $(this).parents("tr").find(".error").first().focus();
            
            if (!empty) {
                $.ajax({
                    url: "/save_row_data",  // Replace with your backend route
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify({
                        tableName: table,  // Send the extracted table name
                        rowData: rowData       // Send the row data
                    }),
                    success: function (response) {
                        if (response.success) {
                            console.log(response.success)
                            // On success, replace inputs with plain text
                            input.each(function () {
                                $(this).parent("td").html($(this).val());
                            });
                            // Toggle add and edit buttons visibility
                            $(this).parents("tr").find(".add-asset, .edit").toggle();
                            $(".add-new").removeAttr("disabled");
                        } else {
                            alert("Failed to save data: " + response.message);
                        }
                    }.bind(this), // Bind the current context
                    error: function (xhr, status, error) {
                        console.error("Error:", error);
                        alert("An error occurred while saving data.");
                    }
                });
            }
        });

        // Edit row on edit button click
        $(tableClass).on("click", ` .edit`, function () {
            $(this).parents("tr").find("td:not(:last-child)").each(function () {
                $(this).html('<input type="text" class="form-control" value="' + $(this).text() + '">');
            });
            $(this).parents("tr").find(".add-asset, .edit").toggle();
            $(".add-new").attr("disabled", "disabled");
        });

        // Delete row on delete button click
        // $(tableClass).on("click", ` .delete`, function () {
        //     $(this).parents("tr").remove();
        //     $(".add-new").removeAttr("disabled");
        // });
        $(tableClass).on("click", `.delete`, function () {
            var $row = $(this).parents("tr");
            
            // Assume each row has a unique identifier (like 'id' or 'row_id') stored in a data attribute
            var rowId = $row.data("id");  // e.g., <tr data-id="123">
            
            if (!rowId) {
                console.error("Row ID not found.");
                return;
            }
            
            // Send AJAX request to the server to delete the row from the database
            $.ajax({
                url: '/delete_row',  // Endpoint that handles the row deletion
                type: 'DELETE',
                contentType: 'application/json',
                data: JSON.stringify({ id: rowId }),  // Send the row ID to be deleted
                success: function (response) {
                    if (response.success) {
                        console.log("Row deleted successfully");
                        $row.remove();  // Remove the row from the frontend
                        $(".add-new").removeAttr("disabled");
                    } else {
                        console.error("Failed to delete row:", response.message);
                    }
                },
                error: function (xhr, status, error) {
                    console.error("Error deleting row:", error);
                }
            });
        });
        

    });
}




document.querySelectorAll(".dropdown-menu").forEach(function (dropdown) {
    dropdown.addEventListener("click", function (e) {
        e.stopPropagation();
    });
});

document.getElementById("category").addEventListener("change", function () {
    const customCategory = document.getElementById("customCategory");
    const saveCustomCategory = document.getElementById("saveCustomCategory");

    if (this.value === "Other") {
        customCategory.style.display = "inline-block"; // Show the custom category input
        saveCustomCategory.style.display = "inline-block"; // Show the save button
    } else {
        customCategory.style.display = "none"; // Hide the custom category input
        saveCustomCategory.style.display = "none"; // Hide the save button
        customCategory.value = ""; // Clear custom category input
    }
});

document.getElementById("subcategory").addEventListener("change", function () {
    const customSubcategory = document.getElementById("customSubcategory");
    const saveCustomSubcategory = document.getElementById(
        "saveCustomSubcategory"
    );
    if (this.value === "Other") {
        customSubcategory.style.display = "block";
        saveCustomSubcategory.style.display = "block";
    } else {
        customSubcategory.style.display = "none";
        saveCustomSubcategory.style.display = "none";
        customSubcategory.value = ""; // Reset the input field if not "Other"
    }
});

function saveCustom() {
    const customCategory = document.getElementById("customCategory").value.trim();
    const categorySelect = document.getElementById("category");

    if (customCategory) {
        // Save custom category to the database
        fetch("/add_category", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ category: customCategory }), // Send custom category to the server
        })
        .then((response) => {
            if (!response.ok) throw new Error("Failed to save custom category");
            return response.json();
        })
        .then((data) => {
            // Show success message
            alert(data.message); 

            // Add custom category to the category dropdown
            const option = document.createElement("option");
            option.value = customCategory;
            option.text = customCategory;
            categorySelect.appendChild(option);

            // Set the newly added custom category as the selected value
            categorySelect.value = customCategory;

            // Hide and reset the custom category input and save button
            document.getElementById("customCategory").style.display = "none";
            document.getElementById("saveCustomCategory").style.display = "none";
            document.getElementById("customCategory").value = "";
        })
        .catch((error) => {
            console.error("Error saving custom category:", error); // Handle error
            alert("Error saving custom category. Please try again."); // Notify user of error
        });
    } else {
        alert("Please enter a custom category.");
    }
}


// Save custom subcategory and add to the dropdown
function saveCustomSub() {
    const customSubcategory = document.getElementById("customSubcategory").value.trim();
    const subcategorySelect = document.getElementById("subcategory");
    const categorySelect = document.getElementById("category"); // Get the selected category

    if (customSubcategory) {
        // Save custom subcategory to the database
        fetch("/add_subcategory", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                subcategory: customSubcategory, // Send custom subcategory to the server
                category: categorySelect.value    // Include the selected category
            }),
        })
        .then((response) => {
            if (!response.ok) throw new Error("Failed to save custom subcategory");
            return response.json();
        })
        .then((data) => {
            alert(data.message); // Show success message

            // Add custom subcategory to the subcategory dropdown
            const option = document.createElement("option");
            option.value = customSubcategory;
            option.text = customSubcategory;
            subcategorySelect.appendChild(option);

            // Set the newly added custom subcategory as the selected value
            subcategorySelect.value = customSubcategory;

            // Hide and reset the custom subcategory input and save button
            document.getElementById("customSubcategory").style.display = "none";
            document.getElementById("saveCustomSubcategory").style.display = "none";
            document.getElementById("customSubcategory").value = "";
        })
        .catch((error) => {
            console.error("Error saving custom subcategory:", error); // Handle error
            alert("Error saving custom subcategory. Please try again."); // Notify user of error
        });
    } else {
        alert("Please enter a custom subcategory.");
    }
}


function addCustomOption() {
    const customOptionInput = document.getElementById("customOption");
    const optionValue = customOptionInput.value.trim();
    const subcategorySelect = document.getElementById("subcategory"); // Get the selected subcategory

    if (optionValue) {
        // Save custom asset to the database
        fetch("/add_asset", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                asset: optionValue,             // Send custom asset to the server
                subcategory: subcategorySelect.value // Include the selected subcategory
            }),
        })
        .then((response) => {
            if (!response.ok) throw new Error("Failed to save custom asset");
            return response.json();
        })
        .then((data) => {
            alert(data.message); // Show success message

            // Create and append the new checkbox option
            const optionsList = document.getElementById("optionsList");
            const optionDiv = document.createElement("div");
            optionDiv.className = "form-check";
            optionDiv.innerHTML = `
                <input type="checkbox" class="form-check-input" id="${data.name}">
                <label class="form-check-label" for="${data.name}">${data.name}</label>
            `;
            optionsList.appendChild(optionDiv);

            customOptionInput.value = ""; // Clear the input field
        })
        .catch((error) => {
            console.error("Error saving custom asset:", error); // Handle error
            alert("Error saving custom asset. Please try again."); // Notify user of error
        });
    } else {
        alert("Please enter a valid option.");
    }
}


function resetForm() {
    document.getElementById('category').selectedIndex = 0;
    document.getElementById('subcategory').innerHTML = '<option value="">Select Sub Category</option>';
    const checkboxes = document.querySelectorAll('#optionsList .form-check-input');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    document.getElementById('selectAll').checked = false;
    savedOptions = [];
}