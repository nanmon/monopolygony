import React from 'react';
import './BoardScreen.css';
import PropertyHut from './components/PropertyHut';
import { tiles } from './services/board.json';
import GoHut from './components/GoHut';
import TaxHut from './components/TaxHut';
import ChestHut from './components/ChestHut';
import RailroadHut from './components/RailroadHut';
import ChanceHut from './components/ChanceHut';
import CompanyHut from './components/CompanyHut';

function BoardScreen() {
    function renderTile(tile, index) {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        const Hut = MAP[tile.type];
        const side = getSide(index);
        const classes = ['tile', tile.id, side];
        return (
            <div
                className={classes.join(' ')}
                key={tile.id}
                style={{
                    gridArea: tile.id,
                    backgroundColor: `rgb(${r},${g},${b})`,
                }}
            >
                {Hut && <Hut tile={tile} side={side} />}
            </div>
        );
    }

    return (
        <div className="BoardScreen">
            <div className="Board">
                <div className="center"></div>
                {tiles.map(renderTile)}
            </div>
        </div>
    );
}

export default BoardScreen;

const MAP = {
    go: GoHut,
    property: PropertyHut,
    chest: ChestHut,
    tax: TaxHut,
    railroad: RailroadHut,
    chance: ChanceHut,
    company: CompanyHut,
};

function getSide(index) {
    const tilesPerSide = tiles.length / 4;
    const sideIndex = Math.floor(index / tilesPerSide);
    return ['bottom', 'left', 'top', 'right'][sideIndex];
}
