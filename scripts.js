


/*GERAÇAO DO CONTEUDO DOS CALENDARIOS E SELECÇAO*/

const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
];

let currentDate = new Date();
let today = new Date();

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

        let calendarCenter = document.getElementById("rf-calendar-" + j);
        document.getElementById("rf-MY-" + j).textContent = months[month] + " " + year;

        let firstDay = new Date(year, month, 1).getDay();
        let lastDay = new Date(year, month + 1, 0).getDate();
    
        // cria "slots" em branco para posicionar o primeiro dia do mes 
        for (let i = firstDay; i > 0; i--) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add("day-number");
            calendarCenter.appendChild(dayDiv);
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
            
            calendarCenter.appendChild(dayDiv);
        }
    }
    

}


var startDateTimestamp = null;
var endDateTimestamp = null;

function handleDateClick(e) {
    console.log(e.currentTarget);
    const clickedDayTimestamp = +e.currentTarget.dataset.dateValue;

    if (!startDateTimestamp || (startDateTimestamp && endDateTimestamp)) {
        // Reinicia: primeiro clique
        startDateTimestamp = clickedDayTimestamp;
        endDateTimestamp = null;
    } else {
        // Segundo clique: define o fim
        if (clickedDayTimestamp < startDateTimestamp) {
            endDateTimestamp = startDateTimestamp;
            startDateTimestamp = clickedDayTimestamp;
        } else {
            endDateTimestamp = clickedDayTimestamp;
        }
    }
    updateSelectionVisuals(null);
}

function handleMouseEnter(e) {
    // para desenhar o range
    if (startDateTimestamp && !endDateTimestamp) {
        let hoverDateTimestamp = +e.currentTarget.dataset.dateValue;
        updateSelectionVisuals(hoverDateTimestamp);
    }
}

function updateSelectionVisuals(hoverDate) {
    let allDays = document.querySelectorAll('.day-number');
    let tempEnd = endDateTimestamp || hoverDate;

    allDays.forEach(dayDiv => 
    {
        let dayTimestamp = +dayDiv.dataset.dateValue;
        
        // Reset de classes
        dayDiv.classList.remove('in-range', 'start-node', 'end-node');

        if (dayTimestamp === startDateTimestamp) 
            dayDiv.classList.add('start-node');
        if (dayTimestamp === tempEnd) 
            dayDiv.classList.add('end-node');

        if (startDateTimestamp && tempEnd) {
            let min = Math.min(startDateTimestamp, tempEnd);
            let max = Math.max(startDateTimestamp, tempEnd);
            if (dayTimestamp >= min && dayTimestamp <= max) {
                dayDiv.classList.add('in-range');
            }
        }
    });
}




/* MOSTRA/ESCONDE CALENDARIO*/
const calendar_container = {
    element : document.getElementById('rf-calendar-container'),
    toggle : function() {
        if (this.element.style.display == "none"){
            return this.element.style.display = "flex";
        }else{
            return this.element.style.display = "none";
        }
     }
};


document.querySelectorAll(".rf-date-pick").forEach(el1 => 
    el1.addEventListener("click", function(){
        calendar_container.toggle();
    })
);


/*Show cars/Trucks*/

document.addEventListener('DOMContentLoaded', function() {
    console.log("JS carregado!"); // Debug

    const resultsDiv = document.getElementById('rf-search-results');
    const showCarsButtons = document.querySelectorAll('[id="rf-btn-showcars"]');

    if(showCarsButtons.length > 0 && resultsDiv) {
        showCarsButtons.forEach(function(button) {
            button.addEventListener('click', function(event) {
                console.log("Botão clicado!"); // Debug
                
                event.preventDefault(); 
                
                // Muda o display para grid
                resultsDiv.style.display = 'grid';
                
                // Faz scroll até aos resultados
                resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    } else {
        console.log("Erro: Elementos não encontrados.");
    }
});






/*INICIALIZAÇAO DA PAGINA*/


function init(){
    calendar_container.toggle();        
    generateCalendars(currentDate);
}


init()