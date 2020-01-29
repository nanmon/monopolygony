import React from 'react';
import './styles/RailroadHut.css';
import { getRailroadsOwned, getTileOwner } from '../../services/util.js';

/**
 * @param {object} props
 * @param {Monopolygony.BoardBundle} props.state
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Tile>} props.tile
 */
function RailroadHut({ state, tile: railroad, side, children, onClick }) {
    const classes = ['RailroadHut', side];
    const owner = getTileOwner(state, railroad);
    let moneyText = '$' + railroad.data().price;
    if (owner) {
        const ownedCount = getRailroadsOwned(state, owner.id).length;
        const rent = railroad.data().rentIncreases[ownedCount - 1];
        moneyText = 'R$' + rent;
        if (railroad.data().mortgaged) {
            moneyText = 'M';
        }
    }
    // if (
    //     state.selected &&
    //     state.selected.tile &&
    //     state.selected.tile.id === railroad.id &&
    //     state.trade.length === 0
    // ) {
    //     classes.push('selected');
    // }
    return (
        <div className={classes.join(' ')} onClick={onClick}>
            <span>Railroad</span>

            <span>{moneyText}</span>
            <div className="Tokens">{children}</div>
            {owner && (
                <div
                    className="owner"
                    style={{ backgroundColor: owner.data().color }}
                ></div>
            )}
        </div>
    );
}

export default RailroadHut;
