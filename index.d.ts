declare namespace Monopolygony {
    type ID = string;

    interface Game {
        started: boolean;
        turn: ID;
        phase: 'roll' | 'advance' | 'tileEffect' | 'end' | 'payFine';
        doublesCount: number;
        lastDices: [number, number];
        order: ID[];
    }

    interface Player {
        color: string;
        money: number;
        position: ID;
        frozenTurns: number;
        sentToJail: boolean;
    }

    interface MiscTile {
        type: string;
        position: number;
    }

    interface PropertyTile extends MiscTile {
        name: string;
        price: number;
        rent?: number;
        rentIncreases: number[];
        buildingCost?: number;
        group: string;
        groupColor: string;
        buildings: number;
        owner?: ID;
        mortgaged: boolean;
    }

    type Tile = MiscTile | PropertyTile;

    interface Trade {
        by: ID;
        with?: ID;
        bMoney: number;
        wMoney: number;
        bProperties: ID[];
        wProperties: ID[];
    }

    interface AddPlayerAction {
        type: 'add-player';
        color: string;
    }

    interface RemovePlayerAction {
        type: 'remove-player';
        playerId: ID;
    }

    interface NextAction {
        type: 'next';
        dice1?: number;
        dice2?: number;
        buy?: boolean;
    }

    interface BuyHouseAction {
        type: 'buy-house';
        tileId: ID;
    }

    interface SellHouseAction {
        type: 'sell-house';
        tileId: ID;
    }

    interface MortgageAction {
        type: 'mortgage';
        tileId: ID;
    }

    interface TradeNewAction {
        type: 'trade-new';
        playerId: ID;
    }

    interface TradeAddAction {
        type: 'trade-add';
        tradeId: ID;
        tileId: ID;
    }

    interface TradeRemoveAction {
        type: 'trade-remove';
        tradeId: ID;
        tileId: ID;
    }

    interface TradeMoneyAction {
        type: 'trade-money';
        tradeId: ID;
        bMoney?: number;
        wMoney?: number;
    }

    interface TradeCancelAction {
        type: 'trade-cancel';
        tradeId: ID;
    }

    interface TradeDoneAction {
        type: 'trade-done';
        tradeId: ID;
    }

    interface BankruptAction {
        type: 'bankrupt';
        playerId: ID;
    }

    type Action =
        | AddPlayerAction
        | RemovePlayerAction
        | NextAction
        | BuyHouseAction
        | SellHouseAction
        | MortgageAction
        | TradeNewAction
        | TradeAddAction
        | TradeRemoveAction
        | TradeMoneyAction
        | TradeCancelAction
        | TradeDoneAction
        | BankruptAction;
}
