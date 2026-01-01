/* ####################################
## VARIAVEIS GLOBAIS E ELEMENTOS DOM ##
#################################### */

//main div
const divMain = document.querySelector('#main');

//divs com string das datas
const startDateDivs = document.querySelectorAll(".start-date");
const endDateDivs = document.querySelectorAll(".end-date");


//objeto para div que contem o Calendario
const objCalendarContainer = {
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


/* ########################
## OBJECTO <RENTAL INFO> ##
######################## */

const objRentalInfoAndBilling = {

    vehicle         : "car",

    startDateTS     : 0,
    startHours      : 0,
    startMinutes    : 0, 

    endDateTS       : 0,
    endHours        : 0,
    endMinutes      : 0,
    
    diffReturn      : false,
    diffReturnFee   : 30,

    applyCorpRate   : false,
    tier1DiscRate   : 0.1,
    tier2DiscRate   : 0.2,

    weekCarRate     : 6,
    weekendCarRate  : 15,
    
    weekTruckRate   : 12,
    weekendTruckRate : 20,
    
    numWeekDays    : 0,
    numWeekendDays  : 0,

    billWeekDays   : 0,
    billWeekendDays : 0,

    billBeforeDiscount  : 0,
    billDiscount        : 0,
    billTotal           : 0,


    handleRentingDays : function() {
        let tsStart = this.startDateTS + (this.startHours*3600 + this.startMinutes*60)*1000;
        let tsEnd = this.ehdDateTS + (this.endHours*3600 + this.endMinutes*60)*1000;

        let timeWeek    = 0;
        let timeWeekend = 0;

        let ts = tsStart;
        //vamos ver, dia em dia de aluguer, como o tempo é alocado (semana ou fds)
        while (ts < tsEnd) {
            // calcula o inicio do proximo dia À meia-noite
            let nextDay = new Date(ts);
            nextDay.setHours(24, 0, 0, 0);
            let limit = Math.min(nextDay.getTime(), tsEnd);

            //fracçao de tempo (max 24*60*60*1000 miliseg)
            let fraction = limit - ts;

            // verifica se o dia atual é tsEnd de semana (sabado ou domingo)
            let date = new Date(ts);
            let week = date.getDay(); 
            if (week == 0 || week == 6) {// domingo=0 e sabado=6
                timeWeekend += fraction;
            } else {
                timeWeek += fraction;
            }

            ts = limit; // salta para o inicio do prox dia
        }

        this.numweeks    = Math.ceil(timeWeek / (1000 * 60 * 60))
        this.numWeekendDays = Math.ceil(timeWeekend / (1000 * 60 * 60));
        
    },

    handleBilling : function() {

        let weekRate     = 0;
        let weekendRate  = 0;
        let discountRate = 0;

        if (this.vehicle == "car"){
            weekRate    = this.weekCarRate;
            weekendRate = this.weekendCarRate;
        } else {
            weekRate    = this.weekTruckRate;
            weekendRate = this.weekendTruckRate;
        }
        
        this.billWeekDays       = this.numWeekDays * this.weekCarRate;
        this.billWeekendDays    = this.numWeekDays * this.weekendCarRate;
        this.billBeforeDiscount = this.billWeekDays + this.billWeekendDays;
        
        if (this.diffReturn){
            this.billBeforeDiscount += this.diffReturnFee;
        }

        if (this.applyCorpRate){
            if (this.numWeekDays + this.numWeekendDays < 3){
                discountRate = this.tier1DiscRate;
            }else{
                discountRate = this.tier2DiscRate;
            }
        }else{
            discountRate = 0;
        }

        this.billDiscount = this.billTotal * discountRate;

        this.billTotal = billBeforeDiscount - this.billDiscount;

    }

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
        objCalendarContainer.toggle();
    })
);


//faz reset à visualização através de clicks no main
document.body.addEventListener('click', function (event) {
    if (divMain.contains(event.target)) {
        objCalendarContainer.element.style.display = "none";       
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
    if (!objRentalInfoAndBilling.startDateTS || (objRentalInfoAndBilling.startDateTS && objRentalInfoAndBilling.endDateTS)) {
        objRentalInfoAndBilling.startDateTS = clickedDayTimestamp;
        objRentalInfoAndBilling.endDateTS = 0;
    } else {
        //se data de fim inferior ao start, troca, senao atribui enddate
        if (clickedDayTimestamp < objRentalInfoAndBilling.startDateTS) {
            objRentalInfoAndBilling.endDateTS = objRentalInfoAndBilling.startDateTS;
            objRentalInfoAndBilling.startDateTS = clickedDayTimestamp;
        } else {
            objRentalInfoAndBilling.endDateTS = clickedDayTimestamp;
        }

        setStartDate(objRentalInfoAndBilling.startDateTS);
        setEndDate(objRentalInfoAndBilling.endDateTS);
        delay(0.75).then( () => objCalendarContainer.toggle());

    }
    updateSelectionVisuals(0);
}

function handleMouseEnter(e) {
    if (objRentalInfoAndBilling.startDateTS && !objRentalInfoAndBilling.endDateTS) {
        let hoverDateTimestamp = +e.currentTarget.dataset.dateValue;
        updateSelectionVisuals(hoverDateTimestamp);
    }
}

function updateSelectionVisuals(hoverDate) {
    let allDays = document.querySelectorAll('.day-number');
    let tempEnd = objRentalInfoAndBilling.endDateTS || hoverDate; //condiçao para dar no hover e end date ao mesmo tempo

    allDays.forEach(dayDiv => 
    {
        let dayTimestamp = +dayDiv.dataset.dateValue;
        
        //limpa os estilos das divs por remocao de classes
        dayDiv.classList.remove('in-range', 'start-node', 'end-node');

        //atribui estilo ao start date e end date
        if (dayTimestamp === objRentalInfoAndBilling.startDateTS) 
            dayDiv.classList.add('start-node');
        if (dayTimestamp === tempEnd) 
            dayDiv.classList.add('end-node');

        //caso o star e end sejam os memos atribui este especial
        if (objRentalInfoAndBilling.startDateTS && tempEnd) {
            let min = Math.min(objRentalInfoAndBilling.startDateTS, tempEnd);
            let max = Math.max(objRentalInfoAndBilling.startDateTS, tempEnd);
            if (dayTimestamp >= min && dayTimestamp <= max) {
                dayDiv.classList.add('in-range');
            }
        }
    });
}


/*INICIALIZAÇAO DA PAGINA*/


function init(){
    objCalendarContainer.toggle();        
    generateCalendars(currentDate);
}


init()