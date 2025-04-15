// Funkcje pomocnicze do formatowania wartości

/**
 * Formatuje kwotę jako walutę w formacie polskim.
 * @param amount Kwota do sformatowania
 * @param currency Symbol waluty (domyślnie "PLN")
 * @returns Sformatowana kwota z symbolem waluty
 */
export const formatCurrency = (amount: number | undefined | null, currency = "PLN"): string => {
    if (amount == null || isNaN(amount)) {
        return `-- ${currency}`;
    }
    return new Intl.NumberFormat('pl-PL', { 
        style: 'currency', 
        currency: currency, 
        maximumFractionDigits: 0 
    }).format(amount);
};

/**
 * Zaokrągla kwotę do pełnych złotych.
 * @param amount Kwota do zaokrąglenia
 * @returns Zaokrąglona kwota
 */
export const roundToInt = (amount: number): number => Math.round(amount);

/**
 * Zaokrągla kwotę do groszy (2 miejsca po przecinku).
 * @param amount Kwota do zaokrąglenia
 * @returns Zaokrąglona kwota z dokładnością do 2 miejsc po przecinku
 */
export const roundToCent = (amount: number): number => Math.round(amount * 100) / 100;

/**
 * Formatuje procent do postaci tekstowej.
 * @param value Wartość procentowa (np. 0.0976 dla 9,76%)
 * @param digits Liczba cyfr po przecinku (domyślnie 2)
 * @returns Sformatowana wartość procentowa
 */
export const formatPercent = (value: number, digits = 2): string => {
    return `${(value * 100).toFixed(digits)}%`;
};
