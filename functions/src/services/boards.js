const json = require('./regular.json');

function regular(admin) {
    const board = admin
        .firestore()
        .collection('Boards')
        .doc('regular');
    const tiles = board.collection('Tiles');
    json.tiles.map((tile, tileIndex) => {
        const property = json.properties.find(p => p.id === tile.id);
        let tileData = {
            type: tile.type,
            position: tileIndex,
        };
        if (property) {
            tileData = {
                ...tileData,
                name: tile.id,
                price: property.price,
                rent: property.rent || null,
                rentIncreases: property.multpliedrent,
                buildingCost: property.housecost || null,
                group: property.group,
                groupColor: property.groupColor,
            };
        }
        return tiles.doc(tile.id).set(tileData);
    });
}

module.exports.regular = regular;
