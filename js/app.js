
const mascotaInput = document.querySelector('#mascota');
const propietarioInput = document.querySelector('#propietario');
const telefonoInput = document.querySelector('#telefono');
const fechaInput = document.querySelector('#fecha');
const horaInput = document.querySelector('#hora');
const sintomasInput = document.querySelector('#sintomas');
let DB;

// Contenedor para las citas
const contenedorCitas = document.querySelector('#citas');

// Formulario nuevas citas
const formulario = document.querySelector('#nueva-cita')
formulario.addEventListener('submit', nuevaCita);

// Heading
const heading = document.querySelector('#administra');


let editando = false;

window.onload = () => {
    eventListeners();

    crearDB();
}


// Eventos
eventListeners();
function eventListeners() {
    mascotaInput.addEventListener('change', datosCita);
    propietarioInput.addEventListener('change', datosCita);
    telefonoInput.addEventListener('change', datosCita);
    fechaInput.addEventListener('change', datosCita);
    horaInput.addEventListener('change', datosCita);
    sintomasInput.addEventListener('change', datosCita);
}

const citaObj = {
    mascota: '',
    propietario: '',
    telefono: '',
    fecha: '',
    hora: '',
    sintomas: ''
}


function datosCita(e) {
    //  console.log(e.target.name) // Obtener el Input
    citaObj[e.target.name] = e.target.value;
}

// CLasses
class Citas {
    constructor() {
        this.citas = []
    }
    agregarCita(cita) {
        this.citas = [...this.citas, cita];
    }
    editarCita(citaActualizada) {
        this.citas = this.citas.map(cita => cita.id === citaActualizada.id ? citaActualizada : cita)
    }

    eliminarCita(id) {
        this.citas = this.citas.filter(cita => cita.id !== id);
    }
}

class UI {

    constructor({ citas }) {
        this.textoHeading(citas);
    }

    imprimirAlerta(mensaje, tipo) {
        // Crea el div
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('text-center', 'alert', 'd-block', 'col-12');

        // Si es de tipo error agrega una clase
        if (tipo === 'error') {
            divMensaje.classList.add('alert-danger');
        } else {
            divMensaje.classList.add('alert-success');
        }

        // Mensaje de error
        divMensaje.textContent = mensaje;

        // Insertar en el DOM
        document.querySelector('#contenido').insertBefore(divMensaje, document.querySelector('.agregar-cita'));

        // Quitar el alert despues de 3 segundos
        setTimeout(() => {
            divMensaje.remove();
        }, 3000);
    }

    imprimirCitas() {

        this.limpiarHTML();


        //Leer el contenido de laBD
        const objectStore = DB.transaction('citas').objectStore('citas');

        const total = objectStore.count();

        const fnTextoHeading = this.textoHeading;

        total.onsuccess = function () {
            fnTextoHeading(total.result);
        }

        objectStore.openCursor().onsuccess = function (e) {
            const cursor = e.target.result;

            if (cursor) {
                // Mostrar mensaje de que todo esta bien...

                const { mascota, propietario, telefono, fecha, hora, sintomas, id } = cursor.value;

                const divCita = document.createElement('div');
                divCita.classList.add('citas', 'p-3');
                divCita.dataset.id = id;

                //Scripting de los elementos de la cita
                const mascotaP = document.createElement('h2');
                mascotaP.classList.add('card-title', 'font-weight-bolder');
                mascotaP.textContent = mascota;

                const propietarioP = document.createElement('p');
                propietarioP.innerHTML = `
                        <span class="font-weight-bolder">Propietario: </span> ${propietario}`;

                const telefonoP = document.createElement('p');
                telefonoP.innerHTML = `
                        <span class="font-weight-bolder">Tel: </span> ${telefono}`;

                const fechaP = document.createElement('p');
                fechaP.innerHTML = `
                        <span class="font-weight-bolder">Fecha: </span> ${fecha}`;

                const sintomasP = document.createElement('p');
                sintomasP.innerHTML = `
                        <span class="font-weight-bolder">Sintomas: </span> ${sintomas}`;

                //Boton para eliminar esta cita
                const btnEliminar = document.createElement('button');
                btnEliminar.classList.add('btn', 'btn-danger', 'mr-2');
                btnEliminar.innerHTML = 'Eliminar <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>';
                btnEliminar.onclick = () => eliminarCita(id);

                //Boton para editar 
                const btnEditar = document.createElement('button');
                btnEditar.classList.add('btn', 'btn-info');
                btnEditar.innerHTML = 'Editar <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>'
                const cita = cursor.value;
                btnEditar.onclick = () => cargarEdicion(cita);

                //agregar los parrafos al divCita
                divCita.appendChild(mascotaP);
                divCita.appendChild(propietarioP);
                divCita.appendChild(telefonoP);
                divCita.appendChild(fechaP);
                divCita.appendChild(sintomasP);
                divCita.appendChild(btnEliminar);
                divCita.appendChild(btnEditar);

                //agregar las citas al HTML
                contenedorCitas.appendChild(divCita);

                //Ve al siguiente elemento
                cursor.continue();
            }
        }
    }





