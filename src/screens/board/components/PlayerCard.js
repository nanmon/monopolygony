import React from 'react';
import { properties } from '../services/board.json';
import './styles/PlayerCard.css';
import { userAssetsValue, isBankrupt } from '../services/util.js';

function PlayerCard({ state, playerIndex }) {
    const player = state.players[playerIndex];
    const assets = userAssetsValue(state, playerIndex);
    const groups = {};
    properties.forEach(p => {
        const ownership = state.properties.find(
            o => o.id === p.id && o.ownedBy === playerIndex,
        );
        const property = { ...p, ownership };
        if (!groups[p.group]) groups[p.group] = [property];
        else groups[p.group].push(property);
    });
    const classes = ['PlayerCard'];
    if (isBankrupt(state, playerIndex)) classes.push('Bankrupt');
    return (
        <div className={classes.join(' ')}>
            <div className="Header">
                <span
                    className="Token"
                    style={{ backgroundColor: player.color }}
                />
                <span>${player.money}</span>
                <span>${assets} in assets</span>
            </div>
            <div className="Content">
                {Object.entries(groups).map(([groupColor, ppties]) => (
                    <div key={groupColor} className="Group">
                        {ppties.map(ppty => (
                            <div
                                key={ppty.id}
                                className="Property"
                                style={{
                                    borderColor: ppty.groupColor,
                                    backgroundColor: ppty.ownership
                                        ? ppty.groupColor
                                        : 'transparent',
                                }}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PlayerCard;
