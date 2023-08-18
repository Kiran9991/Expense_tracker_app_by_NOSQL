
let submitbtn = document.getElementById('submit');

submitbtn.addEventListener('click', loginUser);

async function loginUser(e) {
    try {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const loginDetails = {
        email,
        password
    }

    const response = await axios.post(`http://localhost:3000/user/login-user`,loginDetails)
        alert(response.data.message)
        console.log(response.data);
        localStorage.setItem('token', response.data.token)
        window.location.href = `../Expense Table/ExpenseTracker.html`;
    }catch(err) {
        document.body.innerHTML += `<div style = "color:red;">${err.message} </div>`
    }
}

