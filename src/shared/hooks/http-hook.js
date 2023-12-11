import { useState, useCallback, useRef, useEffect } from 'react';

export const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  // Si hacemos una petición (por ejemplo al hacer login) y antes de que tengamos una respuesta cambiamos de página (por ejemplo que rápido nos
  // cambiemos a la página de all users) obtendremos un error porque estamos intentando actualizar nuestro state en un componente que ya no 
  // está en la pantalla, si sucede este caso lo mejor es cancelar nuestra petición. Con useRef You can store information between re-renders (
    // unlike regular variables, which reset on every render). 
  const activeHttpRequests = useRef([]);

  // Se usa useCallback para que esta función no se vuelva a ejecutar cuando el componente que usa este hook se vuelva a renderizar
  const sendRequest = useCallback(
    async (url, method = 'GET', body = null, headers = {}) => {
      setIsLoading(true);

      // El AbortController es una api soportado por el navegador. It's typically used to cancel ongoing fetch requests. 
      const httpAbortCtrl = new AbortController();
      activeHttpRequests.current.push(httpAbortCtrl);

      try {
        const response = await fetch(url, {
          method,
          body,
          headers,
          signal: httpAbortCtrl.signal
        });

        // Para obtener la informacion del body de la respuesta usamos el método json en response
        const responseData = await response.json();

        activeHttpRequests.current = activeHttpRequests.current.filter(
          reqCtrl => reqCtrl !== httpAbortCtrl
        );

        // En el backend programamos casos que pueden suceder para arrojar un error (Por ejemplo cuando se intenta crear un usuario que ya 
        // existe) Estos errores tecnicamente no son tratados como errores en este bloque try catch, ya que cumplen con su función de mandar
        // una petición y obtener una respuesta. Es por eso que se debe de ver que tipo de respuesta es mandada, ya que en el backend 
        // también existe validación y a veces esta puede tener un error o no. Después de que analizamos la respuesta con json(), tenemos que
        // verificar si la respuesta no tiene errores con la propiedad response.ok. NOTA: Nosotros programamos los errores, colocando el
        // status del error (si era 400, 402, etc) y siempre mandando un objeto message de lo que ocurrio
        if (!response.ok) {
          // Accedemos a message, la propiedad que agregamos en todos los errores programados. Como arrojamos un error todo el siguiente 
          // codigo de try se dejará de ejecutar y se ejecutará el bloque catch. De esta forma ya no nos rederijiremos de página al ejecutar
          // auth.login
          throw new Error(responseData.message);
        }

        setIsLoading(false);
        return responseData;

      } catch (err) {
        setError(err.message);
        setIsLoading(false);
        throw err;
      }
    },
    []
  );

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    // Why did we return a function from our effect? This is the optional cleanup mechanism for effects. Every effect may return a function 
    // that cleans up after it. This lets us keep the logic for adding and removing subscriptions close to each other. They’re part of the 
    // same effect!

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      activeHttpRequests.current.forEach(abortCtrl => abortCtrl.abort());
    };
  }, []);

  return { isLoading, error, sendRequest, clearError };
};
