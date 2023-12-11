import React, { Suspense } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch
} from 'react-router-dom';

// import Users from './user/pages/Users';
// import NewPlace from './places/pages/NewPlace';
// import MainNavigation from './shared/components/Navigation/MainNavigation';
// import UpdatePlace from './places/pages/UpdatePlace';
// import UserPlaces from './places/pages/UserPlaces';
import Auth from './user/pages/Auth';
import { AuthContext } from './shared/context/auth-context';
import { useAuth } from './shared/hooks/auth-hook';
import LoadingSpinner from './shared/components/UIElements/LoadingSpinner';

// Lazy nos ayuda a que los componentes importados solo se rendericen cuando sea necesario, optimizando más la página web
const Users = React.lazy(() => import('./user/pages/Users'));
const NewPlace = React.lazy(() => import('./places/pages/NewPlace'));
const MainNavigation = React.lazy(() => import('./shared/components/Navigation/MainNavigation'));
const UpdatePlace = React.lazy(() => import('./places/pages/UpdatePlace'));
const UserPlaces = React.lazy(() => import('./places/pages/UserPlaces'));

const App = () => {
  const { token, login, logout, userId } = useAuth();

  let routes;

  if(token){
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/:userId/places" exact>
          <UserPlaces/>
        </Route>
        <Route path="/places/new" exact>
          <NewPlace />
        </Route>
        <Route path="/places/:placeId">
          <UpdatePlace />
        </Route>
        <Redirect to="/" />
      </Switch>
    );
  } else {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/:userId/places" exact>
          <UserPlaces/>
        </Route>
        <Route path="/auth">
          <Auth />
        </Route>
        <Redirect to="/auth" />
      </Switch>
    );
  }

  return (
    <AuthContext.Provider
      value={{ 
        isLoggedIn: !!token, 
        token: token,
        userId: userId, 
        login: login, 
        logout: logout 
      }}
    >
      {/* Suspense es necesario en el router para que react.lazy funcione, este nos ayuda a solo cargar ciertos routes solo si es necesario
      cuando el usuario le da click a cierto link */}
      <Suspense
        fallback={
          <div className="center">
            <LoadingSpinner/>
          </div>
        }
      >
        <Router>
          <MainNavigation/>
          <main>
              {routes}
          </main>
        </Router>
      </Suspense>
    </AuthContext.Provider>
  );
};

export default App;
