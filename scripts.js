


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






/*INICIALIZAÇAO DA PAGINA*/


function init(){
    calendar_container.toggle();        
    generateCalendars(currentDate);
    initSector3Carousel();
    initSector4Carousel();
}


init()