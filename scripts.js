/* ####################################
## VARIAVEIS GLOBAIS E ELEMENTOS DOM ##
#################################### */

//main div
const divMain = document.querySelector('#main');

//objeto para div que contem o Calendario
const calendarContainer = {
    element : document.getElementById('rf-calendar-container'),
    toggle : function() {
        if (this.element.style.display == "none"){
            this.element.style.display = "flex";
        }else{
            this.element.style.display = "none";
        }
    }
};

//botoes que ativam o calendario
const btnDatePick = document.querySelectorAll(".rf-date-pick");

//botoes que ativam o calendario
const btnShowVehicles = document.querySelectorAll(".rf-div-cbx-show");

const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
];

const startDateDivs = document.querySelectorAll(".start-date");
const endDateDivs = document.querySelectorAll(".end-date");

const rental_info = {
    //TS = timestamp
    startDateTS : 0,
    startHours : 0,
    startMinutes : 0, 
    endDateTS : 0,
    endHours : 0,
    endMinutes : 0, 
} 

/* ###################################
## CONTROLO DE VISUALIZAÇÃO DE DIVS ##
################################### */

//sleep function
function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time*1000));
}

//evento que abre e fecha div do calendário ao clicar nos botões pickdate
btnDatePick.forEach(el1 => 
    el1.addEventListener("click", function(){
        calendarContainer.toggle();
    })
);


//faz reset à visualização através de clicks no main
document.body.addEventListener('click', function (event) {
    if (divMain.contains(event.target)) {
        calendarContainer.element.style.display = "none";       
    }
});

/* #################################################
## GERAÇAO DO CONTEUDO DOS CALENDARIOS E SELECÇAO ##
################################################# */

let currentDate = new Date();
let today = new Date();

function getDateMonthDayFormat(timestamp){
    
    let date = new Date(timestamp);
    let month = months[date.getMonth()].substring(0,3);
    let day = date.getDate().toString();
    
    return month + " " + day;
}

function setStartDate(timestamp){
    startDateDivs.forEach(el => {
        el.textContent = getDateMonthDayFormat(timestamp);
    });
}

function setEndDate(timestamp){
    endDateDivs.forEach(el => {
        el.textContent = getDateMonthDayFormat(timestamp);
    });
}

function generateCalendars(date) {

    //limpa dias dos 3 calendarios através da classe
    const elements = document.getElementsByClassName("day-number");
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }

    //preenche os novos dias para o 3 calendarios
    for (let j=0; j<3; j++){

        //obtem ano e mes da data indicada 
        let newDate = new Date(date.getFullYear(), date.getMonth() + j, 1);
        let year = newDate.getFullYear();
        let month = newDate.getMonth();

        let calendar = document.getElementById("rf-calendar-" + j);
        document.getElementById("rf-MY-" + j).textContent = months[month] + " " + year;

        let firstDay = new Date(year, month, 1).getDay();
        let lastDay = new Date(year, month + 1, 0).getDate();
    
        // cria "slots" em branco para posicionar o primeiro dia do mes 
        for (let i = firstDay; i > 0; i--) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add("day-number");
            calendar.appendChild(dayDiv);
        }
    
        // insere dias do mes desejado
        for (let i = 1; i <= lastDay; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.textContent = i;
            

            //precisamos disto para guardar um timestamp no div
            dayDiv.dataset.dateValue = new Date(year, month, i).getTime();

            //atribui a formataçao e eventos clic e mouseenter
            dayDiv.classList.add("day-number");
            dayDiv.addEventListener('click', handleDateClick);
            dayDiv.addEventListener('mouseenter', handleMouseEnter);
            
            calendar.appendChild(dayDiv);
        }
    }
    

}

function handleDateClick(e) {
    //console.log(e.currentTarget);
    let clickedDayTimestamp = +e.currentTarget.dataset.dateValue;

    //se nada clicado (inicia) ou start e end clicados (termina)
    if (!rental_info.startDateTS || (rental_info.startDateTS && rental_info.endDateTS)) {
        rental_info.startDateTS = clickedDayTimestamp;
        rental_info.endDateTS = 0;
    } else {
        //se data de fim inferior ao start, troca, senao atribui enddate
        if (clickedDayTimestamp < rental_info.startDateTS) {
            rental_info.endDateTS = rental_info.startDateTS;
            rental_info.startDateTS = clickedDayTimestamp;
        } else {
            rental_info.endDateTS = clickedDayTimestamp;
        }

        setStartDate(rental_info.startDateTS);
        setEndDate(rental_info.endDateTS);
        delay(0.75).then( () => calendarContainer.toggle());

    }
    updateSelectionVisuals(0);
}

function handleMouseEnter(e) {
    if (rental_info.startDateTS && !rental_info.endDateTS) {
        let hoverDateTimestamp = +e.currentTarget.dataset.dateValue;
        updateSelectionVisuals(hoverDateTimestamp);
    }
}

function updateSelectionVisuals(hoverDate) {
    let allDays = document.querySelectorAll('.day-number');
    let tempEnd = rental_info.endDateTS || hoverDate; //condiçao para dar no hover e end date ao mesmo tempo

    allDays.forEach(dayDiv => 
    {
        let dayTimestamp = +dayDiv.dataset.dateValue;
        
        //limpa os estilos das divs por remocao de classes
        dayDiv.classList.remove('in-range', 'start-node', 'end-node');

        //atribui estilo ao start date e end date
        if (dayTimestamp === rental_info.startDateTS) 
            dayDiv.classList.add('start-node');
        if (dayTimestamp === tempEnd) 
            dayDiv.classList.add('end-node');

        //caso o star e end sejam os memos atribui este especial
        if (rental_info.startDateTS && tempEnd) {
            let min = Math.min(rental_info.startDateTS, tempEnd);
            let max = Math.max(rental_info.startDateTS, tempEnd);
            if (dayTimestamp >= min && dayTimestamp <= max) {
                dayDiv.classList.add('in-range');
            }
        }
    });
}


/*INICIALIZAÇAO DA PAGINA*/


function init(){
    calendarContainer.toggle();        
    generateCalendars(currentDate);
}


init()