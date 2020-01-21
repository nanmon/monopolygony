import React from 'react';
import PlayerToken from '../PlayerToken';
import { properties } from '../../services/board.json';

function PlayerInfo({ state }) {
    const playerIndex = state.selected.index;
    const player = state.players[playerIndex];
    const owned = state.properties
        .filter(p => p.ownedBy === playerIndex)
        .map(p => {
            const property = properties.find(pp => p.id === pp.id);
            return property;
        });
    let assets = 0;
    owned.forEach(p => (assets += p.price));
    return (
        <div className="PlayerInfo">
            <p>Player</p>
            <PlayerToken player={player} />
            <p>Money: ${player.money}</p>
            <p>Assets: ${assets}</p>
        </div>
    );
}

export default PlayerInfo;
