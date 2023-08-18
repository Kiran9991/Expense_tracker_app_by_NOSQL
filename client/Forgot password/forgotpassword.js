function forgotpassword(e) {
    e.preventDefault(e);
    const email = document.getElementById('emailId').value;
    
    const userDetails = {
        email
    }
   
    axios.post('http://localhost:3000/password/forgotpassword',userDetails).then(response => {
        if(response.status === 202){
            document.body.innerHTML += '<div style="color:red;">Mail Successfuly sent <div>'
        } else {
            throw new Error('Something went wrong!!!')
        }
    }).catch(err => {
        document.body.innerHTML += `<div style="color:red;">${err} <div>`;
    })
}