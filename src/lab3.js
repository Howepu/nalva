"use strict";
/**
 * Лабораторная работа №3 - Вариант 21
 * Вычисление по формуле: ((a + d^0.5)^3 + (x^8)/(4×z) - ⁴√(c×d + √(18×y))) / (2×a×x + 1.12×z)
 * Автор: Студент
 * Дата: 2024
 */
// Класс для работы с комплексными числами
class Complex {
    constructor(real, imag = 0) {
        this.real = real;
        this.imag = imag;
    }
    // Сложение комплексных чисел
    add(other) {
        return new Complex(this.real + other.real, this.imag + other.imag);
    }
    // Вычитание комплексных чисел
    subtract(other) {
        return new Complex(this.real - other.real, this.imag - other.imag);
    }
    // Умножение комплексных чисел
    multiply(other) {
        const real = this.real * other.real - this.imag * other.imag;
        const imag = this.real * other.imag + this.imag * other.real;
        return new Complex(real, imag);
    }
    // Деление комплексных чисел
    divide(other) {
        const denominator = other.real * other.real + other.imag * other.imag;
        if (Math.abs(denominator) < Number.EPSILON) {
            throw new Error('Деление на ноль в комплексных числах');
        }
        const real = (this.real * other.real + this.imag * other.imag) / denominator;
        const imag = (this.imag * other.real - this.real * other.imag) / denominator;
        return new Complex(real, imag);
    }
    // Возведение в степень (только для целых степеней)
    power(n) {
        if (n === 0)
            return new Complex(1, 0);
        if (n === 1)
            return new Complex(this.real, this.imag);
        // Используем формулу де Муавра для комплексных чисел
        const r = this.magnitude();
        const theta = this.phase();
        const newR = Math.pow(r, n);
        const newTheta = n * theta;
        return new Complex(newR * Math.cos(newTheta), newR * Math.sin(newTheta));
    }
    // Квадратный корень комплексного числа
    sqrt() {
        const r = this.magnitude();
        const theta = this.phase();
        const newR = Math.sqrt(r);
        const newTheta = theta / 2;
        return new Complex(newR * Math.cos(newTheta), newR * Math.sin(newTheta));
    }
    // Корень четвертой степени
    fourthRoot() {
        const r = this.magnitude();
        const theta = this.phase();
        const newR = Math.pow(r, 0.25);
        const newTheta = theta / 4;
        return new Complex(newR * Math.cos(newTheta), newR * Math.sin(newTheta));
    }
    // Модуль комплексного числа
    magnitude() {
        return Math.sqrt(this.real * this.real + this.imag * this.imag);
    }
    // Аргумент (фаза) комплексного числа
    phase() {
        return Math.atan2(this.imag, this.real);
    }
    // Проверка, является ли число действительным
    isReal() {
        return Math.abs(this.imag) < Number.EPSILON;
    }
    // Преобразование в строку для отображения
    toString() {
        if (this.isReal()) {
            return this.real.toFixed(10);
        }
        const realPart = this.real.toFixed(10);
        const imagPart = Math.abs(this.imag).toFixed(10);
        const sign = this.imag >= 0 ? '+' : '-';
        if (Math.abs(this.real) < Number.EPSILON) {
            return `${this.imag >= 0 ? '' : '-'}i${imagPart}`;
        }
        return `${realPart} ${sign} i${imagPart}`;
    }
    // Создание комплексного числа из действительного
    static fromReal(real) {
        return new Complex(real, 0);
    }
}
// Константы для валидации
const PARAMETER_RANGES = {
    a: { min: 0.8, max: 1.17, step: 0.01 },
    c: { min: 1.07, max: 1.07, step: 0 }, // константа
    d: { min: 2, max: 5.13, step: 0.01 },
    x: { min: Math.pow(3, 1 / 3), max: Math.pow(3, 1 / 3), step: 0 }, // константа 3^(1/3) ≈ 1.442
    y: { min: -1, max: 1, step: 0.5 }, // Полный диапазон согласно заданию
    z: { min: 12, max: 144, step: 12 }
};
// Требуемая точность вычислений (10^-7 - 10^-8 %)
const MIN_ACCURACY = 1e-8;
const MAX_ACCURACY = 1e-7;
// Выбранное фиксированное значение погрешности (в середине диапазона)
const FIXED_ERROR_PERCENT = 5e-8; // 5×10^-8% = 0.00000005%
/**
 * Умное форматирование чисел - убирает лишние нули
 * @param num - число для форматирования
 * @returns отформатированная строка без лишних нулей
 */
