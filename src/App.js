import React from 'react';
import firebase from 'firebase';
import 'firebase/auth';
import 'firebase/firestore';
import Router from './components/Router';
import './App.scss';
const API_KEYS = require('./firekeys.json');

firebase.initializeApp(API_KEYS);

function App() {
    return (
        <div className="App">
            <Router />
        </div>
    );
}

export default App;
