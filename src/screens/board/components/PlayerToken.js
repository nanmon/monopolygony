import React from 'react';
import './styles/PlayerToken.css';

function PlayerToken({ player, onClick }) {
    return (
        <button
            className="PlayerToken"
            style={{
                backgroundColor: player.color,
                borderColor: player.color === 'yellow' ? 'black' : 'white',
            }}
            onClick={e => {
                e.stopPropagation();
                if (onClick) onClick();
            }}
        ></button>
    );
}

export default PlayerToken;
