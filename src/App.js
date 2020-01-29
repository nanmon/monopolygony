import React from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import './App.scss';
import Router from './components/Router';

function App() {
    return (
        <div className="App">
            <Router />
        </div>
    );
}

export default App;
