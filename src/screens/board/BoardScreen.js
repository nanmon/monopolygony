import React from 'react';
import './BoardScreen.css';
import { tiles } from './services/board.json';
import PropertyHut from './components/Huts/PropertyHut';
import GoHut from './components/Huts/GoHut';
import TaxHut from './components/Huts/TaxHut';
import ChestHut from './components/Huts/ChestHut';
import RailroadHut from './components/Huts/RailroadHut';
import ChanceHut from './components/Huts/ChanceHut';
import CompanyHut from './components/Huts/CompanyHut';
import JailHut from './components/Huts/JailHut';
import FreeParkingHut from './components/Huts/FreeParkingHut';
import GoToJailHut from './components/Huts/GoToJailHut';
import PlayerToken from './components/PlayerToken';
import BoardInfo from './components/BoardInfo';
import { useBoardState } from './services/reducer';
import BoardCenter from './components/BoardCenter';
import { isBankrupt } from './services/util';
import { bigboys, regular } from './services/presets.json';

const PRESET = process.env.NODE_ENV === 'production' ? regular : bigboys;

function BoardScreen() {
    const [state, dispatch] = useBoardState(PRESET);

    function onHutClick(tile) {
        if (state.trade.length > 0) {
            const ownership = state.properties.find(p => p.id === tile.id);
            if (!ownership) return;
            dispatch({
                type: 'trade-add',
                propertyId: tile.id,
                playerIndex: ownership.ownedBy,
            });
        } else {
            dispatch({ type: 'select', tile });
        }
    }

    function onPlayerClick(player) {
        if (state.trade.length === 1) {
            return e => {
                e.stopPropagation();
                const playerIndex = state.players.findIndex(
                    p => p.color === player.color,
                );
                dispatch({ type: 'trade-set', playerIndex, money: 0 });
            };
        }
    }

    function renderTile(tile, index) {
        const Hut = MAP[tile.type];
        const side = getSide(index);
        const classes = ['tile', tile.id, side];
        const tokens = state.players.filter((p, pIndex) => {
            if (isBankrupt(state, pIndex)) return false;
            return p.position === index;
        });
        const owned = state.properties.find(p => p.index === index);
        return (
            <div
                className={classes.join(' ')}
                key={tile.id}
                style={{
                    gridArea: tile.id,
                }}
            >
                <Hut
                    state={state}
                    tile={tile}
                    side={side}
                    owner={owned && state.players[owned.ownedBy]}
                    onClick={() => onHutClick(tile)}
                >
                    {tokens.map(player => (
                        <PlayerToken
                            key={player.color}
                            player={player}
                            onClick={onPlayerClick(player)}
                        />
                    ))}
                </Hut>
            </div>
        );
    }

    return (
        <div className="BoardScreen">
            <div className="Board">
                <BoardCenter
                    state={state}
                    onNext={args => dispatch({ ...args, type: 'next' })}
                />
                {tiles.map(renderTile)}
            </div>
            <div className="AfterBoard">
                <BoardInfo
                    state={state}
                    onBuyHouse={() => dispatch({ type: 'buy-house' })}
                    onSellHouse={() => dispatch({ type: 'sell-house' })}
                    onMortgage={() => dispatch({ type: 'mortgage' })}
                    onTrade={args => dispatch({ ...args, type: 'trade-add' })}
                    onMoneyTrade={args =>
                        dispatch({ ...args, type: 'trade-set' })
                    }
                    onCancelTrade={() => dispatch({ type: 'trade-cancel' })}
                    onDoneTrade={() => dispatch({ type: 'trade-done' })}
                    onClose={() => dispatch({ type: 'select' })}
                    onNext={args => dispatch({ ...args, type: 'next' })}
                    onAddPlayer={() => dispatch({ type: 'add-player' })}
                    onRemovePlayer={() => dispatch({ type: 'remove-player' })}
                />
            </div>
        </div>
    );
}

export default BoardScreen;

const MAP = {
    go: GoHut,
    jail: JailHut,
    freeparking: FreeParkingHut,
    gotojail: GoToJailHut,
    property: PropertyHut,
    railroad: RailroadHut,
    company: CompanyHut,
    chest: ChestHut,
    chance: ChanceHut,
    tax: TaxHut,
};

function getSide(index) {
    const tilesPerSide = tiles.length / 4;
    const sideIndex = Math.floor(index / tilesPerSide);
    return ['bottom', 'left', 'top', 'right'][sideIndex];
}
