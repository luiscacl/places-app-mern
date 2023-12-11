import React from "react";
import { useState, useContext } from "react";
import classes from './Auth.module.css';
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import Card from "../../shared/components/UIElements/Card";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";
import { VALIDATOR_EMAIL, VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from "../../shared/util/validators";
import { useForm } from "../../shared/hooks/form-hook";
import { AuthContext } from "../../shared/context/auth-context";
import { useHttpClient } from "../../shared/hooks/http-hook";

const Auth = () => {
  const auth = useContext(AuthContext);
  const [isLoginMode, setIsLoginMode] = useState(true);

  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const [formState, inputHandler, setFormData] = useForm({
    email: {
      value: '',
      isValid: false
    },
    password: {
      value: '',
      isValid: false
    },
  }, false);

  const switchModeHandler = () => {
    if(!isLoginMode){
      setFormData(
        {
          ...formState.inputs,
          name: undefined,
          image: undefined
        },
        formState.inputs.email.isValid && formState.inputs.password.isValid
      );
    } else {
      setFormData(
        {
          ...formState.inputs,
          name: {
            value: '',
            isValid: false
          },
          image: {
            value: null,
            isValid: false
          }
        }, 
        false
      )
    }

    setIsLoginMode(prevMode => !prevMode);
  }

  const authSubmitHandler = async (event) => {
    event.preventDefault();
    console.log(formState.inputs);

    if(isLoginMode){
      // Es importante agregar headers en un post request, si no se especifica el content type el backend no sabrá que tipo de información se 
      // esta mandando, en este caso sería json
      try {
        const responseData = await sendRequest(
          process.env.REACT_APP_BACKEND_URL + '/users/login', 
          'POST', 
          JSON.stringify({
            email: formState.inputs.email.value,
            password: formState.inputs.password.value
          }),
          {
            'Content-Type': 'application/json'
          }
        );
        auth.login(responseData.userId, responseData.token);

      } catch (err) {}

      
    } else {
      try {
        // FormData es una api del browser que nos permite eviar binary data al backend en vez de solo json
        const formData = new FormData();
        formData.append('email', formState.inputs.email.value);
        formData.append('name', formState.inputs.name.value);
        formData.append('password', formState.inputs.password.value);
        formData.append('image', formState.inputs.image.value);

        const responseData = await sendRequest(
          process.env.REACT_APP_BACKEND_URL + '/users/signup',
          'POST', 
          // JSON.stringify({
          //   name: formState.inputs.name.value,
          //   email: formState.inputs.email.value,
          //   password: formState.inputs.password.value
          // }),
          // {
          //   'Content-Type': 'application/json'
          // }
          formData
        );

        auth.login(responseData.userId, responseData.token);

      } catch (err) {}
      
    }
  }

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError}/>
      <Card className={classes.authentication}>
        {isLoading && <LoadingSpinner asOverlay/>}
        <h2>Login Required</h2>
        <hr />
        <form className={classes["place-form"]} onSubmit={authSubmitHandler}>
          {!isLoginMode && (
            <Input 
              id="name"
              element="input" 
              type="text" 
              label="Your Name" 
              validators={[VALIDATOR_REQUIRE()]} 
              errorText="Please enter a valid name"
              onInput={inputHandler}
            />
          )}
          {!isLoginMode && (
            <ImageUpload 
              center 
              id="image" 
              onInput={inputHandler} 
              errorText="Please provide an image."
            />
          )}
          <Input 
            id="email"
            element="input" 
            type="text" 
            label="Email" 
            validators={[VALIDATOR_EMAIL()]} 
            errorText="Please enter a valid email"
            onInput={inputHandler}
          />
          <Input 
            id="password"
            element="input" 
            label="Password" 
            validators={[VALIDATOR_MINLENGTH(6)]} 
            errorText="Please enter a valid password."
            onInput={inputHandler}
          />
          <Button type="submit" disabled={!formState.isValid}>
            {isLoginMode ? 'LOGIN' : 'SIGNUP'}
          </Button>
        </form>
        <Button inverse  onClick={switchModeHandler}>
            SWITCH TO {isLoginMode ? 'SIGNUP' : 'LOGIN'}
        </Button>
      </Card>
    </React.Fragment>
  );
}

export default Auth;