//server listening
app.listen(8000, () => {
  console.log('Server is running at port 8000');
});

//Validate inputs

var username = document.forms['form']['username'];
var password = document.forms['form']['password'];

var username_error = document.getElementById('username_error');
var password_error = document.getElementById('password_error');

username.addEventListener('textInput', username_Verify);
password.addEventListener('textInput', password_Verify);

function validated(){
    if (username.value.length == 0){
        username.style.border ="1px solid red";
        username_error.style.display = "block";
        username.focus();
        return false;
    }
    if (password.value.length == 0){
        password.style.border ="1px solid red";
        password_error.style.display = "block";
        password.focus();
        return false;
    } 
}

function username_Verify(){
    if (username.value.length >=1){
        username.style.border = "1px solid silver";
        username_error.style.display = "none";
        return true;
    }
}

function password_Verify(){
    if (password.value.length >=1){
        password.style.border = "1px solid silver";
        password_error.style.display = "none";
        return true;
    }
}