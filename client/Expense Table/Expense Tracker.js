
const myform = document.getElementById('myform');
let items = document.getElementById('items');
const backendApi = 'http://localhost:3000/expense';

const razorPay = document.getElementById('rzp-button');


myform.addEventListener('submit', storeExpenses);

async function storeExpenses(e) {
    try {
        e.preventDefault();

    let amount = document.getElementById('amount').value;
    let description = document.getElementById('description').value;
    let category = document.getElementById('category').value;

    let expenseDetails = {
        amount,
        description,
        category
    }

    // showExpenseOnScreen(expenseDetails);
    const token = localStorage.getItem('token');
    const response = await axios.post(`${backendApi}/add`, expenseDetails, { headers: {"Authorization": token} })
        showExpenseOnScreen(response.data.newExpenseDetail);
        if(response.status == 200) {
            document.getElementById('amount').value = ''
            document.getElementById('description').value = ''
        }
    } catch(err) {
        console.log(err);
        document.body.innerHTML = document.body.innerHTML+`<h4 style="text-align: center;">Something went Wrong</h4>`;
    }
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

window.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const decodeToken = parseJwt(token); 
    console.log(decodeToken);
    const ispremiumuser = decodeToken.ispremiumuser
    if(ispremiumuser) {
        showPremiumText(razorPay);
        showLeaderBoardOnScreen()
    }
    getAllExpenses();
    setPaginationLimit();
})

async function getAllExpenses(page = 1, limit = 5) {
    const token = localStorage.getItem('token');
    if(localStorage.getItem('limit')){
        limit = localStorage.getItem('limit');
    }
    const res = await axios.get(`${backendApi}/expenses?page=${page}&limit=${limit}`, {headers: {'Authorization': token}})
        const expenses = res.data.allExpensesDetails;
        expenses.forEach((expense) => {
            showExpenseOnScreen(expense)
        })
        balance = res.data.balance;
        if(expenses.length <= 0){
            const paginationRowDiv = document.getElementById('paginationRowDiv');
            paginationRowDiv.innerText = '';
            return;
        }
        const currentPage = res.data.currentPage;
        const prevPage = res.data.prevPage;
        const nextPage = res.data.nextPage;
        paginationInDOM(currentPage, prevPage, nextPage, limit);
}

function paginationInDOM(currentPage, prevPage, nextPage, limit = 5){
    currentPage = parseInt(currentPage);
    prevPage = parseInt(prevPage);
    nextPage = parseInt(nextPage);
    
    paginationButtons.innerText = '';
    
    const currentPageBtn = document.createElement('button');
    currentPageBtn.innerText = currentPage;
    currentPageBtn.className = 'btn btn-secondary';
    currentPageBtn.addEventListener('click', () => getAllExpenses(currentPage, limit));

    const prevPageBtn = document.createElement('button');
    prevPageBtn.innerText = '<< Prev';
    prevPageBtn.className = 'btn btn-outline-secondary';
    prevPageBtn.addEventListener('click', () => getAllExpenses(prevPage, limit));

    const nextPageBtn = document.createElement('button');
    nextPageBtn.innerText = 'Next >>';
    nextPageBtn.className = 'btn btn-outline-secondary';
    nextPageBtn.addEventListener('click', () => getAllExpenses(nextPage, limit));

    if(prevPage){
        prevPageBtn.classList.remove('disabled');
    }else{
        prevPageBtn.classList.add('disabled');
    }
    if(nextPage){
        nextPageBtn.classList.remove('disabled');
    }else{
        nextPageBtn.classList.add('disabled');
    }

    paginationButtons.appendChild(prevPageBtn);
    paginationButtons.appendChild(currentPageBtn);
    paginationButtons.appendChild(nextPageBtn);
}

function setPaginationLimit(){
    const paginationLimit = document.getElementById('paginationLimit');
    paginationLimit.addEventListener('change', () => {
        localStorage.setItem('limit', paginationLimit.value);
        window.location.reload();
    });
}

