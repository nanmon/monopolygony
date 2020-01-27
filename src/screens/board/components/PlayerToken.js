import React from 'react';
import './styles/PlayerToken.css';

function PlayerToken({ player, onClick }) {
    if (onClick) {
        return (
            <button
                className="PlayerToken"
                onClick={onClick}
                style={{
                    backgroundColor: player.color,
                    borderColor: player.color === 'yellow' ? 'black' : 'white',
                }}
            ></button>
        );
    }
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
