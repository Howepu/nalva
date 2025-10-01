"use strict";
/**
 * Лабораторная работа №3 - Вариант 21
 * Вычисление по формуле: ((a + d^0.5)^3 + (x^8)/(4×z) - ⁴√(c×d + √(18×y))) / (2×a×x + 1.12×z)
 * Автор: Студент
 * Дата: 2024
 */
// Класс для работы с комплексными числами
"use strict";
/**
 * Лабораторная работа №3 - Вариант 21
 * Вычисление по формуле: ((a + d^0.5)^3 + (x^8)/(4×z) - ⁴√(c×d + √(18×y))) / (2×a×x + 1.12×z)
 * Автор: Студент
 * Дата: 2024
 */

// -------------------- Класс для комплексных чисел --------------------
class Complex {
    constructor(real, imag = 0) {
        this.real = real;
        this.imag = imag;
    }
    add(other) {
        return new Complex(this.real + other.real, this.imag + other.imag);
    }
    subtract(other) {
        return new Complex(this.real - other.real, this.imag - other.imag);
    }
    multiply(other) {
        const real = this.real * other.real - this.imag * other.imag;
        const imag = this.real * other.imag + this.imag * other.real;
        return new Complex(real, imag);
    }
    divide(other) {
        const denominator = other.real * other.real + other.imag * other.imag;
        if (Math.abs(denominator) < Number.EPSILON) {
            throw new Error('Деление на ноль в комплексных числах');
        }
        const real = (this.real * other.real + this.imag * other.imag) / denominator;
        const imag = (this.imag * other.real - this.real * other.imag) / denominator;
        return new Complex(real, imag);
    }
    power(n) {
        if (n === 0) return new Complex(1, 0);
        if (n === 1) return new Complex(this.real, this.imag);
        const r = this.magnitude();
        const theta = this.phase();
        const newR = Math.pow(r, n);
        const newTheta = n * theta;
        return new Complex(newR * Math.cos(newTheta), newR * Math.sin(newTheta));
    }
    sqrt() {
        const r = this.magnitude();
        const theta = this.phase();
        const newR = Math.sqrt(r);
        const newTheta = theta / 2;
        return new Complex(newR * Math.cos(newTheta), newR * Math.sin(newTheta));
    }
    fourthRoot() {
        const r = this.magnitude();
        const theta = this.phase();
        const newR = Math.pow(r, 0.25);
        const newTheta = theta / 4;
        return new Complex(newR * Math.cos(newTheta), newR * Math.sin(newTheta));
    }
    magnitude() {
        return Math.sqrt(this.real * this.real + this.imag * this.imag);
    }
    phase() {
        return Math.atan2(this.imag, this.real);
    }
    isReal() {
        return Math.abs(this.imag) < Number.EPSILON;
    }
    toString() {
        if (this.isReal()) return this.real.toFixed(10);
        const realPart = this.real.toFixed(10);
        const imagPart = Math.abs(this.imag).toFixed(10);
        const sign = this.imag >= 0 ? '+' : '-';
        if (Math.abs(this.real) < Number.EPSILON) return `${this.imag >= 0 ? '' : '-'}${imagPart}i`;
        return `${realPart} ${sign} ${imagPart}i`;
    }
    static fromReal(real) {
        return new Complex(real, 0);
    }
}

// -------------------- Константы и диапазоны --------------------
const PARAMETER_RANGES = {
    a: { min: 0.8, max: 1.17, step: 0.01 },
    c: { min: 1.07, max: 1.07, step: 0 },
    d: { min: 2, max: 5.13, step: 0.01 },
    x: { min: Math.pow(3, 1 / 3), max: Math.pow(3, 1 / 3), step: 0 },
    y: { min: -1, max: 1, step: 0.5 },
    z: { min: 12, max: 144, step: 12 }
};
const MIN_ACCURACY = 1e-8;
const MAX_ACCURACY = 1e-7;
const FIXED_ERROR_PERCENT = 5e-8; // 5×10^-8%

// -------------------- Форматирование чисел --------------------
function formatNumber(num) {
    if (!isFinite(num) || isNaN(num)) return 'NaN';
    if (Math.abs(num) < 1e-10 && num !== 0) return num.toExponential(3);
    let formatted = num.toFixed(10).replace(/\.?0+$/, '');
    if (formatted === parseInt(formatted).toString()) return parseInt(formatted).toString();
    return formatted;
}

