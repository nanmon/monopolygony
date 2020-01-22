import React from 'react';
import { getOwner, isBuyable } from '../services/util';
import { tiles } from '../services/board.json';
import PlayerToken from './PlayerToken';

function BoardCenter({ state, onNext }) {
    const currentPlayer = state.players[state.turn];
    return (
        <div className="BoardCenter center">
            <button onClick={() => onNext()}>{getNextText(state)}</button>
            {state.phase === 'end' && isBuyable(state) && (
                <button onClick={() => onNext({ buy: true })}>
                    Buy property
                </button>
            )}
            <div className="turn">
                <span>Turn:</span>
                <PlayerToken player={currentPlayer} />
            </div>
            <span>${currentPlayer.money}</span>
            {state.phase === 'end' && (
                <div className="dices">
                    <span>Dices:</span>|{state.lastDices[0]}|
                    {state.lastDices[1]}|
                </div>
            )}
        </div>
    );
}

export default BoardCenter;

function getNextText(state) {
    const player = state.players[state.turn];
    const tile = tiles[player.position];
    if (state.phase === 'roll') {
        if (player.frozenTurns === 0) return 'Pay $50 fine and roll dices';
        return 'Roll dices';
    } else if (state.phase === 'end') {
        const owner = getOwner(state);
        if (owner !== -1 && owner !== state.turn) return 'Pay rent';
        if (player.frozenTurns >= 0) return 'Stay in jail';
        if (tile.type === 'gotojail') return 'Go to jail';
        if (tile.type === 'tax') return 'Pay tax';
        return 'Continue';
    }
}