function showExpenseOnScreen(expenseDetails) {

    var tbody = document.createElement('tbody');
    var tr = document.createElement('tr');
    var th0 = document.createElement('td');
    // var th = document.createElement('td')
    var th1 = document.createElement('td')
    var th2 = document.createElement('td')
    var th3 = document.createElement('td')
    // var th4 = document.createElement('td')
    tbody.appendChild(tr)
    // tr.appendChild(th)
    tr.appendChild(th0)
    tr.appendChild(th1)
    tr.appendChild(th2)
    tr.appendChild(th3)
    // tr.appendChild(th4)
    th0.textContent = expenseDetails.amount
    // th.textContent = expenseDetails.createdAt;
    th1.textContent = expenseDetails.description;
    th2.textContent = expenseDetails.category;
    

    function deleteId(itemId) {
        const token = localStorage.getItem('token');
        axios.delete(`${backendApi}/${itemId}`, { headers: {"Authorization": token} })
        .then((res) => console.log(res))
        .catch(err => console.log(err))
    }

    var deletebtn = document.createElement('button');
    deletebtn.className = 'btn btn-danger btn-sm';
    deletebtn.innerHTML = 'Delete';
    deletebtn.onclick = () => {
            items.removeChild(tbody)
            deleteId(expenseDetails._id)
    }

    function editId(itemId) {
        const token = localStorage.getItem('token');
        axios.put(`${backendApi}/${itemId}`, { headers: {"Authorization": token} })
        .then((res) => console.log(res))
    }
    
    let editbtn = document.createElement('button')
    editbtn.className = 'btn btn-success btn-sm';
    editbtn.innerHTML = 'Edit'
    editbtn.onclick = () => {
      items.removeChild(tbody)
      editId(expenseDetails._id)
      deleteId(expenseDetails._id)
      document.getElementById('amount').value = expenseDetails.amount
      document.getElementById('description').value = expenseDetails.description
      document.getElementById('category').value = expenseDetails.category
    }

    th3.appendChild(editbtn)

    th3.appendChild(deletebtn)
    
    items.appendChild(tbody)
}

function showPremiumText(rzp){
    rzp.value = 'You are a Premium user'
    rzp.className = 'btn btn-warning';
    rzp.disabled = true;
    document.getElementById('downloadexpense').hidden = false
    document.getElementById('fileDownloadedbutton').hidden = false;
}

function showLeaderBoardOnScreen() {
    const leaderBoard = document.createElement('input')
    leaderBoard.type = "button"
    leaderBoard.value = 'Show LeaderBoard'
    leaderBoard.className = 'btn btn-success'
    leaderBoard.onclick = async() => {
        const token = localStorage.getItem('token');
        const userLeaderBoardArray = await axios.get('http://localhost:3000/premium/leaderboard',{ headers: {"Authorization": token} })
        console.log(userLeaderBoardArray);
        
        var leaderBoardElem = document.getElementById('leaderboard')
        leaderBoardElem.innerHTML += '<h3>Leader Board </h3>'
        userLeaderBoardArray.data.forEach((userDetails) => {
            leaderBoardElem.innerHTML += `<li>Name - ${userDetails.name} Total Expense - ${userDetails.totalExpenses}</li>`
        })
    }
    document.getElementById('message').appendChild(leaderBoard)
}

razorPay.onclick = async function (e) {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:3000/purchase/premiummembership',{ headers: {"Authorization": token} })
    console.log(response);
    var options = 
    {
        "key": response.data.key_id,
        "order_id": response.data.order.orderid,
        "handler": async function (response) {
            const res = await axios.post('http://localhost:3000/purchase/update-transaction-status', {
                order_id: options.order_id,
                payment_id: response.razorpay_payment_id,
            }, { headers: {"Authorization": token} })

            alert(`You are a Premium User Now`)
            showPremiumText(razorPay)
            localStorage.setItem('token', res.data.token)
            showLeaderBoardOnScreen()
        },
    };
    if(response.status === 200) {
        alert('Transaction successful')
    }
    const rzpl = new Razorpay(options);
    rzpl.open();
    e.preventDefault();

    rzpl.on('payment failed', function (response) {
        console.log(response);
        alert('Something went wrong')
    });
}

async function download(){
    try{
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:3000/user/download', { headers: {"Authorization" : token} })
    if(response.status === 200){
        // document.getElementById('fileDownloadedbutton').hidden = false;
        var a = document.createElement("a");
        a.href = response.data.fileURL;
        a.download = 'myexpense.csv';
        a.click();
    } else {
        throw new Error(response.data.message)
    }
    }catch(err) {
        console.log(err);
    }
}

async function showDownloadedFiles() {
    try{
    const downloadedFiles = document.getElementById('downloadedFiles');
    
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:3000/user/downloaded-Files', { headers: {"Authorization" : token} })
    const data = response.data;
    console.log('all downloads',data);
    if(data.length >0){ 
    downloadedFiles.hidden = false;
    const urls = document.getElementById('fileList');
    urls.textContent = 'Downloaded Files';
    urls.style.fontWeight= "500";
      
    for(let i=0; i<data.length; i++){
        const link = document.createElement('a');
        link.href = data[i]
        link.textContent = data[i].slice(0, 50 - 3) + "...";
        const urlList = document.createElement('li');
        urlList.appendChild(link);
        urls.appendChild(urlList);
        }
    }else{
      alert(`You haven't downloaded any file yet`);
    }
    }catch(err) {
        console.log(err);
    }
}

function showError(err){
    document.body.innerHTML += `<p style="color:red; text-align: center;">${err}</p>`
}

function logOut() {
    window.location.href = '../Login/login.html';
}
