const checkboxFiltersContainer = document.querySelector('.checkbox_filters_container')
const cardsContainer = document.querySelector('.cards_container')
const textFilter = document.querySelector('.text_filter')
const clearButton = document.querySelector('.btn_clear')
let data = await fetch('https://fakerapi.it/api/v1/books')
    .then(response => response.json())
    .then((data) => {
        return data.data;
    })
// Добавляем объект для работы с динамикой
let globalObj = {
    initialData: data,
    currentData: [],
    checkboxData: [],
    checkboxArr: [],
    checkboxSelectedValues: [],
    textData: [],
    textSelectedValues: '',
    firstInit: firstInit,
    render: render
}
// Вспомогательная функция для установки аттрибутов
function setAttributes(el, attrs) {
    for(let key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
}
// Функции для создания необходимых динамических элементов
function createCheckBoxComponent(el) {
    let checkboxContainer = document.createElement('div')
    let input = document.createElement('input')
    input.addEventListener('click',toggleCheckboxFilter)
    let text = document.createElement('p')
    text.innerHTML = el.genre
    setAttributes(checkboxContainer, {'class': 'checkbox_item_container'})
    if (el.checked) {
        setAttributes(input, {'type': 'checkbox', 'class': 'checkbox_item', 'value': `${el.genre}`, 'checked': 'true'})
    } else {
        setAttributes(input, {'type': 'checkbox', 'class': 'checkbox_item', 'value': `${el.genre}`})
    }
    checkboxContainer.append(input, text)
    return checkboxContainer;
}
function createBookCard(book){
    let bookContainer = document.createElement('div')
    let description = document.createElement('p')
    description.innerHTML = book.description
    let author = document.createElement('p')
    author.innerHTML = book.author
    let genre = document.createElement('p')
    genre.innerHTML = book.genre
    setAttributes(bookContainer, {'class': 'card_item'})
    bookContainer.append(description, author, genre)
    return bookContainer;
}

// Функция для выставления значений при клике на чекбокс
function toggleCheckboxFilter(e) {
    let val = e.target.value
    let selected = []
    _.each(globalObj.checkboxData, el => {
        if (el.genre === val) {
            el.checked = !el.checked
        }
    })
    _.each(globalObj.checkboxData, el => {
        if (el.checked) {
            selected.push(el)
        }
    })
    compareFilters(selected)
}
// Вспомогательная функция для корректной фильтрации при множественном выборе чекбоксов
function sliceArr(arr1, arr2, textFlag){
    if (arr1.length) {
        arr2 = _.filter(arr2, el => {
            return el.genre === arr1[0].genre
        })
        arr1 = arr1.slice(1)
        if (textFlag) {
            sliceArr(arr1, arr2, true)
        } else {
            sliceArr(arr1, arr2, false)
        }
    } else {
        if (textFlag) {
            globalObj.currentData = arr2
            let val = globalObj.textSelectedValues
            filterByText(val)
        } else {
            globalObj.currentData = arr2
            render(arr2)
        }
    }
}
// Основная логика по фильтрации
function compareFilters(checkboxValues = []) {
    let elementsArr = []
    let textValues = globalObj.textSelectedValues
    _.each(globalObj.checkboxData, el => {
        elementsArr.push(el)
    })
    if (textValues === '') {
        if (checkboxValues.length) {
            sliceArr(checkboxValues, elementsArr, false)
        } else {
            render(globalObj.initialData)
        }
    } else {
        if (checkboxValues.length) {
            sliceArr(checkboxValues, elementsArr, true)
        } else {
            let val = globalObj.textSelectedValues
            globalObj.currentData = globalObj.initialData
            filterByText(val)
        }
    }
}
// Функции текстового инпута-фильтра
textFilter.oninput = changeTextFilter
function changeTextFilter(e) {
    let val = e.target.value
    filterByText(val)
}
function filterByText(val){
    globalObj.textData = []
    globalObj.textSelectedValues = val
    globalObj.textData = _.filter( globalObj.currentData, (el) => {
        if (_.includes(el.author, val) || _.includes(el.description, val) || _.includes(el.genre, val)) {
            return el
        }
    })
    render(globalObj.textData)
}
// Функция сброса фильтров
clearButton.onclick = clearFilters
function clearFilters() {
    textFilter.value = ''
    globalObj.currentData = []
    prepareObj(globalObj)
    firstInit(globalObj.currentData, globalObj.checkboxArr)
}

// Функция рендера для карточек
function render(arr) {
    if (arr.length > 0) {
        cardsContainer.innerHTML = ''
        _.each(arr, el => {
            let card = createBookCard(el)
            cardsContainer.append(card)
        })
    } else {
        cardsContainer.innerHTML = 'Ничего не найдено'
    }
}

// Подготовка объекта и первичная инициализация
function prepareObj(obj) {
    obj.checkboxArr = []
    obj.checkboxData = []
    obj.currentData = []
    obj.textData = []
    obj.checkboxSelectedValues = []
    obj.textSelectedValues = ''
    _.each(obj.initialData, el => {
        obj.currentData.push({
            ...el,
            checked: false
        })
        obj.checkboxData.push({
            ...el,
            checked: false
        })
        obj.checkboxArr.push({
            ...el,
            checked: false
        })
    })
    obj.checkboxArr = _.uniqBy(obj.checkboxArr, item => item.genre)
}
prepareObj(globalObj)
function firstInit(arr, checkboxArr) {
    checkboxFiltersContainer.innerHTML = ''
    cardsContainer.innerHTML = ''
    _.each(arr, el => {
        let card = createBookCard(el)
        cardsContainer.append(card)
    })
    _.each(checkboxArr, el => {
        let checkbox = createCheckBoxComponent(el)
        checkboxFiltersContainer.append(checkbox)
    })
}
firstInit(globalObj.currentData, globalObj.checkboxArr)

