import React from 'react';
import './styles/BoardCenter.css';
import PlayerToken from './PlayerToken';

function BoardCenter({ state }) {
    const player = state.players[state.turn];
    return (
        <div className="BoardCenter center">
            {state.started && (
                <>
                    <div className="Turn">
                        <span>{player.money < 0 ? 'In Debt!' : 'Turn:'}</span>
                        <PlayerToken player={player} />
                        {player.money < 0 && <span>${player.money}</span>}
                    </div>
                    {state.phase !== 'roll' && (
                        <>
                            <div className="Die">
                                <span className="Dice">
                                    {state.lastDices[0]}
                                </span>
                                <span className="Dice">
                                    {state.lastDices[1]}
                                </span>
                            </div>

                            {state.lastDices[0] === state.lastDices[1] && (
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
