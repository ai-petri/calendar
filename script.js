let calendar = createCalendar(showPopup);
document.body.append(calendar);


function showPopup(date)
{
    let popup = document.createElement("div");
    popup.className = "popup";

    let closeButton = document.createElement("button");
    closeButton.className = "close_button";
    closeButton.onclick = e => popup.remove();
    popup.append(closeButton);


    document.body.append(popup)
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