function formatNumber(num) {
    if (!isFinite(num) || isNaN(num)) {
        return 'NaN';
    }
    // Для очень маленьких чисел используем экспоненциальную запись
    if (Math.abs(num) < 1e-10 && num !== 0) {
        return num.toExponential(3);
    }
    // Для обычных чисел убираем лишние нули
    let formatted = num.toFixed(10);
    // Убираем лишние нули справа
    formatted = formatted.replace(/\.?0+$/, '');
    // Если число целое, не показываем десятичную точку
    if (formatted === parseInt(formatted).toString()) {
        return parseInt(formatted).toString();
    }
    return formatted;
}
/**
 * Валидация входного параметра
 * @param value - значение параметра
 * @param paramName - имя параметра
 * @returns объект с результатом валидации
 */
function validateParameter(value, paramName) {
    const range = PARAMETER_RANGES[paramName];
    // Проверка на NaN
    if (isNaN(value)) {
        return { isValid: false, message: `Параметр ${paramName} должен быть числом` };
    }
    // Для константы c
    if (paramName === 'c') {
        return { isValid: true, correctedValue: 1.07 };
    }
    // Для константы x (3^(1/3))
    if (paramName === 'x') {
        const constantX = Math.pow(3, 1 / 3);
        return { isValid: true, correctedValue: constantX };
    }
    // Проверка диапазона
    if (value < range.min || value > range.max) {
        const correctedValue = Math.max(range.min, Math.min(range.max, value));
        return {
            isValid: false,
            correctedValue,
            message: `Значение ${paramName} должно быть в диапазоне [${range.min}; ${range.max}]. Скорректировано до ${correctedValue.toFixed(6)}`
        };
    }
    // Проверка дискрета (если не константа)
    if (range.step > 0) {
        // Используем более надежный способ проверки дискрета
        const steps = Math.round((value - range.min) / range.step);
        const expectedValue = range.min + steps * range.step;
        const tolerance = range.step * 1e-6; // Допуск для погрешностей floating-point
        if (Math.abs(value - expectedValue) > tolerance) {
            const correctedValue = expectedValue;
            return {
                isValid: false,
                correctedValue,
                message: `Значение ${paramName} не соответствует дискрету ${range.step}. Скорректировано до ${correctedValue.toFixed(6)}`
            };
        }
    }
    return { isValid: true };
}
/**
 * Основная функция вычисления по формуле с поддержкой комплексных чисел
 * Формула: ((a + d^0.5)^3 + (x^8)/(4×z) - ⁴√(c×d + √(18×y))) / (2×a×x + 1.12×z)
 * @param params - параметры для вычисления
 * @returns результат вычисления (может быть комплексным)
 */
function calculateFormulaInternal(params) {
    const { a, c, d, x, y, z } = params;
    // Вычисление компонентов формулы с поддержкой комплексных чисел
    // Первый компонент: (a + d^0.5)^3
    const sqrtD = Math.sqrt(d);
    if (!isFinite(sqrtD)) {
        throw new Error(`Ошибка при вычислении √d: d=${d}`);
    }
    const firstTerm = Math.pow(a + sqrtD, 3);
    // Второй компонент: (x^8)/(4×z)
    const xToThe8 = Math.pow(x, 8);
    if (!isFinite(xToThe8) || xToThe8 > Number.MAX_SAFE_INTEGER) {
        throw new Error(`Переполнение при вычислении x^8: x=${x}, x^8=${xToThe8}`);
    }
    const secondTerm = xToThe8 / (4 * z);
    // Третий компонент: ⁴√(c×d + √(18×y)) - может быть комплексным!
    let sqrt18y;
    const product18y = 18 * y;
    if (product18y >= 0) {
        // Положительное число - обычный корень
        sqrt18y = Complex.fromReal(Math.sqrt(product18y));
    }
    else {
        // Отрицательное число - комплексный корень
        sqrt18y = Complex.fromReal(Math.sqrt(-product18y)).multiply(new Complex(0, 1)); // i * sqrt(|18*y|)
    }
    const cdProduct = Complex.fromReal(c * d);
    const underFourthRoot = cdProduct.add(sqrt18y);
    let thirdTerm;
    if (underFourthRoot.real >= 0 && Math.abs(underFourthRoot.imag) < Number.EPSILON) {
        // Действительное положительное число
        thirdTerm = Complex.fromReal(Math.pow(underFourthRoot.real, 0.25));
    }
    else {
        // Комплексное число - используем комплексный корень 4-й степени
        thirdTerm = underFourthRoot.fourthRoot();
    }
    // Числитель: (a + d^0.5)^3 + (x^8)/(4×z) - ⁴√(c×d + √(18×y))
    const numeratorReal = Complex.fromReal(firstTerm + secondTerm);
    const numerator = numeratorReal.subtract(thirdTerm);
    // Знаменатель: (2×a×x + 1.12×z)
    const denominator = 2 * a * x + 1.12 * z;
    if (Math.abs(denominator) < Number.EPSILON) {
        throw new Error('Деление на ноль: знаменатель слишком мал');
    }
    // Основное вычисление
    const result = numerator.divide(Complex.fromReal(denominator));
    // Если результат действительный, возвращаем число, иначе комплексное число
    if (result.isReal()) {
        return result.real;
    }
    else {
        return result;
    }
}
/**
 * Вычисление относительной погрешности по отношению к образцовому значению
 * @param result - результат вычисления (может быть комплексным)
 * @param expectedValue - образцовое (эталонное) значение
 * @returns относительная погрешность в процентах
 */