    textoHeading(resultado) {
        // console.log(citas);
        if (resultado > 0) {
            heading.textContent = 'Administra tus Citas '
        } else {
            heading.textContent = 'No hay Citas, comienza creando una'
        }
    };

    limpiarHTML() {
        while (contenedorCitas.firstChild) {
            contenedorCitas.removeChild(contenedorCitas.firstChild);
        }
    }
};



const administrarCitas = new Citas();

const ui = new UI(administrarCitas);

function nuevaCita(e) {
    e.preventDefault();

    const { mascota, propietario, telefono, fecha, hora, sintomas } = citaObj;

    // Validar
    if (mascota === '' || propietario === '' || telefono === '' || fecha === '' || hora === '' || sintomas === '') {
        ui.imprimirAlerta('Todos los mensajes son Obligatorios', 'error')

        return;
    }

    if (editando) {
        // Estamos editando
        administrarCitas.editarCita({ ...citaObj });

        //Edita en indexedDB
        const transaction = DB.transaction(['citas'], 'readwrite');
        const objectStore = transaction.objectStore('citas');

        objectStore.put(citaObj);

        transaction.oncomplete = () => {
            ui.imprimirAlerta('Guardado Correctamente');

            formulario.querySelector('button[type="submit"]').textContent = 'Crear Cita';

            editando = false;
        }

        transaction.onerror = ()=> {
            console.log('Hubo un error');
        }


    } else {
        // Nuevo Registrando

        // Generar un ID único
        citaObj.id = Date.now();

        // Añade la nueva cita
        administrarCitas.agregarCita({ ...citaObj });

        // Insertar Registro en IndexedDB
        const transaction = DB.transaction(['citas'], 'readwrite');

        //Habilitar el object store
        const objectStore = transaction.objectStore('citas');

        // Agrega objeto a la base de datos
        objectStore.add(citaObj);

        transaction.oncomplete = function () {
            console.log('cita agregada');

            // Mostrar mensaje de que todo esta bien...
            ui.imprimirAlerta('Se agregó correctamente');
        }


    }


    // Imprimir el HTML de citas
    ui.imprimirCitas();

    // Reinicia el objeto para evitar futuros problemas de validación
    reiniciarObjeto();

    // Reiniciar Formulario
    formulario.reset();

}

function reiniciarObjeto() {
    // Reiniciar el objeto
    citaObj.mascota = '';
    citaObj.propietario = '';
    citaObj.telefono = '';
    citaObj.fecha = '';
    citaObj.hora = '';
    citaObj.sintomas = '';
}


function eliminarCita(id) {
    const transaction = DB.transaction(['citas'], 'readwrite');
    const objectStore = transaction.objectStore('citas');

    objectStore.delete(id);

    transaction.oncomplete = ()=>{
        console.log(`Cita ${id} eliminada`);
        ui.imprimirCitas();
    }

    transaction.onerror = () =>{
        console.log('hubo un error');
    }
}

function cargarEdicion(cita) {

    const { mascota, propietario, telefono, fecha, hora, sintomas, id } = cita;

    // Reiniciar el objeto
    citaObj.mascota = mascota;
    citaObj.propietario = propietario;
    citaObj.telefono = telefono;
    citaObj.fecha = fecha
    citaObj.hora = hora;
    citaObj.sintomas = sintomas;
    citaObj.id = id;

    // Llenar los Inputs
    mascotaInput.value = mascota;
    propietarioInput.value = propietario;
    telefonoInput.value = telefono;
    fechaInput.value = fecha;
    horaInput.value = hora;
    sintomasInput.value = sintomas;

    formulario.querySelector('button[type="submit"]').textContent = 'Guardar Cambios';

    editando = true;

}

function crearDB() {
    //Crear la base de datosen version 1.0
    const crearDB = window.indexedDB.open('citas', 1);

    //Si hay un error
    crearDB.onerror = function () {
        console.log('Hubo un error');
    }


    //si todo sale bien
    crearDB.onsuccess = function () {
        console.log('Base de Datos creada');
        DB = crearDB.result;

        //Mostrar citas al cargar (Pero IndexDB ya esta listo)
        ui.imprimirCitas();
    }

    //Definir el Schema
    crearDB.onupgradeneeded = function (e) {
        const db = e.target.result;

        const objectSore = db.createObjectStore('citas', {
            keyPath: 'id',
            autoIncremente: true
        });

        //Definir todas las columnas
        objectSore.createIndex('mascota', 'mascota', { unique: false });
        objectSore.createIndex('propietario', 'propietario', { unique: false });
        objectSore.createIndex('telefono', 'telefono', { unique: false });
        objectSore.createIndex('hora', 'hora', { unique: false });
        objectSore.createIndex('sintomas', 'sintomas', { unique: false });
        objectSore.createIndex('id', 'id', { unique: true });

        console.log('DB creada y lista');

    }





}