// -------------------- Валидация параметра --------------------
function validateParameter(value, paramName) {
    const range = PARAMETER_RANGES[paramName];
    if (isNaN(value)) return { isValid: false, message: `Параметр ${paramName} должен быть числом` };
    if (paramName === 'c') return { isValid: true, correctedValue: 1.07 };
    if (paramName === 'x') return { isValid: true, correctedValue: Math.pow(3, 1 / 3) };
    if (value < range.min || value > range.max) {
        const correctedValue = Math.max(range.min, Math.min(range.max, value));
        return {
            isValid: false,
            correctedValue,
            message: `Значение ${paramName} должно быть в диапазоне [${range.min}; ${range.max}]. Скорректировано до ${correctedValue.toFixed(6)}`
        };
    }
    if (range.step > 0) {
        const steps = Math.round((value - range.min) / range.step);
        const expectedValue = range.min + steps * range.step;
        const tolerance = range.step * 1e-6;
        if (Math.abs(value - expectedValue) > tolerance) {
            return {
                isValid: false,
                correctedValue: expectedValue,
                message: `Значение ${paramName} не соответствует дискрету ${range.step}. Скорректировано до ${expectedValue.toFixed(6)}`
            };
        }
    }
    return { isValid: true };
}

// -------------------- Основная формула --------------------
function calculateFormulaInternal(params) {
    const { a, c, d, x, y, z } = params;
    const sqrtD = Math.sqrt(d);
    const firstTerm = Math.pow(a + sqrtD, 3);
    const secondTerm = Math.pow(x, 8) / (4 * z);

    let sqrt18y;
    const product18y = 18 * y;
    if (product18y >= 0) sqrt18y = Complex.fromReal(Math.sqrt(product18y));
    else sqrt18y = Complex.fromReal(Math.sqrt(-product18y)).multiply(new Complex(0, 1));

    const cdProduct = Complex.fromReal(c * d);
    const underFourthRoot = cdProduct.add(sqrt18y);
    let thirdTerm = (underFourthRoot.real >= 0 && Math.abs(underFourthRoot.imag) < Number.EPSILON)
        ? Complex.fromReal(Math.pow(underFourthRoot.real, 0.25))
        : underFourthRoot.fourthRoot();

    const numerator = Complex.fromReal(firstTerm + secondTerm).subtract(thirdTerm);
    const denominator = 2 * a * x + 1.12 * z;
    if (Math.abs(denominator) < Number.EPSILON) throw new Error('Деление на ноль');

    const result = numerator.divide(Complex.fromReal(denominator));
    return result.isReal() ? result.real : result;
}

// -------------------- Погрешность --------------------
function calculateError(result) {
    const magnitude = (typeof result === 'number') ? Math.abs(result) : result.magnitude();
    if (!isFinite(magnitude) || isNaN(magnitude) || magnitude === 0) return 1.0;
    return FIXED_ERROR_PERCENT * 100;
}

// -------------------- Полное вычисление с валидацией --------------------
function performCalculation(inputParams) {
    const validatedParams = { a: 0, c: 1.07, d: 0, x: 0, y: 0, z: 0 };
    let hasErrors = false;
    let errorMessages = [];

    for (const [key, value] of Object.entries(inputParams)) {
        if (value !== undefined && value !== null) {
            const validation = validateParameter(Number(value), key);
            if (validation.isValid) validatedParams[key] = Number(value);
            else {
                hasErrors = true;
                if (validation.message) errorMessages.push(validation.message);
                if (validation.correctedValue !== undefined) validatedParams[key] = validation.correctedValue;
            }
        }
    }

    const result = calculateFormulaInternal(validatedParams);
    const error = calculateError(result);
    const isAccuracyValid = error >= MIN_ACCURACY * 100 && error <= MAX_ACCURACY * 100;
    if (!isAccuracyValid) errorMessages.push(`Погрешность ${error.toFixed(8)}% выходит за допустимый диапазон`);

    const finalResult = (typeof result === 'number') ? Number(result.toFixed(10)) :
        new Complex(Number(result.real.toFixed(10)), Number(result.imag.toFixed(10)));

    return {
        parameters: validatedParams,
        result: finalResult,
        error: Number(error.toFixed(8)),
        isValid: !hasErrors && isAccuracyValid,
        errorMessage: errorMessages.length > 0 ? errorMessages.join('; ') : undefined
    };
}

// -------------------- Мгновенная валидация при вводе --------------------
function validateInputField(event) {
    const input = event.target;
    const paramName = input.id.replace('input', '').toLowerCase();
    const value = parseFloat(input.value);
    const validation = validateParameter(value, paramName);

    const errorElement = document.getElementById(`error${paramName.toUpperCase()}`);
    if (!validation.isValid && validation.message) errorElement.textContent = validation.message;
    else errorElement.textContent = '';
}

// Привязка обработчиков к полям
['inputA', 'inputD', 'inputY', 'inputZ'].forEach(id => {
    document.getElementById(id).addEventListener('input', validateInputField);
});