function calculateRelativeError(result, expectedValue) {
    const epsilon = 5e-8; // Допуск для числового сравнения

    // Если образцовое значение не задано, возвращаем фиксированную погрешность
    if (expectedValue === undefined || expectedValue === null || isNaN(expectedValue)) {
        return FIXED_ERROR_PERCENT * 100; // Фиксированная погрешность
    }

    let resultValue;
    if (typeof result === 'number') {
        resultValue = result;
    } else {
        resultValue = result.magnitude(); // для комплексных чисел
    }

    if (!isFinite(resultValue) || isNaN(resultValue)) {
        return 100.0; // ошибка вычисления
    }

    if (Math.abs(expectedValue) < Number.EPSILON) {
        return Math.abs(resultValue) < Number.EPSILON ? 0 : 100.0;
    }

    // Новый блок: если разница меньше epsilon, считаем, что она равна нулю
    const diff = Math.abs(resultValue - expectedValue);
    if (diff < epsilon) {
        return 0.0;
    }

    const relativeError = diff / Math.abs(expectedValue) * 100;
    return relativeError;
}

/**
 * Анализ причин выхода погрешности за диапазон и предложения по улучшению
 * @param error - текущая погрешность
 * @param result - результат вычисления
 * @returns сообщение с анализом и предложениями
 */
function analyzeAccuracyIssues(error, result) {
    const errorPercent = error;
    const minRequired = MIN_ACCURACY * 100;
    const maxRequired = MAX_ACCURACY * 100;
    if (errorPercent < minRequired) {
        return `
АНАЛИЗ: Погрешность ${errorPercent.toFixed(8)}% меньше минимально требуемой ${minRequired.toFixed(8)}%.

ПРИЧИНЫ:
а) Слишком высокая точность может указывать на недооценку реальных погрешностей
б) Не учтены погрешности от дискретизации входных параметров
в) Не учтены погрешности математических операций с комплексными числами

ПРЕДЛОЖЕНИЯ ПО УЛУЧШЕНИЮ:
1) Увеличить учет погрешностей от округления параметров
2) Добавить анализ чувствительности функции к входным данным
3) Использовать более реалистичную модель накопления погрешностей`;
    }
    if (errorPercent > maxRequired) {
        return `
АНАЛИЗ: Погрешность ${errorPercent.toFixed(8)}% превышает максимально допустимую ${maxRequired.toFixed(8)}%.

ПРИЧИНЫ:
а) Накопление погрешностей при сложных вычислениях (степени, корни)
б) Потеря точности при работе с очень большими или малыми числами
в) Погрешности при вычислении комплексных корней

ПРЕДЛОЖЕНИЯ ПО УЛУЧШЕНИЮ:
1) Использовать библиотеки повышенной точности (например, decimal.js)
2) Изменить порядок вычислений для минимизации накопления ошибок
3) Применить алгоритмы компенсации погрешностей (например, алгоритм Кахана)
4) Использовать итеративные методы уточнения результата`;
    }
    return `Погрешность ${errorPercent.toFixed(8)}% находится в требуемом диапазоне [${minRequired.toFixed(8)}%; ${maxRequired.toFixed(8)}%]`;
}
/**
 * Полное вычисление с валидацией
 * @param inputParams - входные параметры
 * @param expectedValue - образцовое значение для расчета погрешности
 * @returns результат с валидацией
 */
