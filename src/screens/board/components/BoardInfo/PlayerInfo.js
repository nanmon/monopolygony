import React from 'react';
import PlayerCard from '../PlayerCard';
import './styles/PlayerInfo.css';
import { tiles } from '../../services/board.json';
import {
    isMiscTile,
    isBuyable,
    getOwner,
    canBuyProperty,
    canProcede,
    isGameOver,
} from '../../services/util';

function PlayerInfo({ state, onNext }) {
    function next() {
        if (state.phase === 'roll') {
            const dice1 = Math.ceil(Math.random() * 6);
            const dice2 = Math.ceil(Math.random() * 6);
            onNext({ dice1, dice2 });
        } else {
            onNext({ buy: true });
        }
    }
    return (
        <div className="PlayerInfo">
            <div className="Actions">
                <button
                    className="ActionButton"
                    disabled={!canProcede(state)}
                    onClick={next}
                >
                    {getNextText(state)}
                </button>
                {state.phase === 'tileEffect' && canBuyProperty(state) && (
                    <button className="ActionButton" onClick={() => onNext()}>
                        Skip
                    </button>
                )}
            </div>
            <div className="Players">
                {state.players.map((_, i) => (
                    <PlayerCard key={i} state={state} playerIndex={i} />
                ))}
            </div>
        </div>
    );
}

export default PlayerInfo;

function getNextText(state) {
    if (isGameOver(state)) return 'Game over';
    if (!canProcede(state)) return 'Pay your debt to continue';
    const player = state.players[state.turn];
    const tile = tiles[player.position];
    switch (state.phase) {
        case 'roll':
            return 'Roll die';
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
                return 'Buy property';
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
