import React from 'react';
import PlayerToken from '../PlayerToken';
import { properties } from '../../services/board.json';

function PlayerInfo({ state }) {
    const playerIndex = state.selected.index;
    const player = state.players[playerIndex];
    const owned = state.properties
        .filter(p => p.ownedBy === playerIndex)
        .map(ownership => {
            const property = properties.find(pp => ownership.id === pp.id);
            return { ...property, ownership };
        });
    let assets = 0;
    owned.forEach(p => {
        if (p.ownership.mortgaged) assets += p.price / 2;
        else assets += p.price;
        if (p.housecost) assets += p.ownership.houses * p.housecost;
    });
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
