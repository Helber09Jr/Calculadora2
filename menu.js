/* --- FUNCIONALIDAD MENU CALCULADORAS --- */

document.addEventListener('DOMContentLoaded', () => {
  configurarMenuResponsivo();
  cargarCalculadorasDinamicas();
});

/* --- MENU RESPONSIVO --- */

function configurarMenuResponsivo() {
  const botonMenu = document.getElementById('botonMenu');
  const menuNavegacion = document.getElementById('menuNavegacion');

  if (!botonMenu || !menuNavegacion) return;

  botonMenu.addEventListener('click', () => {
    menuNavegacion.classList.toggle('menu-activo');
  });

  const enlacesMenu = document.querySelectorAll('.menu-navegacion a');
  enlacesMenu.forEach(enlace => {
    enlace.addEventListener('click', () => {
      menuNavegacion.classList.remove('menu-activo');
    });
  });
}

/* --- CARGAR CALCULADORAS --- */

function cargarCalculadorasDinamicas() {
  const contenedor = document.getElementById('contenedorCalculadoras');

  fetch('data/calculadoras.json')
    .then(respuesta => {
      if (!respuesta.ok) {
        throw new Error('Error al cargar el archivo de calculadoras');
      }
      return respuesta.json();
    })
    .then(datos => {
      contenedor.innerHTML = '';
      renderizarCalculadoras(datos, contenedor);
      configurarAcordeon();
    })
    .catch(error => {
      console.error('Error:', error);
      contenedor.innerHTML = `
        <div class="mensaje-error">
          <h3>Error al cargar las calculadoras</h3>
          <p>No se pudieron cargar los datos. Por favor, intenta recargar la página.</p>
        </div>
      `;
    });
}

/* --- RENDERIZAR CALCULADORAS --- */

function renderizarCalculadoras(datos, contenedor) {
  Object.keys(datos).forEach(claveUnidad => {
    const unidad = datos[claveUnidad];
    const bloqueUnidad = crearBloqueUnidad(unidad);
    contenedor.appendChild(bloqueUnidad);
  });
}

/* --- CREAR BLOQUE UNIDAD --- */

function crearBloqueUnidad(unidad) {
  const seccion = document.createElement('section');
  seccion.classList.add('bloque-unidad');

  const titulo = document.createElement('h2');
  titulo.classList.add('titulo-unidad');
  titulo.textContent = unidad.titulo;
  seccion.appendChild(titulo);

  const contenedorTarjetas = document.createElement('div');
  contenedorTarjetas.classList.add('contenedor-tarjetas');

  unidad.items.forEach(item => {
    const tarjeta = crearTarjetaCalculadora(item);
    contenedorTarjetas.appendChild(tarjeta);
  });

  seccion.appendChild(contenedorTarjetas);
  return seccion;
}

/* --- CREAR TARJETA CALCULADORA --- */

function crearTarjetaCalculadora(item) {
  const enlace = document.createElement('a');
  enlace.href = item.link;
  enlace.classList.add('tarjeta');

  const imagenContenedor = document.createElement('div');
  imagenContenedor.classList.add('imagen-tarjeta');

  const imagen = document.createElement('img');
  imagen.src = item.imagen;
  imagen.alt = item.nombre;
  imagen.loading = 'lazy';
  imagenContenedor.appendChild(imagen);

  const contenido = document.createElement('div');
  contenido.classList.add('contenido-tarjeta');

  const nombre = document.createElement('h3');
  nombre.textContent = item.nombre;

  const descripcion = document.createElement('p');
  descripcion.textContent = item.descripcion;

  contenido.appendChild(nombre);
  contenido.appendChild(descripcion);

  enlace.appendChild(imagenContenedor);
  enlace.appendChild(contenido);

  return enlace;
}

/* --- ACORDEON --- */

function configurarAcordeon() {
  const titulosUnidad = document.querySelectorAll('.titulo-unidad');

  titulosUnidad.forEach(titulo => {
    titulo.addEventListener('click', () => {
      const bloque = titulo.parentElement;
      bloque.classList.toggle('unidad-activa');
    });
  });
}