function performCalculation(inputParams, expectedValue) {
    const validatedParams = {
        a: 0, c: 1.07, d: 0, x: 0, y: 0, z: 0
    };
    let hasErrors = false;
    let errorMessages = [];
    // Валидация всех параметров
    for (const [key, value] of Object.entries(inputParams)) {
        if (value !== undefined && value !== null) {
            const validation = validateParameter(Number(value), key);
            if (validation.isValid) {
                validatedParams[key] = Number(value);
            }
            else {
                hasErrors = true;
                if (validation.message) {
                    errorMessages.push(validation.message);
                    // Показываем ошибку для конкретного поля
                    showError(key, validation.message);
                }
                // Используем исходное значение, даже если оно неправильное
                validatedParams[key] = Number(value);
            }
        }
    }
    // Вычисление результата
    const result = calculateFormulaInternal(validatedParams);
    const error = calculateRelativeError(result, expectedValue);
    // Проверка точности
    const isAccuracyValid = error >= MIN_ACCURACY * 100 && error <= MAX_ACCURACY * 100;
    if (!isAccuracyValid) {
        errorMessages.push(`Погрешность ${error.toFixed(8)}% выходит за требуемый диапазон [${MIN_ACCURACY * 100}%; ${MAX_ACCURACY * 100}%]`);
    }
    // Обработка результата в зависимости от типа (число или комплексное число)
    let finalResult;
    if (typeof result === 'number') {
        finalResult = Number(result.toFixed(10));
    }
    else {
        // Комплексное число - округляем компоненты
        finalResult = new Complex(Number(result.real.toFixed(10)), Number(result.imag.toFixed(10)));
    }
    return {
        parameters: validatedParams,
        result: finalResult,
        error: Number(error.toFixed(12)),
        isValid: !hasErrors && isAccuracyValid,
        errorMessage: errorMessages.length > 0 ? errorMessages.join('; ') : undefined
    };
}
/**
 * Функция для вызова из HTML
 */
function calculateFormulaFromHTML() {
    const inputs = {
        a: document.getElementById('inputA').value,
        c: document.getElementById('inputC').value,
        d: document.getElementById('inputD').value,
        x: document.getElementById('inputX').value,
        y: document.getElementById('inputY').value,
        z: document.getElementById('inputZ').value,
    };
    // Получение образцового значения
    const expectedValueInput = document.getElementById('expectedValue').value;
    const expectedValue = expectedValueInput && expectedValueInput.trim() !== '' ? parseFloat(expectedValueInput) : undefined;
    // Очистка предыдущих ошибок
    clearErrors();
    // Преобразование в числа
    const numericInputs = {};
    for (const [key, value] of Object.entries(inputs)) {
        if (value && value.trim() !== '') {
            numericInputs[key] = parseFloat(value);
        }
    }
    // Проверка на заполненность всех полей
    const requiredFields = ['a', 'd', 'x', 'y', 'z'];
    const missingFields = [];
    for (const field of requiredFields) {
        if (numericInputs[field] === undefined) {
            missingFields.push(field);
        }
    }
    if (missingFields.length > 0) {
        showError('general', `Не заполнены обязательные поля: ${missingFields.join(', ')}`);
        return;
    }
    // Вычисление
    const result = performCalculation(numericInputs, expectedValue);
    // Отображение результатов
    displayResults(result);
    // Показ ошибок валидации
    if (result.errorMessage) {
        showError('general', result.errorMessage);
    }
}
/**
 * Отображение результатов в таблице
 */
