/* ####################################
## VARIAVEIS GLOBAIS E ELEMENTOS DOM ##
#################################### */

//main div
const divMain = document.querySelector('#main');

//divs com string das datas
const pickupDateDivs = document.querySelectorAll(".pickup-date");
const returnDateDivs = document.querySelectorAll(".return-date");

//classe para o controlo de mostrar/ocultar elementos
class ToggleContainer {
    constructor(id) {
        this.id = id;
        this.element = document.getElementById(id);
    }

    toggle() {
        if (this.element.style.display === "none" || this.element.style.display === "") {
            this.element.style.display = "flex";
        } else {
            this.element.style.display = "none";
        }
    }

    show() {
        this.element.style.display = "flex";
    }

    hide() {
        this.element.style.display = "none";
    }

    bindBtns(buttons) {
        buttons.forEach(btn => {
            btn.addEventListener("click", (e) => {
                this.toggle();
            });
        });
    }

    checkClickOutside(target, buttons) {
        let isInsideElement = this.element.contains(target);
        let isInsideButton = Array.from(buttons).some(btn => btn.contains(target));
        if (!isInsideElement && !isInsideButton) {
            this.hide();
        }
    }
}

//objetos que requerem mostrar/ocultar
const objCalendarContainer = new ToggleContainer('rf-calendar-container');
const objPickupTimeContainer = new ToggleContainer('rf-div-pickup-timeslots');
const objReturnTimeContainer = new ToggleContainer('rf-div-return-timeslots');
const objShowCarsContainer = new ToggleContainer('rf-search-results-cars');
const objShowTrucksContainer = new ToggleContainer('rf-search-results-trucks');

//botoes que ativam o calendario
const btnsDatePick = document.querySelectorAll(".rf-date-pick-btn");

//botoes que ativam o pickup e return time
const btnsPickupTime = document.querySelectorAll(".rf-time-pickup-btn");
const btnsReturnTime = document.querySelectorAll(".rf-time-return-btn");

//botoes de horas
const btnsTimePick = document.querySelectorAll(".timeslot");

//botoes que apresentam os resultados
const btnShowCars   = document.querySelector("#rf-btn-show-cars");
const btnShowTrucks = document.querySelector("#rf-btn-show-trucks");

//car cards
const divsCards = document.querySelectorAll(".car-card")

const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
];


/* ########################
## OBJECTO <RENTAL INFO> ##
######################## */

