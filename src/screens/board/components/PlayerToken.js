import React from 'react';
import './styles/PlayerToken.css';

function PlayerToken({ player }) {
    return (
        <div
            className="PlayerToken"
            style={{
                backgroundColor: player.color,
                borderColor: player.color === 'yellow' ? 'black' : 'white',
            }}
        ></div>
    );
}

export default PlayerToken;
