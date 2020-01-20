import React from 'react';
import './styles/PlayerToken.css';

function PlayerToken({ player }) {
    return (
        <div
            className="PlayerToken"
            style={{ backgroundColor: player.color }}
        ></div>
    );
}

export default PlayerToken;
