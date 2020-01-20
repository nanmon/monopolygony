import React from 'react';
import PlayerToken from './PlayerToken';

function BoardInfo({ state }) {
    const { type, index } = state.selected;
    if (type === 'player') {
        const player = state.players[index];
        return (
            <div className="BoardInfo">
                <p>Player</p>
                <PlayerToken player={player} />
                <p>${player.money}</p>
            </div>
        );
    }
}

export default BoardInfo;
