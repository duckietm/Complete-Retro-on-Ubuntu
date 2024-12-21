import { IFigureDataColor } from '../../interfaces';
import { IPartColor } from './IPartColor';

export class PartColor implements IPartColor
{
    private _id: any;
    private _index: number;
    private _clubLevel: number;
    private _isSelectable: boolean;
    private _rgb: number;
    private _hex: string;

    constructor(data?: IFigureDataColor, id?: string, index?: number)
    {
        if(!data){
            this._id = id;
            this._index = index;
            this._clubLevel = 0;
            this._isSelectable = true;
            this._rgb = parseInt('0x' + id, 16);
            this._hex = id;
            return;
        };

        this._id = data.id;
        this._index = data.index;
        this._clubLevel = (data.club || 0);
        this._isSelectable = data.selectable;
        this._rgb = parseInt('0x' + data.hexCode, 16);
        this._hex = data.hexCode;
    }

    public get id(): string
    {
        return this._id;
    }

    public get index(): number
    {
        return this._index;
    }

    public get clubLevel(): number
    {
        return this._clubLevel;
    }

    public get isSelectable(): boolean
    {
        return this._isSelectable;
    }

    public get rgb(): number
    {
        return this._rgb;
    }

    public get hex(): string
    {
        return this._hex;
    }
}