const objBill = {

    active          : false,

    vehicleType     : "car",
    vehicleID       : 0,

    pickupDateTS    : 0,
    pickupHours     : 0,
    pickupMinutes   : 0, 

    returnDateTS    : 0,
    returnHours     : 0,
    returnMinutes   : 0,
    
    diffReturn      : false,
    diffReturnFee   : 30,

    applyCorpRate   : false,
    tier1DiscRate   : 0.1,
    tier2DiscRate   : 0.2,

    weekCarRate     : 6,
    weekendCarRate  : 15,
    
    weekTruckRate   : 12,
    weekendTruckRate: 20,
    
    numWeekDays     : 0,
    numWeekendDays  : 0,

    billWeekDays    : 0,
    billWeekendDays : 0,

    billBeforeDiscount  : 0,
    billDiscount        : 0,
    billTotal           : 0,


    handleRentingDays : function() {
        let tsStart = this.pickupDateTS + (this.pickupHours*3600 + this.pickupMinutes*60)*1000;
        let tsEnd = this.returnDateTS + (this.returnHours*3600 + this.returnMinutes*60)*1000;

        let timeWeek    = 0;
        let timeWeekend = 0;

        let ts = tsStart;
        //vamos ver, para cada dia do aluguer, como o tempo é alocado (semana ou fds)
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

        this.numWeekDays    = Math.ceil(timeWeek / (1000 * 3600 * 24)) //converte timestamp de milisec para dias
        this.numWeekendDays = Math.ceil(timeWeekend / (1000 * 3600 * 24 ));
        
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
        
        this.billWeekDays       = this.numWeekDays * weekRate;
        this.billWeekendDays    = this.numWeekDays * weekendRate;
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

        this.billTotal = this.billBeforeDiscount - this.billDiscount;

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
objCalendarContainer.bindBtns(btnsDatePick);

//eventos que abrem e fecham divs dos timeslots ao clicar nos botões picktime
objPickupTimeContainer.bindBtns(btnsPickupTime);
objReturnTimeContainer.bindBtns(btnsReturnTime);

objShowCarsContainer.bindBtns([btnShowCars]);
objShowTrucksContainer.bindBtns([btnShowTrucks]);


//faz reset à visualização através de clicks no body
document.body.addEventListener('click', function (event) {

    let target = event.target;

    objCalendarContainer.checkClickOutside(target, btnsDatePick);
    objPickupTimeContainer.checkClickOutside(target, btnsPickupTime);
    objReturnTimeContainer.checkClickOutside(target, btnsReturnTime);
    objShowCarsContainer.checkClickOutside(target, [btnShowCars]);
    objShowTrucksContainer.checkClickOutside(target, [btnShowTrucks]);
});

//faz reset ao sandwich através de clicks no main
divMain.addEventListener("click", function(event){
    document.getElementById("toggle").checked = false;
});


//reset às grids dos resultados
function resetResultsGrids(resetSelectedVehicle = false){
    let divsResults = document.querySelectorAll(".rf-results-container");
    divsResults.forEach(el => el.classList.remove("bill-summary-mode"));
    
    let divsResGallery = document.querySelectorAll(".rf-results-gallery");
    divsResGallery.forEach(el => el.classList.remove("bill-summary-mode"));

    if(resetSelectedVehicle){
        divsCards.forEach(card => card.style.order = "");
    }
}
    

/* #############
## CARROUSELS ##
############# */

/*Sector 3 - carrossel*/
function initSector3Carousel() {
    // 1. Seletores
    const cards = Array.from(document.querySelectorAll('#s3-carrossel .img-container'));
    const dots = document.querySelectorAll('#s3-btns-esq .btn-dot');
    const btnLeft = document.querySelector('#s3-btns-dir .btn-arrow:first-child');
    const btnRight = document.querySelector('#s3-btns-dir .btn-arrow:last-child');

    let currentIndex = 0;
    const itemsVisible = 3; 
    const maxIndex = cards.length - itemsVisible; // 5 - 3 = 2

    function updateCarousel() {
        // A. MOSTRAR/ESCONDER CARTÕES
        // O Grid tem 3 colunas. Nós vamos tornar visíveis apenas 3 itens.
        // O Grid vai pegar nesses 3 e colocá-los nas colunas 1, 2 e 3.
        
        cards.forEach((card, index) => {
            // Se o índice estiver dentro da janela atual (ex: 0, 1, 2), mostra.
            if (index >= currentIndex && index < currentIndex + itemsVisible) {
                card.classList.add('visible');
            } else {
                card.classList.remove('visible');
            }
        });

        // B. ATUALIZAR PONTOS
        dots.forEach((dot, index) => {
            // O toggle adiciona a classe se a condição for true, remove se false
            dot.classList.toggle('active-dot', index === currentIndex);
        });

        // C. BLOQUEAR SETAS
        btnLeft.classList.toggle('disabled-arrow', currentIndex === 0);
        btnRight.classList.toggle('disabled-arrow', currentIndex === maxIndex);
    }

    // --- EVENT LISTENERS ---
    
    if (btnLeft) {
        btnLeft.addEventListener('click', function() {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        });
    }

    if (btnRight) {
        btnRight.addEventListener('click', function() {
            if (currentIndex < maxIndex) {
                currentIndex++;
                updateCarousel();
            }
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            if (index <= maxIndex) {
                currentIndex = index;
                updateCarousel();
            }
        });
    });

    // Iniciar
    updateCarousel();
}

/*Sector 4 - carrossel*/
function initSector4Carousel() {
    // Seletores
    const slides = document.querySelectorAll('#s4-carrossel > div');
    const dots = document.querySelectorAll('#s4-btns-esq .btn-dot');
    const btnLeft = document.querySelector('#s4-btns-dir .btn-arrow:first-child');
    const btnRight = document.querySelector('#s4-btns-dir .btn-arrow:last-child');

    let currentIndex = 0; // inicia sempre no indice 0 
    const maxIndex = slides.length - 1;

    //função para atualizar toda a informação nos slides - setas, pontos e texto
    function updateCarousel() {
      
        //Atualizar Slides
        slides.forEach((slide, index) => {
            if (index === currentIndex) {
                slide.classList.add('active-slide');
            } else {
                slide.classList.remove('active-slide');
            }
        });

        //Atualizar os Pontos (Dots)
        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('active-dot');
            } else {
                dot.classList.remove('active-dot');
            }
        });

        // Atualizar Estado das Setas nos limites
        // Se estiver no início (0), desativa a esquerda
        if (currentIndex === 0) {
            btnLeft.classList.add('disabled-arrow');
        } else {
            btnLeft.classList.remove('disabled-arrow');
        }

        // Se estiver no fim (max), desativa a direita
        if (currentIndex === maxIndex) {
            btnRight.classList.add('disabled-arrow');
        } else {
            btnRight.classList.remove('disabled-arrow');
        }
    }

    // Event Listeners para as Setas
    btnLeft.addEventListener('click', function() {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    btnRight.addEventListener('click', function() {
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateCarousel();
        }
    });

    // Opcional: Permitir clicar nos pontos para navegar
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            currentIndex = index;
            updateCarousel();
        });
    });

    // Inicializar o estado (mostrar o primeiro slide e configurar setas)
    updateCarousel();
}

