
import PlaceList from '../components/PlaceList';
import { useEffect, useState } from 'react';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { useParams } from 'react-router-dom';

// const DUMMY_PLACES = [
//   {
//     id: 'p1',
//     title: 'Empire State Building',
//     description: 'One of the most famous sky scrapers in the world!',
//     imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg',
//     address: '20 W 34th St, New York, NY 10001',
//     location: {
//       lat: 40.7484405,
//       lng: -73.9878584
//     },
//     creator: 'u1'
//   }
// ];


const UserPlaces = () => {
  const [loadedPlaces, setLoadedPlaces] = useState();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  
  const userId = useParams().userId;
    
  useEffect(() => {
    const fetchPlaces = async () => {
      // Es importante agregar headers en un post request, si no se especifica el content type el backend no sabrá que tipo de información se 
      // esta mandando, en este caso sería json

      try {
        const responseData = await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/places/user/${userId}`);
        
        setLoadedPlaces(responseData.places);
    
      } catch (err) {
        console.log(err)
      }
    }
    fetchPlaces();
    
  }, [sendRequest, userId]);

  const placeDeleteHandler = deletedPlaceId => {
    setLoadedPlaces(prevPlaces => prevPlaces.filter(place => place.id !== deletedPlaceId));
  }

  return (
    <>
    <ErrorModal error={error} onClear={clearError}/>
    {isLoading && (
      <div className='center'>
        <LoadingSpinner />
      </div>
    )}
    { !isLoading && loadedPlaces && <PlaceList items={loadedPlaces} onDeletePlace={placeDeleteHandler} /> }
    </>
  )
};

export default UserPlaces;