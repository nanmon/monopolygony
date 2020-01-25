import React from 'react';
import {
    getOwner,
    isBuyable,
    isMiscTile,
    canBuyProperty,
} from '../services/util';
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
            {state.phase === 'tileEffect' && canBuyProperty(state) && (
                <button onClick={() => onNext({ buy: true })}>
                    Buy property
                </button>
            )}
            <button onClick={next}>{getNextText(state)}</button>
            <div className="turn">
                <span>Turn:</span>
                <PlayerToken player={currentPlayer} />
            </div>
            <span>${currentPlayer.money}</span>
            {state.phase !== 'roll' && (
                <div className="dices">
                    <span>Dices:</span>|{state.lastDices[0]}|
                    {state.lastDices[1]}|
                    {state.lastDices[0] === state.lastDices[1] && 'Doubles!'}
                </div>
            )}
        </div>
    );
}

export default BoardCenter;

function getNextText(state) {
    const player = state.players[state.turn];
    const tile = tiles[player.position];
    switch (state.phase) {
        case 'roll':
            return 'Roll dices';
        case 'payFine':
            return 'Pay fine';
        case 'advance': {
            if (player.frozenTurns <= 0) {
                // not jailed
                if (state.doublesCount === 3) return 'Go to jail';
                return 'Advance';
            } else {
                if (state.lastDices[0] === state.lastDices[1])
                    return 'Doubles! Got out of jail!';
                return 'Advance';
            }
        }
        case 'tileEffect': {
            if (isMiscTile(state)) {
                if (tile.type === 'tax') return 'Pay tax';
                if (tile.type === 'gotojail') return 'Go to jail';
                return endText(state, player);
            }
            if (isBuyable(state)) {
                return 'Not buy';
            }
            const owner = getOwner(state);
            if (owner !== -1 && owner !== state.turn) {
                return 'Pay rent';
            }
            return endText(state, player);
        }
        case 'end': {
            return endText(state, player);
        }
        default:
            break;
    }
    return 'Continue';
}

function endText(state, player) {
    if (state.doublesCount > 0 && state.doublesCount < 3) {
        return 'Roll again!';
    }
    if (player.frozenTurns > 1) {
        return 'Stay in jail';
    }
    return 'Next player';
}
