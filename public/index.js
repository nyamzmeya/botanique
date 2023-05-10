import { font } from "./Roboto-Regular-normal.js"; // шрифт для jspdf


// данные пользователя
async function getUser() {
  const data = await fetch("/user", {
    method: "GET",
  });
  if (!data.ok) {
    throw new Error(`HTTP error! status: ${user.status}`);
  }
  const data_serialised = await data.json();
  return data_serialised;
}

// поменять статус прибора
async function changeStatus(id, new_status) {
  const data = await fetch("/status", {
    method: "PATCH",
    body: JSON.stringify({ id: id, status: new_status }),
  });
  if (!data.ok) {
    throw new Error(`HTTP error! status: ${data.status}`);
  }
}

// select элемент
let createSelect = (data) => {
  let selectList = document.createElement("select");
  let array = ["Свободен", "Занят"];
  for (let i = 0; i < array.length; i++) {
    let option = document.createElement("option");
    option.value = array[i];
    option.text = array[i];
    selectList.appendChild(option);
  }
  selectList.value = data.status;
  selectList.addEventListener("change", () => {
    let answer = confirm("Вы хотите сменить статус прибора?");
    if (answer) {
      changeStatus(data._id, selectList.value);
    } else {
      selectList.value = data.status;
    }
  });
  return selectList;
};

// Рендер для главной страницы
let showDevices = (data) => {
  let fragment = document.createDocumentFragment();
  for (let i = 0; i < data.length; i++) {
    let newNode = document.createElement("div");
    let img = document.createElement("img");
    img.src = data[i].image;
    img.className = "main__devices__item__img";
    let title = document.createElement("span");
    title.innerHTML = data[i].title;
    title.className = "main__devices__item__title";
    let status = createSelect(data[i]);
    status.className = "main__devices__item__status";
    let work_status = document.createElement("img");
    work_status.src = `./img/${data[i].work_status}.svg`;
    work_status.className = "main__devices__item__work";
    newNode.className = "main__devices__item";
    newNode.appendChild(img);
    newNode.appendChild(title);
    newNode.appendChild(status);
    newNode.appendChild(work_status);
    fragment.appendChild(newNode);
  }
  return fragment;
};


// поиск прибора по названию
let searchEvent = (event) => {
  let filter = event.target.value.toLowerCase();
  let items = document.querySelectorAll(".main__devices__item");
  for (let i = 0; i < items.length; i++) {
    let title = items[i].querySelector(".main__devices__item__title").innerHTML;
    if (title.toLowerCase().indexOf(filter) > -1) {
      items[i].style.display = "";
    } else {
      items[i].style.display = "none";
    }
  }
};


// сохранение таблицы в pdf
let saveTopdf = (e) => {
  let element = e.target
    .closest(".main__analytics__device")
    .querySelector(".main__analytics__device__table")
    .querySelector("table");
  
  let doc = new jsPDF('l', 'pt');
  doc.addFileToVFS("Roboto.ttf", font);
  doc.addFont("Roboto.ttf", "Roboto", "normal");
  doc.setFont("Roboto");
  let res = doc.autoTableHtmlToJson(element);
  doc.autoTable(res.columns, res.data, {
    theme: 'grid',
    styles: {
      font: "Roboto",
      fontStyle: "normal",
    },
  });
  doc.save('table.pdf');
};

let search = document.querySelector(".main__input");
search?.addEventListener("keyup", searchEvent);



// header прибора для страницы с аналитикой
let createFullHeader = (data) => {
  let fragment = document.createDocumentFragment();
  let header = document.createElement("div");
  let img = document.createElement("img");
  img.className = "main__device__header__img";
  let title = document.createElement("div");
  title.className = "main__device__header__title";
  let title_main = document.createElement("span");
  title_main.innerHTML = data.title;
  let subtitle = document.createElement("span");
  subtitle.innerHTML = `${data.number} ${data.subdivision}`;
  title.appendChild(title_main);
  title.appendChild(subtitle);
  img.src = data.image;
  let status = createSelect(data);
  status.className = "main__device__header__select";
  let heart = document.createElement("img");
  heart.src = "./img/heart_color.svg";
  heart.className = "main__device__header__heart";
  let settings = document.createElement("img");
  settings.src = "./img/settings.svg";
  settings.className = "main__device__header__setting";
  let subheader = document.createElement("div");
  subheader.className = "main__device__subheader";
  let show_work = document.createElement("div");
  show_work.innerHTML = "Работа прибора";
  show_work.className = "main__device__subheader__show";
  let timer = document.createElement("img");
  timer.src = "./img/timer.svg";
  timer.className = "main__device__subheader__timer";
  subheader.appendChild(show_work);
  subheader.appendChild(timer);
  let pdf = document.createElement("div");
  pdf.innerHTML = "Сохранить PDF";
  pdf.className = "main__device__subheader__pdf";
  pdf.addEventListener("click", (e) => saveTopdf(e));
  subheader.appendChild(pdf);
  header.className = "main__device__header";
  header.appendChild(img);
  header.appendChild(title);
  header.appendChild(status);
  header.appendChild(heart);
  header.appendChild(settings);
  fragment.appendChild(header);
  fragment.appendChild(subheader);
  return fragment;
};

