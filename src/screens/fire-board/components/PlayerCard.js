import React from 'react';
import './styles/PlayerCard.css';
import {
    isBankrupt,
    getPlayerAssetsValue,
    isMiscTile,
} from '../services/util.js';

/**
 * @param {object} props
 * @param {Monopolygony.BoardBundle} props.state
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Player>} props.player
 */
function PlayerCard({ state, player }) {
    const assets = getPlayerAssetsValue(state, player);
    /** @type {{[key: string]: FirebaseFirestore.DocumentSnapshot<Monopolygony.Tile>[]}} */
    const groups = {};
    state.tiles.docs.forEach(p => {
        if (isMiscTile(p)) return;
        const groupName = p.data().group;
        if (!groups[groupName]) groups[groupName] = [p];
        else groups[groupName].push(p);
    });
    const classes = ['PlayerCard'];
    if (isBankrupt(state, player)) classes.push('Bankrupt');
    return (
        <div className={classes.join(' ')}>
            <div className="Header">
                <span
                    className="Token"
                    style={{ backgroundColor: player.data().color }}
                />
                <span>${player.data().money}</span>
                <span>${assets} in assets</span>
            </div>
            <div className="Content">
                {Object.entries(groups).map(([groupName, ppties]) => (
                    <div key={groupName} className="Group">
                        {ppties.map(ppty => (
                            <div
                                key={ppty.id}
                                className="Property"
                                style={{
                                    borderColor: ppty.data().groupColor,
                                    backgroundColor:
                                        ppty.data().owner === player.id
                                            ? ppty.data().groupColor
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
