export const validator = (data) => {
    const error = [];
    const fields = Object.keys(data);

    console.log(data)

    /* ------CHECK IF VALUE IS EMPTY---------*/

   fields.forEach(field => {    
        if(data[field].value.trim().length < 1){
                error.push(`${field} is required`)
        }
    })

    if(error.length > 0){
        return error
    }


    /*-------CHECK IF EMAIL IS VALID--------*/
    let emailIsValid = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(data.email.value.trim())
      if(!emailIsValid){
        error.push('Please, enter a valid email')
      }


      /*----CHECK FIRST NAME AND LAST NAME LLENGTH------*/ 

      if(fields.includes('firstName')){
          if(data.firstName.value.trim().length < 3){
              error.push('Firstname should be at least 3 characters long')
          }
      }

     if(fields.includes('lastName')){
        if(data.lastName.value.trim().length < 3){
            error.push('Lastname should be at least 3 characters long')
        }
    }


    /*------CHECK PASSWORD LENGTH-----*/



    if(fields.includes('password') && data.password.value.trim().length < 5) {
        error.push('Password should be at least 5 characters long')
    }

    /*----CHECK IF TWO PASSWORDS ARE EQUAL-----*/
    if(fields.includes('confirm_password')){
        if(data.password.value.trim() !== data.confirm_password.value.trim()){
            error.push('Please enter the same password')
        }
    }

    return error
    
}