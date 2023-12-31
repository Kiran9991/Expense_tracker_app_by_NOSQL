let submitbtn = document.getElementById('submit');

submitbtn.addEventListener('click', storeData);

async function storeData (e) {
    try {
    e.preventDefault();
    
    let name = document.getElementById('username').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;

    let signupDetails = {
        name,
        email,
        password
    }

    const response = await axios.post('http://localhost:3000/user/signup', signupDetails)
    console.log(response)
    if(response.status === 201) {
        window.location.href = "../Login/login.html";
    } else {
        throw new Error('Failed to login');
    }
    alert(response.data.message);
    }catch(err) {
        document.body.innerHTML += `<div style = "color:red;">${err.response.data.message} </div>`
        console.log(err)
    }
}