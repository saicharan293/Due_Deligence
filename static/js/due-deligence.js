
let savedOptions = []; // Array to hold selected options

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


// document.getElementById("evaluationForm").addEventListener("submit", function (event) {
//     event.preventDefault();

//     const category = document.getElementById("customCategory").value.trim() || document.getElementById("category").value;
//     const subcategory = document.getElementById("customSubcategory").value.trim() || document.getElementById("subcategory").value;
//     // Replace all spaces with underscores globally
//     const tableName = `${category.replace(/\s+/g, '_')}_${subcategory.replace(/\s+/g, '_')}`;
//     const selectedAssets = Array.from(document.querySelectorAll('input[name="assets"]:checked')).map(asset => asset.value);
//     console.log('selected assets',selectedAssets)

//     // Ensure category and subcategory are selected before building the table
//     if (category && subcategory) {
//         // Send data to the server
//         fetch("/submit_form", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//                 category: category,
//                 subcategory: subcategory,
//                 tableName:tableName,
//                 selectedAssets: selectedAssets
//             }),
//         })
//         .then(response => response.json())
//         .then(data => {
//             console.log('data form submission',data[1],data[0]);
//             // Fetch and display the new data as required
//             displayTableData(data[1],data[0]); 
//             // Function to fetch and display the new table data
//             initializeTableActions(data[1],data[0]);

//         })
//         .catch(error => console.error("Error:", error));

//         // Reset the form after creating the table
//         document.querySelector("#evaluationForm").reset();
//     } else {
//         alert("Please select a category and subcategory.");
//     }
// });
// console.log('due', tableData)

// second.js

document.addEventListener('DOMContentLoaded', function() {
    fetch('/get-table-data')
    .then(response => response.json())
    .then(tableData => {
        console.log('Retrieved table data from server:', tableData);
        console.log('columns data', tableData[1].columns)
        // Now you can perform your DOM manipulation or table creation here
        
        displayTableData(tableData);
        initializeTableActions(tableData[0].tableName,tableData[0].rowData)

    })
    .catch(error => {
        console.error('Error fetching table data:', error);
    });
});



