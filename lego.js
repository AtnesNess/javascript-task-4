'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

function getCollectionCopy(collection) {

    return JSON.parse(JSON.stringify(collection));
}

function sortByPriority(functions) {
    var priorities = {
        'and': 1,
        'or': 1,
        'filterIn': 2,
        'sortBy': 3,
        'select': 4,
        'format': 5,
        'limit': 6
    };

    return functions.sort(function (f1, f2) {

        return priorities[f1.name] < priorities[f2.name] ? -1 : 1;
    });
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    var functions = sortByPriority([].slice.call(arguments, 1));
    var collectionCopy = getCollectionCopy(collection);
    functions.forEach(function (func) {
        collectionCopy = func(collectionCopy);
    });

    return collectionCopy;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function} - Отбирающая функция
 */
exports.select = function () {
    var fields = [].slice.call(arguments);

    return function select(collection) {
        var filteredCollection = [];
        collection.forEach(function (contact) {
            var filteredContact = {};
            for (var field in contact) {
                if (fields.indexOf(field) !== -1) {
                    filteredContact[field] = contact[field];
                }
            }
            filteredCollection.push(filteredContact);
        });

        return filteredCollection;
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function} - Фильтрующая по значению функция
 */
exports.filterIn = function (property, values) {
    // console.info(property, values);

    return function filterIn(collection) {
        var filteredCollection = [];
        collection.forEach(function (contact) {
            if (values.indexOf(contact[property]) !== -1) {
                filteredCollection.push(contact);
            }
        });

        return filteredCollection;
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function} - Сортирующая функция
 */
exports.sortBy = function (property, order) {
    // console.info(property, order);

    return function sortBy(collection) {

        return collection.sort(function (contact1, contact2) {
            if (order === 'asc') {

                return contact1[property] > contact2[property];
            }

            return contact1[property] < contact2[property];
        });
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Function} -  Форматрирующая функция
 */
exports.format = function (property, formatter) {
    // console.info(property, formatter);

    return function format(collection) {

        return collection.slice().map(function (contact) {
            contact[property] = formatter(contact[property]);

            return contact;
        });
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function} - ограничивающая функция
 */
exports.limit = function (count) {
    // console.info(count);
    return function limit(collection) {

        return collection.slice(0, count);
    };
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function} - or функция
     */
    exports.or = function () {
        var functions = [].slice.call(arguments);

        return function or(collection) {
            var filteredCollection = [];
            functions.forEach(function (func) {

                func(collection).forEach(function (contact) {
                    if (filteredCollection.indexOf(contact) === -1) {
                        filteredCollection.push(contact);
                    }
                });
            });

            return filteredCollection;
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function} - and функция
     */
    exports.and = function () {
        var functions = [].slice.call(arguments);

        return function and(collection) {
            var collectionCopy = getCollectionCopy(collection);
            functions.forEach(function (func) {
                collectionCopy = func(collectionCopy);
            });

            return collectionCopy;
        };
    };
}
