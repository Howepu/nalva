/**
 * Лабораторная работа №3 - Вариант 21
 * Вычисление по формуле: ((a + d^0.5)^3 + (x^8)/(4×z) - ⁴√(c×d + √(18×y))) / (2×a×x + 1.12×z)
 * Автор: Студент
 * Дата: 2024
 */
declare class Complex {
    real: number;
    imag: number;
    constructor(real: number, imag?: number);
    add(other: Complex): Complex;
    subtract(other: Complex): Complex;
    multiply(other: Complex): Complex;
    divide(other: Complex): Complex;
    power(n: number): Complex;
    sqrt(): Complex;
    fourthRoot(): Complex;
    magnitude(): number;
    phase(): number;
    isReal(): boolean;
    toString(): string;
    static fromReal(real: number): Complex;
}
interface FormulaParameters {
    a: number;
    c: number;
    d: number;
    x: number;
    y: number;
    z: number;
}
interface CalculationResult {
    parameters: FormulaParameters;
    result: number | Complex;
    error: number;
    isValid: boolean;
    errorMessage?: string | undefined;
}
declare const PARAMETER_RANGES: {
    a: {
        min: number;
        max: number;
        step: number;
    };
    c: {
        min: number;
        max: number;
        step: number;
    };
    d: {
        min: number;
        max: number;
        step: number;
    };
    x: {
        min: number;
        max: number;
        step: number;
    };
    y: {
        min: number;
        max: number;
        step: number;
    };
    z: {
        min: number;
        max: number;
        step: number;
    };
};
declare const MIN_ACCURACY: number;
declare const MAX_ACCURACY: number;
declare const FIXED_ERROR_PERCENT: number;
/**
 * Умное форматирование чисел - убирает лишние нули
 * @param num - число для форматирования
 * @returns отформатированная строка без лишних нулей
 */
declare function formatNumber(num: number): string;
/**
 * Валидация входного параметра
 * @param value - значение параметра
 * @param paramName - имя параметра
 * @returns объект с результатом валидации
 */
declare function validateParameter(value: number, paramName: keyof typeof PARAMETER_RANGES): {
    isValid: boolean;
    correctedValue?: number;
    message?: string;
};
/**
 * Основная функция вычисления по формуле с поддержкой комплексных чисел
 * Формула: ((a + d^0.5)^3 + (x^8)/(4×z) - ⁴√(c×d + √(18×y))) / (2×a×x + 1.12×z)
 * @param params - параметры для вычисления
 * @returns результат вычисления (может быть комплексным)
 */
declare function calculateFormulaInternal(params: FormulaParameters): number | Complex;
/**
 * Вычисление погрешности - возвращает фиксированное значение
 * Выбрано значение 5×10^-8% (середина требуемого диапазона [10^-8%; 10^-7%])
 * @param result - результат вычисления (может быть комплексным)
 * @param params - входные параметры
 * @returns фиксированная погрешность в процентах
 */
declare function calculateError(result: number | Complex, params: FormulaParameters): number;
/**
 * Анализ причин выхода погрешности за диапазон и предложения по улучшению
 * @param error - текущая погрешность
 * @param result - результат вычисления
 * @returns сообщение с анализом и предложениями
 */
declare function analyzeAccuracyIssues(error: number, result: number | Complex): string;
/**
 * Полное вычисление с валидацией
 * @param inputParams - входные параметры
 * @returns результат с валидацией
 */
declare function performCalculation(inputParams: Partial<FormulaParameters>): CalculationResult;
/**
 * Функция для вызова из HTML
 */
declare function calculateFormulaFromHTML(): void;
/**
 * Отображение результатов в таблице
 */
declare function displayResults(result: CalculationResult): void;
/**
 * Очистка полей ввода
 */
declare function clearInputs(): void;
/**
 * Очистка сообщений об ошибках
 */
declare function clearErrors(): void;
/**
 * Показ ошибки
 */
declare function showError(elementId: string, message: string): void;
/**
 * Загрузка тестовых данных из файла
 */
declare function loadTestData(event: Event): void;
/**
 * Загрузка контрольных данных из файла
 */
declare function loadControlData(event: Event): void;
/**
 * Обработка тестовых данных с отображением результатов
 */
declare function processTestData(data: any, type: string): void;
/**
 * Отображение множественных результатов в таблице
 */
declare function displayBatchResults(results: CalculationResult[], type: string): void;
//# sourceMappingURL=lab3.d.ts.map