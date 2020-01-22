import React from 'react';
import PlayerInfo from './PlayerInfo';
import PropertyInfo from './PropertyInfo.js';
import RailroadInfo from './RailroadInfo.js';
import CompanyInfo from './CompanyInfo';

function BoardInfo({ state, onBuyHouse, onMortgage }) {
    let content = null;
    if (state.selected.type === 'player') {
        content = <PlayerInfo state={state} />;
    } else if (state.selected.type === 'property') {
        if (state.selected.tile.type === 'property')
            content = (
                <PropertyInfo
                    state={state}
                    onBuyHouse={onBuyHouse}
                    onMortgage={onMortgage}
                />
            );
        else if (state.selected.tile.type === 'railroad')
            content = <RailroadInfo state={state} onMortgage={onMortgage} />;
        else if (state.selected.tile.type === 'company')
            content = <CompanyInfo state={state} onMortgage={onMortgage} />;
    }
    return <div className="BoardInfo">{content}</div>;
}

export default BoardInfo;
