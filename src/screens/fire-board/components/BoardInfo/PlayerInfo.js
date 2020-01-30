import React from 'react';
import PlayerCard from '../PlayerCard';
import './styles/PlayerInfo.css';
import {
    isMiscTile,
    isBuyable,
    canBuyProperty,
    canProcede,
    isGameOver,
    isBankrupt,
    getPlayerInTurn,
    getPlayerTile,
} from '../../services/util';

/**
 * @param {object} props
 * @param {Monopolygony.BoardBundle} props.state
 */

function PlayerInfo({
    isMaster,
    state,
    onNext,
    onAddPlayer,
    onBankrupt,
    onRemovePlayer,
}) {
    const player = getPlayerInTurn(state);
    const tile = getPlayerTile(state, player);
    function next() {
        if (isBankrupt(state, player)) {
            onBankrupt({ playerId: player.id });
        } else if (state.game.data().phase === 'roll') {
            const dice1 = Math.ceil(Math.random() * 6);
            const dice2 = Math.ceil(Math.random() * 6);
            onNext({ dice1, dice2 });
        } else {
            onNext({ buy: true });
        }
    }
    return (
        <div className="PlayerInfo">
            {isMaster && (
                <div className="Actions">
                    <button
                        className="ActionButton"
                        disabled={!canProcede(state)}
                        onClick={next}
                    >
                        {getNextText(state)}
                    </button>
                    {state.game.data().phase === 'tileEffect' &&
                        canBuyProperty(state, tile, player) && (
                            <button
                                className="ActionButton"
                                onClick={() => onNext()}
                            >
                                Skip
                            </button>
                        )}
                </div>
            )}
            <div className="Players">
                {state.players.docs.map(player => (
                    <PlayerCard key={player.id} state={state} player={player} />
                ))}
                {!state.game.data().started && isMaster && (
                    <div className="Actions">
                        <button className="ActionButton" onClick={onAddPlayer}>
                            +
                        </button>
                        <button
                            className="ActionButton"
                            onClick={onRemovePlayer}
                        >
                            -
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PlayerInfo;

/**
 * @param {Monopolygony.BoardBundle} state
 */
function getNextText(state) {
    const player = getPlayerInTurn(state);
    if (!state.game.data().started) return 'Start game';
    if (isGameOver(state)) return 'Game over';
    if (!canProcede(state)) return 'Pay your debt to continue';
    if (isBankrupt(state, player)) return 'Bankrupt :c';
    const tile = getPlayerTile(state, player);
    switch (state.game.data().phase) {
        case 'roll':
            return 'Roll die';
        case 'payFine':
            return 'Pay fine';
        case 'advance': {
            if (player.data().frozenTurns <= 0) {
                // not jailed
                if (state.game.data().doublesCount === 3) return 'Go to jail';
                return 'Advance';
            } else {
                if (
                    state.game.data().lastDices[0] ===
                    state.game.data().lastDices[1]
                )
                    return 'Doubles! Got out of jail!';
                return 'Advance';
            }
        }
        case 'tileEffect': {
            if (isMiscTile(tile)) {
                if (tile.type === 'tax') return 'Pay tax';
                if (tile.type === 'gotojail') return 'Go to jail';
                return endText(state, player);
            }
            if (isBuyable(state, tile)) {
                if (canBuyProperty(state, tile, player)) return 'Buy property';
                return "Can't afford it! Skip";
            }
            if (tile.data().owner !== player.id) {
                if (tile.data().mortgaged) return endText(state, player);
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

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Player>} player
 */
function endText(state, player) {
    if (
        state.game.data().doublesCount > 0 &&
        state.game.data().doublesCount < 3
    ) {
        if (player.data().sentToJail) return 'Next player';
        return 'Roll again!';
    }
    if (player.data().frozenTurns > 1) {
        return 'Stay in jail';
    }
    return 'Next player';
}
