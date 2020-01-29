import React from 'react';
import './styles/BoardCenter.css';
import PlayerToken from './PlayerToken';
import { getPlayerInTurn } from '../services/util';

/**
 * @param {object} props
 * @param {Monopolygony.BoardBundle} props.state
 */
function BoardCenter({ state }) {
    const player = getPlayerInTurn(state);
    return (
        <div className="BoardCenter center">
            {state.game.data().started && (
                <>
                    <div className="Turn">
                        <span>
                            {player.data().money < 0 ? 'In Debt!' : 'Turn:'}
                        </span>
                        <PlayerToken player={player} />
                        <span>${player.data().money}</span>
                    </div>
                    {state.game.data().phase !== 'roll' && (
                        <>
                            <div className="Die">
                                <span className="Dice">
                                    {state.game.data().lastDices[0]}
                                </span>
                                <span className="Dice">
                                    {state.game.data().lastDices[1]}
                                </span>
                            </div>

                            {state.game.data().lastDices[0] ===
                                state.game.data().lastDices[1] && (
                                <span className="Dobles">Doubles!</span>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default BoardCenter;
