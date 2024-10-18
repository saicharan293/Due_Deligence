// function initializeTooltips() {
//     const tooltips = document.querySelectorAll('[data-toggle="tooltip"]');
//     tooltips.forEach(tooltip => {
        
//         tooltip.addEventListener("mouseenter", function () {
//             const tooltipText = this.getAttribute("title");
//             const tooltipElement = document.createElement("div");
//             tooltipElement.className = "tooltip-custom";
//             tooltipElement.textContent = tooltipText;
//             document.body.appendChild(tooltipElement);
//             const rect = this.getBoundingClientRect();
//             tooltipElement.style.left = `${rect.left + window.scrollX}px`;
//             tooltipElement.style.top = `${rect.top + window.scrollY - tooltipElement.offsetHeight}px`;
//         });

//         tooltip.addEventListener("mouseleave", function () {
//             const existingTooltip = document.querySelector(".tooltip-custom");
//             if (existingTooltip) {
//                 existingTooltip.remove();
//             }
//         });
//     });
// }

// function initializeTableActions() {
//     initializeTooltips();

//     document.querySelector('.add-new').addEventListener('click', function () {
//         const newRow = createEditableRow();
//         document.querySelector(".assets-table")?.appendChild(newRow); 
//         this.setAttribute("disabled", "disabled");

//         initializeTooltips(); 
//     });

//     document.addEventListener("click", function (e) {
//         if (e.target.classList.contains("add-new")) {
//             const row = e.target.closest("tr");
//             const inputs = row.querySelectorAll('input[type="text"]');
//             let empty = false;

//             inputs.forEach(input => {
//                 if (!input.value) {
//                     input.classList.add("error");
//                     empty = true;
//                 } else {
//                     input.classList.remove("error");
//                 }
//             });

//             const firstError = row.querySelector(".error");
//             if (firstError) {
//                 firstError.focus();
//             }

//             if (!empty) {
//                 inputs.forEach(input => {
//                     const cell = input.parentElement;
//                     cell.innerHTML = input.value; 
//                 });

//                 toggleButtons(row); 
//                 document.querySelector(".add-new").removeAttribute("disabled");
//             }
//         }
//     });


//     document.addEventListener("click", function (e) {
//         if (e.target.classList.contains("edit-asset")) {
//             const row = e.target.closest("tr");
//             const cells = row.querySelectorAll("td:not(:last-child)");

//             cells.forEach(cell => {
//                 const currentValue = cell.textContent; 
//                 cell.innerHTML = `<input type="text" class="form-control" value="${currentValue}">`;
//             });

//             toggleButtons(row); 
//             document.querySelector(".add-new").setAttribute("disabled", "disabled"); 
//         }
//     });

//     document.addEventListener("click", function (e) {
//         if (e.target.classList.contains("delete-asset")) {
//             console.log('delete')
//             const row = e.target.closest("tr");
//             row.remove(); 
//             document.querySelector(".add-new").removeAttribute("disabled"); 
//         }
//     });
// }

// Function to create a new editable row
// function createEditableRow() {
//     const newRow = document.createElement("tr");
//     console.log(savedOptions,'saved opt')

    
//     savedOptions.forEach(() => {
//         const assetCell = document.createElement("td"); 
//         const inputRow = document.createElement("input"); 
//         inputRow.type = "text";
//         inputRow.className = "form-control input-control";
//         assetCell.appendChild(inputRow); 
//         newRow.appendChild(assetCell); 
//     });


//     const actionsCell = document.createElement("td");
//     actionsCell.innerHTML = `
//         <a class="add-asset" title="Add" data-toggle="tooltip"><i class="material-icons">&#xE03B;</i></a>
//         <a class="edit-asset" title="Edit" data-toggle="tooltip" style="display:none;"><i class="material-icons">&#xE254;</i></a>
//         <a class="delete" title="Delete" data-toggle="tooltip"><i class="material-icons">&#xE872;</i></a>
//     `;
    
//     newRow.appendChild(actionsCell); 

//     return newRow; 
// }
// Function to toggle the visibility of buttons
// function toggleButtons(row) {
//     const addBtn = row.querySelector(".add-asset");
//     const editBtn = row.querySelector(".edit-asset");
//     addBtn.style.display = addBtn.style.display === "none" ? "inline" : "none"; 
//     editBtn.style.display = editBtn.style.display === "none" ? "inline" : "none"; 
// }

export function initializeTableActions(){
    $(document).ready(function(){
        $('[data-toggle="tooltip"]').tooltip();
        var actions = $("table td:last-child").html();
        // Append table with add row form on add new button click
        $(".add-new").click(function(){
            $(this).attr("disabled", "disabled");
            var index = $("table tbody tr:last-child").index();
            var row = '<tr>' +
                '<td><input type="text" class="form-control" name="name" id="name"></td>' +
                '<td><input type="text" class="form-control" name="department" id="department"></td>' +
                '<td><input type="text" class="form-control" name="phone" id="phone"></td>' +
                '<td>' + actions + '</td>' +
            '</tr>';
            $("table").append(row);		
            $("table tbody tr").eq(index + 1).find(".add, .edit").toggle();
            $('[data-toggle="tooltip"]').tooltip();
        });
        // Add row on add button click
        $(document).on("click", ".add-asset", function(){
            var empty = false;
            var input = $(this).parents("tr").find('input[type="text"]');
            input.each(function(){
                if(!$(this).val()){
                    $(this).addClass("error");
                    empty = true;
                } else{
                    $(this).removeClass("error");
                }
            });
            $(this).parents("tr").find(".error").first().focus();
            if(!empty){
                input.each(function(){
                    $(this).parent("td").html($(this).val());
                });			
                $(this).parents("tr").find(".add-asset, .edit-asset").toggle();
                $(".add-new").removeAttr("disabled");
            }		
        });
        // Edit row on edit button click
        $(document).on("click", ".edit-asset", function(){		
            $(this).parents("tr").find("td:not(:last-child)").each(function(){
                $(this).html('<input type="text" class="form-control" value="' + $(this).text() + '">');
            });		
            $(this).parents("tr").find(".add-asset, .edit-asset").toggle();
            $(".add-new").attr("disabled", "disabled");
        });
        // Delete row on delete button click
        $(document).on("click", ".delete", function(){
            $(this).parents("tr").remove();
            $(".add-new").removeAttr("disabled");
        });
    });
}