/* #################################################
## GERAÇAO DO CONTEUDO DOS CALENDARIOS E SELECÇAO ##
################################################# */

let currentDate = new Date();
let today = new Date();

function handleCalendar(date) {

    //limpa dias dos 3 calendarios através da classe
    let elements = document.getElementsByClassName("day-number");
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

    function getDateMonthDayFormat(timestamp){
        let date = new Date(timestamp);
        let month = months[date.getMonth()].substring(0,3);
        let day = date.getDate().toString();
        return month + " " + day;
    }

    function setStartDate(timestamp){
        pickupDateDivs.forEach(el => {
            el.textContent = getDateMonthDayFormat(timestamp);
        });
        objBill.pickupDateTS = timestamp;
    }

    function setEndDate(timestamp){
        returnDateDivs.forEach(el => {
            el.textContent = getDateMonthDayFormat(timestamp);
        });
        objBill.returnDateTS = timestamp;
    }

    function handleDateClick(e) {
        let clickedDayTimestamp = +e.currentTarget.dataset.dateValue;
    
        //se nada clicado (inicia) ou start e end clicados (termina)
        if (!objBill.pickupDateTS || (objBill.pickupDateTS && objBill.returnDateTS)) {
            objBill.pickupDateTS = clickedDayTimestamp;
            objBill.returnDateTS = 0;
        } else {
            //se data de fim inferior ao start, troca, senao atribui enddate
            if (clickedDayTimestamp < objBill.pickupDateTS) {
                objBill.returnDateTS = objBill.pickupDateTS;
                objBill.pickupDateTS = clickedDayTimestamp;
            } else {
                objBill.returnDateTS = clickedDayTimestamp;
            }
    
            setStartDate(objBill.pickupDateTS);
            setEndDate(objBill.returnDateTS);
            delay(0.75).then( () => objCalendarContainer.hide() );
    
        }
        updateSelectionVisuals(0);
    }
    
    function handleMouseEnter(e) {
        if (objBill.pickupDateTS && !objBill.returnDateTS) {
            let hoverDateTimestamp = +e.currentTarget.dataset.dateValue;
            updateSelectionVisuals(hoverDateTimestamp);
        }
    }
    
    function updateSelectionVisuals(hoverDate) {

        //a seleção de nova data  leva a limpar a pesquisa por veiculo
        //restaura configuraçao de 4 viaturas e limpa escolha actual do veiculo
        resetResultsGrids(true);

        let allDays = document.querySelectorAll('.day-number');
        let tempEnd = objBill.returnDateTS || hoverDate; //condiçao para dar no hover e end date ao mesmo tempo
    
        allDays.forEach(dayDiv => 
        {
            let dayTimestamp = +dayDiv.dataset.dateValue;
            
            //limpa os estilos das divs por remocao de classes
            dayDiv.classList.remove('in-range', 'start-node', 'end-node');
    
            //atribui estilo ao start date e end date
            if (dayTimestamp === objBill.pickupDateTS) 
                dayDiv.classList.add('start-node');
            if (dayTimestamp === tempEnd) 
                dayDiv.classList.add('end-node');
    
            //caso o star e end sejam os memos atribui este especial
            if (objBill.pickupDateTS && tempEnd) {
                let min = Math.min(objBill.pickupDateTS, tempEnd);
                let max = Math.max(objBill.pickupDateTS, tempEnd);
                if (dayTimestamp >= min && dayTimestamp <= max) {
                    dayDiv.classList.add('in-range');
                }
            }
        });
    }
}

