// numberjs.ts
// idea by khawkriab(Sittisak Thainoi)
// create by chatgpt.com

type NumericInput = number | string | null | undefined;
type NumericArrayInput = NumericInput[];
type NumberJsInput = NumericInput | NumericArrayInput;

const DEFAULT_LOCALE = 'en-US';

function toNumber(input: NumericInput): number {
    if (typeof input === 'number') return Number.isFinite(input) ? input : 0;
    if (input == null) return 0;

    const cleaned = String(input).trim().replace(/,/g, '');
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
}

function sumArray(list: NumericArrayInput = []): number {
    return list.reduce<number>((acc, item) => {
        return acc + toNumber(item);
    }, 0);
}

function clampInt(n: number, min: number, max: number): number {
    const v = Math.floor(n);
    return Math.max(min, Math.min(max, v));
}

export interface NumberJS {
    add(x: NumericInput): NumberJS;
    del(x: NumericInput): NumberJS;
    mul(x: NumericInput): NumberJS;
    div(x: NumericInput): NumberJS;

    round(n?: number): NumberJS;
    ceil(): NumberJS;
    floor(): NumberJS;
    abs(): NumberJS;

    compare(x: NumericInput): -1 | 0 | 1;
    percent(): NumberJS;

    /** Sum array into the current value (replaces current value). */
    reduce(list: NumericArrayInput): NumberJS;

    format(minDecimals?: number, maxDecimals?: number): string;
    readonly value: number;
}

class NumberJSImpl implements NumberJS {
    private _value: number;

    constructor(initial?: NumberJsInput) {
        if (Array.isArray(initial)) this._value = sumArray(initial);
        else this._value = toNumber(initial);
    }

    add(x: NumericInput): NumberJS {
        this._value += toNumber(x);
        return this;
    }

    del(x: NumericInput): NumberJS {
        this._value -= toNumber(x);
        return this;
    }

    mul(x: NumericInput): NumberJS {
        this._value *= toNumber(x);
        return this;
    }

    div(x: NumericInput): NumberJS {
        const n = toNumber(x);
        if (n === 0) return this; // safe no-op
        this._value /= n;
        return this;
    }

    round(n: number = 0): NumberJS {
        const dp = clampInt(n, 0, 20);
        const f = 10 ** dp;
        this._value = Math.round((this._value + Number.EPSILON) * f) / f;
        return this;
    }

    ceil(): NumberJS {
        this._value = Math.ceil(this._value);
        return this;
    }

    floor(): NumberJS {
        this._value = Math.floor(this._value);
        return this;
    }

    abs(): NumberJS {
        this._value = Math.abs(this._value);
        return this;
    }

    compare(x: NumericInput): -1 | 0 | 1 {
        const n = toNumber(x);
        if (this._value < n) return -1;
        if (this._value > n) return 1;
        return 0;
    }

    percent(): NumberJS {
        this._value *= 100;
        return this;
    }

    reduce(list: NumericArrayInput): NumberJS {
        this._value = sumArray(list);
        return this;
    }

    get value(): number {
        return this._value;
    }

    format(minDecimals?: number, maxDecimals?: number): string {
        let minimumFractionDigits: number;
        let maximumFractionDigits: number;

        if (typeof minDecimals === 'number' && typeof maxDecimals === 'number') {
            minimumFractionDigits = Math.max(0, Math.floor(minDecimals));
            maximumFractionDigits = Math.max(minimumFractionDigits, Math.floor(maxDecimals));
        } else if (typeof minDecimals === 'number') {
            minimumFractionDigits = Math.max(0, Math.floor(minDecimals));
            maximumFractionDigits = minimumFractionDigits;
        } else {
            const isInteger = Number.isInteger(this._value);
            minimumFractionDigits = 0;
            maximumFractionDigits = isInteger ? 0 : 20;
        }

        return new Intl.NumberFormat(DEFAULT_LOCALE, {
            minimumFractionDigits,
            maximumFractionDigits,
            useGrouping: true,
        }).format(this._value);
    }
}

/**
 * numberjs() behavior:
 * - numberjs().value === 0
 * - numberjs([1,2,"3"]).value === 6
 * - numberjs().reduce([1,2,"3"]).value === 6
 */
export function numberjs(initial?: NumberJsInput): NumberJS {
    return new NumberJSImpl(initial);
}
