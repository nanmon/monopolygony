import React from 'react';
import { getOwner, isBuyable } from '../services/util';
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
    if (state.phase === 'roll') return 'Roll dices';
    else if (state.phase === 'end') {
        const owner = getOwner(state);
        if (owner !== -1 && owner !== state.turn) return 'Pay rent';
        else return 'Continue';
    }
}
