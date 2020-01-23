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

function BoardScreen() {
    const [state, dispatch] = useBoardState();

    function renderTile(tile, index) {
        const Hut = MAP[tile.type];
        const side = getSide(index);
        const classes = ['tile', tile.id, side];
        const tokens = state.players.filter(p => p.position === index);
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
                    onClick={() => dispatch({ type: 'select', tile })}
                >
                    {tokens.map(player => (
                        <PlayerToken
                            key={player.color}
                            player={player}
                            onClick={() => dispatch({ type: 'select', player })}
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
            <BoardInfo
                state={state}
                onBuyHouse={() => dispatch({ type: 'buy-house' })}
                onSellHouse={() => dispatch({ type: 'sell-house' })}
                onMortgage={() => dispatch({ type: 'mortgage' })}
            />
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
