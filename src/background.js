//example of using a message handler from the content scripts
chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.msg) {
    case 'films':
      sendResponse();
      break;
    default:
      break;
  }
});

jQuery.ajaxSetup({ async: false });

chrome.storage.sync.get('films', async (result) => {
  // информация считается устаревшей если ей более чем 24 часа
  if (!result.films || (result.films && new Date().getTime() > result.films.date + 1000 * 60 * 60 * 24)) {
    console.log('Start parsing...');
    let films = await parseFilms();
    films = await parseDetails(films);
    console.log('films', films);
    if (films.length) {
      chrome.storage.sync.set({ 'films': { films: films, date: new Date().getTime() } }, () => {
        console.log('write to storage');
      });
    }
  } else {
    console.log('result from storage', result.films);
  }
});

/**
 * Получаем массив объектов.
 * Пример: [{ url: "http://afisha.gid43.ru/films/view/id/3173/" }]
 */
async function parseFilms() {
  let films = [];
  await $.get(`https://afisha.yandex.ru/kirov/cinema?source=calendar&preset=today`, (response) => {
    $(response).find('.i-page__item_loader_yes').map((index, el) => {
      let url = 'https://afisha.yandex.ru/' + $(el).find('a[href]')[0].href.split('/').splice(3).join('/');
      films.push({ url: url });
    });
  });
  return films;
}
/**
 * Получаем подробности по каждому фильму.
 * @param {array} urls - массив ссылок на фильмы
 */
async function parseDetails(urls) {
  let films = []; // массив фильмов
  await urls.forEach(async (el, index) => {
    await $.get(`${el.url}`, (response) => {
      let title = $(response).find('.event-heading__title')[0].textContent.trim();
      let image = $(response).find('.event-gallery__image')[0].style.backgroundImage.split('"')[1];
      let cinema = []; // массив кинотеатров
      let scheduleTable = $(response).find('.schedule-cinema-item');

      for (let i = 0; i < scheduleTable.length; i++) {
        let name = $(scheduleTable[i]).find('.place__title')[0].textContent.trim();
        let schedule = $(scheduleTable[i]).find('.schedule-cinema-item__groups');
        let time = []; // массив расписаний
        let room = []; // массив, в котором указан номер зала и цена билета
        // получаем расписание показов
        for (let j = 0; j < schedule.length; j++) {
          let arraySchedule = $(schedule[j]).find('.schedule-sessions__item');
          for (let k = 0; k < arraySchedule.length; k++) {
            // если фильм еще не начался, то можно узнать номер зала и цену
            if (arraySchedule[k].localName.trim() == 'button') {
              time.push($(arraySchedule[k]).find('span')[0].innerHTML.split('<')[0]);
              room.push($(arraySchedule[k]).find('div')[0].textContent.trim());
            } else {
              time.push(arraySchedule[k].textContent.trim());
              room.push('Цена не определена');
            }
          }
        }
        cinema.push({ name, time, room });
      }
      films.push({ title, cinema, image });
    });
  });
  return films;
}

/**
 * Получаем массив объектов.
 * Пример: [{ url: "http://afisha.gid43.ru/films/view/id/3173/" }]
 */
async function GIDparseFilms() {
  let films = [];
  await $.get(`http://afisha.gid43.ru/rubr/view/id/0/`, (response) => {
    $(response).find('.c-cinema').map((index, el) => {
      let url = $(el).find('a[href]')[0].href;
      films.push({ url: url });
    });
  });
  return films;
}
/**
 * Получаем подробности по каждому фильму.
 * @param {array} urls - массив ссылок на фильмы
 */
async function GIDparseDetails(urls) {
  let films = []; // массив фильмов
  await urls.forEach(async (el, index) => {
    await $.get(`${el.url}`, (response) => {
      let title = $(response).find('.film__title h1')[0].textContent.trim();
      let image = $(response).find('.film__img img')[0].src;
      let cinema = []; // массив кинотеатров
      let scheduleTable = $(response).find('.schedule__table')[0].rows;
      for (let i = 0; i < scheduleTable.length; i++) {
        let name = scheduleTable[i].cells[0].textContent.trim();
        let schedule = scheduleTable[i].cells[1];
        let time = []; // массив расписаний
        let room = []; // массив, в котором указан номер зала и цена билета
        // получаем расписание показов
        for (let j = 0; j < schedule.children.length; j++) {
          // если фильм еще не начался, то можно узнать номер зала и цену
          if (schedule.children[j].localName.trim() == 'a') {
            time.push(schedule.children[j].firstChild.textContent.trim());
            room.push(schedule.children[j].lastChild.textContent.trim());
          } else {
            time.push(schedule.children[j].textContent.trim());
          }
        }
        cinema.push({ name, time, room });
      }
      films.push({ title, cinema, image });
    });
  });
  return films;
}