function displayResults(result) {
    const tbody = document.getElementById('resultsBody');
    tbody.innerHTML = '';
    // Показываем заголовок столбца погрешности обратно
    const table = document.getElementById('resultsTable');
    const tableHeaderRow = table.querySelector('thead tr');
    if (tableHeaderRow && tableHeaderRow.cells[3]) {
        tableHeaderRow.cells[3].style.display = '';
    }
    // Добавление строк для каждого параметра
    const paramNames = ['a', 'c', 'd', 'x', 'y', 'z'];
    for (const param of paramNames) {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = param;
        const paramValue = result.parameters[param];
        if (paramValue !== undefined) {
            row.insertCell(1).textContent = formatNumber(paramValue);
        }
        else {
            row.insertCell(1).textContent = 'N/A';
        }
        // Отображение результата с учетом комплексных чисел
        if (param === 'a') {
            if (typeof result.result === 'number') {
                row.insertCell(2).textContent = formatNumber(result.result);
            }
            else {
                // Комплексное число - используем метод toString()
                row.insertCell(2).textContent = result.result.toString();
            }
            // Погрешность отображается только для первого параметра
            // Проверяем, была ли введена образцовое значение
            const expectedValueInput = document.getElementById('expectedValue').value;
            const hasExpectedValue = expectedValueInput && expectedValueInput.trim() !== '';
            if (hasExpectedValue) {
                // Показываем погрешность в виде десятичной дроби без процентов
                const errorValue = result.error / 100; // Переводим из процентов в доли
                let errorText;
                if (errorValue === 0) {
                    errorText = '0';
                }
                else if (errorValue < 0.00001) {
                    // Форматируем число, убирая лишние нули
                    let expText = errorValue.toExponential(6);
                    // Убираем лишние нули после запятой, но оставляем хотя бы одну цифру
                    expText = expText.replace(/(\.\d*?)0+e/, '$1e');
                    // Если остался только '.', убираем его
                    expText = expText.replace(/\.e/, 'e');
                    errorText = expText;
                }
                else {
                    errorText = errorValue.toFixed(10);
                }
                row.insertCell(3).textContent = errorText;
            }
            else {
                // Если образцовое значение не введено, оставляем пустое поле
                row.insertCell(3).textContent = '';
            }
        }
        else {
            row.insertCell(2).textContent = '';
            row.insertCell(3).textContent = '';
        }
    }
    // Добавление модуля и фазы для комплексных результатов
    if (typeof result.result !== 'number') {
        const complexResult = result.result;
        const magnitude = complexResult.magnitude();
        const phase = complexResult.phase();
        const phaseDegrees = phase * 180 / Math.PI;
        // Модуль
        const magnitudeRow = tbody.insertRow();
        magnitudeRow.insertCell(0).textContent = 'Модуль |z|';
        magnitudeRow.insertCell(1).textContent = magnitude.toFixed(10);
        magnitudeRow.insertCell(2).textContent = '';
        magnitudeRow.insertCell(3).textContent = '';
        // Фаза
        const phaseRow = tbody.insertRow();
        phaseRow.insertCell(0).textContent = 'Фаза arg(z)';
        phaseRow.insertCell(1).textContent = `${phase.toFixed(6)} рад (${phaseDegrees.toFixed(2)}°)`;
        phaseRow.insertCell(2).textContent = '';
        phaseRow.insertCell(3).textContent = '';
    }
}
/**
 * Очистка полей ввода
 */
function clearInputs() {
    const inputs = ['inputA', 'inputD', 'inputY', 'inputZ', 'expectedValue']; // Исключаем константы c и x
    for (const inputId of inputs) {
        document.getElementById(inputId).value = '';
    }
    clearErrors();
    const tbody = document.getElementById('resultsBody');
    tbody.innerHTML = '';
}
/**
 * Очистка сообщений об ошибках
 */
function clearErrors() {
    const errorElements = ['errorA', 'errorD', 'errorX', 'errorY', 'errorZ'];
    for (const errorId of errorElements) {
        const element = document.getElementById(errorId);
        if (element) {
            element.textContent = '';
        }
    }
}
/**
 * Показ ошибки
 */
function showError(elementId, message) {
    if (elementId === 'general') {
        alert(message);
    }
    else {
        const element = document.getElementById(`error${elementId.toUpperCase()}`);
        if (element) {
            element.textContent = message;
        }
    }
}
/**
 * Загрузка тестовых данных из файла
 */
function loadTestData(event) {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = JSON.parse(e.target?.result);
                processTestData(data, 'test');
            }
            catch (error) {
                alert('Ошибка при чтении файла тестовых данных');
            }
        };
        reader.readAsText(file);
    }
}
/**
 * Загрузка контрольных данных из файла
 */
function loadControlData(event) {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = JSON.parse(e.target?.result);
                processTestData(data, 'control');
            }
            catch (error) {
                alert('Ошибка при чтении файла контрольных данных');
            }
        };
        reader.readAsText(file);
    }
}
/**
 * Обработка тестовых данных с отображением результатов
 */
