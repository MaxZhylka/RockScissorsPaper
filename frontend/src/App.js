import React from 'react';
import { BrowserRouter as Router,Route, Routes, Navigate } from 'react-router-dom';
import AuthPage from './pages/auth-page/auth-page';
import { Helmet } from 'react-helmet';
import './App.css'
import Menu from './pages/main-menu/menu';
import {useSelector } from 'react-redux';
import Loader from './components/loader/loader';
import Profile from './pages/profile/profile';
import ProtectedRoute from './components/protected-route/prtoected-route';
import GamePage from './pages/game-page/game-page';
import Tournament from './pages/tournament/tournament';
import Tournaments from './pages/tournaments/tournaments';


function App() {

  


  const isLoading = useSelector((state)=> state.auth.isLoading);
  if(isLoading)
  {
    return (<Loader/>);
  }
  return (
    <Router>
    <div className="App">
      <Helmet> 
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>
                  <Routes>
                  <Route path="/" element={<Navigate to="/menu" />} />
                  <Route exact path="/login" element={<AuthPage />}  />
                  <Route path="/registration" element={<AuthPage />} />
                        <Route path="/menu" element={<ProtectedRoute><Menu/></ProtectedRoute>} />
                        <Route path="/profile" element={ <ProtectedRoute><Profile/></ProtectedRoute>}></Route>
                        <Route path="/game/:gameId" element={<ProtectedRoute><GamePage></GamePage></ProtectedRoute>}></Route>
                        <Route path="/tournament/:tournamentId" element={<ProtectedRoute><Tournament></Tournament></ProtectedRoute>}></Route>
                        <Route path="/tournaments" element={<ProtectedRoute><Tournaments></Tournaments></ProtectedRoute>}></Route>
                  </Routes>
    </div>
    </Router>
  );
}

export default App;
