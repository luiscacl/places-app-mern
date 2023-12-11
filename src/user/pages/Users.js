import React, { Suspense } from 'react';
import UsersList from '../components/UsersList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useState, useEffect } from 'react';
import { useHttpClient } from '../../shared/hooks/http-hook';

// const USERS = [
//   {
//     id: 'u1',
//     image: 'https://miro.medium.com/v2/resize:fit:1400/1*YMJDp-kqus7i-ktWtksNjg.jpeg',
//     name: 'img1',
//     places: 3
//   }
// ];

const Users = () => {
  const [loadedUsers, setLoadedUsers] = useState();

  const { isLoading, error, sendRequest, clearError } = useHttpClient();


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const responseData = await sendRequest(process.env.REACT_APP_BACKEND_URL + '/users');
  
        // Nosotros mandamos en la respuesta un objeto con la propiedad users donde se encuentran todos los usuarios de la base de datos
        setLoadedUsers(responseData.users);
  
      } catch (err) {console.log(err)}
    }

    fetchUsers()
  }, [sendRequest]);

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className='center'>
          <LoadingSpinner/>
        </div>
      )}
      {!isLoading && loadedUsers && <UsersList items={loadedUsers}/>}
    </>
  );
};

export default Users;