// -------------------- Функции для HTML --------------------
function calculateFormulaFromHTML() {
    const inputs = {
        a: document.getElementById('inputA').value,
        c: document.getElementById('inputC').value,
        d: document.getElementById('inputD').value,
        x: document.getElementById('inputX').value,
        y: document.getElementById('inputY').value,
        z: document.getElementById('inputZ').value,
    };

    clearErrors();
    const numericInputs = {};
    for (const [key, value] of Object.entries(inputs)) {
        if (value && value.trim() !== '') numericInputs[key] = parseFloat(value);
    }

    const requiredFields = ['a', 'd', 'x', 'y', 'z'];
    const missingFields = requiredFields.filter(f => numericInputs[f] === undefined);
    if (missingFields.length > 0) {
        alert(`Не заполнены обязательные поля: ${missingFields.join(', ')}`);
        return;
    }

    const result = performCalculation(numericInputs);
    displayResults(result);
    if (result.errorMessage) alert(result.errorMessage);
}

function displayResults(result) {
    const tbody = document.getElementById('resultsBody');
    tbody.innerHTML = '';
    ['a', 'c', 'd', 'x', 'y', 'z'].forEach(param => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = param;
        row.insertCell(1).textContent = formatNumber(result.parameters[param]);
        if (param === 'a') {
            row.insertCell(2).textContent = (typeof result.result === 'number') ?
                formatNumber(result.result) : result.result.toString();
            row.insertCell(3).textContent = result.error.toFixed(8) + '%';
        } else {
            row.insertCell(2).textContent = '';
            row.insertCell(3).textContent = '';
        }
    });
}

function clearInputs() {
    ['inputA', 'inputD', 'inputY', 'inputZ'].forEach(id => document.getElementById(id).value = '');
    clearErrors();
    document.getElementById('resultsBody').innerHTML = '';
}

function clearErrors() {
    ['errorA', 'errorD', 'errorX', 'errorY', 'errorZ'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '';
    });
}

// -------------------- Файлы --------------------
function loadTestData(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        try { const data = JSON.parse(e.target?.result); processTestData(data, 'test'); }
        catch { alert('Ошибка при чтении файла тестовых данных'); }
    };
    reader.readAsText(file);
}

function loadControlData(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        try { const data = JSON.parse(e.target?.result); processTestData(data, 'control'); }
        catch { alert('Ошибка при чтении файла контрольных данных'); }
    };
    reader.readAsText(file);
}

function processTestData(data, type) {
    if (!Array.isArray(data)) return;
    const results = data.map(testCase => {
        const params = { a: testCase.a, c: testCase.c, d: testCase.d, x: testCase.x, y: testCase.y, z: testCase.z };
        const result = performCalculation(params);
        console.log(`${type} case:`, testCase.description || '', 'Result:', result);
        return result;
    });
    displayBatchResults(results, type);
    alert(`Обработано ${data.length} ${type === 'test' ? 'тестовых' : 'контрольных'} примеров`);
}

function displayBatchResults(results, type) {
    const tbody = document.getElementById('resultsBody');
    tbody.innerHTML = '';
    const headerRow = tbody.insertRow();
    const headerCell = headerRow.insertCell(0);
    headerCell.colSpan = 4;
    headerCell.style.fontWeight = 'bold';
    headerCell.style.backgroundColor = '#f0f0f0';
    headerCell.style.textAlign = 'center';
    headerCell.textContent = `Результаты ${type === 'test' ? 'тестовых' : 'контрольных'} примеров`;

    results.forEach((result, index) => {
        if (index > 0) {
            const sepRow = tbody.insertRow();
            const sepCell = sepRow.insertCell(0);
            sepCell.colSpan = 4;
            sepCell.style.height = '5px';
            sepCell.style.backgroundColor = '#e0e0e0';
        }
        const exHeaderRow = tbody.insertRow();
        const exHeaderCell = exHeaderRow.insertCell(0);
        exHeaderCell.colSpan = 4;
        exHeaderCell.style.fontWeight = 'bold';
        exHeaderCell.style.backgroundColor = '#f8f8f8';
        exHeaderCell.textContent = `Пример ${index + 1}`;
        ['a', 'c', 'd', 'x', 'y', 'z'].forEach(param => {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = param;
            row.insertCell(1).textContent = formatNumber(result.parameters[param]);
            if (param === 'a') {
                row.insertCell(2).textContent = (typeof result.result === 'number') ? formatNumber(result.result) : result.result.toString();
                row.insertCell(3).textContent = result.error.toFixed(8) + '%';
            } else {
                row.insertCell(2).textContent = '';
                row.insertCell(3).textContent = '';
            }
        });
        if (result.errorMessage) {
            const errorRow = tbody.insertRow();
            const errorCell = errorRow.insertCell(0);
            errorCell.colSpan = 4;
            errorCell.style.color = 'red';
            errorCell.style.fontStyle = 'italic';
            errorCell.textContent = `Ошибка: ${result.errorMessage}`;
        }
    });
}

// -------------------- Глобальные функции --------------------
window.calculateFormula = calculateFormulaFromHTML;
window.clearInputs = clearInputs;
window.loadTestData = loadTestData;
window.loadControlData = loadControlData;
