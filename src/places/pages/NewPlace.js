import React, { Suspense, useContext } from 'react';
import { useHistory } from 'react-router-dom';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';
import { VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from '../../shared/util/validators';
import { useCallback, useReducer } from 'react';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import classes from './PlaceForm.module.css';



const NewPlace = () => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const [formState, inputHandler] = useForm({
    title: {
      value: '',
      isValid: false
    },
    description: {
      value: '',
      isValid: false
    },
    address: {
      value: '',
      isValid: false
    },
    image: {
      value: null,
      isValid: false
    }
  }, false);

  const history = useHistory();

  const placeSubmitHandler = async (event) => {
    event.preventDefault();
    // Es importante agregar headers en un post request, si no se especifica el content type el backend no sabrá que tipo de información se 
    // esta mandando, en este caso sería json
    try {
      const formData = new FormData();
      formData.append('title', formState.inputs.title.value);
      formData.append('description', formState.inputs.description.value);
      formData.append('address', formState.inputs.address.value);
      formData.append('image', formState.inputs.image.value);

      await sendRequest(
        process.env.REACT_APP_BACKEND_URL + '/places',
        'POST',
        // JSON.stringify({
        //   title: formState.inputs.title.value,
        //   description: formState.inputs.description.value,
        //   address: formState.inputs.address.value,
        //   creator: auth.userId
        // }),
        // {
        //   'Content-Type': 'application/json'
        // }
        formData,
        {         
          Authorization: 'Bearer ' + auth.token // Tenemos que agregar el string Bearer para identificar este tipo de autorizacion
        }
      );
      history.push('/');

    } catch (err) {
      console.log(err)
    }
  }

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      <form className={classes["place-form"]} onSubmit={placeSubmitHandler}>
        {isLoading && <LoadingSpinner asOverlay />}
        <Input 
          id="title"
          element="input" 
          type="text" 
          label="Title" 
          validators={[VALIDATOR_REQUIRE()]} 
          errorText="Please enter a valid title"
          onInput={inputHandler}
        />
        <Input 
          id="description"
          element="textarea" 
          label="Description" 
          validators={[VALIDATOR_MINLENGTH(5)]} 
          errorText="Please enter a valid description (At least 5 characters)."
          onInput={inputHandler}
        />
        <Input 
          id="address"
          element="input" 
          label="Address" 
          validators={[VALIDATOR_REQUIRE()]} 
          errorText="Please enter a valid address"
          onInput={inputHandler}
        />
        <ImageUpload 
          center
          id="image"
          onInput={inputHandler}
          errorText="Please provide an image."
        />
        <Button type="submit" disabled={!formState.isValid}>
          ADD PLACE
        </Button>
      </form>
    </>
  );
};

export default NewPlace;
