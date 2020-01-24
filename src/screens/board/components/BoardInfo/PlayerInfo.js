import React from 'react';
import PlayerToken from '../PlayerToken';
import { userAssetsValue } from '../../services/util';

function PlayerInfo({ state }) {
    const playerIndex = state.selected.index;
    const player = state.players[playerIndex];
    const assets = userAssetsValue(state, playerIndex);
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
