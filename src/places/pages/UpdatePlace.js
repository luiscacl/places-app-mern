import React, { useEffect, useState, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH
} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import classes from './PlaceForm.module.css';

// const DUMMY_PLACES = [
//   {
//     id: 'p1',
//     title: 'Empire State Building',
//     description: 'One of the most famous sky scrapers in the world!',
//     imageUrl:
//       'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg',
//     address: '20 W 34th St, New York, NY 10001',
//     location: {
//       lat: 40.7484405,
//       lng: -73.9878584
//     },
//     creator: 'u1'
//   }
// ];

const UpdatePlace = () => {
  const auth = useContext(AuthContext);
  const [loadedPlace, setLoadedPlace] = useState();
  const placeId = useParams().placeId;
  const history = useHistory();

  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  
  const [formState, inputHandler, setFormData] = useForm({
    title: {
        value: '',
        isValid: false
    },
    description: {
        value: '',
        isValid: false
    }
  }, false);

  useEffect(() => {
    const fetchPlaces = async () => {
      const responseData = await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/places/${placeId}`);
      setLoadedPlace(responseData.place);

      setFormData({
        title: {
          value: responseData.place.title,
          isValid: true
      },
      description: {
        value: responseData.place.description,
        isValid: true
      }
      }, true);
    }
    fetchPlaces();

  }, [sendRequest, setFormData, placeId]);


  const placeUpdateSubmitHandler = async event => {
    event.preventDefault();

    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/places/${placeId}`, 
        'PATCH',
        JSON.stringify({
          title: formState.inputs.title.value,
          description: formState.inputs.description.value
        }),
        {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + auth.token // Tenemos que agregar el string Bearer para identificar este tipo de autorizacion
        }
      );
      history.push(`/${auth.userId}/places`);

    } catch (err) {
      console.log(err);
    }
  }

  if(isLoading){
    return (
      <div className={classes.center}>
        <LoadingSpinner />
      </div>
    );
  }

  if(!loadedPlace && !error) {
    return (
      <div className='center'>
        <Card>
          <h2>Could not find this place</h2>
        </Card>
      </div>
    );
  }

  return (
    <>
      <ErrorModal error={error} onClear={clearError}/>
      {!isLoading && loadedPlace && (
      <form className={classes['place-form']} onSubmit={placeUpdateSubmitHandler}>
        <Input
          id="title"
          element="input"
          type="text"
          label="Title"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid title."
          onInput={inputHandler}
          initialValue={loadedPlace.title}
          initialValid={true}
        />
        <Input
          id="description"
          element="textarea"
          label="Description"
          validators={[VALIDATOR_MINLENGTH(5)]}
          errorText="Please enter a valid description (min. 5 characters)."
          onInput={inputHandler}
          initialValue={loadedPlace.description}
          initialValid={true}
        />
        <Button type="submit" disabled={!formState.isValid}>
          UPDATE PLACE
        </Button>
      </form>)}
    </>
  );
};

export default UpdatePlace;
