import React from 'react';
import './styles/CompanyHut.css';
import { getCompaniesOwned, getTileOwner } from '../../services/util.js';

/**
 * @param {object} props
 * @param {Monopolygony.BoardBundle} props.state
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Tile>} props.tile
 */
function CompanyHut({ state, ui, tile: company, side, children, onClick }) {
    const classes = ['CompanyHut', side];
    const owner = getTileOwner(state, company);
    let moneyText = '$' + company.data().price;
    if (owner) {
        const ownedCount = getCompaniesOwned(state, owner.id).length;
        const multiplier = company.data().rentIncreases[ownedCount - 1];
        moneyText = 'Dx' + multiplier;
        if (company.data().mortgaged) {
            moneyText = 'M';
        }
    }
    if (
        ui.selected &&
        ui.selected.tileId === company.id &&
        state.trades.size === 0
    ) {
        classes.push('selected');
    }
    return (
        <div className={classes.join(' ')} onClick={onClick}>
            <span>Utility</span>
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

export default CompanyHut;
