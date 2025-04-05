let calendar = createCalendar(showPopup);
document.body.append(calendar);

/**
 * @type {IDBDatabase}
 */
let db;
let request = indexedDB.open("calendar",1);
request.onsuccess = e =>
{
    db = e.target.result;
    updateBusyDays();
}
request.onupgradeneeded = e =>
{
    let db = e.target.result;
    let store = db.createObjectStore("events",{keyPath:"timeStamp"});
    store.createIndex("date","date", {unique:false});
    store.createIndex("time","time",{unique:false});
    store.createIndex("description","description", {unique:false});
}


function deleteAll()
{
    return new Promise(resolve=>
    {
        if(!db)
        {
            resolve("no database");
        }
        else
        {
            let store = db.transaction("events","readwrite").objectStore("events");
            let request = store.clear();
            request.onerror = e => resolve("error");
            request.onsuccess = e =>
            {
                updateBusyDays();
                resolve("deleted successfully");
            }
        }
    })
}

function addEvent(eventObject)
{
    return new Promise(resolve =>
    {
        if(!db)
        {
            resolve("no database");
        }
        else
        {
            let store = db.transaction("events", "readwrite").objectStore("events");
            let request = store.add(eventObject);
            request.onerror = e => resolve("error");
            request.onsuccess = e => resolve("event saved");
        }
    })
}


function getEvents(dateString)
{
    return new Promise(resolve=>
    {
        if(!db)
        {
            resolve([]);
        }
        else
        {
            let store = db.transaction("events","readonly").objectStore("events");
            let index = store.index("date")
            let request = index.getAll(dateString);
            request.onerror = e => resolve([]);
            request.onsuccess = e => 
            {
                let arr = [...e.target.result];
                arr.sort((a,b) => a.time - b.time);
                resolve(arr);
            }
        }
    })
}

function getAllDates()
{
    return new Promise(resolve=>
    {
        if(!db)
        {
            resolve([])
        }
        else
        {
            let store = db.transaction("events","readonly").objectStore("events");
            let index = store.index("date");
            let request = index.openCursor();
            let dates = [];
            request.onerror = e => resolve(dates);
            request.onsuccess = e =>
            {
                let cursor = e.target.result;
                
                if(cursor)
                {
                    dates.push(cursor.key);
                    cursor.continue();
                }
                else
                {
                    resolve(dates);
                }
            }
            
        }
    })
}

async function updateBusyDays()
{
    let dateStrings =  await getAllDates();

    for(let el of document.querySelectorAll(".day"))
    {
        if(dateStrings.includes(el.getAttribute("data-date")))
        {
            el.classList.add("busy");
        }
        else
        {
            el.classList.remove("busy")
        }
    }
}

function showCreateEventPopup()
{
    let popup = document.createElement("div");
    popup.className = "popup";

    let title = document.createElement("div");
    title.className = "title";
    title.innerText = "Добавить событие";

    let form = document.createElement("form");
    form.className = "event_form";

    let dateLabel = document.createElement("label");
    dateLabel.innerText = "дата:";
    let dateInput = document.createElement("input");
    dateInput.type = "date";
    let timeLabel = document.createElement("label");
    timeLabel.innerText = "время:"
    let timeInput = document.createElement("input");
    timeInput.type = "time";
    let descriptionInput = document.createElement("textarea");
    form.append(dateLabel,dateInput,timeLabel,timeInput,descriptionInput);

    let closeButton = document.createElement("button");
    closeButton.className = "close_button";
    closeButton.onclick = e => popup.remove();

    let okButton = document.createElement("button");
    okButton.innerText = "OK";
    okButton.className = "ok_button";
    okButton.onclick = e=>
    {
        let timeStamp = new Date().getTime();
        let date = new Date(dateInput.value).toLocaleDateString("ru");
        let time = timeInput.value == "" ? null :  new Date("1970-01-01T"+timeInput.value).getTime();
        let description = descriptionInput.value;
        if(date !== "Invalid Date")
        {
            addEvent({timeStamp, date, time, description}).then(_=>updateBusyDays());
        }
        popup.remove();
    }

    let cancelButton = document.createElement("button");
    cancelButton.innerText = "Отмена";
    cancelButton.className = "cancel_button";
    cancelButton.onclick = e => popup.remove();





    popup.append(title,closeButton,form, okButton, cancelButton);
    document.body.append(popup);
}
function showPopup(date)
{
    let dateString = date.toLocaleDateString("ru");

    let popup = document.createElement("div");
    popup.className = "popup";

    let title = document.createElement("div");
    title.className = "title";
    title.innerText = dateString;

    let closeButton = document.createElement("button");
    closeButton.className = "close_button";
    closeButton.onclick = e => popup.remove();

    let table = document.createElement("table");
    table.className = "events_table"

    popup.append(title,closeButton,table);
    document.body.append(popup);

    getEvents(dateString).then(events =>     
    {
        for(let event of events)
        {
            let tr = document.createElement("tr");
            let td1 = document.createElement("td");
            td1.innerText = event.time ? new Date(event.time).toLocaleTimeString("ru",{hour:"2-digit",minute:"2-digit"}): "--:--";
            let td2 = document.createElement("td");
            td2.innerText = event.description? event.description : "";
            tr.append(td1,td2);
            table.append(tr);
        }
    })
}

function createCalendar(dateClicked)
{

    let calendar = document.createElement("div");
    calendar.className = "calendar";

    let months = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
    let daysOfWeek = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
    let currentDate = new Date();
    
    let date = new Date();
    for(let i=0; i<12; i++)
    {
        let card = document.createElement("div");
        card.className = "card"
        let title = document.createElement("h3");
        title.innerText = months[i];
        card.append(title);
        
        let table = document.createElement("table");
        let header = document.createElement("tr");
        for(let day of daysOfWeek)
        {
            let th = document.createElement("th");
            th.innerText = day;
            header.append(th);
        }
        table.append(header);


        date.setMonth(i);
        date.setDate(1);
        let offset = date.getDay() - 1;
        if(offset < 0)
        {
            offset += 7;
        }
        let lastRow = document.createElement("tr");
        table.append(lastRow);

        for(let j=0; j<offset; j++)
        {
            lastRow.append(document.createElement("td"));              
        }

        while(date.getMonth() == i)
        {
            if(lastRow.cells.length == 7)
            {
                lastRow = document.createElement("tr");
                table.append(lastRow);
            }
            let td = document.createElement("td");
            td.className = "day";
            td.setAttribute("data-date", date.toLocaleDateString("ru"));    

            if(dateClicked && typeof(dateClicked) == "function")
            {
                let d = date;
                td.onclick = e => dateClicked(d);
            }

            if(currentDate.getMonth() == date.getMonth() && currentDate.getDate() == date.getDate())
            {
                td.classList.add("current");
            }

            td.innerText = date.getDate();
            lastRow.append(td);
            date = new Date(date.getTime() + 3600*1000*24);               
        }

        card.append(table);
        calendar.append(card);
    }

    return calendar;
}