import React from 'react';
import './styles/FreeParkingHut.css';

function FreeParkingHut({ children }) {
    return (
        <div className="FreeParkingHut">
            <span>Free Parking</span>
            <div className="Tokens">{children}</div>
        </div>
    );
}

export default FreeParkingHut;
