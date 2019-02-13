(function(document) {
var toggle_btn = document.querySelector('.js-menu-toggle-btn');
var toggle_menu = document.querySelector('.js-site-menu');

//установка исходного состояния главного меню (закрыто)
toggle_btn.classList.remove('menu-toggle-btn--open');
toggle_menu.classList.add('site-navigation__list--close');


//обработка отрытия меню

toggle_btn.addEventListener('click', function() {
  if(this.classList.contains('menu-toggle-btn--open')) {
    this.classList.remove('menu-toggle-btn--open');
    toggle_menu.classList.add('site-navigation__list--close');
  }
  else {
    this.classList.add('menu-toggle-btn--open');
    toggle_menu.classList.remove('site-navigation__list--close');
  }
});

// инициализация и добавление интерактивной карты на странциу

var map_container = document.getElementById('main_contacts_map');
var map_backup = document.getElementById('main_contacts_map_backup');

//получаем ширину страницы браузера для изменения карты
var screen_width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

// переменная, которая содержит слой карты с меткой. Необходимо для удаления/добавления маркера на разных вьюпортах
var layer = null;
// переменная содержит ссылку на добавленую карту
var map = null;
// инициализация карты
initMap();

// изменение вида карты для разных вьюпортов
window.addEventListener('resize', function() {
  screen_width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

  // удаляем маркер с карты для его реинициализации на новых вьюпорта (чтобы небыло наложения)
  if (layer !== null) {
    layer.removeFrom(map);
    initMap();
  }
});

function initMap() {
  //console.log('Инициализация карты');

  //проверяем доступность ассинхронно загружаемого скрипта leaflet для карты
  var timerId = null;
  if (!window.L) {
    //console.log('Инициализация таймера');
    timerId = setTimeout(initMap, 500);
    return false;
  }
  else {
    clearTimeout(timerId);
    timerId = null;
  }

  //скрываем картинку для бэкапа если JS не работает
  //показываем блок для дальнейшего размещения в нем карты
  map_backup.style.display = 'none';
  map_container.style.display = "block";

  // задаем координаты маркера
  var lat = 59.938727;
  var lng = 30.323085;

  //задаем высоту и ширину маркера
  var map_pin_width = 56;
  var map_pin_height = 53;
  // задаем относительную точку позиционирования маркера над координатами
  var map_pin_anchor_g = Math.round(map_pin_width / 2);
  var map_pin_anchor_v = map_pin_height - 1;

  // на экранах планшета и больше иконка макера больше
  if (screen_width >= 768) {
    map_pin_width = 113;
    map_pin_height = 106;
  }

  //инициализация карты
  //отключаем возможность увеличения карты по скролингу, чтобы не мешало пролистыванию страницы
  if (map == null) {
    map = L.map(map_container, {scrollWheelZoom: false});
  }

  //различные представления карты на разных вьюпортах
  if (screen_width >= 1440) {
    //на версии для десктопа центр карты смещаем вправо
    //уменьшаем стартовый зум до 17
    map.setView([59.939012, 30.317150], 17);
  }
  else if (screen_width >= 768) {
    map.setView([lat, lng], 18);
  }
  else {
    map.setView([lat, lng], 17);
  }

  //инициализация тайтлов
  // для карты gogle параметр lyrs означает
  // lyrs=m - городсткая карта
  // lyrs=s - спутниковые снимки
  // lyrs=s,h - гибрид
	L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3'],
    attribution: '&copy; <a href="https://www.google.com/permissions/geoguidelines/">Google Maps</a> contributors'
  }).addTo(map);

  var icon_url = '../img/map-pin.png';
  if (document.documentElement.classList.contains('webp'))
    icon_url='../img/map-pin.webp';



  //инициализация иконки с указанием адреса картинки
  var myIcon = L.icon({
    iconUrl: icon_url,
    iconSize: [map_pin_width, map_pin_height],
    iconAnchor: [map_pin_anchor_g, map_pin_anchor_v]
  });

  //добавление макера на карту
  layer = L.marker([lat, lng], {icon: myIcon}).addTo(map);
}
}(document));
