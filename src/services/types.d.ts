type ID = string;

export interface Game {
    started: boolean
}

export interface Player {
    name: string
    admin: boolean

    money: number
    properties: ID[];
}

export interface Property {
    name: string
    value: number
    block: number
    housePrice: number
    rent: number[] // [normal, 1house, 2houses, 3houses, 4house, hotel]
    owner: ID
    mortgaged: boolean
}