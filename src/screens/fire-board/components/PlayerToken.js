import React from 'react';
import './styles/PlayerToken.css';

/**
 * @param {object} props
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Player>} props.player
 */

function PlayerToken({ player, onClick }) {
    if (onClick) {
        return (
            <button
                className="PlayerToken"
                onClick={onClick}
                style={{
                    backgroundColor: player.data().color,
                    borderColor:
                        player.data().color === 'yellow' ? 'black' : 'white',
                }}
            ></button>
        );
    }
    return (
        <div
            className="PlayerToken"
            style={{
                backgroundColor: player.data().color,
                borderColor:
                    player.data().color === 'yellow' ? 'black' : 'white',
            }}
        ></div>
    );
}

export default PlayerToken;
