const BASE_URL = "http://localhost:3000";

const expenseList = document.getElementById("expenseList");
const addBtn = document.getElementById("addBtn");
const searchBy = document.getElementById("searchBy");
const searchContainer = document.getElementById("searchContainer");

let editId = null;
let allExpenses = [];
let currentExpenses = [];

addBtn.addEventListener("click", addExpense);
searchBy.addEventListener("change", changeSearchField);

getExpenses();

async function getExpenses(){

    try{

        const response = await fetch(`${BASE_URL}/expenses`);
        allExpenses = await response.json();

        displayExpenses(allExpenses);

        if(document.getElementById("searchInput")){
            searchExpense();
        }

        if(searchBy.value === "category"){
            changeSearchField();
        }

    }
    catch(error){
        console.log(error);
        alert("Unable to connect to server.");
    }
}

function displayExpenses(expenses){

    currentExpenses = [...expenses];

    expenseList.innerHTML = "";

    if(expenses.length === 0){

        expenseList.innerHTML =
        "<h3 style='text-align:center'>No Expenses Found</h3>";

        document.getElementById("total").innerHTML =
        "Total : ₹0";

        return;
    }

    let total = 0;

    expenses.forEach(expense=>{

        total += expense.amount;

        expenseList.innerHTML += `
        <div class="row">

            <span>${expense.title}</span>

            <span>₹${expense.amount}</span>

            <span>${expense.category}</span>

            <span>${new Date(expense.date).toLocaleDateString("en-IN")}</span>

            <span class="actions">

                <button
                    class="edit"
                    onclick="editExpense('${expense._id}')">
                    Edit
                </button>

                <button
                    class="delete"
                    onclick="deleteExpense('${expense._id}')">
                    Delete
                </button>

            </span>

        </div>`;
    });

    document.getElementById("total").innerHTML =
    `Total : ₹${total}`;
}

async function addExpense(){

    const title = document.getElementById("title").value.trim();
    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value.trim();
    const date = document.getElementById("date").value;

    if(!title || !amount || !category){
        alert("Please fill all required fields.");
        return;
    }

    const expense = {
        title,
        amount: Number(amount),
        category,
        date: date || undefined
    };

    try{

        if(editId){

            await fetch(`${BASE_URL}/expenses/${editId}`,{
                method:"PUT",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(expense)
            });

            alert("Expense Updated");
            editId = null;
            addBtn.innerText = "Add";
        }

        else{

            await fetch(`${BASE_URL}/expenses`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(expense)
            });

            alert("Expense Added");
        }

        document.getElementById("title").value = "";
        document.getElementById("amount").value = "";
        document.getElementById("category").value = "";
        document.getElementById("date").value = "";

        await getExpenses();

    }
    catch(error){
        console.log(error);
        alert("Something went wrong.");
    }
}

async function deleteExpense(id){

    if(!confirm("Delete this expense?")){
        return;
    }

    try{

        await fetch(`${BASE_URL}/expenses/${id}`,{
            method:"DELETE"
        });

        await getExpenses();

    }
    catch(error){
        console.log(error);
        alert("Unable to delete expense.");
    }
}

function editExpense(id){

    const expense = allExpenses.find(e => e._id === id);

    if(!expense){
        return;
    }

    document.getElementById("title").value = expense.title;
    document.getElementById("amount").value = expense.amount;
    document.getElementById("category").value = expense.category;
    document.getElementById("date").value = expense.date.split("T")[0];

    editId = id;
    addBtn.innerText = "Update";
}

changeSearchField();

