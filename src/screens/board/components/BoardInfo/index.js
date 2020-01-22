import React from 'react';
import PlayerInfo from './PlayerInfo';
import PropertyInfo from './PropertyInfo.js';
import RailroadInfo from './RailroadInfo.js';
import CompanyInfo from './CompanyInfo';

function BoardInfo({ state, onBuyHouse }) {
    let content = null;
    if (state.selected.type === 'player') {
        content = <PlayerInfo state={state} />;
    } else if (state.selected.type === 'property') {
        if (state.selected.tile.type === 'property')
            content = <PropertyInfo state={state} onBuyHouse={onBuyHouse} />;
        else if (state.selected.tile.type === 'railroad')
            content = <RailroadInfo state={state} />;
        else if (state.selected.tile.type === 'company')
            content = <CompanyInfo state={state} />;
    }
    return <div className="BoardInfo">{content}</div>;
}

export default BoardInfo;
