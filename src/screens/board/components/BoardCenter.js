import React from 'react';
import { getOwner, isBuyable } from '../services/util';
import { tiles } from '../services/board.json';
import PlayerToken from './PlayerToken';

function BoardCenter({ state, onNext }) {
    const currentPlayer = state.players[state.turn];
    function next() {
        if (state.phase === 'roll') {
            const dice1 = Math.ceil(Math.random() * 6);
            const dice2 = Math.ceil(Math.random() * 6);
            onNext({ dice1, dice2 });
        } else {
            onNext();
        }
    }
    return (
        <div className="BoardCenter center">
            <button onClick={next}>{getNextText(state)}</button>
            {state.phase === 'tileEffect' && isBuyable(state) && (
                <button onClick={() => onNext({ buy: true })}>
                    Buy property
                </button>
            )}
            <div className="turn">
                <span>Turn:</span>
                <PlayerToken player={currentPlayer} />
            </div>
            <span>${currentPlayer.money}</span>
            {state.phase !== 'roll' && (
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
        return 'Roll dices';
    } else if (state.phase === 'tileEffect') {
        const owner = getOwner(state);
        if (owner !== -1 && owner !== state.turn) return 'Pay rent';
        if (tile.type === 'gotojail') return 'Go to jail';
        if (tile.type === 'tax') return 'Pay tax';
        return 'Continue';
    } else if (state.phase === 'payFine') {
        return 'Pay $50 fine';
    }
    return 'Continue';
}