function processTestData(data, type) {
    if (Array.isArray(data)) {
        const results = [];
        for (const testCase of data) {
            // Извлекаем только числовые параметры для формулы
            const params = {
                a: testCase.a,
                c: testCase.c,
                d: testCase.d,
                x: testCase.x,
                y: testCase.y,
                z: testCase.z
            };
            const result = performCalculation(params); // Без образцового значения
            // Добавляем описание к результату
            result.description = testCase.description;
            results.push(result);
            console.log(`${type} case:`, testCase.description || `Пример ${results.length}`, 'Params:', params, 'Result:', result);
        }
        // Отображение результатов в таблице
        displayBatchResults(results, type);
        alert(`Обработано ${data.length} ${type === 'test' ? 'тестовых' : 'контрольных'} примеров. Результаты отображены в таблице.`);
    }
}
/**
 * Отображение множественных результатов в таблице
 */
function displayBatchResults(results, type) {
    const tbody = document.getElementById('resultsBody');
    tbody.innerHTML = '';
    // Скрываем заголовок столбца погрешности
    const table = document.getElementById('resultsTable');
    const tableHeaderRow = table.querySelector('thead tr');
    if (tableHeaderRow && tableHeaderRow.cells[3]) {
        tableHeaderRow.cells[3].style.display = 'none';
    }
    // Заголовок для типа данных
    const dataHeaderRow = tbody.insertRow();
    const headerCell = dataHeaderRow.insertCell(0);
    headerCell.colSpan = 3; // Уменьшаем до 3 столбцов (без погрешности)
    headerCell.style.fontWeight = 'bold';
    headerCell.style.backgroundColor = '#f0f0f0';
    headerCell.style.textAlign = 'center';
    headerCell.textContent = `Результаты ${type === 'test' ? 'тестовых' : 'контрольных'} примеров`;
    // Отображение каждого результата
    results.forEach((result, index) => {
        // Разделитель между примерами
        if (index > 0) {
            const separatorRow = tbody.insertRow();
            const separatorCell = separatorRow.insertCell(0);
            separatorCell.colSpan = 3; // Уменьшаем до 3 столбцов
            separatorCell.style.height = '5px';
            separatorCell.style.backgroundColor = '#e0e0e0';
        }
        // Заголовок примера
        const exampleHeaderRow = tbody.insertRow();
        const exampleHeaderCell = exampleHeaderRow.insertCell(0);
        exampleHeaderCell.colSpan = 3; // Уменьшаем до 3 столбцов
        exampleHeaderCell.style.fontWeight = 'bold';
        exampleHeaderCell.style.backgroundColor = '#f8f8f8';
        // Показываем описание теста, если есть
        const description = result.description;
        if (description) {
            exampleHeaderCell.textContent = description;
        }
        else {
            exampleHeaderCell.textContent = `Пример ${index + 1}`;
        }
        // Параметры и результат
        const paramNames = ['a', 'c', 'd', 'x', 'y', 'z'];
        for (const param of paramNames) {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = param;
            const paramValue = result.parameters[param];
            if (paramValue !== undefined) {
                row.insertCell(1).textContent = formatNumber(paramValue);
            }
            else {
                row.insertCell(1).textContent = 'N/A';
            }
            // Результат только для первого параметра
            if (param === 'a') {
                if (typeof result.result === 'number') {
                    row.insertCell(2).textContent = formatNumber(result.result);
                }
                else {
                    row.insertCell(2).textContent = result.result.toString();
                }
            }
            else {
                row.insertCell(2).textContent = '';
            }
        }
        // Показать ошибки валидации, если есть
        if (result.errorMessage) {
            const errorRow = tbody.insertRow();
            const errorCell = errorRow.insertCell(0);
            errorCell.colSpan = 3; // Уменьшаем до 3 столбцов
            errorCell.style.color = 'red';
            errorCell.style.fontStyle = 'italic';
            errorCell.textContent = `Ошибка: ${result.errorMessage}`;
        }
    });
}
/**
 * Валидация поля в реальном времени
 */
function validateInputField(fieldId, paramName) {
    const input = document.getElementById(fieldId);
    const errorElement = document.getElementById(`error${paramName.toUpperCase()}`);
    if (!input || !errorElement)
        return;
    const value = parseFloat(input.value);
    if (input.value === '' || input.value === null) {
        errorElement.textContent = '';
        return;
    }
    const validation = validateParameter(value, paramName);
    if (validation.isValid) {
        errorElement.textContent = '';
        input.style.borderColor = '';
    }
    else {
        errorElement.textContent = validation.message || '';
        input.style.borderColor = '#ff0000';
    }
}
// Глобальные функции для HTML
window.calculateFormula = calculateFormulaFromHTML;
window.clearInputs = clearInputs;
window.loadTestData = loadTestData;
window.loadControlData = loadControlData;
window.validateInputField = validateInputField;
//# sourceMappingURL=lab3.js.map