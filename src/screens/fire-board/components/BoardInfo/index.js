import React from 'react';
import PlayerInfo from './PlayerInfo';
import PropertyInfo from './PropertyInfo.js';
import RailroadInfo from './RailroadInfo.js';
import CompanyInfo from './CompanyInfo';
import TradeInfo from './TradeInfo';
import './styles/BoardInfo.css';

function BoardInfo({
    state,
    onBuyHouse,
    onSellHouse,
    onMortgage,
    onTrade,
    onMoneyTrade,
    onCancelTrade,
    onDoneTrade,
    onClose,
    onNext,
    onAddPlayer,
    onRemovePlayer,
}) {
    // function trade() {
    //     const propertyId = state.selected.tile.id;
    //     const ownership = state.properties.find(p => p.id === propertyId);
    //     if (!ownership) return;
    //     onTrade({ playerIndex: ownership.ownedBy, propertyId });
    // }

    let content = null;
    // if (state.trade.length > 0) {
    //     content = (
    //         <TradeInfo
    //             state={state}
    //             onMoney={onMoneyTrade}
    //             onCancel={onCancelTrade}
    //             onDone={onDoneTrade}
    //         />
    //     );
    // } else if (state.selected == null) {
    content = (
        <PlayerInfo
            state={state}
            onNext={onNext}
            onAddPlayer={onAddPlayer}
            onRemovePlayer={onRemovePlayer}
        />
    );
    // } else if (state.selected.type === 'property') {
    //     if (state.selected.tile.type === 'property')
    //         content = (
    //             <PropertyInfo
    //                 state={state}
    //                 onBuyHouse={onBuyHouse}
    //                 onSellHouse={onSellHouse}
    //                 onMortgage={onMortgage}
    //                 onTrade={trade}
    //                 onClose={onClose}
    //             />
    //         );
    //     else if (state.selected.tile.type === 'railroad')
    //         content = (
    //             <RailroadInfo
    //                 state={state}
    //                 onMortgage={onMortgage}
    //                 onTrade={trade}
    //                 onClose={onClose}
    //             />
    //         );
    //     else if (state.selected.tile.type === 'company')
    //         content = (
    //             <CompanyInfo
    //                 state={state}
    //                 onMortgage={onMortgage}
    //                 onTrade={trade}
    //                 onClose={onClose}
    //             />
    //         );
    // }
    return <div className="BoardInfo">{content}</div>;
}

export default BoardInfo;