async function changeSearchField(){

    const type = searchBy.value;

    if(type === "title"){

        searchContainer.innerHTML = `
        <input
            type="search"
            id="searchInput"
            placeholder="Enter title"
        >`;

        document.getElementById("searchInput")
        .addEventListener("input", searchExpense);
    }

    else if(type === "category"){

        searchContainer.innerHTML = `
        <select id="searchInput">
            <option value="">All Categories</option>
        </select>`;

        const select = document.getElementById("searchInput");

        const categories = [...new Set(allExpenses.map(expense => expense.category))];

        categories.sort();

        categories.forEach(category=>{

            select.innerHTML += `
            <option value="${category}">
                ${category}
            </option>`;
        });

        select.addEventListener("change", searchExpense);
    }

    else if(type === "amountGreater"){

        searchContainer.innerHTML = `
        <input
            type="number"
            id="searchInput"
            placeholder="Amount greater than"
        >`;

        document.getElementById("searchInput")
        .addEventListener("input", searchExpense);
    }

    else if(type === "amountLess"){

        searchContainer.innerHTML = `
        <input
            type="number"
            id="searchInput"
            placeholder="Amount less than"
        >`;

        document.getElementById("searchInput")
        .addEventListener("input", searchExpense);
    }

    else if(type === "date"){

        searchContainer.innerHTML = `
        <input
            type="date"
            id="searchInput"
        >`;

        document.getElementById("searchInput")
        .addEventListener("change", searchExpense);
    }

    else if(type === "monthYear"){

    searchContainer.innerHTML = `
        <select id="searchMonth">
            <option value="">Month</option>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
        </select>

        <select id="searchYear">
            <option value="">Year</option>
        </select>
    `;

    const yearSelect = document.getElementById("searchYear");

    const years = [...new Set(
        allExpenses.map(expense =>
            new Date(expense.date).getFullYear()
        )
    )];

    years.sort((a,b)=>b-a);

    years.forEach(year=>{
        yearSelect.innerHTML += `
            <option value="${year}">
                ${year}
            </option>`;
    });

    document.getElementById("searchMonth")
        .addEventListener("change", searchExpense);

    document.getElementById("searchYear")
        .addEventListener("change", searchExpense);
    }

    searchExpense();
}

function searchExpense(){

    const type = searchBy.value;

    let value = "";

    if(type !== "monthYear"){
        value = document.getElementById("searchInput").value.trim();
    }

    let filtered = [...allExpenses];

    if(type === "title"){

        filtered = filtered.filter(expense =>
            expense.title.toLowerCase().includes(value.toLowerCase())
        );
    }

    else if(type === "category"){

        if(value !== ""){

            filtered = filtered.filter(expense =>
                expense.category.toLowerCase() === value.toLowerCase()
            );
        }
    }

    else if(type === "amountGreater"){

        if(value !== ""){

            const amount = Number(value);

            filtered = filtered.filter(expense =>
                expense.amount >= amount
            );
        }
    }

    else if(type === "amountLess"){

        if(value !== ""){

            const amount = Number(value);

            filtered = filtered.filter(expense =>
                expense.amount <= amount
            );
        }
    }

    else if(type === "date"){

        if(value !== ""){

            filtered = filtered.filter(expense =>
                expense.date.split("T")[0] === value
            );
        }
    }

    else if(type === "monthYear"){

        const month = document.getElementById("searchMonth").value;
        const year = document.getElementById("searchYear").value;

        filtered = allExpenses.filter(expense=>{

            const expenseDate = new Date(expense.date);

            const expenseMonth = expenseDate.getMonth() + 1;
            const expenseYear = expenseDate.getFullYear();

            if(month !== "" && expenseMonth !== Number(month)){
                return false;
            }

            if(year !== "" && expenseYear !== Number(year)){
                return false;
            }

            return true;
        });
    }

    displayExpenses(filtered);
}

function sortExpenses(){

    const type = document.getElementById("sortBy").value;

    let sorted = [...currentExpenses];

    if(type === "newest"){

        sorted.sort((a,b)=>
            new Date(b.date)-new Date(a.date)
        );
    }

    else if(type === "oldest"){

        sorted.sort((a,b)=>
            new Date(a.date)-new Date(b.date)
        );
    }

    else if(type === "high"){

        sorted.sort((a,b)=>
            b.amount-a.amount
        );
    }

    else if(type === "low"){

        sorted.sort((a,b)=>
            a.amount-b.amount
        );
    }

    displayExpenses(sorted);
}

document.getElementById("sortBy")
.addEventListener("change", sortExpenses);