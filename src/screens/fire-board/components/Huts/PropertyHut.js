import React from 'react';
import './styles/PropertyHut.css';
import { getBlockOwner, getTileOwner } from '../../services/util.js';

/**
 * @param {object} props
 * @param {Monopolygony.BoardBundle} props.state
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Tile>} props.tile
 */
function PropertyHut({ state, ui, tile: property, side, children, onClick }) {
    const classes = ['PropertyHut', side];
    const owner = getTileOwner(state, property);
    let moneyText = '$' + property.data().price;
    if (owner) {
        moneyText = 'R$' + property.data().rent;
        if (property.data().mortgaged) {
            moneyText = 'M';
        } else if (getBlockOwner(state, property.data().group) === owner.id) {
            if (property.data().buildings === 0)
                moneyText = 'R$' + property.data().rent * 2;
            else
                moneyText =
                    'R$' +
                    property.data().rentIncreases[
                        property.data().buildings - 1
                    ];
        }
    }
    if (
        ui.selected &&
        ui.selected.tileId === property.id &&
        state.trades.size === 0
    ) {
        classes.push('selected');
    }
    return (
        <div
            className={classes.join(' ')}
            onClick={e => {
                e.preventDefault();
                onClick();
            }}
        >
            <div
                className="group"
                style={{ backgroundColor: property.data().groupColor }}
            ></div>
            <span>{moneyText}</span>
            <div className="Tokens">{children}</div>
            {owner && (
                <div
                    className="owner"
                    style={{
                        backgroundColor: owner.data().color,
                        borderColor:
                            owner.data().color === 'yellow' ? 'black' : 'white',
                    }}
                ></div>
            )}
        </div>
    );
}

export default PropertyHut;