// Function to display the fetched data in a table
function displayTableData(tableData) {
    const tablesContainer = document.getElementById('tablesContainer');
    const newSection = document.createElement("div");
    newSection.classList.add("mt-3",tableData[0].tableName);
    newSection.innerHTML=`
            <div class="table-title" style="padding-inline: 60px">
                <div class="row">
                    <div class="col-10"><h2>${tableData[0].tableName}</h2></div>
                    <div class="col-2">
                    <button type="button" class="btn btn-info add-new"><i class="fa fa-plus"></i> Add Row</button>
                    <button type="button" class="btn btn-warning back-home" onclick="window.location.href='/'"><i class="fa fa-arrow-left"></i> Back</button>
                    </div>
                </div>
            </div>
        `;
    const newTable = document.createElement("table");
    newTable.className = "container table table-bordered mt-3 assets-table"; // Bootstrap styling
    newTable.style.width = "100%";
    
    newSection.className = `mt-3 ${tableData[0].tableName}`;

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    let columns = tableData[1].columns

    // if (tableData[1].columns) {
    //     for (const column in tableData[1].columns) {
    //         const th = document.createElement("th");
    //         th.textContent = column; // Column name
    //         headerRow.appendChild(th);
    //     }
    // }
    for (let i = 0; i < columns.length; i++) {
        // const element = array[i];
        const th = document.createElement("th");
        th.textContent=columns[i];
        headerRow.appendChild(th)
        
    }
    const actionTh = document.createElement("th");
    actionTh.textContent = "Action buttons";
    headerRow.appendChild(actionTh);
    
    thead.appendChild(headerRow);
    newTable.appendChild(thead);
    const tbody = document.createElement("tbody");
    newTable.appendChild(tbody);
    // Append the new table to the container
    newSection.appendChild(newTable);
    tablesContainer.appendChild(newSection);
}
// displayTableData()
// console.log(tableData);


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
            let myObject=data
            Object.entries(myObject).forEach(([key, value]) => {
                console.log(`${key}: ${value}`);
                row += `<td><input type="${value}" class="form-control" name="${value}" id="${value}"></td>`;
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




// document.querySelectorAll(".dropdown-menu").forEach(function (dropdown) {
//     dropdown.addEventListener("click", function (e) {
//         e.stopPropagation();
//     });
// });

// document.getElementById("category").addEventListener("change", function () {
//     const customCategory = document.getElementById("customCategory");
//     const saveCustomCategory = document.getElementById("saveCustomCategory");

//     if (this.value === "Other") {
//         customCategory.style.display = "inline-block"; // Show the custom category input
//         saveCustomCategory.style.display = "inline-block"; // Show the save button
//     } else {
//         customCategory.style.display = "none"; // Hide the custom category input
//         saveCustomCategory.style.display = "none"; // Hide the save button
//         customCategory.value = ""; // Clear custom category input
//     }
// });

// document.getElementById("subcategory").addEventListener("change", function () {
//     const customSubcategory = document.getElementById("customSubcategory");
//     const saveCustomSubcategory = document.getElementById(
//         "saveCustomSubcategory"
//     );
//     if (this.value === "Other") {
//         customSubcategory.style.display = "block";
//         saveCustomSubcategory.style.display = "block";
//     } else {
//         customSubcategory.style.display = "none";
//         saveCustomSubcategory.style.display = "none";
//         customSubcategory.value = ""; // Reset the input field if not "Other"
//     }
// });

// function saveCustom() {
//     const customCategory = document.getElementById("customCategory").value.trim();
//     const categorySelect = document.getElementById("category");

//     if (customCategory) {
//         // Save custom category to the database
//         fetch("/add_category", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({ category: customCategory }), // Send custom category to the server
//         })
//         .then((response) => {
//             if (!response.ok) throw new Error("Failed to save custom category");
//             return response.json();
//         })
//         .then((data) => {
//             // Show success message
//             alert(data.message); 

//             // Add custom category to the category dropdown
//             const option = document.createElement("option");
//             option.value = customCategory;
//             option.text = customCategory;
//             categorySelect.appendChild(option);

//             // Set the newly added custom category as the selected value
//             categorySelect.value = customCategory;

//             // Hide and reset the custom category input and save button
//             document.getElementById("customCategory").style.display = "none";
//             document.getElementById("saveCustomCategory").style.display = "none";
//             document.getElementById("customCategory").value = "";
//         })
//         .catch((error) => {
//             console.error("Error saving custom category:", error); // Handle error
//             alert("Error saving custom category. Please try again."); // Notify user of error
//         });
//     } else {
//         alert("Please enter a custom category.");
//     }
// }


// Save custom subcategory and add to the dropdown
// function saveCustomSub() {
//     const customSubcategory = document.getElementById("customSubcategory").value.trim();
//     const subcategorySelect = document.getElementById("subcategory");
//     const categorySelect = document.getElementById("category"); // Get the selected category

//     if (customSubcategory) {
//         // Save custom subcategory to the database
//         fetch("/add_subcategory", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//                 subcategory: customSubcategory, // Send custom subcategory to the server
//                 category: categorySelect.value    // Include the selected category
//             }),
//         })
//         .then((response) => {
//             if (!response.ok) throw new Error("Failed to save custom subcategory");
//             return response.json();
//         })
//         .then((data) => {
//             alert(data.message); // Show success message

//             // Add custom subcategory to the subcategory dropdown
//             const option = document.createElement("option");
//             option.value = customSubcategory;
//             option.text = customSubcategory;
//             subcategorySelect.appendChild(option);

//             // Set the newly added custom subcategory as the selected value
//             subcategorySelect.value = customSubcategory;

//             // Hide and reset the custom subcategory input and save button
//             document.getElementById("customSubcategory").style.display = "none";
//             document.getElementById("saveCustomSubcategory").style.display = "none";
//             document.getElementById("customSubcategory").value = "";
//         })
//         .catch((error) => {
//             console.error("Error saving custom subcategory:", error); // Handle error
//             alert("Error saving custom subcategory. Please try again."); // Notify user of error
//         });
//     } else {
//         alert("Please enter a custom subcategory.");
//     }
// }


// function addCustomOption() {
//     const customOptionInput = document.getElementById("customOption");
//     const optionValue = customOptionInput.value.trim();
//     const subcategorySelect = document.getElementById("subcategory"); // Get the selected subcategory

//     if (optionValue) {
//         // Save custom asset to the database
//         fetch("/add_asset", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//                 asset: optionValue,             // Send custom asset to the server
//                 subcategory: subcategorySelect.value // Include the selected subcategory
//             }),
//         })
//         .then((response) => {
//             if (!response.ok) throw new Error("Failed to save custom asset");
//             return response.json();
//         })
//         .then((data) => {
//             alert(data.message); // Show success message

//             // Create and append the new checkbox option
//             const optionsList = document.getElementById("optionsList");
//             const optionDiv = document.createElement("div");
//             optionDiv.className = "form-check";
//             optionDiv.innerHTML = `
//                 <input type="checkbox" class="form-check-input" id="${data.name}">
//                 <label class="form-check-label" for="${data.name}">${data.name}</label>
//             `;
//             optionsList.appendChild(optionDiv);

//             customOptionInput.value = ""; // Clear the input field
//         })
//         .catch((error) => {
//             console.error("Error saving custom asset:", error); // Handle error
//             alert("Error saving custom asset. Please try again."); // Notify user of error
//         });
//     } else {
//         alert("Please enter a valid option.");
//     }
// }


// function resetForm() {
//     document.getElementById('category').selectedIndex = 0;
//     document.getElementById('subcategory').innerHTML = '<option value="">Select Sub Category</option>';
//     const checkboxes = document.querySelectorAll('#optionsList .form-check-input');
//     checkboxes.forEach(checkbox => {
//         checkbox.checked = false;
//     });

//     document.getElementById('selectAll').checked = false;
//     savedOptions = [];
// }