// выбор дат
let changePeriod = (start_old, end_old, i, type) => {
  let start = new Date(start_old);
  let end = new Date(end_old);
  if (type === "start") {
    if (!end_old || start > end) {
      document.querySelector(`#end-${i}`).value = new Date(
        start.getTime() - start.getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 16);
      changePeriod(start_old, start_old, i);
    }
  } else {
    if (!start_old || end < start) {
      document.querySelector(`#start-${i}`).value = new Date(
        end.getTime() - end.getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 16);
      changePeriod(end_old, end_old, i);
    }
  }
  let times = document.querySelectorAll(`.table-${i}`);
  let difference = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);

  for (let i = 0; i < times.length; i++) {
    let time = times[i].querySelector("[data-date]").dataset.date;
    if (new Date(time) < start || new Date(time) > end) {
      times[i].style.display = "none";
    } else {
      times[i].style.display = "table-row";
    }
  }

  let period = times[0].closest(".main__analytics__device");
  let periods = period.querySelectorAll(
    ".main__analytics__device__times__time"
  );
  for (let i = 0; i < periods.length; i++) {
    if (parseInt(periods[i].dataset.period) === difference) {
      periods[i].classList.add("main__analytics__device__times__time_active");
    } else {
      periods[i].classList.remove(
        "main__analytics__device__times__time_active"
      );
    }
  }
};

// таблица для страницы аналитики
let createWorkTable = (data, i) => {
  let table = data
    .map((value) => {
      let d = new Date(value.time);
      let date_formatted =
        d.getDate() +
        "." +
        (d.getMonth() + 1) +
        "." +
        d.getFullYear() +
        ", " +
        d.getHours() +
        ":" +
        d.getMinutes();
      return `<tr class="table-${i}">
         <td data-date="${value.time}">${date_formatted}</td>
         <td>${value.type}</td>
         <td>${value.description
           .split(",")
           .map(
             (value) =>
               `<span>${value.split(":")[0]}: </span>${value.split(":")[1]}<br>`
           )
           .join("")}</td>
         <td>${
           value.result
             ? value.result
                 .split(",")
                 .map(
                   (value) =>
                     `<span>${value.split(":")[0]}: </span>${
                       value.split(":")[1]
                     }<br>`
                 )
                 .join("")
             : ""
         }</td>
         <td>${value.user}</td>
      </tr>`;
    })
    .join("");
  return `<table>
  <thead>
    <tr>
      <th style="width:15%">Начало</th>
      <th style="width:13%">Тип работ</th>
      <th style="width:47%">Работы</th>
      <th style="width:13%">Результат</th>
      <th>Пользователь</th>
    </tr>
  </thead>
  <tbody>
        ${table}                            
  </tbody>
</table>`;
};

// рендер прибора со страницы с аналитикой
let createWorkInfo = (data, i) => {
  let fragment = document.createDocumentFragment();
  let container = document.createElement("div");
  container.className = "main__analytics__device__picker";
  let start_date = document.createElement("input");
  start_date.className = "main__analytics__device__start";
  let end_date = document.createElement("input");
  end_date.className = "main__analytics__device__end";
  start_date.setAttribute("id", `start-${i}`);
  end_date.setAttribute("id", `end-${i}`);
  start_date.setAttribute("type", "datetime-local");
  end_date.setAttribute("type", "datetime-local");
  start_date.addEventListener("change", () =>
    changePeriod(start_date.value, end_date.value, i, "start")
  );
  end_date.addEventListener("change", () =>
    changePeriod(start_date.value, end_date.value, i, "end")
  );
  let arrow = document.createElement("img");
  arrow.src = "./img/arrow.svg";
  container.appendChild(start_date);
  container.appendChild(arrow);
  container.appendChild(end_date);

  let times_fragment = document.createElement("div");
  times_fragment.className = "main__analytics__device__times";
  let times = [
    { text: "День", value: 1 },
    { text: "Неделя", value: 7 },
    { text: "2 недели", value: 14 },
    { text: "Месяц", value: 31 },
    { text: "3 месяца", value: 93 },
    { text: "Полгода", value: 186 },
  ];
  for (let i = 0; i < times.length; i++) {
    let time = document.createElement("div");
    time.innerHTML = times[i].text;
    time.className = "main__analytics__device__times__time";
    time.dataset.period = times[i].value;
    times_fragment.appendChild(time);
  }
  let times_table = document.createElement("div");
  times_table.innerHTML = createWorkTable(data.work, i);
  times_table.className = "main__analytics__device__table";
  fragment.appendChild(container);
  fragment.appendChild(times_fragment);
  fragment.appendChild(times_table);
  return fragment;
};


// рендер приборов со страницы с аналитикой
let showDevicesFull = (data) => {
  let fragment = document.createDocumentFragment();
  for (let i = 0; i < data.length; i++) {
    let newNode = document.createElement("div");
    newNode.append(createFullHeader(data[i]));
    newNode.append(createWorkInfo(data[i], i));
    newNode.className = "main__analytics__device";
    fragment.appendChild(newNode);
  }
  return fragment;
};


// загрузка данных --> рендер
getUser().then((res) => {
  let devices = res.devices;
  let container = document.querySelector(".main__devices");
  container?.appendChild(showDevices(devices));
  let analytics = document.querySelector(".main__analytics");
  analytics?.appendChild(showDevicesFull(devices));
  document.querySelector(".loading").style.display ="none";
});
