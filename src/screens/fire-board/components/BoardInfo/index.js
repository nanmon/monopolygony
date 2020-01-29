import React from 'react';
import PlayerInfo from './PlayerInfo';
import PropertyInfo from './PropertyInfo.js';
import RailroadInfo from './RailroadInfo.js';
import CompanyInfo from './CompanyInfo';
import TradeInfo from './TradeInfo';
import './styles/BoardInfo.css';
import { PLAYER_COLORS, getTileById } from '../../services/util';

function BoardInfo({ state, ui, dispatch, uiDispatch }) {
    function trade() {
        // const propertyId = state.selected.tile.id;
        // const ownership = state.properties.find(p => p.id === propertyId);
        // if (!ownership) return;
        // onTrade({ playerIndex: ownership.ownedBy, propertyId });
    }

    function addPlayer() {
        const color = PLAYER_COLORS[state.players.size];
        if (!color) return;
        dispatch({ type: 'add-player', color });
    }

    function removePlayer() {
        const { size } = state.players;
        if (state.players.size === 2) return;
        const lastPlayer = state.players.docs[size - 1];
        dispatch({ type: 'remove-player', playerId: lastPlayer.id });
    }

    let content = null;
    if (state.trades.size > 0) {
        content = (
            <TradeInfo
                state={state}
                // onMoney={onMoneyTrade}
                // onCancel={onCancelTrade}
                // onDone={onDoneTrade}
            />
        );
    } else if (ui.selected == null) {
        content = (
            <PlayerInfo
                state={state}
                onNext={args => dispatch({ ...args, type: 'next' })}
                onAddPlayer={addPlayer}
                onRemovePlayer={removePlayer}
            />
        );
    } else if (ui.selected.tileId) {
        const selectedTile = getTileById(state, ui.selected.tileId);
        if (selectedTile.data().type === 'property')
            content = (
                <PropertyInfo
                    state={state}
                    tile={selectedTile}
                    onBuyHouse={() =>
                        dispatch({ type: 'buy-house', tileId: selectedTile.id })
                    }
                    onSellHouse={() =>
                        dispatch({
                            type: 'sell-house',
                            tileId: selectedTile.id,
                        })
                    }
                    onMortgage={() =>
                        dispatch({ type: 'mortgage', tileId: selectedTile.id })
                    }
                    onTrade={() =>
                        dispatch({
                            type: 'trade-new',
                            playerId: selectedTile.data().owner,
                            tileId: selectedTile.id,
                        })
                    }
                    onClose={() => uiDispatch({})}
                />
            );
        else if (selectedTile.data().type === 'railroad')
            content = (
                <RailroadInfo
                    state={state}
                    tile={selectedTile}
                    onMortgage={() =>
                        dispatch({ type: 'mortgage', tileId: selectedTile.id })
                    }
                    onTrade={() =>
                        dispatch({
                            type: 'trade-new',
                            playerId: selectedTile.data().owner,
                            tileId: selectedTile.id,
                        })
                    }
                    onClose={() => uiDispatch({})}
                />
            );
        else if (selectedTile.data().type === 'company')
            content = (
                <CompanyInfo
                    state={state}
                    tile={selectedTile}
                    onMortgage={() =>
                        dispatch({ type: 'mortgage', tileId: selectedTile.id })
                    }
                    onTrade={() =>
                        dispatch({
                            type: 'trade-new',
                            playerId: selectedTile.data().owner,
                            tileId: selectedTile.id,
                        })
                    }
                    onClose={() => uiDispatch({})}
                />
            );
    }
    return <div className="BoardInfo">{content}</div>;
}

export default BoardInfo;