/* #########################################
## SELECÇAO DE HORAS DE RECOLHA E ENTREGA ##
##########################################*/

function timeslotsEventListeners(){
    btnsTimePick.forEach(slot => {
        slot.addEventListener('click', handleTimeClick);
    });
}

function handleTimeClick(e) {
    const timeSlot = e.currentTarget;
    
    // 1. Descobrir em que container estamos (Pickup ou Return)
    const parentContainer = timeSlot.closest('.rf-time-container');
    const isPickup = parentContainer.id.includes('pickup');
    const type = isPickup ? 'pickup' : 'return';

    // 2. Limpar a formatação APENAS dos slots dentro deste container específico
    parentContainer.querySelectorAll(".timeslot").forEach(t => {
        t.classList.remove("selected-timeslot");
    });

    // 3. Atribuir formatação ao slot clicado
    timeSlot.classList.add("selected-timeslot");

    // 4. Atualizar o texto nos spans correspondentes do formulário
    const spansToUpdate = document.querySelectorAll("." + type + "-time");
    spansToUpdate.forEach(span => {
        span.textContent = timeSlot.textContent.trim();
        span.classList.add("selected-timeslot"); // Opcional: dar cor ao texto no botão
    });

    // 5. Guardar a hora no objeto objBill para cálculos futuros
    const timeValue = timeSlot.textContent.trim(); // ex: "9:00 AM"
    // Aqui podes adicionar a lógica de converter string para horas/minutos se precisares

    if (isPickup) {
        delay(0.5).then( () => objPickupTimeContainer.hide() );
    } else {
        delay(0.5).then( () => objReturnTimeContainer.hide() );
    }
}


/* #####################
## DIVS DE RESULTADOS ##
##################### */

function showSearchResults(type) {

    objBill.vehicleType = type;

    //impede alterar o veiculo já seleccionado (randomizar muda o index)
    if (!objBill.active){
        randomizeVehicleCards(type);
    }
    
    divsCards.forEach(card => card.addEventListener('click', handleCardClick));

    function handleCardClick(e) {
        
        let card = e.currentTarget;

        objBill.vehicleID = +card.dataset.cardID;

        //impede alterar o veiculo já seleccionado (via order)
        if (!objBill.active){
            card.style.order = "-1";
            objBill.active = true;
        }

        let divsResults = document.querySelectorAll(".rf-results-container");
        divsResults.forEach(el => {
            el.classList.add("bill-summary-mode");
        });

        let divsResGallery = document.querySelectorAll(".rf-results-gallery");
        divsResGallery.forEach(el => {
            el.classList.add("bill-summary-mode");
        });

        let divsSummary = document.querySelectorAll(".rf-booking-summary");
        divsSummary.forEach(el => {
            el.classList.add("bill-summary-mode");
        });

        let divsResultsDiv = document.querySelectorAll(".rf-search-results");
        divsResultsDiv.forEach(el => {
            el.classList.add("bill-summary-mode");
        });

    }

    function randomizeVehicleCards(type) {
        // esconde todas as cards
        divsCards.forEach(card => card.classList.add("inactive"));
        
        // escolhe 4 indices aleatorios
        let pos = [0,1,2,3,4,5,6,7]
        for (let i = 0; i < 4; i++){
            let idx = Math.floor(Math.random() * pos.length); 
            pos.splice(idx, 1);
        }
    
        //devolve visibilidade aos cards escolhidos
        for (let i = 0; i < 4; i++){
            let card = document.querySelector("#" + type + "-card-" + pos[i]) ;
            card.classList.remove("inactive");
            card.dataset.cardID = i+1;
            card.dataset.cardIntID = pos[i];
        }
    }

    
}

btnShowCars.addEventListener("click", () => showSearchResults('car'));
btnShowTrucks.addEventListener("click", () => showSearchResults('truck'));







/*INICIALIZAÇAO DA PAGINA*/

function init(){
    objCalendarContainer.hide();
    objPickupTimeContainer.hide();
    objReturnTimeContainer.hide();        
    handleCalendar(currentDate);
    timeslotsEventListeners();
    initSector3Carousel();
    initSector4Carousel();
    
}

init()